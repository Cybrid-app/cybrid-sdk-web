import { TestBed } from '@angular/core/testing';

import { QuoteService } from './quote.service';
import { TranslateService } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AssetPipe } from '../../pipes/asset.pipe';
import { ConfigService } from '../config/config.service';
import { of } from 'rxjs';
import { TestConstants } from '../../constants/test.constants';
import { PostQuoteBankModel } from '@cybrid/cybrid-api-bank-angular';
import { MockAssetPipe } from '../../pipes/mock-asset.pipe';

describe('QuoteService', () => {
  let service: QuoteService;
  let MockTranslateService = jasmine.createSpyObj('TranslateService', [
    'setTranslation',
    'setDefaultLang',
    'use'
  ]);
  let MockConfigService = jasmine.createSpyObj('ConfigService', {
    getConfig$: of(TestConstants.CONFIG)
  });
  let asset = TestConstants.BTC_ASSET;
  let counter_asset = TestConstants.USD_ASSET;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: TranslateService, useValue: MockTranslateService },
        { provide: ConfigService, useValue: MockConfigService },
        { provide: AssetPipe, useClass: MockAssetPipe }
      ]
    });
    service = TestBed.inject(QuoteService);
    MockTranslateService = TestBed.inject(TranslateService);
    MockConfigService = TestBed.inject(ConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get the customer GUID', () => {
    expect(service.customer_guid).toEqual('');
  });

  it('should build and return a postQuoteBankModel', () => {
    /* Testing with BTC asset and USD counter_asset */
    let amount = 10;
    let input = 'asset';

    /*
    Side = 'buy'
    Input = 'asset'
    * */
    let postQuote = service.getQuote(
      amount,
      input,
      PostQuoteBankModel.SideEnum.Buy,
      asset,
      counter_asset
    );
    expect(postQuote.receive_amount).toEqual(1000000000); // Satoshi;

    /*
     * Side = 'buy'
     * Input = 'counter_asset'
     * */
    input = 'counter_asset';
    delete postQuote.receive_amount;
    postQuote = service.getQuote(
      amount,
      input,
      PostQuoteBankModel.SideEnum.Buy,
      asset,
      counter_asset
    );
    expect(postQuote.deliver_amount).toEqual(1000); // Cents;

    /*
    Side = 'sell'
    Input = 'asset'
    * */
    input = 'asset';
    delete postQuote.deliver_amount;
    postQuote = service.getQuote(
      amount,
      input,
      PostQuoteBankModel.SideEnum.Sell,
      asset,
      counter_asset
    );
    expect(postQuote.deliver_amount).toEqual(1000000000); // Satoshi

    /*
    Side = 'sell'
    Input = 'counter_asset'
    * */
    input = 'counter_asset';
    delete postQuote.deliver_amount;
    postQuote = service.getQuote(
      amount,
      input,
      PostQuoteBankModel.SideEnum.Sell,
      asset,
      counter_asset
    );
    expect(postQuote.receive_amount).toEqual(1000); // Cents
  });
});
