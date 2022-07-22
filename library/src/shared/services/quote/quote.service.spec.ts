import { TestBed } from '@angular/core/testing';

import { QuoteService } from './quote.service';
import { TranslateService } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AssetPipe } from '../../pipes/asset/asset.pipe';
import { ConfigService } from '../config/config.service';
import { of } from 'rxjs';
import { TestConstants } from '../../constants/test.constants';
import { PostQuoteBankModel } from '@cybrid/cybrid-api-bank-angular';
import { MockAssetPipe } from '../../pipes/asset/mock-asset.pipe';

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

  // Reset temp customer GUID to mock prod
  TestConstants.CONFIG.customer = '';

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
    expect(service.customer_guid).toEqual(TestConstants.CONFIG.customer);
  });

  it('should build and return a postQuoteBankModel', () => {
    /* Testing with BTC asset and USD counter_asset */
    let testAmounts = ['0.01', '12', '123456', '12345678910'];

    function testQuote(
      amounts: string[],
      side: PostQuoteBankModel.SideEnum,
      input: string
    ): PostQuoteBankModel[] {
      let quotes: PostQuoteBankModel[] = [];
      amounts.forEach((amount) => {
        quotes.push(
          service.getQuote(amount, input, side, asset, counter_asset)
        );
      });
      return quotes;
    }

    /* Side = 'buy', Input = 'asset' */
    let expectedAmounts = [
      // Satoshi
      '1000000',
      '1200000000',
      '12345600000000',
      '1234567891000000000'
    ];
    let testedAmounts = testQuote(
      testAmounts,
      PostQuoteBankModel.SideEnum.Buy,
      'asset'
    ).map((quote) => quote.receive_amount) as string[];
    expect(testedAmounts).toEqual(expectedAmounts);

    /* Side = 'buy', Input = 'counter_asset' */
    expectedAmounts = [
      // Cents
      '1',
      '1200',
      '12345600',
      '1234567891000'
    ];
    testedAmounts = testQuote(
      testAmounts,
      PostQuoteBankModel.SideEnum.Buy,
      'counter_asset'
    ).map((quote) => quote.deliver_amount) as string[];
    expect(testedAmounts).toEqual(expectedAmounts);

    /* Side = 'sell', Input = 'asset' */
    expectedAmounts = [
      // Satoshi
      '1000000',
      '1200000000',
      '12345600000000',
      '1234567891000000000'
    ];
    testedAmounts = testQuote(
      testAmounts,
      PostQuoteBankModel.SideEnum.Sell,
      'asset'
    ).map((quote) => quote.deliver_amount) as string[];
    expect(testedAmounts).toEqual(expectedAmounts);

    /* Side = 'sell', Input = 'counter_asset' */
    expectedAmounts = [
      // Cents
      '1',
      '1200',
      '12345600',
      '1234567891000'
    ];
    testedAmounts = testQuote(
      testAmounts,
      PostQuoteBankModel.SideEnum.Sell,
      'counter_asset'
    ).map((quote) => quote.receive_amount) as string[];
    expect(testedAmounts).toEqual(expectedAmounts);

    /* Testing with ETH asset and USD counter_asset
     *
     * Until openAPI Generator is configured to use the BigInt type instead of Number we
     * are limited by the amount of ETH this service can convert.
     */

    /* Side = 'buy', Input = 'asset' */
    testAmounts = ['0.01', '12', '1234'];
    asset = TestConstants.ETH_ASSET;
    expectedAmounts = [
      // Wei
      '10000000000000000',
      '12000000000000000000',
      '1234000000000000000000'
    ];
    testedAmounts = testQuote(
      testAmounts,
      PostQuoteBankModel.SideEnum.Buy,
      'asset'
    ).map((quote) => quote.receive_amount) as string[];
    expect(testedAmounts).toEqual(expectedAmounts);

    /* Side = 'sell', Input = 'asset' */
    testAmounts = ['0.01', '12', '1234'];
    asset = TestConstants.ETH_ASSET;
    expectedAmounts = [
      // Wei
      '10000000000000000',
      '12000000000000000000',
      '1234000000000000000000'
    ];
    testedAmounts = testQuote(
      testAmounts,
      PostQuoteBankModel.SideEnum.Sell,
      'asset'
    ).map((quote) => quote.deliver_amount) as string[];
    expect(testedAmounts).toEqual(expectedAmounts);
  });
});
