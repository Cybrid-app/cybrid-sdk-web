import {
  Component,
  ComponentRef,
  OnDestroy,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { BehaviorSubject, filter, map, Subject, takeUntil } from 'rxjs';

import { DemoConfigService } from '../../services/demo-config/demo-config.service';

// Library
import { AppComponent } from '@components';
import { CODE, EventLog } from '@services';
import { Constants } from '@constants';

// Components
import { DemoCredentials } from '../login/login.component';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss']
})
export class DemoComponent implements OnDestroy {
  @ViewChild('viewContainer', { static: true, read: ViewContainerRef })
  public viewContainer!: ViewContainerRef;

  token = '';

  webComponents = ['price-list', 'trade', 'account-list', 'account-details'];
  languages = ['en-US', 'fr-CA'];

  componentRef!: ComponentRef<AppComponent>;
  componentGroup: FormGroup = new FormGroup({
    component: new FormControl(Constants.DEFAULT_COMPONENT)
  });

  languageGroup: FormGroup = new FormGroup({
    language: new FormControl(Constants.DEFAULT_CONFIG.locale)
  });

  login$ = new BehaviorSubject(false);
  loading$ = new BehaviorSubject(true);

  private unsubscribe$ = new Subject();

  constructor(public demoConfigService: DemoConfigService) {}

  ngOnDestroy() {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  // Set component on changes
  initComponentGroup() {
    this.componentGroup
      .get('component')
      ?.valueChanges.pipe(
        takeUntil(this.unsubscribe$),
        map((component) => {
          this.componentRef.instance.component = component;
        })
      )
      .subscribe();
  }

  // Set language on changes
  initLanguageGroup() {
    this.languageGroup
      .get('language')
      ?.valueChanges.pipe(
        takeUntil(this.unsubscribe$),
        map((language) => {
          let config = this.demoConfigService.config$.value;
          config.locale = language;
          this.demoConfigService.config$.next(config);
        })
      )
      .subscribe();
  }

  initDemo(credentials: DemoCredentials) {
    this.login$.next(true);

    let config = Constants.DEFAULT_CONFIG;
    config.customer = credentials.customer;

    this.languageGroup.patchValue({ language: config.locale });
    this.demoConfigService.config$.next(config);

    // Create main app
    this.componentRef = this.viewContainer.createComponent(AppComponent);

    this.componentRef.instance.hostConfig = config;
    this.componentRef.instance.auth = credentials.token;
    this.componentRef.instance.component = Constants.DEFAULT_COMPONENT;

    // Subscribe to component configuration changes
    this.demoConfigService.config$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((config) => {
        this.componentRef.instance.hostConfig = config;
      });

    // Subscribe to routing events and set component selector value
    this.componentRef.instance.eventLog
      .pipe(
        takeUntil(this.unsubscribe$),
        filter((event: EventLog) => {
          return (
            event.code == CODE.ROUTING_END ||
            event.code == CODE.ROUTING_START ||
            event.code == CODE.ROUTING_REQUEST
          );
        }),
        map((event) => {
          this.componentGroup.get('component')?.patchValue(event.data.default, {
            emitEvent: false,
            onlySelf: true
          });
        })
      )
      .subscribe();

    // Subscribe to errors
    this.componentRef.instance.errorLog.subscribe((error) =>
      console.log(error)
    );

    this.initComponentGroup();
    this.initLanguageGroup();
    this.loading$.next(false);
  }
}
