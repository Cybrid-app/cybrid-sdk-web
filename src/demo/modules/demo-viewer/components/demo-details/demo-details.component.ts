import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  Renderer2,
  ViewChild
} from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import {
  combineLatest,
  ReplaySubject,
  takeUntil,
  Subject,
  take,
  map,
  tap
} from 'rxjs';

import { ConfigService } from '../../../../services/config/config.service';
import { DemoViewerService } from '../../services/demo-viewer.service';
import { EventLog } from '@services';

@Component({
  selector: 'app-demo-component',
  templateUrl: './demo-details.component.html',
  styleUrls: ['./demo-details.component.scss']
})
export class DemoDetailsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('outlet', { static: false }) outlet: ElementRef | undefined;

  sdk = new ReplaySubject<ElementRef>(1);
  sdk$ = this.sdk.asObservable().pipe();

  auth = <string>window.localStorage.getItem('customer');

  private unsubscribe$ = new Subject();

  constructor(
    private demoViewerService: DemoViewerService,
    private activatedRoute: ActivatedRoute,
    private configService: ConfigService,
    private _renderer2: Renderer2,
    private location: Location
  ) {}

  ngAfterViewInit() {
    combineLatest([this.activatedRoute.params, this.configService.config])
      .pipe(
        take(1),
        map((combined) => {
          const [params, config] = combined;

          // Create the SDK element
          const sdk = this._renderer2.createElement('cybrid-app');

          // Assign SDK @Inputs
          this._renderer2.setProperty(sdk, 'auth', this.auth);
          this._renderer2.setProperty(sdk, 'config', config);
          this._renderer2.setProperty(sdk, 'component', params['id']);

          // Subscribe to logging
          this._renderer2.listen(sdk, 'eventLog', (event) => {
            console.log(event.detail);

            // Update current url path as SDK component path on SDK routing events
            const eventLog = event.detail as EventLog;
            if (eventLog.code === 'ROUTING_END') {
              const component = eventLog.data['default'];

              this.demoViewerService.updateRoute(component);
              this.location.replaceState(`demo/${component}`);
            }
          });

          this._renderer2.listen(sdk, 'errorLog', (event) =>
            console.error(event.detail)
          );

          // Add the SDK element to a DOM node
          this._renderer2.appendChild(this.outlet?.nativeElement, sdk);

          return sdk;
        }),
        tap((sdk) => this.sdk.next(sdk))
      )
      .subscribe();

    // Update SDK component
    combineLatest([this.activatedRoute.params, this.sdk$])
      .pipe(
        takeUntil(this.unsubscribe$),
        tap((combined) => {
          const [params, sdk] = combined;
          this._renderer2.setProperty(sdk, 'component', params['id']);
        })
      )
      .subscribe();

    // Update SDK config
    combineLatest([this.configService.config, this.sdk$])
      .pipe(
        takeUntil(this.unsubscribe$),
        tap((combined) => {
          const [config, sdk] = combined;
          this._renderer2.setProperty(sdk, 'config', config);
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }
}
