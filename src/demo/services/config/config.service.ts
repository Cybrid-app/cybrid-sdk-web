import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of, ReplaySubject, switchMap, throwError } from 'rxjs';

// Library
import { ComponentConfig } from '@services';
import { Constants, TestConstants } from '@constants';

// Services
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

// Api
import {
  BankBankModel,
  BanksService,
  Configuration
} from '@cybrid/cybrid-api-bank-angular';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  config = new ReplaySubject<ComponentConfig>(1);
  config$ = this.config.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {}

  getBank(): Observable<BankBankModel> {
    const bankToken = window.localStorage.getItem('bank');
    const env = this.authService.environment;

    if (bankToken && env) {
      return new BanksService(
        this.http,
        Object(environment.bankBaseUrl)[env],
        new Configuration({ credentials: { BearerAuth: bankToken } })
      )
        .listBanks()
        .pipe(
          switchMap((list) => {
            const banks = list.objects;

            if (banks.length == 1) {
              return of(banks[0]);
            } else if (banks.length > 1) {
              return throwError(() => new Error('Multiple banks configured'));
            } else return throwError(() => new Error('No bank found'));
          })
        );
    } else return throwError(() => new Error('Unable to configure banks api'));
  }

  getConfig(): Observable<ComponentConfig> {
    return this.getBank().pipe(
      switchMap((bank) => {
        const config: ComponentConfig = Constants.DEFAULT_CONFIG;

        if (this.validateBank(bank)) {
          config.fiat = bank.supported_fiat_account_assets![0];
          config.customer = this.authService.customer;
          config.features = bank.features;
          config.environment = this.authService.environment;
          config.redirectUri = TestConstants.CONFIG.redirectUri;

          this.config.next(config);
          return of(config);
        } else return throwError(() => new Error('Invalid bank configuration'));
      })
    );
  }

  setConfig(config: ComponentConfig): Observable<ComponentConfig> {
    if (this.validateConfig(config)) {
      this.config.next(config);
      return of(config);
    } else return throwError(() => new Error('Invalid config'));
  }

  validateConfig(config: object): config is ComponentConfig {
    const refreshInterval = (config as ComponentConfig).refreshInterval;
    const locale = (config as ComponentConfig).locale;
    const theme = (config as ComponentConfig).theme;
    const routing = (config as ComponentConfig).routing;
    const customer = (config as ComponentConfig).customer;
    const fiat = (config as ComponentConfig).fiat;
    const environment = (config as ComponentConfig).environment;
    return (
      refreshInterval !== undefined &&
      refreshInterval !== null &&
      locale !== undefined &&
      locale !== null &&
      Constants.SUPPORTED_LOCALES.includes(locale) &&
      routing !== undefined &&
      routing !== null &&
      theme !== undefined &&
      theme !== null &&
      customer !== null &&
      customer !== undefined &&
      fiat !== null &&
      fiat !== undefined &&
      environment !== null &&
      environment !== undefined
    );
  }

  validateBank(bank: BankBankModel): boolean {
    return (
      bank.features.length !== 0 &&
      bank.supported_fiat_account_assets !== null &&
      bank.supported_fiat_account_assets !== undefined &&
      bank.supported_fiat_account_assets?.length == 1 &&
      bank.supported_country_codes !== null &&
      bank.supported_country_codes !== undefined &&
      bank.supported_country_codes?.length == 1
    );
  }
}
