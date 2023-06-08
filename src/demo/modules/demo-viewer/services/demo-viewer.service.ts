import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DemoViewerService {
  private route = new Subject<string>();
  route$ = this.route.asObservable();

  updateRoute(route: string) {
    this.route.next(route);
  }
}
