import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../../../modules/library.module';
import { HttpClient } from '@angular/common/http';

import { AccountBalanceComponent } from '@components';
import { ConfigService } from '@services';
import { of } from 'rxjs';
import { TestConstants } from '@constants';

describe('AccountBalanceComponent', () => {
  let component: AccountBalanceComponent;
  let fixture: ComponentFixture<AccountBalanceComponent>;

  let MockConfigService = jasmine.createSpyObj('ConfigService', [
    'setConfig',
    'getConfig$',
    'getComponent$'
  ]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountBalanceComponent],
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        })
      ],
      providers: [{ provide: ConfigService, useValue: MockConfigService }]
    }).compileComponents();
    MockConfigService = TestBed.inject(ConfigService);
    MockConfigService.getConfig$.and.returnValue(of(TestConstants.CONFIG));

    fixture = TestBed.createComponent(AccountBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should check the environment and asset type', () => {
    // Default 'staging' environment

    // Trading account
    component.account = TestConstants.ACCOUNT_BANK_MODEL_BTC;
    expect(component.isSandboxTradingAccount()).toBeTrue();

    // Fiat account
    component.account = TestConstants.ACCOUNT_BANK_MODEL_USD;
    expect(component.isSandboxTradingAccount()).toBeFalse();

    // Set environment: 'sandbox'
    component.environment = 'sandbox';

    // Trading account
    component.account = TestConstants.ACCOUNT_BANK_MODEL_BTC;
    expect(component.isSandboxTradingAccount()).toBeTrue();

    // Fiat account
    component.account = TestConstants.ACCOUNT_BANK_MODEL_USD;
    expect(component.isSandboxTradingAccount()).toBeFalse();
  });

  it('should get the balance', () => {
    // Trading account
    component.account = TestConstants.ACCOUNT_BANK_MODEL_BTC;
    expect(component.Balance).toEqual(
      TestConstants.ACCOUNT_BANK_MODEL_BTC.platform_balance
    );

    // Fiat account
    component.account = TestConstants.ACCOUNT_BANK_MODEL_USD;
    expect(component.Balance).toEqual(
      TestConstants.ACCOUNT_BANK_MODEL_USD.platform_available
    );
  });

  it('should get pending', () => {
    // Trading account
    component.account = TestConstants.ACCOUNT_BANK_MODEL_BTC;
    expect(component.Pending).toEqual(0);

    // Fiat account with pending difference of 50 base units
    let pendingAccount = { ...TestConstants.ACCOUNT_BANK_MODEL_USD };
    pendingAccount.platform_balance = '100';
    pendingAccount.platform_available = '50';

    component.account = pendingAccount;
    expect(component.Pending).toEqual(50);
  });
});
