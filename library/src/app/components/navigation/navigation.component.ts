import { Component, Input } from '@angular/core';

// Services
import { ConfigService, RoutingData, RoutingService } from '@services';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {
  @Input() routingData: RoutingData = { origin: '', route: '' };

  constructor(
    public configService: ConfigService,
    private routingService: RoutingService
  ) {}

  onNavigate(): void {
    this.routingService.handleRoute(this.routingData);
  }
}
