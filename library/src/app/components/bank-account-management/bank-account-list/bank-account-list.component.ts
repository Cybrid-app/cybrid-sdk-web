import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import {
  BehaviorSubject,
  catchError,
  EMPTY,
  expand,
  map,
  Observable,
  of,
  reduce,
  Subject,
  Subscription,
  switchMap,
  takeUntil,
  tap,
  throwError,
  timer
} from 'rxjs';

// Services
import {
  BankAccountService,
  ComponentConfig,
  ConfigService,
  ErrorService,
  EventService,
  RoutingData,
  RoutingService
} from '@services';

// Components
import { BankAccountDetailsComponent } from '../bank-account-details/bank-account-details.component';

// Models
import { ExternalBankAccountBankModel } from '@cybrid/cybrid-api-bank-angular/model/externalBankAccount';
import { ExternalBankAccountListBankModel } from '@cybrid/cybrid-api-bank-angular';

// Utility
import { TestConstants } from '@constants';

@Component({
  selector: 'app-bank-account-list',
  templateUrl: './bank-account-list.component.html',
  styleUrls: ['./bank-account-list.component.scss']
})
export class BankAccountListComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) set matPaginator(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }

  @ViewChild(MatSort) set matSort(sort: MatSort) {
    this.sort = sort;
    this.dataSource.sortingDataAccessor = this.sortingDataAccessor;

    this.sort.sort({ id: '', start: 'desc', disableClear: true });
    this.sort.sort({ id: 'status', start: 'asc', disableClear: true });
    this.sort.sortChange.emit(this.sort);
  }

  sort!: MatSort;
  paginator!: MatPaginator;

  dataSource = new MatTableDataSource<ExternalBankAccountBankModel>();
  displayedColumns: string[] = ['account', 'status'];

  pageSize = 5;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  externalBankAccountsPerPage = 10;

  isLoading$ = new BehaviorSubject(true);
  isLoadingResults$ = new BehaviorSubject(true);
  isRecoverable$ = new BehaviorSubject(true);
  listExternalBankAccountsError = false;

  refreshDataSub!: Subscription;

  error$ = new BehaviorSubject(false);
  unsubscribe$ = new Subject();

  routingData: RoutingData = {
    route: 'bank-account-connect',
    origin: 'bank-account-management'
  };

  constructor(
    public configService: ConfigService,
    private errorService: ErrorService,
    private eventService: EventService,
    private bankAccountService: BankAccountService,
    private router: RoutingService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.listExternalBankAccounts();
    this.refreshData();
  }

  ngOnDestroy() {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  sortChange(): void {
    this.dataSource.sort = this.sort;
  }

  sortingDataAccessor(
    bankAccount: ExternalBankAccountBankModel,
    columnDef: string
  ) {
    switch (columnDef) {
      case 'account':
        return bankAccount.plaid_account_name!;
      case 'status':
        return bankAccount.state!;
      default:
        return '';
    }
  }

  pageExternalAccounts(
    list: ExternalBankAccountListBankModel
  ): Observable<ExternalBankAccountListBankModel> | Observable<never> {
    const perPage = Number(list.per_page);
    const nextPage = (perPage + 1).toString();

    return list.objects.length == perPage
      ? this.bankAccountService.listExternalBankAccounts(nextPage)
      : EMPTY;
  }

  accumulateExternalAccounts(
    acc: ExternalBankAccountBankModel[],
    value: ExternalBankAccountBankModel[]
  ): ExternalBankAccountBankModel[] {
    return [...acc, ...value];
  }

  listExternalBankAccounts(): void {
    this.isLoadingResults$.next(true);

    this.bankAccountService
      .listExternalBankAccounts()
      .pipe(
        expand((list) => this.pageExternalAccounts(list)),
        map((list) => list.objects),
        reduce((acc, value) => this.accumulateExternalAccounts(acc, value)),
        map((accounts) =>
          accounts.filter(
            (account) =>
              account.state == 'storing' ||
              account.state == 'completed' ||
              account.state == 'refresh_required'
          )
        ),
        switchMap(() => throwError(() => new Error('error me harder'))),
        map((accounts) => (this.dataSource.data = accounts)),
        catchError((err) => {
          this.refreshDataSub.unsubscribe();
          this.listExternalBankAccountsError = true;
          this.dataSource.data = [];
          this.isLoading$.next(false);
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
        takeUntil(this.unsubscribe$),
        tap(() => this.listExternalBankAccounts())
      )
      .subscribe();
  }

  onAccountSelect(account: ExternalBankAccountBankModel): void {
    this.dialog
      .open(BankAccountDetailsComponent, { data: account })
      .afterClosed()
      .pipe(
        map((res) => {
          if (res) this.listExternalBankAccounts();
        })
      )
      .subscribe();
  }

  onAddAccount(): void {
    this.router.handleRoute(this.routingData);
  }
}
