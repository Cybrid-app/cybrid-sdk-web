import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';
import {
  ComponentConfig,
  ConfigService
} from '../../../../../src/shared/services/config/config.service';
import { AuthService } from '../../../../../src/shared/services/auth/auth.service';
import {
  CODE,
  EventLog,
  EventService,
  LEVEL
} from '../../../../../src/shared/services/event/event.service';
import {
  ErrorLog,
  ErrorService
} from '../../../../../src/shared/services/error/error.service';
import {
  catchError,
  combineLatest,
  of,
  Subject,
  take,
  takeUntil,
  tap
} from 'rxjs';
import { Router } from '@angular/router';
import { AssetService } from '../../../../../src/shared/services/asset/asset.service';

@Component({
  selector: 'app-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
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

  private unsubscribe$ = new Subject();

  constructor(
    private router: Router,
    private authService: AuthService,
    private assetService: AssetService,
    private eventService: EventService,
    private errorService: ErrorService,
    private configService: ConfigService
  ) {}

  ngOnInit(): void {
    this.initEventService();
    this.initErrorService();
    combineLatest([
      this.configService.getConfig$(),
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
          this.router.initialNavigation();
        }),
        catchError((err) => {
          this.eventService.handleEvent(
            LEVEL.FATAL,
            CODE.APPLICATION_ERROR,
            'Fatal error initializing application'
          );
          this.errorService.handleError(
            new Error('Fatal error initializing application')
          );
          return of(err);
        })
      )
      .subscribe();
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
}
