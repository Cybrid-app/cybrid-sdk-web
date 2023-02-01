import {
  AfterContentInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { BehaviorSubject, catchError, map, of, Subject, take } from 'rxjs';

// Services
import {
  BankAccountService,
  CODE,
  ConfigService,
  ErrorService,
  EventService,
  LEVEL,
  RoutingData,
  RoutingService
} from '@services';

// Models
import { ExternalBankAccountBankModel } from '@cybrid/cybrid-api-bank-angular/model/externalBankAccount';

@Component({
  selector: 'app-bank-account-list',
  templateUrl: './bank-account-list.component.html',
  styleUrls: ['./bank-account-list.component.scss']
})
export class BankAccountListComponent
  implements OnInit, AfterContentInit, OnDestroy
{
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  dataSource = new MatTableDataSource<ExternalBankAccountBankModel>();
  displayedColumns: string[] = ['account', 'status'];

  totalRows = 0;
  pageSize = 5;
  currentPage = 0;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  isLoadingResults = true;

  isLoading$ = new BehaviorSubject(true);
  isRecoverable$ = new BehaviorSubject(true);
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
    public dialog: MatDialog,
    private router: RoutingService
  ) {}

  ngOnInit(): void {
    this.getExternalBankAccounts();
  }

  ngAfterContentInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sortingDataAccessor = this.sortingDataAccessor;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy() {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  sortingDataAccessor(
    bankAccount: ExternalBankAccountBankModel,
    columnDef: string
  ) {
    switch (columnDef) {
      case 'account':
        return bankAccount.plaid_account_name!;
      default:
        return '';
    }
  }

  sortChange(): void {
    this.dataSource.sort = this.sort;
  }

  pageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;

    this.getExternalBankAccounts();
  }

  getExternalBankAccounts(): void {
    this.isLoadingResults = true;

    this.bankAccountService
      .listExternalBankAccounts(
        this.currentPage.toString(),
        this.pageSize.toString()
      )
      .pipe(
        take(1),
        map((accounts) => {
          this.dataSource.data = accounts.objects;
          this.totalRows = Number(accounts.total);

          this.isLoading$.next(false);
          this.isLoadingResults = false;
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

          this.dataSource.data = [];
          return of(err);
        })
      )
      .subscribe();
  }

  onAccountRefresh(account: ExternalBankAccountBankModel): void {
    this.configService
      .getConfig$()
      .pipe(
        take(1),
        map((config) => {
          if (config.routing) {
            let routingData = { ...this.routingData };
            routingData.extras = {
              queryParams: {
                externalAccountGuid: account.guid
              }
            };

            this.router.handleRoute(routingData);
          }
        })
      )
      .subscribe();
  }

  onAddAccount(): void {
    this.router.handleRoute(this.routingData);
  }
}
