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
  BehaviorSubject,
  catchError,
  combineLatest,
  forkJoin,
  map,
  of,
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

// Constants
import { Constants } from '@constants';
import { fork } from 'child_process';

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
  set hostConfig(config: ComponentConfig) {
    this.configService.setConfig(config);
  }
  @Input()
  set component(selector: string) {
    this.currentComponent$.next(selector);
  }

  currentComponent$ = new BehaviorSubject(Constants.DEFAULT_COMPONENT);

  private unsubscribe$ = new Subject();

  constructor(
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
    this.assetService.getAssets$().subscribe(() => {
      this.initNavigation();
    });
    // this.initNavigation();
    // forkJoin([this.configService.getConfig$(), this.assetService.getAssets$()])
    //   .pipe(
    //     take(1),
    //     tap(() => {
    //       this.eventLog.emit({
    //         level: LEVEL.INFO,
    //         code: CODE.APPLICATION_INIT,
    //         message: 'Initializing application'
    //       });
    //     }),
    //     catchError((err) => {
    //       this.eventService.handleEvent(
    //         LEVEL.FATAL,
    //         CODE.APPLICATION_ERROR,
    //         'Fatal error initializing application'
    //       );
    //       this.errorService.handleError(
    //         new Error('Fatal error initializing application')
    //       );
    //       return of(err);
    //     })
    //   )
    //   .subscribe(() => {
    //     this.initNavigation();
    //   });

    this.configService.config$.subscribe((config) => console.log(config));
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
    this.currentComponent$
      .pipe(
        takeUntil(this.unsubscribe$),
        map((component) => {
          // Navigates whenever component is set
          this.router.navigate(['app/' + component]);

          // Handles host navigation request for events
          this.routingService.handleRoute({
            route: component,
            origin: 'cybrid-app'
          });
        })
      )
      .subscribe();
  }
}
