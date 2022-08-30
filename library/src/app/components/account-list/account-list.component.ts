import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

import {
  BehaviorSubject,
  catchError,
  map,
  of,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
  timer
} from 'rxjs';

// Services
import {
  AccountService,
  Account,
  ComponentConfig,
  LEVEL,
  CODE,
  ConfigService,
  EventService,
  ErrorService,
  AssetService,
  Asset,
  RoutingData,
  RoutingService
} from '@services';

// Utility
import { Constants } from '@constants';
import { NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.scss']
})
export class AccountListComponent implements OnInit, OnDestroy {
  @ViewChild(MatSort) set matSort(sort: MatSort) {
    this.dataSource.sort = sort;
    this.dataSource.sortingDataAccessor = this.sortingDataAccessor;
  }

  @ViewChild(MatPaginator) set matPaginator(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }

  balance$ = new BehaviorSubject<number>(0);
  currentFiat: Asset = Constants.USD_ASSET;

  isLoading$ = new BehaviorSubject(true);
  isRecoverable$ = new BehaviorSubject(true);
  private unsubscribe$ = new Subject();
  routingData: RoutingData = {
    route: 'price-list',
    origin: 'account-list'
  };

  dataSource = new MatTableDataSource<Account>();
  displayedColumns: string[] = ['asset', 'balance'];
  getAccountsError = false;

  constructor(
    public configService: ConfigService,
    private assetService: AssetService,
    private eventService: EventService,
    private errorService: ErrorService,
    private accountService: AccountService,
    private routingService: RoutingService
  ) {}

  ngOnInit(): void {
    this.eventService.handleEvent(
      LEVEL.INFO,
      CODE.COMPONENT_INIT,
      'Initializing account-list component'
    );
    this.getCurrentFiat();
    this.getAccounts();
    this.refreshData();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  getCurrentFiat(): void {
    this.configService
      .getConfig$()
      .pipe(
        takeUntil(this.unsubscribe$),
        map((config) => {
          this.currentFiat = this.assetService.getAsset(config.fiat);
        })
      )
      .subscribe();
  }

  getAccounts(): void {
    this.accountService
      .getPortfolio()
      .pipe(
        map((accountOverview) => {
          this.isLoading$.next(false);

          this.balance$.next(accountOverview.balance);
          this.dataSource.data = accountOverview.accounts;
          this.getAccountsError = false;

          this.eventService.handleEvent(
            LEVEL.INFO,
            CODE.DATA_REFRESHED,
            'Accounts successfully updated'
          );
        }),
        catchError((err) => {
          this.eventService.handleEvent(
            LEVEL.ERROR,
            CODE.DATA_ERROR,
            'There was an error fetching accounts'
          );

          this.errorService.handleError(
            new Error('There was an error fetching accounts')
          );

          this.dataSource.data = [];
          this.getAccountsError = true;
          return of(err);
        })
      )
      .subscribe();
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
            'Refreshing accounts...'
          );
          this.getAccounts();
        }
      });
  }

  onRowClick(accountGuid: string): void {
    this.configService
      .getConfig$()
      .pipe(
        take(1),
        map((config: ComponentConfig) => {
          if (config.routing) {
            const extras: NavigationExtras = {
              queryParams: {
                accountGuid: accountGuid
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

  sortingDataAccessor(account: Account, columnDef: string) {
    switch (columnDef) {
      case 'asset':
        return account.account.asset!;
      case 'balance':
        return account.value!;
      default:
        return '';
    }
  }
}
