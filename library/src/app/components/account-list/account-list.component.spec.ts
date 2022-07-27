import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HttpLoaderFactory } from '../../modules/library.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

// Services
import {
  AccountService,
  ConfigService,
  ErrorService,
  EventService,
  RoutingService
} from '@services';

// Components
import { AccountListComponent } from '@components';

// Utility
import { AssetPipe, MockAssetPipe } from '@pipes';
import { TestConstants } from '@constants';
import { SharedModule } from '../../../shared/modules/shared.module';

describe('AccountListComponent', () => {
  let component: AccountListComponent;
  let fixture: ComponentFixture<AccountListComponent>;

  let MockEventService = jasmine.createSpyObj('EventService', [
    'getEvent',
    'handleEvent'
  ]);
  let MockErrorService = jasmine.createSpyObj('ErrorService', [
    'getError',
    'handleError'
  ]);
  let MockConfigService = jasmine.createSpyObj('ConfigService', [
    'setConfig',
    'getConfig$'
  ]);
  let MockAccountService = jasmine.createSpyObj('AccountService', [
    'getPortfolio'
  ]);
  let MockRoutingService = jasmine.createSpyObj('RoutingService', [
    'handleRoute'
  ]);
  const error$ = throwError(() => {
    new Error('Error');
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountListComponent, AssetPipe],
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        SharedModule,
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        })
      ],
      providers: [
        { provide: AssetPipe, useClass: MockAssetPipe },
        { provide: EventService, useValue: MockEventService },
        { provide: ErrorService, useValue: MockErrorService },
        { provide: ConfigService, useValue: MockConfigService },
        { provide: AccountService, useValue: MockAccountService },
        { provide: RoutingService, useValue: MockRoutingService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    MockEventService = TestBed.inject(EventService);
    MockErrorService = TestBed.inject(ErrorService);
    MockConfigService = TestBed.inject(ConfigService);
    MockConfigService.getConfig$.and.returnValue(of(TestConstants.CONFIG));
    MockAccountService = TestBed.inject(AccountService);
    MockAccountService.getPortfolio.and.returnValue(
      of(TestConstants.ACCOUNT_OVERVIEW)
    );
    MockRoutingService = TestBed.inject(RoutingService);

    fixture = TestBed.createComponent(AccountListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should log an event when the component is initialized', () => {
    expect(MockEventService.handleEvent).toHaveBeenCalled();
  });

  it('should call init functions in ngOnInit()', () => {
    component.getAccounts = () => undefined;
    component.refreshData = () => undefined;
    const getAccountsSpy = spyOn(component, 'getAccounts').and.callThrough();
    const refreshDataSpy = spyOn(component, 'refreshData').and.callThrough();

    component.ngOnInit();

    expect(getAccountsSpy).toHaveBeenCalled();
    expect(refreshDataSpy).toHaveBeenCalled();
  });

  it('should get accounts', () => {
    const balance$Spy = spyOn(component.balance$, 'next');

    component.ngOnInit();

    expect(MockAccountService.getPortfolio).toHaveBeenCalled();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
    expect(balance$Spy).toHaveBeenCalledWith(
      TestConstants.ACCOUNT_OVERVIEW.balance
    );
    expect(component.dataSource.data).toEqual(
      TestConstants.ACCOUNT_OVERVIEW.accounts
    );
  });

  it('should handle errors when calling get accounts', () => {
    MockAccountService.getPortfolio.and.returnValue(error$);

    component.ngOnInit();

    expect(MockEventService.handleEvent).toHaveBeenCalled();
    expect(MockErrorService.handleError).toHaveBeenCalled();
  });

  it('should refresh the accounts', fakeAsync(() => {
    const getAccountsSpy = spyOn(component, 'getAccounts');

    component.ngOnInit();
    tick(TestConstants.CONFIG.refreshInterval);

    expect(getAccountsSpy).toHaveBeenCalledTimes(2);
    expect(MockEventService.handleEvent).toHaveBeenCalled();
    discardPeriodicTasks();
  }));

  it('should call the routing service onNavigate', () => {
    component.ngOnInit();
    component.onNavigate();

    expect(MockRoutingService.handleRoute).toHaveBeenCalledWith(
      'trade',
      'account-list'
    );
  });
});
