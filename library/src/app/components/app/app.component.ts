import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { Router } from '@angular/router';

import {
  map,
  ReplaySubject,
  Subject,
  takeUntil,
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
    this.changeDetector.detectChanges();
  }
  @Input()
  set component(selector: string) {
    this.currentComponent$.next(selector);
  }

  currentComponent$ = new ReplaySubject<string>(1);

  private unsubscribe$ = new Subject();

  constructor(
    private router: Router,
    private authService: AuthService,
    private assetService: AssetService,
    private eventService: EventService,
    private errorService: ErrorService,
    public configService: ConfigService,
    private routingService: RoutingService,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initEventService();
    this.initErrorService();

    // List assets before navigating to initial component
    this.assetService.getAssets$().subscribe(() => {
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
