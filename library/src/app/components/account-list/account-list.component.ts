import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  map,
  of,
  Subject,
  switchMap,
  takeUntil,
  timer
} from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';

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
  RoutingService
} from '@services';

// Utility
import { Constants } from '@constants';

@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.scss']
})
export class AccountListComponent implements OnInit, OnDestroy {
  balance$ = new BehaviorSubject<number>(0);

  isLoading$ = new BehaviorSubject(true);
  isRecoverable$ = new BehaviorSubject(true);
  private unsubscribe$ = new Subject();

  // todo(Dustin) look into getting counter_asset as part of the config
  counter_asset = Constants.USD_ASSET;

  dataSource = new MatTableDataSource<Account>();
  displayedColumns: string[] = ['account', 'balance'];

  constructor(
    public configService: ConfigService,
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
    this.getAccounts();
    this.refreshData();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  getAccounts(): void {
    this.accountService
      .getPortfolio()
      .pipe(
        map((accountOverview) => {
          this.balance$.next(accountOverview.balance);
          this.dataSource.data = accountOverview.accounts;

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
          return of(err);
        })
      )
      .subscribe(() => {
        this.isLoading$.next(false);
      });
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

  onNavigate(): void {
    this.routingService.handleRoute('trade', 'account-list');
  }
}
