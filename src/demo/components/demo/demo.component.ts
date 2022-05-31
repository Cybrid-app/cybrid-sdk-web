import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { PriceListComponent } from '../../../../library/src/app/components/price-list/price-list.component';
import { TokenService } from '../../services/token/token.service';
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

  constructor(public tokenService: TokenService) {}

  ngOnInit(): void {
    this.initDemo();
  }

  initDemo() {
    this.tokenService.token$
      .pipe(
        take(1),
        map((token) => {
          const elementRef =
            this.viewContainer.createComponent(PriceListComponent);
          elementRef.instance.auth = token;
        })
      )
      .subscribe(() => {
        this.loading$.next(false);
      });
  }
}
