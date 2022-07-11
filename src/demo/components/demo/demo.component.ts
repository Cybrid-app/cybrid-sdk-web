import {
  Component,
  ComponentRef,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { AppComponent } from '../../../../library/src/app/components/app/app.component';
import { ConfigService } from '../../services/config/config.service';
import { BehaviorSubject, map, Subject, take, takeUntil } from 'rxjs';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss']
})
export class DemoComponent implements OnInit, OnDestroy {
  @ViewChild('viewContainer', { static: true, read: ViewContainerRef })
  public viewContainer!: ViewContainerRef;
  token = '';

  componentRef!: ComponentRef<AppComponent>;
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
        this.initDemo();
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  initDemo() {
    this.componentRef = this.viewContainer.createComponent(AppComponent);
    this.componentRef.instance.auth = this.token;
    this.loading$.next(false);

    this.configService.config$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((config) => {
        this.componentRef.instance.hostConfig = config;
        this.componentRef.instance.component = 'app/price-list';
      });
  }
}
