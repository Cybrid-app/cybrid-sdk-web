import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import {
  TranslateLoader,
  TranslateModule,
  TranslatePipe
} from '@ngx-translate/core';
import { HttpLoaderFactory } from '../../../modules/library.module';
import { of, throwError } from 'rxjs';

// Client
import { TransfersService } from '@cybrid/cybrid-api-bank-angular';

// Services
import {
  EventService,
  ErrorService,
  ConfigService,
  RoutingService
} from '@services';

// Utility
import { TestConstants } from '@constants';

// Components
import { PriceListComponent, TransferSummaryComponent } from '@components';

describe('TransferSummaryComponent', () => {
    let component: TransferSummaryComponent;
    let fixture: ComponentFixture<TransferSummaryComponent>;
  
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
      'getConfig$',
      'getComponent$'
    ]);
    let MockTransfersService = jasmine.createSpyObj('TransfersService', ['getTransfer']);
    let MockRoutingService = jasmine.createSpyObj('RoutingService', [
      'handleRoute'
    ]);
    let MockSnackbar = jasmine.createSpyObj('Snackbar', ['open']);
    let MockDialogRef = jasmine.createSpyObj('MatDialogRef', ['open', 'close']);
  
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          BrowserAnimationsModule,
          HttpClientTestingModule,
          MatDialogModule,
          MatSnackBarModule,
          RouterTestingModule.withRoutes([
            {
              path: 'app',
              children: [
                {
                  path: 'price-list',
                  component: PriceListComponent
                }
              ]
            }
          ]),
          TranslateModule.forRoot({
            loader: {
              provide: TranslateLoader,
              useFactory: HttpLoaderFactory,
              deps: [HttpClient]
            }
          })
        ],
        declarations: [TransferSummaryComponent],
        providers: [
          { provide: TransfersService, useValue: MockTransfersService },
          { provide: RoutingService, useValue: MockRoutingService },
          {
            provide: MAT_DIALOG_DATA,
            useValue: {
              model: TestConstants.FIAT_TRANSFER_BANK_MODEL,
              asset: TestConstants.USD_ASSET
            }
          },
          { provide: EventService, useValue: MockEventService },
          { provide: ErrorService, useValue: MockErrorService },
          { provide: ConfigService, useValue: MockConfigService },
          { provide: MatDialogRef, useValue: MockDialogRef },
          { provide: MatSnackBar, useValue: MockSnackbar },
          TranslatePipe
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      }).compileComponents();
      MockTransfersService = TestBed.inject(TransfersService);
      MockTransfersService.getTransfer.and.returnValue(
        of(TestConstants.FIAT_TRANSFER_BANK_MODEL)
      );
      MockRoutingService = TestBed.inject(RoutingService);
      MockEventService = TestBed.inject(EventService);
      MockErrorService = TestBed.inject(ErrorService);
      MockConfigService = TestBed.inject(ConfigService);
      MockConfigService.getConfig$.and.returnValue(of(TestConstants.CONFIG));
      MockConfigService.getComponent$.and.returnValue(of('Transfer'));
    });
  
    beforeEach(() => {
      fixture = TestBed.createComponent(TransferSummaryComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  
    it('should getTransfer()', () => {
      const transfer$Spy = spyOn(component.transfer$, 'next');
      component.ngOnInit();
      expect(MockTransfersService.getTransfer).toHaveBeenCalled();
      expect(transfer$Spy).toHaveBeenCalled();
    });
  
    it('should catch errors when fetching a transfer', () => {
      const error$ = throwError(() => {
        new Error('Error');
      });
      MockTransfersService.getTransfer.and.returnValue(error$);
      component.ngOnInit();
      expect(MockSnackbar.open).toHaveBeenCalled();
      expect(MockEventService.handleEvent).toHaveBeenCalled();
      expect(MockErrorService.handleError).toHaveBeenCalled();
      expect(MockDialogRef.close).toHaveBeenCalled();
    });
  });