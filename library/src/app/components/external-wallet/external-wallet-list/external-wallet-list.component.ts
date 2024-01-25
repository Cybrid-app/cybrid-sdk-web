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

import {
  BehaviorSubject,
  catchError,
  of,
  startWith,
  Subject,
  Subscription,
  switchMap,
  take,
  map,
  takeUntil,
  tap,
  timer
} from 'rxjs';

// Client
import {
  ExternalWalletBankModel,
  ExternalWalletListBankModel,
  AccountBankModel
} from '@cybrid/cybrid-api-bank-angular';

// Services
import {
  ExternalWalletService,
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
import { AssetFormatPipe } from '@pipes';

@Component({
  selector: 'app-external-wallet-list',
  templateUrl: './external-wallet-list.component.html',
  styleUrls: ['./external-wallet-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExternalWalletListComponent
  implements OnInit, AfterContentInit, OnDestroy
{
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  dataSource: MatTableDataSource<ExternalWalletBankModel> =
    new MatTableDataSource();

  walletList$ = new BehaviorSubject<ExternalWalletListBankModel | null>(null);

  displayedColumns: string[] = ['name', 'state'];

  totalRows = 0;
  pageSize = 20;
  currentPage = 0;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  isLoadingWallets$ = this.walletList$.pipe(
    switchMap((account) => (account ? of(false) : of(true)))
  );

  isLoadingResults$ = new BehaviorSubject(true);
  isRecoverable$ = new BehaviorSubject(true);
  refreshDataSub!: Subscription;
  unsubscribe$ = new Subject();

  routingData: RoutingData = {
    route: 'external-wallet-list',
    origin: 'external-wallet-list'
  };

  constructor(
    public configService: ConfigService,
    private eventService: EventService,
    private externalWalletService: ExternalWalletService,
    private assetService: AssetService,
    private route: ActivatedRoute,
    private routingService: RoutingService,
    private assetFormatPipe: AssetFormatPipe
  ) {}

  ngOnInit() {
    this.eventService.handleEvent(
      LEVEL.INFO,
      CODE.COMPONENT_INIT,
      'Initializing external-wallet-list component'
    );
    this.refreshData();
  }

  ngAfterContentInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sortingDataAccessor = this.sortingWalletsDataAccessor;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  listExternalWallets(): void {
    this.isLoadingResults$.next(true);

    this.externalWalletService
      .listExternalWallets()
      .pipe(
        tap((wallets) => {
          let walletsFiltered = wallets.objects.filter(
            (item) => !['deleted', 'deleting'].includes(item.state!)
          );
          this.totalRows = Number(walletsFiltered.length);
          this.dataSource.data = walletsFiltered;
          this.walletList$.next(wallets);
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
          this.listExternalWallets();
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe();
  }

  pageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.listExternalWallets();
  }

  sortChange(): void {
    this.dataSource.sort = this.sort;
  }

  sortingWalletsDataAccessor(
    wallet: ExternalWalletBankModel,
    columnDef: string
  ) {
    switch (columnDef) {
      case 'name':
        return wallet.name!;
      case 'state':
        return wallet.state!;
      default:
        return '';
    }
  }

  onAddWallet(): void {
    this.configService
      .getConfig$()
      .pipe(
        take(1),
        map((config: ComponentConfig) => {
          if (config.routing) {
            const extras: NavigationExtras = {
              queryParams: {}
            };
            this.routingService.handleRoute({
              route: 'external-wallet-create',
              origin: 'external-wallet-list',
              extras
            });
          }
        })
      )
      .subscribe();
  }

  onWalletClick(wallet: ExternalWalletBankModel): void {
    this.configService
      .getConfig$()
      .pipe(
        take(1),
        map((config: ComponentConfig) => {
          if (config.routing) {
            const extras: NavigationExtras = {
              queryParams: {
                walletGuid: wallet.guid
              }
            };
            this.routingService.handleRoute({
              route: 'external-wallet-detail',
              origin: 'external-wallet-list',
              extras
            });
          }
        })
      )
      .subscribe();
  }
}
