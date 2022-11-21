import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { of } from 'rxjs';

// Services
import {
  ComponentConfig,
  ConfigService,
  ErrorService,
  EventService
} from '@services';

// Utility
import { TranslateService } from '@ngx-translate/core';
import { TestConstants } from '@constants';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
  BanksService,
  CustomersService
} from '@cybrid/cybrid-api-bank-angular';

describe('ConfigService', () => {
  let service: ConfigService;
  let MockErrorService = jasmine.createSpyObj('ErrorService', ['handleError']);
  let MockEventService = jasmine.createSpyObj('EventService', ['handleEvent']);
  let MockTranslateService = jasmine.createSpyObj('TranslateService', [
    'setTranslation',
    'setDefaultLang',
    'use'
  ]);
  let MockCustomersService = jasmine.createSpyObj(['getCustomer']);
  let MockBanksService = jasmine.createSpyObj(['getBank']);

  // Reset config to mock prod
  TestConstants.CONFIG.customer = '';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, HttpClientTestingModule],
      providers: [
        { provide: ErrorService, useValue: MockErrorService },
        { provide: EventService, useValue: MockEventService },
        { provide: TranslateService, useValue: MockTranslateService },
        { provide: CustomersService, useValue: MockCustomersService },
        { provide: BanksService, useValue: MockBanksService }
      ]
    });
    service = TestBed.inject(ConfigService);
    MockErrorService = TestBed.inject(ErrorService);
    MockEventService = TestBed.inject(EventService);
    MockTranslateService = TestBed.inject(TranslateService);
    MockCustomersService = TestBed.inject(CustomersService);
    MockCustomersService.getCustomer.and.returnValue(
      of(TestConstants.CUSTOMER_BANK_MODEL)
    );
    MockBanksService = TestBed.inject(BanksService);
    MockBanksService.getBank.and.returnValue(of(TestConstants.BANK_BANK_MODEL));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize the defaultConfig', () => {
    expect(service.config).toEqual(TestConstants.CONFIG);
  });

  it('should set config$ with a host config when setConfig() is called', fakeAsync(() => {
    // Set refresh interval to mock host config
    TestConstants.CONFIG.refreshInterval = 1000;
    let testConfig!: ComponentConfig;

    service.config$.subscribe((cfg) => {
      testConfig = cfg;
    });
    service.setConfig(TestConstants.CONFIG);
    tick();
    expect(testConfig).toEqual(TestConstants.CONFIG);

    // Reset interval
    TestConstants.CONFIG.refreshInterval = 5000;
  }));

  it('should set component$ with a component selector when setConfig() is called', () => {
    service.setComponent('test');

    service.component$.subscribe((component) => {
      expect(component).toEqual('test');
    });
  });

  it('should return the component as an observable ig getComponent$ is called', () => {
    service.setComponent('test');

    service.getComponent$().subscribe((component) => {
      expect(component).toEqual('test');
    });
  });

  it('should output an error and event if setConfig() is given an invalid config', () => {
    const invalidConfig = {
      error: 'error'
    } as unknown as ComponentConfig;
    service.setConfig(invalidConfig);
    expect(MockErrorService.handleError).toHaveBeenCalled();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
  });

  it('should return the config as an observable if getConfig() is called', () => {
    service.setConfig(TestConstants.CONFIG);
    const config = service.getConfig$();
    config.subscribe((cfg) => {
      expect(cfg).toEqual(TestConstants.CONFIG);
    });
  });

  it('should set theme', () => {
    let config = { ...TestConstants.CONFIG };
    config.theme = 'DARK';

    service.setConfig(config);

    service.getConfig$().subscribe((cfg) => {
      expect(cfg.theme).toEqual('DARK');
    });
  });

  it('should fetch customer data', () => {
    service
      .getCustomer$()
      .subscribe((customer) =>
        expect(customer).toEqual(TestConstants.CUSTOMER_BANK_MODEL)
      );
  });

  it('should fetch bank data', () => {
    service
      .getBank$()
      .subscribe((bank) => expect(bank).toEqual(TestConstants.BANK_BANK_MODEL));
  });
});
