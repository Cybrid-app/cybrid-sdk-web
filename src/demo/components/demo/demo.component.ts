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

import { ConfigService } from '../../services/config/config.service';

// Library
import { AppComponent } from '@components';
import { CODE, EventLog } from '@services';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss']
})
export class DemoComponent implements OnInit, OnDestroy {
  @ViewChild('viewContainer', { static: true, read: ViewContainerRef })
  public viewContainer!: ViewContainerRef;
  token = '';

  webComponents = ['price-list', 'trade'];

  componentRef!: ComponentRef<AppComponent>;
  componentGroup: FormGroup = new FormGroup({
    component: new FormControl()
  });

  loading$ = new BehaviorSubject(true);

  private unsubscribe$ = new Subject();

  constructor(
    public tokenService: ConfigService,
    public configService: ConfigService
  ) {}

  ngOnInit(): void {
    this.tokenService.token$
      .pipe(
        take(1),
        map((token) => (this.token = token))
      )
      .subscribe(() => {
        this.initComponentGroup();
        this.initDemo();
      });
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

  initDemo() {
    this.componentRef = this.viewContainer.createComponent(AppComponent);
    this.componentRef.instance.auth = this.token;
    this.loading$.next(false);

    // Subscribe to component configuration changes
    this.configService.config$
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
  }
}
