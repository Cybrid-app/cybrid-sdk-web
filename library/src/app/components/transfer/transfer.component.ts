import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import {
  BehaviorSubject,
  combineLatest,
  catchError,
  map,
  of,
  switchMap,
  take,
  takeUntil,
  Subject
} from 'rxjs';

// Services
import {
  AssetService,
  Asset,
  BankAccountService,
  CODE,
  ConfigService,
  ErrorService,
  EventService,
  LEVEL,
  RoutingData,
  RoutingService
} from '@services';

// Components
import {
  TransferConfirmComponent,
  TransferConfirmData,
  TransferDetailsComponent,
  TransferDetailsData
} from '@components';

// Models
import { ExternalBankAccountBankModel } from '@cybrid/cybrid-api-bank-angular/model/externalBankAccount';
import {
  AccountBankModel,
  AccountsService,
  PostQuoteBankModel,
  QuoteBankModel,
  QuotesService,
  TransferBankModel
} from '@cybrid/cybrid-api-bank-angular';

// Utility
import { AssetPipe } from '@pipes';
import { CurrencyMask } from '../../../shared/utility/currency-mask';

interface TransferGroup {
  account: FormControl<ExternalBankAccountBankModel>;
  amount: FormControl<number | null>;
}

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.scss']
})
export class TransferComponent implements OnInit, OnDestroy {
  bankAccounts$: BehaviorSubject<ExternalBankAccountBankModel[] | null> =
    new BehaviorSubject<ExternalBankAccountBankModel[] | null>(null);
  fiatAccount$: BehaviorSubject<AccountBankModel | null> =
    new BehaviorSubject<AccountBankModel | null>(null);

  fiatAsset!: Asset;
  side: string = 'deposit';
  transferGroup!: FormGroup<TransferGroup>;

  isLoading$ = new BehaviorSubject(true);
  error$ = new BehaviorSubject(false);
  unsubscribe$ = new Subject();

  routingData: RoutingData = {
    route: 'account-list',
    origin: 'transfer'
  };

  MockFiatAccount: AccountBankModel = {
    type: 'fiat',
    guid: 'ce3fa5a7fc35b632f2526df447f75f89',
    created_at: '2022-11-24T18:32:53.196Z',
    asset: 'USD',
    name: 'USD',
    customer_guid: '378c691c1b5ba3b938e17c1726202fe4',
    platform_balance: '500',
    platform_available: '500',
    state: 'created'
  };

  constructor(
    public configService: ConfigService,
    private bankAccountService: BankAccountService,
    private quotesService: QuotesService,
    private accountsService: AccountsService,
    private assetPipe: AssetPipe,
    private assetService: AssetService,
    private errorService: ErrorService,
    private eventService: EventService,
    private router: RoutingService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initTransferGroup();
    this.listAccounts();
  }

  ngOnDestroy() {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  initTransferGroup() {
    this.transferGroup = new FormGroup<TransferGroup>({
      account: new FormControl(),
      amount: new FormControl(null, {
        validators: [Validators.required],
        nonNullable: true
      })
    });

    // 'amount' control validation
    this.transferGroup.controls.amount.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((value) => {
        const amountControl = this.transferGroup.controls.amount;

        if (value) {
          const platformAvailable = this.assetPipe.transform(
            this.fiatAccount$.getValue()?.platform_available!,
            this.fiatAsset,
            'trade'
          ) as number;

          if (value.toString().includes('.')) {
            amountControl.setValue(CurrencyMask(value), {
              emitEvent: false
            });
          }

          if (this.side == 'withdrawal' && value > platformAvailable) {
            amountControl.setErrors({ insufficient_funds: true });
          }
        }
      });
  }

  onSwitchSide(tab: number | null): void {
    switch (tab) {
      case -1: {
        this.side = 'deposit';
        break;
      }
      case 1: {
        this.side = 'withdrawal';
        break;
      }
    }

    // Update 'amount' validators which are dependent on side
    this.transferGroup.controls.amount.clearValidators();
    this.transferGroup.controls.amount.updateValueAndValidity();
  }

  listAccounts(): void {
    this.configService
      .getCustomer$()
      .pipe(
        switchMap((customer) =>
          combineLatest([
            this.bankAccountService
              .listExternalBankAccounts()
              .pipe(catchError((err) => of(err))),
            this.accountsService
              .listAccounts(
                undefined,
                undefined,
                undefined,
                undefined,
                customer.guid
              )
              .pipe(
                map((list) => {
                  return list.objects.find(
                    (account) => account.type == AccountBankModel.TypeEnum.Fiat
                  );
                }),
                catchError((err) => of(err))
              )
          ])
        ),
        map((combined) => {
          const [bankAccounts, fiatAccount] = combined;

          this.fiatAsset = this.assetService.getAsset(fiatAccount.asset!);
          this.fiatAccount$.next(fiatAccount);
          this.bankAccounts$.next(bankAccounts.objects);

          this.transferGroup.patchValue({
            account: bankAccounts.objects[0]
          });

          this.isLoading$.next(false);
        }),
        catchError((err) => {
          this.eventService.handleEvent(
            LEVEL.ERROR,
            CODE.DATA_ERROR,
            'There was an error fetching bank account details'
          );
          this.errorService.handleError(
            new Error('There was an error fetching bank account details')
          );
          return of(err);
        })
      )
      .subscribe();
  }

  onTransfer(): void {
    const account = this.transferGroup.value.account;
    const asset = this.assetService.getAsset(
      this.transferGroup.value.account?.asset!
    );
    const amount = this.transferGroup.value.amount;

    if (asset && amount) {
      let postQuoteBankModel: PostQuoteBankModel;

      this.configService
        .getCustomer$()
        .pipe(
          take(1),
          switchMap((customer) => {
            this.eventService.handleEvent(
              LEVEL.INFO,
              CODE.DATA_FETCHING,
              'Fetching quote...'
            );
            postQuoteBankModel = {
              product_type: PostQuoteBankModel.ProductTypeEnum.Funding,
              customer_guid: customer.guid,
              asset: asset.code,
              side: this.side as PostQuoteBankModel.SideEnum,
              deliver_amount: this.assetPipe.transform(
                amount,
                asset,
                'base'
              ) as string
            };
            return this.quotesService.createQuote(postQuoteBankModel);
          }),
          switchMap((quoteBankModel: QuoteBankModel) => {
            const transferConfirmData: TransferConfirmData = {
              quoteBankModel: quoteBankModel,
              postQuoteBankModel: postQuoteBankModel,
              externalBankAccountBankModel: account!,
              asset: asset
            };

            const dialogRef = this.dialog.open(TransferConfirmComponent, {
              data: transferConfirmData
            });
            return dialogRef.afterClosed();
          }),
          map((transferBankModel: TransferBankModel) => {
            if (transferBankModel) {
              const transferDetailsData: TransferDetailsData = {
                transferBankModel: transferBankModel,
                externalBankAccountBankModel: account!,
                asset: asset
              };
              this.dialog.open(TransferDetailsComponent, {
                disableClose: false,
                data: transferDetailsData
              });
            }
          }),
          catchError((err) => {
            this.eventService.handleEvent(
              LEVEL.ERROR,
              CODE.DATA_ERROR,
              'Error creating transfer'
            );
            this.errorService.handleError(err);
            return of(err);
          })
        )
        .subscribe();
    } else {
      this.error$.next(true);
    }
  }

  onAddAccount(): void {
    this.router.handleRoute({
      origin: 'transfer',
      route: 'bank-account-connect'
    });
  }
}
