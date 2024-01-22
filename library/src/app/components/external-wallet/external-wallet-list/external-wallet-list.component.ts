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
import { MatDialog } from '@angular/material/dialog';

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
    ExternalWalletBankModel,
    ExternalWalletListBankModel,
    AccountBankModel,
    AssetBankModel
} from '@cybrid/cybrid-api-bank-angular';

// Services
import {
    ExternalWalletService,
    AccountService,
    AssetService,
    CODE,
    ComponentConfig,
    ConfigService,
    ErrorService,
    EventService,
    LEVEL,
    RoutingData,
    RoutingService
} from '@services';
  
// Components
import { TransferSummaryComponent } from '@components';

// Utility
import { symbolBuild } from '@utility';
import { AssetFormatPipe } from '@pipes';

@Component({
    selector: 'external-wallet-list',
    templateUrl: './external-wallet-list.component.html',
    styleUrls: ['./external-wallet-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExternalWalletListComponent
  implements OnInit, AfterContentInit, OnDestroy
{
    @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort!: MatSort;
    dataSource: MatTableDataSource<ExternalWalletBankModel> = new MatTableDataSource();

    account$ = new BehaviorSubject<AccountBankModel | null>(null);
    walletList$ = new BehaviorSubject<ExternalWalletListBankModel | null>(null);

    displayedColumns: string[] = ['transaction', 'balance'];

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
        route: 'external-wallet',
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
                    this.totalRows = Number(wallets.total);
                    this.dataSource.data = wallets.objects;
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

    sortingWalletsDataAccessor(wallet: ExternalWalletBankModel, columnDef: string) {
        switch (columnDef) {
          case 'transaction':
            return wallet.created_at!;
          case 'balance':
            return wallet.name!;
          default:
            return '';
        }
    }
}