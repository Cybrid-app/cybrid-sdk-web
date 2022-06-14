import {
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';

import { Asset, AssetService } from './asset.service';
import {
  AssetListBankModel,
  AssetsService
} from '@cybrid/cybrid-api-bank-angular';
import { AuthService } from '../auth/auth.service';
import { EventService } from '../event/event.service';
import { ErrorService } from '../error/error.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { TestConstants } from '../../constants/test.constants';

describe('AssetService', () => {
  let assetService: AssetService;
  const testAssetModel: Asset = {
    type: 'crypto',
    code: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    symbol: '',
    url: TestConstants.ICON_URL
  };
  const testAssetList: AssetListBankModel = {
    total: 0,
    page: 0,
    per_page: 0,
    objects: [testAssetModel]
  };
  let MockAssetsService = jasmine.createSpyObj('AssetsService', {
    listAssets: of(testAssetList)
  });
  let MockAuthService = jasmine.createSpyObj('AuthService', {
    getToken$: of(true)
  });
  let MockEventService = jasmine.createSpyObj('EventService', ['handleEvent']);
  let MockErrorService = jasmine.createSpyObj('ErrorService', ['handleError']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AssetsService, useValue: MockAssetsService },
        { provide: AuthService, useValue: MockAuthService },
        { provide: EventService, useValue: MockEventService },
        { provide: ErrorService, useValue: MockErrorService }
      ]
    });
    assetService = TestBed.inject(AssetService);
    MockAssetsService = TestBed.inject(AssetsService);
    MockAuthService = TestBed.inject(AuthService);
    MockEventService = TestBed.inject(EventService);
    MockErrorService = TestBed.inject(ErrorService);
  });

  it('should be created', () => {
    expect(assetService).toBeTruthy();
  });

  it('should initialize assets', () => {
    assetService.initAssets();
    expect(MockAuthService.getToken$).toHaveBeenCalled();
  });

  it('should log an event and error if initializing assets is unsuccessful', fakeAsync(() => {
    const error$ = throwError(() => {
      return new Error('Error');
    });
    MockAuthService.getToken$.and.returnValue(error$);
    MockAssetsService.listAssets.and.returnValue([]);
    assetService.initAssets();
    tick(1000);
    discardPeriodicTasks();
    expect(MockErrorService.handleError).toHaveBeenCalled();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
  }));

  it('should return the asset list as an observable', () => {
    assetService.getAssets$().subscribe((list) => {
      expect(list).toEqual([testAssetModel]);
    });
  });

  it('should return the asset if it exists', fakeAsync(() => {
    assetService.assetList = [testAssetModel];
    tick(1000);
    discardPeriodicTasks();
    expect(assetService.getAsset('ETH')).toEqual(testAssetModel);
  }));

  it('should log an event and error if the asset does not exist', fakeAsync(() => {
    assetService.assetList = [testAssetModel];
    assetService.getAsset('test');
    tick(1000);
    discardPeriodicTasks();
    expect(MockErrorService.handleError).toHaveBeenCalled();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
  }));
});
