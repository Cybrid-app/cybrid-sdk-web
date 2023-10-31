import {
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { of, Observable, throwError } from 'rxjs';

// Client
import {
  AssetListBankModel,
  AssetsService
} from '@cybrid/cybrid-api-bank-angular';

// Services
import {
  Asset,
  AssetService,
  ConfigService,
  EventService,
  ErrorService
} from '@services';

// Utility
import { Constants, TestConstants } from '@constants';

describe('AssetService', () => {
  let assetService: AssetService;
  const testAssetModel: Asset = {
    type: 'crypto',
    code: 'ETH',
    name: 'Ethereum',
    decimals: '18',
    symbol: '',
    url: Constants.ICON_HOST + 'eth.svg'
  };
  const testAssetList: AssetListBankModel = {
    total: '0',
    page: '0',
    per_page: '0',
    objects: [testAssetModel]
  };
  let MockAssetsService = jasmine.createSpyObj('AssetsService', {
    listAssets: of(testAssetList)
  });
  let MockConfigService = jasmine.createSpyObj('ConfigService', {
    getConfig$: of(TestConstants.CONFIG)
  });
  let MockEventService = jasmine.createSpyObj('EventService', ['handleEvent']);
  let MockErrorService = jasmine.createSpyObj('ErrorService', ['handleError']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AssetsService, useValue: MockAssetsService },
        { provide: ConfigService, useValue: MockConfigService },
        { provide: EventService, useValue: MockEventService },
        { provide: ErrorService, useValue: MockErrorService }
      ]
    });
    assetService = TestBed.inject(AssetService);
    MockAssetsService = TestBed.inject(AssetsService);
    MockConfigService = TestBed.inject(ConfigService);
    MockEventService = TestBed.inject(EventService);
    MockErrorService = TestBed.inject(ErrorService);
  });

  it('should be created', () => {
    expect(assetService).toBeTruthy();
  });

  it('should initialize assets', () => {
    assetService.initAssets();
    expect(MockConfigService.getConfig$).toHaveBeenCalled();
  });

  it('should log an event and error if initializing assets is unsuccessful', fakeAsync(() => {
    const error$ = throwError(() => {
      return new Error('Error');
    });
    MockConfigService.getConfig$.and.returnValue(error$);
    MockAssetsService.listAssets.and.returnValue([]);
    assetService.initAssets();
    tick(1000);
    discardPeriodicTasks();
    expect(MockErrorService.handleError).toHaveBeenCalled();
    expect(MockEventService.handleEvent).toHaveBeenCalled();
  }));

  it('should page through assets', () => {
    let assetList = {
      ...TestConstants.ASSET_LIST_BANK_MODEL
    };
    assetList.objects = [];

    // Fill objects with default amount per page
    for (let i = 0; i < 10; i++) {
      assetList.objects.push(TestConstants.ASSET_LIST_BANK_MODEL.objects[0]);
    }

    MockAssetsService.listAssets.and.returnValue(of(assetList));

    assetService.listAssets();
    expect(assetService.pageAssets(assetList)).toBeInstanceOf(
      Observable<AssetListBankModel>
    );
  });

  it('should return the asset list as an observable', () => {
    assetService
      .getAssets$()
      .subscribe((list) => expect(list).toEqual([testAssetModel]));
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
