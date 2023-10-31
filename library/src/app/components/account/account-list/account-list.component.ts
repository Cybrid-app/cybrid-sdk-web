import {
  AfterContentInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { NavigationExtras } from '@angular/router';

import {
  BehaviorSubject,
  catchError,
  combineLatest,
  map,
  of,
  startWith,
  Subject,
  Subscription,
  switchMap,
  take,
  takeUntil,
  tap,
  timer
} from 'rxjs';

// Client
import {
  AccountBankModel,
  SymbolPriceBankModel
} from '@cybrid/cybrid-api-bank-angular';

// Services
import {
  AccountService,
  AccountBankModelWithDetails,
  PriceService,
  ComponentConfig,
  LEVEL,
  CODE,
  ConfigService,
  EventService,
  RoutingData,
  RoutingService
} from '@services';

// Utility
import { AssetFormatPipe } from '@pipes';

@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.scss']
})
export class AccountListComponent
  implements OnInit, AfterContentInit, OnDestroy {
  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  dataSource = new MatTableDataSource<AccountBankModelWithDetails>();

  totalAccountsValue$ = new BehaviorSubject<string | null>(null);

  displayedColumns: string[] = ['account', 'balance'];

  isLoading$ = new BehaviorSubject(true);
  isLoadingResults$ = new BehaviorSubject(true);
  isRecoverable$ = new BehaviorSubject(true);

  refreshDataSub!: Subscription;

  unsubscribe$ = new Subject();

  routingData: RoutingData = {
    route: 'price-list',
    origin: 'account-list'
  };

  constructor(
    public configService: ConfigService,
    private priceService: PriceService,
    private eventService: EventService,
    private accountService: AccountService,
    private routingService: RoutingService,
    private assetFormatPipe: AssetFormatPipe
  ) {}

  ngOnInit(): void {
    this.eventService.handleEvent(
      LEVEL.INFO,
      CODE.COMPONENT_INIT,
      'Initializing account-list component'
    );
    this.refreshData();
  }

  ngAfterContentInit() {
    this.dataSource.sortingDataAccessor = this.sortingDataAccessor;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  processAccounts(
    accountList: AccountBankModel[],
    priceList: SymbolPriceBankModel[]
  ): AccountBankModelWithDetails[] {
    const processedAccounts: AccountBankModelWithDetails[] = [];

    accountList.forEach((account: AccountBankModelWithDetails) => {
      const processedAccount: AccountBankModelWithDetails = { ...account };

      processedAccount.price = priceList.find((price: SymbolPriceBankModel) => {
        return account.asset === price.symbol?.split('-')[0];
      });

      if (processedAccount.price) {
        processedAccount.value =
          Number(processedAccount.price.sell_price) *
          Number(
            this.assetFormatPipe.transform(
              account.platform_balance,
              <string>account.asset,
              'trade'
            )
          );
      } else if (processedAccount.type == 'fiat') {
        processedAccount.value = Number(
          this.assetFormatPipe.transform(
            processedAccount.platform_available,
            <string>account.asset,
            'trade'
          )
        );
      }

      processedAccounts.push(processedAccount);
    });

    this.totalAccountsValue$.next(
      processedAccounts
        .reduce((acc, account) => acc + (account.value || 0), 0)
        .toString()
    );

    return processedAccounts;
  }

  listAllAccounts(): void {
    this.isLoadingResults$.next(true);

    combineLatest([
      this.accountService.listAllAccounts(),
      this.priceService.listPrices()
    ])
      .pipe(
        take(1),
        map(([accountList, priceList]) => {
          return this.processAccounts(accountList, priceList);
        }),
        tap((accounts) => (this.dataSource.data = accounts)),
        catchError((err) => {
          this.refreshDataSub?.unsubscribe();
          this.isRecoverable$.next(false);

          return of(err);
        })
      )
      .subscribe(() => {
        this.isLoading$.next(false);
        this.isLoadingResults$.next(false);
      });
  }

  refreshData(): void {
    this.refreshDataSub = this.configService
      .getConfig$()
      .pipe(
        switchMap((cfg: ComponentConfig) => {
          return timer(cfg.refreshInterval, cfg.refreshInterval);
        }),
        startWith(0),
        tap(() => this.listAllAccounts()),
        takeUntil(this.unsubscribe$)
      )
      .subscribe();
  }

  sortChange(): void {
    this.dataSource.sort = this.sort;
  }

  sortingDataAccessor(account: AccountBankModelWithDetails, columnDef: string) {
    switch (columnDef) {
      case 'account':
        return <string>account.asset;
      case 'balance':
        return <number>account.value;
      default:
        return '';
    }
  }

  onRowClick(account: AccountBankModel): void {
    this.configService
      .getConfig$()
      .pipe(
        take(1),
        map((config: ComponentConfig) => {
          if (config.routing) {
            const extras: NavigationExtras = {
              queryParams: {
                accountGuid: account.guid
              }
            };
            this.routingService.handleRoute({
              route: 'account-details',
              origin: 'account-list',
              extras
            });
          }
        })
      )
      .subscribe();
  }
}
