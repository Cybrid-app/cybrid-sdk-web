import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { Router } from '@angular/router';

import {
  catchError,
  combineLatest,
  map,
  of,
  ReplaySubject,
  Subject,
  take,
  takeUntil,
  tap
} from 'rxjs';

// Services
import {
  AuthService,
  AssetService,
  RoutingService,
  ConfigService,
  ComponentConfig,
  ErrorService,
  ErrorLog,
  EventService,
  EventLog,
  CODE,
  LEVEL
} from '@services';
import { Configuration } from '@cybrid/cybrid-api-bank-angular';

@Component({
  selector: 'app-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  @Output() eventLog = new EventEmitter<EventLog>();
  @Output() errorLog = new EventEmitter<ErrorLog>();

  @Input()
  set auth(token: string) {
    this.authService.setToken(token);
  }
  @Input()
  set config(config: ComponentConfig) {
    this.configService.setConfig(config);
  }
  @Input()
  set component(selector: string) {
    this.component$.next(selector);
  }

  component$ = new ReplaySubject<string>(1);
  unsubscribe$ = new Subject();

  constructor(
    public configuration: Configuration,
    private router: Router,
    private authService: AuthService,
    private assetService: AssetService,
    private eventService: EventService,
    private errorService: ErrorService,
    public configService: ConfigService,
    private routingService: RoutingService
  ) {}

  ngOnInit(): void {
    this.initEventService();
    this.initErrorService();

    // Get assets/config/platform data before navigating to initial component
    combineLatest([
      this.configService.getConfig$(),
      this.configService.getCustomer$(),
      this.configService.getBank$(),
      this.assetService.getAssets$()
    ])
      .pipe(
        take(1),
        tap(() => {
          this.eventLog.emit({
            level: LEVEL.INFO,
            code: CODE.APPLICATION_INIT,
            message: 'Initializing application'
          });
        }),
        catchError((err) => {
          this.eventService.handleEvent(
            LEVEL.FATAL,
            CODE.APPLICATION_ERROR,
            'Fatal error initializing application'
          );
          this.errorService.handleError({
            code: CODE.APPLICATION_ERROR,
            message: 'Fatal error initializing application'
          });
          return of(err);
        })
      )
      .subscribe(() => {
        this.initNavigation();
      });
  }

  initEventService(): void {
    this.eventService
      .getEvent()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (event: EventLog) => {
          this.eventLog.emit(event);
        },
        error: (err: Error) => {
          this.eventLog.next({
            level: LEVEL.ERROR,
            code: CODE.SERVICE_ERROR,
            message: 'There was a failure initializing the Event service',
            data: err
          });
          this.errorService.handleError(err);
        }
      });
  }

  initErrorService(): void {
    this.errorService
      .getError()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (err: ErrorLog) => {
          this.errorLog.emit(err);
        },
        error: (err: Error) => {
          this.eventService.handleEvent(
            LEVEL.ERROR,
            CODE.SERVICE_ERROR,
            'There was a failure initializing the error service'
          );
          this.errorLog.emit({
            code: err.name,
            message: 'There was a failure initializing the error service',
            data: err
          });
        }
      });
  }

  initNavigation(): void {
    this.component$
      .pipe(
        takeUntil(this.unsubscribe$),
        map((component) => {
          this.routingService.handleRoute({
            route: component,
            origin: 'cybrid-app'
          });
        })
      )
      .subscribe();
  }
}
