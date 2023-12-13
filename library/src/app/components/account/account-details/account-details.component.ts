import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatSort } from '@angular/material/sort';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';

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
  SymbolPriceBankModel,
  TradeBankModel,
  TradeListBankModel,
  TradesService
} from '@cybrid/cybrid-api-bank-angular';

// Services
import {
  AccountBankModelWithDetails,
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
import { TradeSummaryComponent } from '@components';

// Utility
import { symbolBuild } from '@utility';
import { AssetFormatPipe } from '@pipes';

@Component({
  selector: 'app-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountDetailsComponent
  implements OnInit, AfterContentInit, OnDestroy
{
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  dataSource: MatTableDataSource<TradeBankModel> = new MatTableDataSource();

  account$ = new BehaviorSubject<AccountBankModelWithDetails | null>(null);
  tradeList$ = new BehaviorSubject<TradeListBankModel | null>(null);

  accountGuid: string | null = null;
  asset: AssetBankModel | null = null;
  counterAsset: AssetBankModel | null = null;

  displayedColumns: string[] = ['transaction', 'balance'];

  totalRows = 0;
  pageSize = 5;
  currentPage = 0;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  isLoading$ = combineLatest([this.account$, this.tradeList$]).pipe(
    switchMap(([account, tradeList]) =>
      account && tradeList ? of(false) : of(true)
    )
  );
  isLoadingResults$ = new BehaviorSubject(true);
  isRecoverable$ = new BehaviorSubject(true);

  refreshDataSub!: Subscription;

  unsubscribe$ = new Subject();

  routingData: RoutingData = {
    route: 'account-list',
    origin: 'account-detail'
  };

  constructor(
    public configService: ConfigService,
    private eventService: EventService,
    private accountService: AccountService,
    private tradeService: TradesService,
    private priceService: PriceService,
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
      'Initializing account-detail component'
    );
    this.refreshData();
  }

  ngAfterContentInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sortingDataAccessor = this.sortingDataAccessor;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  processAccount(
    account: AccountBankModelWithDetails,
    priceList: SymbolPriceBankModel[]
  ): AccountBankModelWithDetails {
    const processedAccount = { ...account };

    processedAccount.price = priceList.find((price: SymbolPriceBankModel) => {
      return account.asset === price.symbol?.split('-')[0];
    });

    if (processedAccount.price) {
      const platformBalance = Number(
        this.assetFormatPipe.transform(
          account.platform_balance,
          <string>account.asset,
          'trade'
        )
      );

      processedAccount.value =
        Number(processedAccount.price.sell_price) * platformBalance;
    }

    return processedAccount;
  }

  getAccount(): void {
    combineLatest([
      this.configService.getConfig$(),
      this.accountService.getAccount(<string>this.accountGuid),
      this.priceService.listPrices()
    ])
      .pipe(
        take(1),
        tap(([config, account]) => {
          this.asset = this.assetService.getAsset(<string>account.asset);
          this.counterAsset = this.assetService.getAsset(config.fiat);
        }),
        map(([config, account, priceList]) =>
          this.processAccount(account, priceList)
        ),
        tap((account) => {
          this.account$.next(account);
        }),
        catchError((err) => {
          this.refreshDataSub?.unsubscribe();
          this.isRecoverable$.next(false);

          return of(err);
        })
      )
      .subscribe();
  }

  listTrades(): void {
    this.isLoadingResults$.next(true);

    this.tradeService
      .listTrades(
        this.currentPage.toString(),
        this.pageSize.toString(),
        '',
        '',
        '',
        <string>this.accountGuid
      )
      .pipe(
        tap((trades) => {
          this.totalRows = Number(trades.total);
          this.dataSource.data = trades.objects;

          this.tradeList$.next(trades);
          this.isLoadingResults$.next(false);
        }),
        catchError((err) => {
          this.refreshDataSub?.unsubscribe();
          this.dataSource.data = [];
          this.isRecoverable$.next(false);

          return of(err);
        })
      )
      .subscribe();
  }

  refreshData(): void {
    this.refreshDataSub = this.configService
      .getConfig$()
      .pipe(
        take(1),
        switchMap((cfg: ComponentConfig) => {
          return timer(cfg.refreshInterval, cfg.refreshInterval);
        }),
        startWith(0),
        tap(() => {
          this.getAccount();
          this.listTrades();
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe();
  }

  pageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;

    this.listTrades();
  }

  sortChange(): void {
    this.dataSource.sort = this.sort;
  }

  sortingDataAccessor(trade: TradeBankModel, columnDef: string) {
    switch (columnDef) {
      case 'transaction':
        return trade.created_at!;
      case 'balance':
        return trade.side == 'buy'
          ? trade.receive_amount!
          : trade.deliver_amount!;
      default:
        return '';
    }
  }

  onTrade(): void {
    const extras: NavigationExtras = {
      queryParams: {
        code: this.asset?.code
      }
    };
    this.routingService.handleRoute({
      origin: 'account-details',
      route: 'trade',
      extras: extras
    });
  }

  onRowClick(trade: TradeBankModel): void {
    this.dialog.open(TradeSummaryComponent, {
      data: {
        model: trade,
        asset: this.asset,
        counter_asset: this.counterAsset
      }
    });
  }
}
