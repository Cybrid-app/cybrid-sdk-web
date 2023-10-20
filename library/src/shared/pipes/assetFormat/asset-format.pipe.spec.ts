import { of } from 'rxjs';

import { AssetService, ConfigService } from '@services';
import { AssetFormatPipe } from '@pipes';

import { TestConstants } from '@constants';
import { TestBed } from '@angular/core/testing';

describe('AssetFormatPipe', () => {
  let pipe: AssetFormatPipe;
  let MockConfigService = jasmine.createSpyObj('ConfigService', {
    getConfig$: of(TestConstants.CONFIG)
  });

  class MockAssetService {
    assetList = TestConstants.ASSETS;

    getAsset(code: string): any {
      const asset = this.assetList.find((list) => {
        return list.code == code.toUpperCase();
      });
      if (asset) {
        return asset;
      }
    }
  }

  let mockAssetService = new MockAssetService();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [{ provide: AssetService, useValue: mockAssetService }]
    });

    let MockAssetService = TestBed.inject(AssetService);
    pipe = new AssetFormatPipe(MockConfigService, MockAssetService);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should getConfig$() on initialization', () => {
    pipe.initLocale();
    expect(pipe.locale).toEqual(TestConstants.CONFIG.locale);
  });

  it('should transform asset values', () => {
    expect(pipe.transform(0, TestConstants.BTC_ASSET.code)).toEqual('0');
    expect(pipe.transform(0, TestConstants.ETH_ASSET.code)).toEqual('0');
    expect(pipe.transform(0, TestConstants.CAD_ASSET.code)).toEqual('$0.00');
    expect(pipe.transform(1, 'BTC')).toEqual('0.00000001');
    expect(pipe.transform(1, TestConstants.ETH_ASSET.code)).toEqual(
      '0.000000000000000001'
    );
    expect(pipe.transform(1, TestConstants.CAD_ASSET.code)).toEqual('$0.01');
    expect(pipe.transform(1.1, TestConstants.BTC_ASSET.code)).toEqual(
      '0.000000011'
    );
    expect(pipe.transform(123456789123400000000, 'BTC')).toEqual(
      '1,234,567,891,234'
    );
    expect(pipe.transform(123456789123400000000, 'ETH')).toEqual(
      '123.4567891234'
    );
    expect(
      pipe.transform(
        Number.MAX_SAFE_INTEGER.toString(),
        TestConstants.BTC_ASSET.code
      )
    ).toEqual('90,071,992.54740991');
    expect(
      pipe.transform(
        Number.MIN_SAFE_INTEGER.toString(),
        TestConstants.CAD_ASSET.code
      )
    ).toEqual('$-90,071,992,547,409.91');
    expect(
      pipe.transform(
        '123456789123456789123456789123',
        TestConstants.BTC_ASSET.code
      )
    ).toEqual('1,234,567,891,234,568,000,000.56789123');
    expect(
      pipe.transform(
        '123456789123456789123456789123',
        TestConstants.ETH_ASSET.code
      )
    ).toEqual('123,456,789,123.456789123456789123');
    expect(
      pipe.transform('123456789123456789123456', TestConstants.CAD_ASSET.code)
    ).toEqual('$1,234,567,891,234,568,000,000.56');
  });

  it('should trim asset values', () => {
    expect(
      pipe.transform(
        36010.12345678910111213141516,
        TestConstants.CAD_ASSET.code,
        'trim'
      )
    ).toEqual('36010.12');
    expect(pipe.transform(36010, TestConstants.CAD_ASSET.code, 'trim')).toEqual(
      36010
    );
    expect(
      pipe.transform(
        36010.12345678910111213141516,
        TestConstants.BTC_ASSET.code,
        'trim'
      )
    ).toEqual('36010.12345679');
    expect(pipe.transform(36010, TestConstants.BTC_ASSET.code, 'trim')).toEqual(
      36010
    );
  });

  it('should return trade units', () => {
    expect(
      pipe.transform(36010, TestConstants.USD_ASSET.code, 'trade')
    ).toEqual('360.1');
    expect(
      pipe.transform(36010.00321, TestConstants.USD_ASSET.code, 'trade')
    ).toEqual('360.1');
    expect(
      pipe.transform(36010, TestConstants.BTC_ASSET.code, 'trade')
    ).toEqual('0.0003601');
    expect(
      pipe.transform(36010.00321, TestConstants.ETH_ASSET.code, 'trade')
    ).toEqual('0.00000000000003601');
  });

  it('should return base units', () => {
    expect(pipe.transform(36010, TestConstants.USD_ASSET.code, 'base')).toEqual(
      '3601000'
    );
    expect(
      pipe.transform(36010.00321, TestConstants.USD_ASSET.code, 'base')
    ).toEqual('3601000.32');
    expect(pipe.transform(36010, TestConstants.BTC_ASSET.code, 'base')).toEqual(
      '3601000000000'
    );
    expect(
      pipe.transform(36010.00321, TestConstants.ETH_ASSET.code, 'base')
    ).toEqual('36010003210000000000000');
  });

  it('should unsubscribe from getConfig$() onDestroy', () => {
    const unsubSpy = spyOn(pipe.unsubscribe$, 'complete');
    pipe.ngOnDestroy();
    expect(unsubSpy).toHaveBeenCalled();
  });
});
