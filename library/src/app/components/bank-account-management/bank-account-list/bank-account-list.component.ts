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

import { BehaviorSubject, catchError, map, of, Subject, switchMap } from 'rxjs';

// Services
import {
  CODE,
  ConfigService,
  ErrorService,
  EventService,
  LEVEL,
  RoutingData,
  RoutingService
} from '@services';
import { ExternalBankAccountsService } from '@cybrid/cybrid-api-bank-angular';

// Components
import { BankAccountDetailsComponent } from '@components';

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

  addingAccount$ = new BehaviorSubject(false);

  routingData: RoutingData = {
    route: 'account-list',
    origin: 'bank-account-management'
  };

  constructor(
    public configService: ConfigService,
    private errorService: ErrorService,
    private eventService: EventService,
    private bankAccountService: ExternalBankAccountsService,
    public dialog: MatDialog,
    private router: RoutingService
  ) {}

  ngOnInit(): void {
    this.listBankAccounts();
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

    this.listBankAccounts();
  }

  listBankAccounts(): void {
    this.isLoadingResults = true;

    this.configService
      .getConfig$()
      .pipe(
        switchMap((config) =>
          this.bankAccountService.listExternalBankAccounts(
            this.currentPage.toString(),
            this.pageSize.toString(),
            undefined,
            undefined,
            config.customer
          )
        ),
        map((accounts) => {
          this.isLoading$.next(false);

          this.dataSource.data = accounts.objects;
          this.totalRows = Number(accounts.total);

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

  onAccountSelect(account: ExternalBankAccountBankModel): void {
    this.dialog.open(BankAccountDetailsComponent, {
      disableClose: false,
      data: account
    });
  }

  onAddAccount(): void {
    this.router.handleRoute({
      route: 'bank-account-connect',
      origin: 'bank-account-management'
    });
  }
}
