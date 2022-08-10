import {
  Component,
  ComponentRef,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { BehaviorSubject, filter, map, Subject, take, takeUntil } from 'rxjs';

import { DemoConfigService } from '../../services/demo-config/demo-config.service';

// Library
import { AppComponent } from '@components';
import { CODE, ConfigService, EventLog } from '@services';
import { Constants, TestConstants } from '@constants';
import { DemoCredentials } from '../login/login.component';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss']
})
export class DemoComponent implements OnInit, OnDestroy {
  @ViewChild('viewContainer', { static: true, read: ViewContainerRef })
  public viewContainer!: ViewContainerRef;
  token = '';

  webComponents = ['price-list', 'trade', 'account-list'];
  languages = ['en-US', 'fr-CA'];

  componentRef!: ComponentRef<AppComponent>;
  componentGroup: FormGroup = new FormGroup({
    component: new FormControl()
  });

  languageGroup: FormGroup = new FormGroup({
    language: new FormControl(Constants.DEFAULT_CONFIG.locale)
  });

  loading$ = new BehaviorSubject(true);

  private unsubscribe$ = new Subject();

  constructor(
    public tokenService: DemoConfigService,
    public configService: DemoConfigService
  ) {}

  ngOnInit(): void {
    // this.tokenService.token$
    //   .pipe(
    //     take(1),
    //     map((token) => (this.token = token))
    //   )
    //   .subscribe(() => {
    //     this.initComponentGroup();
    //     this.initLanguageGroup();
    //     this.initDemo();
    //   });
  }

  ngOnDestroy() {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  // Subscribe to selected component and set component instance
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

  initLanguageGroup() {
    this.languageGroup
      .get('language')
      ?.valueChanges.pipe(
        takeUntil(this.unsubscribe$),
        map((language) => {
          let newConfig = TestConstants.CONFIG;
          newConfig.locale = language;
          this.componentRef.instance.hostConfig = newConfig;
        })
      )
      .subscribe();
  }

  initDemo(creds: DemoCredentials) {
    this.componentRef = this.viewContainer.createComponent(AppComponent);

    this.componentRef.instance.auth = creds.token;

    let newConfig = Constants.DEFAULT_CONFIG;
    newConfig.customer = creds.customerGuid;

    this.componentRef.instance.hostConfig = newConfig;

    // setTimeout(() => {
    //   this.componentRef.instance.hostConfig = newConfig;
    // }, 100);

    // Subscribe to component configuration changes
    this.configService.config$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((config) => {
        this.componentRef.instance.hostConfig = config;
      });

    this.componentRef.instance.errorLog.subscribe((error) =>
      console.log(error)
    );

    // Subscribe to routing events and set component selector value
    this.componentRef.instance.eventLog
      .pipe(
        takeUntil(this.unsubscribe$)
        // filter((event: EventLog) => {
        //   return (
        //     event.code == CODE.ROUTING_END ||
        //     event.code == CODE.ROUTING_START ||
        //     event.code == CODE.ROUTING_REQUEST
        //   );
        // }),
        // map((event) => {
        //   this.componentGroup.get('component')?.patchValue(event.data.default, {
        //     emitEvent: false,
        //     onlySelf: true
        //   });
        // })
      )
      .subscribe((event) => console.log(event));
  }
}
