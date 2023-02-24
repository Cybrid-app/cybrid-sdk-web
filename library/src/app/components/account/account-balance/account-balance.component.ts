import { Component, Input } from '@angular/core';
import { AccountBankModel } from '@cybrid/cybrid-api-bank-angular';
import { ConfigService } from '@services';
import { map } from 'rxjs';

@Component({
  selector: 'app-account-balance',
  templateUrl: './account-balance.component.html',
  styleUrls: ['./account-balance.component.scss']
})
export class AccountBalanceComponent {
  @Input() account: AccountBankModel | null = null;
  environment: string | undefined;

  constructor(private configService: ConfigService) {
    this.configService
      .getConfig$()
      .pipe(map((config) => (this.environment = config.environment)))
      .subscribe();
  }

  isSandboxTradingAccount(): boolean {
    return (
      (this.environment == 'staging' || this.environment == 'sandbox') &&
      this.account?.type == AccountBankModel.TypeEnum.Trading
    );
  }

  get Balance(): string | undefined {
    return this.isSandboxTradingAccount()
      ? this.account?.platform_balance
      : this.account?.platform_available;
  }

  get Pending(): number | undefined {
    return this.isSandboxTradingAccount()
      ? 0
      : Number(this.account?.platform_balance) -
          Number(this.account?.platform_available);
  }
}
