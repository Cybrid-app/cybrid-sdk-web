import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewChild
  } from '@angular/core';
  import { ActivatedRoute, NavigationExtras } from '@angular/router';
  import { MatTableDataSource } from '@angular/material/table';
  import { MatPaginator, PageEvent } from '@angular/material/paginator';
  import { MatSort } from '@angular/material/sort';
  import { MatDialog, MatDialogRef } from '@angular/material/dialog';
  
  import {
    BehaviorSubject,
    catchError,
    combineLatest,
    map,
    Observable,
    of,
    startWith,
    Subject,
    Subscription,
    switchMap,
    take,
    takeUntil,
    tap,
    timer,
    withLatestFrom
  } from 'rxjs';
  
  // Client
  import {
    AccountBankModel,
    AssetBankModel,
    DepositAddressBankModel,
    DepositAddressesService,
    PostDepositAddressBankModel
  } from '@cybrid/cybrid-api-bank-angular';
  
  // Services
  import {
    AccountService,
    AssetService,
    CODE,
    ComponentConfig,
    ConfigService,
    ErrorService,
    EventService,
    LEVEL,
    RoutingData,
    RoutingService,
    PriceService
  } from '@services';
  
  // Components
  import { DepositAddressPaymentComponent, DepositAddressPayment } from '@components';
  
  // Utility
  import { symbolBuild } from '@utility';
  import { AssetFormatPipe } from '@pipes';
  
  @Component({
    selector: 'app-deposit-address',
    templateUrl: './deposit-address.component.html',
    styleUrls: ['./deposit-address.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
  })
  export class DepositAddressComponent
    implements OnInit, AfterContentInit, OnDestroy
  {
  
    account$ = new BehaviorSubject<AccountBankModel | null>(null);
    depositAddress$ = new BehaviorSubject<DepositAddressBankModel | null>(null);
    depositAddressUrl$ = new BehaviorSubject<string | null>(null);
  
    accountGuid: string | null = null;
    asset: AssetBankModel | null = null;
    depositValues: DepositAddressPayment | null = null;
  
    isLoading$ = combineLatest([this.account$, this.depositAddress$]).pipe(
      switchMap(([account, depositAddress]) =>
        account && depositAddress ? of(false) : of(true)
      )
    );
    isLoadingQR$ = this.depositAddressUrl$.pipe(
      switchMap((url) => (url ? of(false) : of(true)))
    );

    isLoadingResults$ = new BehaviorSubject(true);
    isRecoverable$ = new BehaviorSubject(true);
  
    refreshDataSub!: Subscription;
  
    unsubscribe$ = new Subject();
  
    routingData: RoutingData = {
      route: 'account-list',
      origin: 'account-detail'
    };
    dialogRef!: MatDialogRef<DepositAddressPaymentComponent>;
  
    constructor(
      public configService: ConfigService,
      private eventService: EventService,
      private accountService: AccountService,
      private depositAddressService: DepositAddressesService,
      private assetService: AssetService,
      private route: ActivatedRoute,
      private routingService: RoutingService,
      public dialog: MatDialog,
      private assetFormatPipe: AssetFormatPipe
    ) {
      this.route.queryParams
        .pipe(
          take(1),
          tap((params) => (this.accountGuid = params['accountGuid']))
        )
        .subscribe();
    }
  
    ngOnInit() {
      this.eventService.handleEvent(
        LEVEL.INFO,
        CODE.COMPONENT_INIT,
        'Initializing deposit-address component'
      );
      this.refreshData();
    }
  
    ngAfterContentInit() {}
  
    ngOnDestroy(): void {
      this.unsubscribe$.next('');
      this.unsubscribe$.complete();
    }

    refreshData(): void {
      this.getAccount();
      this.getListDepositAddress();
    }

    getAccount(): void {
      this.accountService
        .getAccount(<string>this.accountGuid)
        .pipe(
          tap((account) => {
            this.account$.next(account);
            this.asset = this.assetService.getAsset(<string>account.asset);
          }),
          catchError((err) => {
            this.refreshDataSub?.unsubscribe();
            this.isRecoverable$.next(false);
            return of(err);
          })
        )
        .subscribe();
    }

    getListDepositAddress(): void {
      this.depositAddressService
        .listDepositAddresses()
        .pipe(
          tap((listDepositAddress) => {
            this.verifyingAtLeastHaveOneAddress(listDepositAddress.objects);
          }),
          catchError((err) => {
            this.refreshDataSub?.unsubscribe();
            this.isRecoverable$.next(false);
            return of(err);
          })
        )
        .subscribe();
    }

    getDepositAddress(depositAddressGuid: String): void {
      this.depositAddressService
        .getDepositAddress(<string>depositAddressGuid)
        .pipe(
          tap((depositAddress) => {
            this.depositAddress$.next(depositAddress);
            this.checkDepositAddressValue(depositAddress);
          }),
          catchError((err) => {
            this.refreshDataSub?.unsubscribe();
            this.isRecoverable$.next(false);
            return of(err);
          })
        )
        .subscribe();
    }

    createDepositAddress(): void {

      const postDepositAddressBankModel: PostDepositAddressBankModel = {
        account_guid: <string>this.accountGuid
      }

      this.depositAddressService
        .createDepositAddress(postDepositAddressBankModel)
        .pipe(
          tap((depositAddress) => {
            this.depositAddress$.next(depositAddress);
            this.checkDepositAddressValue(depositAddress);
          }),
          catchError((err) => {
            this.refreshDataSub?.unsubscribe();
            this.isRecoverable$.next(false);
            return of(err);
          })
        )
        .subscribe();
    }

    verifyingAtLeastHaveOneAddress(depositAddresses: DepositAddressBankModel[]): void {
      const matchingAddress = depositAddresses.find(address => address.account_guid === this.accountGuid);
      if (matchingAddress) {
        this.getDepositAddress(matchingAddress.guid ?? "");
      } else {
        this.createDepositAddress();
      }
    }

    checkDepositAddressValue(depositAddress: DepositAddressBankModel): void {
      if (depositAddress.state == DepositAddressBankModel.StateEnum.Created) {
        this.createAddressUrl(depositAddress.address ?? "", depositAddress.asset ?? "")
      }
    }

    createAddressUrl(depositAddress: string, assetCode: string, amount: string = "", message: string = "") {

      var addressFormatted = ""
      switch(assetCode) {
        case 'BTC':
            addressFormatted += "bitcoin:" + depositAddress;
            if(amount != '') {
              addressFormatted += "&amount=" + amount;
            }
            if(message != '') {
              addressFormatted += "?message=" + message;
            }
            break;
        default:
            addressFormatted += depositAddress   
      }
      console.log("URL: " + addressFormatted);
      this.depositAddressUrl$.next(addressFormatted);
    }

    // -- View Functions
    openPaymentDialog(): void {
      this.dialogRef = this.dialog.open(DepositAddressPaymentComponent, {
        data: {
          account: this.account$.value
        }
      });

      this.dialogRef
      .afterClosed()
      .pipe(
        map((value: DepositAddressPayment) => {
          if (value) {
            this.depositValues = value;
            this.createAddressUrl(
              this.depositAddress$.value?.address ?? "",
              this.depositAddress$.value?.asset ?? "",
              value.amount.toString(),
              value.message
            )
          }
        })
      )
      .subscribe();
    }
  }
  