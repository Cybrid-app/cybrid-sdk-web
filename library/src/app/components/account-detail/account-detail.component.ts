import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import {
  BehaviorSubject,
  catchError,
  map,
  of,
  Subject,
  switchMap,
  take,
  takeUntil,
  timer
} from 'rxjs';

// Client
import { TradeBankModel, TradesService } from '@cybrid/cybrid-api-bank-angular';

// Services
import {
  Account,
  AccountService,
  Asset,
  AssetService,
  CODE,
  ComponentConfig,
  ConfigService,
  EventService,
  LEVEL,
  RoutingData,
  RoutingService
} from '@services';

// Utility
import { Constants } from '@constants';
import { symbolBuild } from '@utility';

@Component({
  selector: 'app-account-detail',
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.scss']
})
export class AccountDetailComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  dataSource: MatTableDataSource<TradeBankModel> = new MatTableDataSource();

  accountGuid: string = '';
  account$ = new BehaviorSubject<Account | null>(null);

  asset: Asset = Constants.BTC_ASSET;
  counterAssetCode = Constants.USD_ASSET.code;

  displayedColumns: string[] = ['transaction', 'balance'];
  isLoadingResults = true;

  totalRows = 0;
  pageSize = 5;
  currentPage = 0;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  isLoading$ = new BehaviorSubject(true);
  isRecoverable$ = new BehaviorSubject(true);
  private unsubscribe$ = new Subject();

  routingData: RoutingData = {
    route: 'account-list',
    origin: 'account-detail'
  };

  constructor(
    public configService: ConfigService,
    private eventService: EventService,
    private accountService: AccountService,
    private tradeService: TradesService,
    private assetService: AssetService,
    private route: ActivatedRoute,
    private routingService: RoutingService
  ) {}

  ngOnInit() {
    this.eventService.handleEvent(
      LEVEL.INFO,
      CODE.COMPONENT_INIT,
      'Initializing account-detail component'
    );
    this.getAccount();
    this.refreshData();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;

    this.dataSource.sortingDataAccessor = this.sortingDataAccessor;
    this.dataSource.sort = this.sort;

    this.getTrades();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  getAccount() {
    // Set currently selected account based on routing data, for instance from an account-list row click
    this.route.queryParams
      .pipe(
        take(1),
        map((params) => {
          if (params) {
            this.accountGuid = params['accountGuid'];
          }
        })
      )
      .subscribe();

    this.configService
      .getConfig$()
      .pipe(
        map((config) => {
          this.counterAssetCode = config.fiat;
          return config.fiat;
        }),
        switchMap((counterAsset) => {
          return this.accountService
            .getAccountDetail(this.accountGuid, counterAsset)
            .pipe(
              map((account) => {
                this.asset = account.asset;
                this.account$.next(account);
                this.isLoading$.next(false);
              })
            );
        })
      )
      .subscribe();
  }

  getTrades(): void {
    this.isLoadingResults = true;

    this.tradeService
      .listTrades(
        this.currentPage.toString(),
        this.pageSize.toString(),
        '',
        '',
        '',
        this.accountGuid
      )
      .pipe(
        map((trades) => {
          this.dataSource.data = trades.objects;

          this.paginator.pageIndex = this.currentPage;
          this.paginator.length = Number(trades.total);

          this.isLoadingResults = false;
        }),
        catchError((err) => {
          return of(err);
        })
      )
      .subscribe();
  }

  pageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;

    this.getTrades();
  }

  sortChange(): void {
    this.dataSource.sort = this.sort;
  }

  refreshData(): void {
    this.configService
      .getConfig$()
      .pipe(
        switchMap((cfg: ComponentConfig) => {
          return timer(cfg.refreshInterval, cfg.refreshInterval);
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe({
        next: () => {
          this.eventService.handleEvent(
            LEVEL.INFO,
            CODE.DATA_FETCHING,
            'Refreshing account details...'
          );
          this.getAccount();
          this.getTrades();
        }
      });
  }

  sortingDataAccessor(trade: TradeBankModel, columnDef: string) {
    switch (columnDef) {
      case 'transaction':
        return trade.created_at!;
      case 'balance':
        return trade.side! == 'buy'
          ? trade.receive_amount!
          : trade.deliver_amount!;
      default:
        return '';
    }
  }

  onTrade(): void {
    const extras: NavigationExtras = {
      queryParams: {
        asset: JSON.stringify(this.asset),
        symbol_pair: symbolBuild(this.asset.code, this.counterAssetCode)
      }
    };
    this.routingService.handleRoute({
      origin: 'account-detail',
      route: 'trade',
      extras: extras
    });
  }
}
