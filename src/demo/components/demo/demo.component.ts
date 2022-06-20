import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { AppComponent } from '../../../../library/src/app/components/app/app.component';
import { ConfigService } from '../../services/config/config.service';
import { BehaviorSubject, map, take } from 'rxjs';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss']
})
export class DemoComponent implements OnInit {
  @ViewChild('viewContainer', { static: true, read: ViewContainerRef })
  public viewContainer!: ViewContainerRef;
  loading$ = new BehaviorSubject(true);

  constructor(public tokenService: ConfigService) {}

  ngOnInit(): void {
    this.initDemo();
  }

  initDemo() {
    this.tokenService.token$
      .pipe(
        take(1),
        map((token) => {
          const elementRef = this.viewContainer.createComponent(AppComponent);
          elementRef.instance.auth = token;
          elementRef.instance.hostConfig = {
            refreshInterval: 2000,
            locale: 'en-US',
            theme: 'LIGHT',
            customer: ''
          };
        })
      )
      .subscribe(() => {
        this.loading$.next(false);
      });
  }
}
