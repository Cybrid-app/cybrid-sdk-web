import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import {
  BehaviorSubject,
  catchError,
  combineLatest,
  EMPTY,
  expand,
  interval,
  map,
  of,
  reduce,
  startWith,
  Subject,
  switchMap,
  take,
  takeUntil
} from 'rxjs';

// Services
import {
  AssetService,
  AccountService,
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
  ExternalBankAccountListBankModel,
  PostQuoteBankModel,
  QuoteBankModel,
  QuotesService,
  TransferBankModel
} from '@cybrid/cybrid-api-bank-angular';
import { Account, PostQuote } from '@models';

// Utility
import { AssetFormatPipe } from '@pipes';
import { fiatMask } from '@utility';
import { TranslatePipe } from '@ngx-translate/core';

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
  isCreatingTransfer$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  isLoading$ = new BehaviorSubject(true);
  unsubscribe$ = new Subject();

  routingData: RoutingData = {
    route: 'account-list',
    origin: 'transfer'
  };

  externalBankAccountsPerPage = 10;

  constructor(
    public configService: ConfigService,
    private bankAccountService: BankAccountService,
    private quotesService: QuotesService,
    private accountService: AccountService,
    public assetFormatPipe: AssetFormatPipe,
    private translatePipe: TranslatePipe,
    private assetService: AssetService,
    private errorService: ErrorService,
    private eventService: EventService,
    private router: RoutingService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar
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
          // Todo: @Dustin Swap for AssetFormatPipe
          const platformAvailable = this.assetFormatPipe.transform(
            this.fiatAccount$.getValue()?.platform_available!,
            this.fiatAsset.code,
            'trade'
          ) as number;

          if (value.toString().includes('.')) {
            amountControl.setValue(fiatMask(value), {
              emitEvent: false
            });
          }

          if (this.side == 'withdrawal' && value > platformAvailable) {
            amountControl.setErrors({ nonSufficientFunds: true });
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

  // Expand function to page through external accounts
  pageExternalAccounts(
    perPage: number,
    list: ExternalBankAccountListBankModel
  ) {
    return list.objects.length == perPage
      ? this.bankAccountService.listExternalBankAccounts(
          (Number(list.page) + 1).toString(),
          perPage.toString()
        )
      : EMPTY;
  }

  accumulateExternalAccounts(
    acc: ExternalBankAccountBankModel[],
    value: ExternalBankAccountBankModel[]
  ) {
    return [...acc, ...value];
  }

  listAccounts(): void {
    this.configService
      .getConfig$()
      .pipe(
        take(1),
        switchMap((config) => interval(config.refreshInterval)),
        startWith(0),
        switchMap(() =>
          combineLatest([
            this.bankAccountService
              .listExternalBankAccounts(
                undefined,
                this.externalBankAccountsPerPage.toString()
              )
              .pipe(
                expand((list) =>
                  this.pageExternalAccounts(
                    this.externalBankAccountsPerPage,
                    list
                  )
                ),
                map((list) => list.objects),
                reduce((acc, value) =>
                  this.accumulateExternalAccounts(acc, value)
                ),
                map((accounts) =>
                  accounts.filter((account) => account.state === 'completed')
                ),
                catchError((err) => of(err))
              ),
            this.accountService.listAccounts().pipe(
              map((accountList) => accountList.objects),
              map((accounts) => {
                return accounts.find(
                  (account) => account.type == Account.TypeEnum.Fiat
                );
              }),
              catchError((err) => of(err))
            )
          ])
        ),
        map((combined) => {
          const [bankAccounts, fiatAccount]: [
            ExternalBankAccountBankModel[],
            AccountBankModel
          ] = combined;

          this.fiatAsset = this.assetService.getAsset(fiatAccount.asset!);
          this.fiatAccount$.next(fiatAccount);
          this.bankAccounts$.next(bankAccounts);

          this.transferGroup.patchValue({
            account: bankAccounts[0]
          });

          this.isLoading$.next(false);
        }),
        takeUntil(this.unsubscribe$),
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
    this.isCreatingTransfer$.next(true);

    const account = this.transferGroup.value.account;
    const asset = this.assetService.getAsset(
      this.transferGroup.value.account?.asset!
    );
    const amount = this.transferGroup.value.amount;

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
            side: this.side as PostQuote.SideEnum,
            deliver_amount: this.assetFormatPipe.transform(
              amount!,
              asset.code,
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
          this.isCreatingTransfer$.next(false);

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
          this.isCreatingTransfer$.next(false);

          this.snackbar.open(
            this.translatePipe.transform('transfer.error'),
            'OK'
          );
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
  }

  onAddAccount(): void {
    this.router.handleRoute({
      origin: 'transfer',
      route: 'bank-account-connect'
    });
  }
}
