import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { HttpLoaderFactory } from '../../../modules/library.module';
import {
  TranslateLoader,
  TranslateModule,
  TranslatePipe
} from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

// Components
import { DepositAddressPaymentComponent } from '@components';

// Services
import {
  EventService,
  ErrorService,
  ConfigService,
  AssetService
} from '@services';

// Utility
import { TestConstants } from '@constants';

describe('DepositAddressPaymentComponent', () => {
  let component: DepositAddressPaymentComponent;
  let fixture: ComponentFixture<DepositAddressPaymentComponent>;

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
  let MockAssetService = jasmine.createSpyObj('AssetService', [
    'getAssets$',
    'getAsset'
  ]);
  let MockDialogRef = jasmine.createSpyObj('MatDialogRef', ['open', 'close']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DepositAddressPaymentComponent],
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        MatDialogModule,
        MatInputModule,
        MatFormFieldModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        })
      ],
      providers: [
        { provide: AssetService, useValue: MockAssetService },
        { provide: MatDialogRef, useValue: MockDialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            account: TestConstants.ACCOUNT_BANK_MODEL_BTC
          }
        },
        { provide: EventService, useValue: MockEventService },
        { provide: ErrorService, useValue: MockErrorService },
        { provide: ConfigService, useValue: MockConfigService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    MockAssetService = TestBed.inject(AssetService);
    MockAssetService.getAssets$.and.returnValue(of(TestConstants.ASSETS));
    MockAssetService.getAsset.and.returnValue(of(TestConstants.BTC_ASSET));
    MockDialogRef = TestBed.inject(MatDialogRef);
    MockDialogRef.open.and.returnValue({ afterClosed: () => of({ id: 1 }) });
    MockEventService = TestBed.inject(EventService);
    MockErrorService = TestBed.inject(ErrorService);
    MockConfigService = TestBed.inject(ConfigService);
    MockConfigService.getConfig$.and.returnValue(of(TestConstants.CONFIG));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DepositAddressPaymentComponent);
    component = fixture.componentInstance;
    component.data = {
      account: TestConstants.ACCOUNT_BANK_MODEL_BTC
    };
    fixture.detectChanges();
    component.account = TestConstants.ACCOUNT_BANK_MODEL_BTC;
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should createDepositPaymentCode()', () => {
    component.createDepositPaymentCode();
    expect(MockDialogRef.close).toHaveBeenCalled();
  });
});
