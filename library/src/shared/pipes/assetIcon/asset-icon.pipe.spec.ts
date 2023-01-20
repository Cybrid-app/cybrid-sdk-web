import { TestBed } from '@angular/core/testing';

import { Asset, AssetService } from '@services';
import { AssetIconPipe } from '@pipes';
import { TestConstants } from '@constants';

describe('IconPipe', () => {
  let pipe: AssetIconPipe;
  let MockAssetService = jasmine.createSpyObj('AssetService', [
    'getAssets$',
    'getAsset'
  ]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [{ provide: AssetService, useValue: MockAssetService }]
    });

    MockAssetService = TestBed.inject(AssetService);
    MockAssetService.getAsset.and.returnValue(TestConstants.BTC_ASSET);
    pipe = new AssetIconPipe(MockAssetService);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return the asset icon url', () => {
    expect(pipe.transform('BTC')).toEqual(TestConstants.BTC_ASSET.url);
  });

  it('should handle an undefined code', () => {
    MockAssetService.getAsset.and.returnValue(undefined);
    expect(pipe.transform(undefined)).toEqual('');
  });

  it('should handle an unavailable url', () => {
    let asset: Partial<Asset> = { ...TestConstants.BTC_ASSET };
    delete asset.url;

    MockAssetService.getAsset.and.returnValue(asset);
    expect(pipe.transform('BTC')).toEqual('');
  });
});
