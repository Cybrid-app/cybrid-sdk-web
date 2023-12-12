import {
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { of, throwError, EMPTY} from 'rxjs';

// Client
import {
  AssetListBankModel,
  AssetBankModel,
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

  describe('when paging all assets', () => {
    it('should page assets', () => {
      const perPage = Number(TestConstants.ASSET_LIST_BANK_MODEL.total);
      assetService.pageAssets(perPage, TestConstants.ASSET_LIST_BANK_MODEL);

      expect(MockAssetsService.listAssets).toHaveBeenCalled();
    });

    it('should return EMPTY when complete', () => {
      const perPage = Number(TestConstants.ASSET_LIST_BANK_MODEL.total + 1);
      const assets = assetService.pageAssets(
        perPage,
        TestConstants.ASSET_LIST_BANK_MODEL
      );

      expect(assets).toEqual(EMPTY);
    });

    it('should accumulate assets', () => {
      const totalAssets = Number(TestConstants.ASSET_LIST_BANK_MODEL.total) + 1;
      const assets = assetService.accumulateAssets(
        TestConstants.ASSET_LIST_BANK_MODEL.objects,
        [TestConstants.ASSET_LIST_BANK_MODEL.objects[0]]
      );

      expect(assets.length).toEqual(totalAssets);
    });
  });

  describe('when listing all assets', () => {
    it('should list all assets', () => {
      MockAssetsService.listAssets.and.returnValue(
        of(TestConstants.ASSET_LIST_BANK_MODEL)
      );

      assetService.assetsPerPage = Number(
        TestConstants.ASSET_LIST_BANK_MODEL.total
      );

      assetService.listAllAssets().subscribe((assets: AssetBankModel[]) => {
        expect(TestConstants.ASSET_LIST_BANK_MODEL.objects).toEqual(assets);
      });

      expect(MockAssetsService.listAssets).toHaveBeenCalled();

      // Reset
      MockAssetsService.listAssets.and.returnValue(of(testAssetList));
    });
  });

  it('should return the asset list as an observable', () => {
    let assetList$ = assetService.getAssets$();
    expect(assetList$).toEqual(assetService.assetList$.asObservable());
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
