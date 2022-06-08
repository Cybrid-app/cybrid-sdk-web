import { AssetPipe } from './asset.pipe';
import { ConfigService } from '../services/config/config.service';
import { of } from 'rxjs';
import { TestConstants } from '../constants/test.constants';

describe('AssetPipe', () => {
  let MockConfigService = jasmine.createSpyObj('ConfigService', {
    getConfig$: of(TestConstants.CONFIG)
  });

  it('create an instance', () => {
    const pipe = new AssetPipe(MockConfigService);
    expect(pipe).toBeTruthy();
  });

  it('should getConfig$() on initialization', () => {
    const pipe = new AssetPipe(MockConfigService);
    pipe.initLocale();
    expect(pipe.locale).toEqual(TestConstants.CONFIG.locale);
  });

  it('should transform asset values', () => {
    const pipe = new AssetPipe(MockConfigService);
    expect(pipe.transform(0, TestConstants.BTC_ASSET)).toEqual('₿0.00');
    expect(pipe.transform(0, TestConstants.ETH_ASSET)).toEqual('Ξ0.00');
    expect(pipe.transform(0, TestConstants.CAD_ASSET)).toEqual('$0.00');
    expect(pipe.transform(1, TestConstants.BTC_ASSET)).toEqual('₿0.00000001');
    expect(pipe.transform(1, TestConstants.ETH_ASSET)).toEqual(
      'Ξ0.000000000000000001'
    );
    expect(pipe.transform(1, TestConstants.CAD_ASSET)).toEqual('$0.01');
    expect(
      pipe.transform(
        Number.MAX_SAFE_INTEGER.toString(),
        TestConstants.BTC_ASSET
      )
    ).toEqual('₿90,071,992.54740991');
    expect(
      pipe.transform(
        Number.MIN_SAFE_INTEGER.toString(),
        TestConstants.CAD_ASSET
      )
    ).toEqual('$-90,071,992,547,409.91');
    expect(
      pipe.transform('123456789123456789123456789123', TestConstants.BTC_ASSET)
    ).toEqual('₿1.23456789123456789123456789123e+21');
    expect(
      pipe.transform('123456789123456789123456789123', TestConstants.ETH_ASSET)
    ).toEqual('Ξ123,456,789,123.456789123456789123');
    expect(
      pipe.transform('123456789123456789123456789123', TestConstants.CAD_ASSET)
    ).toEqual('$1.23');
  });

  it('should adjust to a minimum of 2 decimal places', () => {
    const pipe = new AssetPipe(MockConfigService);
    expect(pipe.transform(36010, TestConstants.CAD_ASSET)).toEqual('$360.10');
  });

  it('should return a trade unit when the param is set to trade', () => {
    const pipe = new AssetPipe(MockConfigService);
    expect(pipe.transform(36010, TestConstants.BTC_ASSET, 'trade')).toEqual(
      '0.0003601'
    );
  });

  it('should return a base unit when the param is set to base', () => {
    const pipe = new AssetPipe(MockConfigService);
    expect(pipe.transform(36010, TestConstants.BTC_ASSET, 'base')).toEqual(
      '3601000000000'
    );
  });

  it('should unsubscribe from getConfig$() onDestroy', () => {
    const pipe = new AssetPipe(MockConfigService);
    const unsubSpy = spyOn(pipe.unsubscribe$, 'complete');
    pipe.ngOnDestroy();
    expect(unsubSpy).toHaveBeenCalled();
  });
});
