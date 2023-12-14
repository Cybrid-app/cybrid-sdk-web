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
  AccountBankModel,
  AssetBankModel,
  TransferBankModel,
  TransferListBankModel
} from '@cybrid/cybrid-api-bank-angular';

// Services
import {
  AccountBankModelWithDetails,
  AccountService,
  AssetService,
  TransferService,
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
  selector: 'app-fiat-account-details',
  templateUrl: './fiat-account-details.component.html',
  styleUrls: ['./fiat-account-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FiatAccountDetailsComponent
  implements OnInit, AfterContentInit, OnDestroy
{
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  dataSource: MatTableDataSource<TransferBankModel> = new MatTableDataSource();

  account$ = new BehaviorSubject<AccountBankModelWithDetails | null>(null);
  transferList$ = new BehaviorSubject<TransferListBankModel | null>(null);

  accountGuid: string | null = null;
  asset: AssetBankModel | null = null;

  displayedColumns: string[] = ['transaction', 'balance'];

  totalRows = 0;
  pageSize = 5;
  currentPage = 0;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  isLoadingAccount$ = this.account$.pipe(
    switchMap((account) => (account ? of(false) : of(true)))
  );

  isLoadingTransfers$ = combineLatest([this.account$, this.transferList$]).pipe(
    switchMap(([account, transferList]) =>
      account && transferList ? of(false) : of(true)
    )
  );

  isLoadingResults$ = new BehaviorSubject(true);
  isRecoverable$ = new BehaviorSubject(true);
  refreshDataSub!: Subscription;
  unsubscribe$ = new Subject();

  routingData: RoutingData = {
    route: 'account-list',
    origin: 'fiat-account-detail'
  };

  constructor(
    public configService: ConfigService,
    private eventService: EventService,
    private accountService: AccountService,
    private transferService: TransferService,
    private assetService: AssetService,
    private route: ActivatedRoute,
    private routingService: RoutingService,
    public dialog: MatDialog,
    private assetFormatPipe: AssetFormatPipe
  ) {
    this.route.queryParams
      .pipe(
        take(1),
        tap((params) => {
          this.accountGuid = params['accountGuid'];
        })
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
    this.dataSource.sortingDataAccessor = this.sortingTransfersDataAccessor;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  getAccount(): void {
    this.accountService
      .getAccount(<string>this.accountGuid)
      .pipe(
        tap((account) => {
          this.asset = this.assetService.getAsset(<string>account.asset);
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

  listTransfers(): void {
    this.isLoadingResults$.next(true);

    this.transferService
      .listTransfers(
        this.currentPage.toString(),
        this.pageSize.toString(),
        <string>this.accountGuid
      )
      .pipe(
        tap((transfers) => {
          this.totalRows = Number(transfers.total);
          this.dataSource.data = transfers.objects;
          this.transferList$.next(transfers);
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
          this.listTransfers();
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe();
  }

  pageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.listTransfers();
  }

  sortChange(): void {
    this.dataSource.sort = this.sort;
  }

  sortingTransfersDataAccessor(transfer: TransferBankModel, columnDef: string) {
    switch (columnDef) {
      case 'transaction':
        return transfer.created_at!;
      case 'balance':
        return transfer.estimated_amount!;
      default:
        return '';
    }
  }

  onTransferClick(transfer: TransferBankModel): void {
    this.dialog.open(TransferSummaryComponent, {
      data: {
        model: transfer,
        asset: this.asset
      }
    });
  }

  getFiatPendingBalance(account: AccountBankModelWithDetails): number {
    const platformBalance = Number(account.platform_balance);
    const platformAvailable = Number(account.platform_available);
    return platformBalance - platformAvailable;
  }

  getTransferIconName(transfer: TransferBankModel): String {
    switch (transfer.side) {
      case 'deposit':
        return 'cybrid-deposit-icon';
      case 'withdrawal':
        return 'cybrid-withdrawal-icon';
      default:
        return '';
    }
  }
}
