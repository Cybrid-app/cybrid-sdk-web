import {
  PostQuoteBankModel,
  QuoteBankModel,
  SymbolPriceBankModel,
  TradeBankModel
} from '@cybrid/cybrid-api-bank-angular';
import { SymbolPrice } from '../../../library/src/app/components/price-list/price-list.component';
import { ComponentConfig } from '../services/config/config.service';
import { Asset } from '../services/asset/asset.service';
import { Constants } from './constants';

export class TestConstants {
  // For JWT validation testing
  static JWT =
    'yJraWQiOiJsWTdPaTI2SXZaWXhwSXJuUzJsZGp1ODZUWGZxcnlKVDlZNnZVc1hzRUNFIiwiYWxnIjoiUlM1MTIifQ.eyJpc3MiOiJodHRwczovL2lkLmRlbW8uY3licmlkLmFwcCIsImF1ZCI6WyJodHRwczovL2JhbmsuZGVtby5jeWJyaWQuYXBwIiwiaHR0cHM6Ly9hcGktaW50ZXJuYWwta2V5Lmhlcm9rdWFwcC5jb20iLCJodHRwczovL2lkLmRlbW8uY3licmlkLmFwcCIsImh0dHBzOi8vYXBpLWludGVybmFsLWFjY291bnRzLmhlcm9rdWFwcC5jb20iLCJodHRwczovL2FwaS1pbnRlcm5hbC1pZGVudGl0eS5oZXJva3VhcHAuY29tIiwiaHR0cHM6Ly9hcGktaW50ZWdyYXRpb24tZXhjaGFuZ2UuaGVyb2t1YXBwLmNvbSJdLCJzdWIiOiJiMzZjZjkwMjhlMjM1NmRlNzczMmU0YzUwNWM4NGZiYyIsInN1Yl90eXBlIjoiYmFuayIsInNjb3BlIjpbImJhbmtzOnJlYWQiLCJiYW5rczp3cml0ZSIsImFjY291bnRzOnJlYWQiLCJhY2NvdW50czpleGVjdXRlIiwiY3VzdG9tZXJzOnJlYWQiLCJjdXN0b21lcnM6d3JpdGUiLCJjdXN0b21lcnM6ZXhlY3V0ZSIsInByaWNlczpyZWFkIiwicXVvdGVzOmV4ZWN1dGUiLCJ0cmFkZXM6ZXhlY3V0ZSIsInRyYWRlczpyZWFkIl0sImlhdCI6MTY1MTU4Njg3OSwiZXhwIjoxNjUxNTg4Njc5LCJqdGkiOiI2YTU2ZDYyZi0zOTk1LTRjZWItOGY5MS02ZDc4MzFiOWNjNWQiLCJ0b2tlbl90eXBlIjoiYWNjZXNzIiwicHJvcGVydGllcyI6eyJ0eXBlIjoic2FuZGJveCJ9fQ.et9mPz-p1X5Y9oalg9TaELpz7THJdv9QqG5Jji_36zTDXbLIxmMTt0wXg172_HFz_0YVnyaY1p92iOa92sbcZtiH-CDNwg-3GXAlK5_aBjgyJ53vxtExUWg1lSjHl4Cq8BlhIBskA1bh1BADixh4RbTeo-XZyAfEt3WecUWtUTxsQvXqnRGeQ4tUUIg8bzUb-9KKiKOdezLKFtzT81-Ma8hpLpa916Y0Nlkgn5UJnE4Tpjlm3IAachG5gSS4qwQfzX7anoqD9FyNMrwXGBqyOkoIRCUodSNPK8sRkjMGG60GiR-Fn3Df4_9jly_SfJ8xqHmDjFamf5CHaJIcRJ8GPi6bGZDS0rqRTEVHhvjqXBYFFqNK5ep9X9DuHEecEH-AexD0qLSgTOJ_FN0N4hAQKgCjaulkHRcnUHoBJrIEmdjbvPsCiLTMdTtCOYtYXnI-v8O8H-euv80aLxIOtL7tuUHIffSzJVwzEfy-zkk2YWIB-xqeM_LiPQKfdk2iyjDx28YNHc8bNyOMtD7u4ZjCIP-pvij8zX834KhRMabYIjx50jkIAdB_5ruoMuZCOJdJDEcmxDZULb5aA6KmXJRzn0JcvDdD_hH71qSCh1NdCIAoquihrmWCzqKsNGMC4rckA-RSXVMeY0qKFchQnKzIDAS9HIn3VZeGgd3U27vGM4E';

  // Demo app customer default for Cypress e2e testing
  static CUSTOMER_GUID = '378c691c1b5ba3b938e17c1726202fe4';

  static CONFIG: ComponentConfig = {
    refreshInterval: 5000,
    locale: 'en-US',
    theme: 'LIGHT',
    customer: TestConstants.CUSTOMER_GUID
  };

  // Extension of AssetBankModel to include urls
  static BTC_ASSET: Asset = {
    code: 'BTC',
    decimals: 8,
    name: 'Bitcoin',
    symbol: '₿',
    type: 'crypto',
    url: Constants.ICON_HOST + 'btc.svg'
  };
  static ETH_ASSET: Asset = {
    code: 'ETH',
    decimals: 18,
    name: 'Ethereum',
    symbol: 'Ξ',
    type: 'crypto',
    url: Constants.ICON_HOST + 'eth.svg'
  };
  static CAD_ASSET: Asset = {
    code: 'CAD',
    decimals: 2,
    name: 'Canadian Dollar',
    symbol: '$',
    type: 'fiat',
    url: Constants.ICON_HOST + 'cad.svg'
  };
  static USD_ASSET: Asset = {
    code: 'USD',
    decimals: 2,
    name: 'United States Dollar',
    symbol: '$',
    type: 'fiat',
    url: Constants.ICON_HOST + 'usd.svg'
  };
  static ASSETS: Asset[] = [
    TestConstants.BTC_ASSET,
    TestConstants.ETH_ASSET,
    TestConstants.CAD_ASSET,
    TestConstants.USD_ASSET
  ];

  // Extension of SymbolPriceBankModel to append the asset models
  static SYMBOL_PRICE: SymbolPrice = {
    asset: TestConstants.BTC_ASSET,
    counter_asset: TestConstants.BTC_ASSET,
    symbol: 'BTC-USD',
    buy_price: 0,
    sell_price: 0,
    buy_price_last_updated_at: '',
    sell_price_last_updated_at: ''
  };
  static SYMBOL_PRICE_BANK_MODEL: SymbolPriceBankModel = {
    symbol: 'BTC-CAD',
    buy_price: 1,
    sell_price: 1,
    buy_price_last_updated_at: '',
    sell_price_last_updated_at: ''
  };

  // Trade component test models
  static QUOTE_GUID: 'f92faf30047aca08b95bf10aecb96254';
  static TRADE_GUID: '01ace2000b0883547f7cbcc6cd73547e';
  static POST_QUOTE: PostQuoteBankModel = {
    customer_guid: TestConstants.CUSTOMER_GUID,
    symbol: 'BTC-USD',
    side: 'buy',
    receive_amount: 100000000
  };
  static QUOTE_BANK_MODEL: QuoteBankModel = {
    guid: TestConstants.QUOTE_GUID,
    customer_guid: TestConstants.CUSTOMER_GUID,
    symbol: 'ETH-USD',
    side: 'buy',
    receive_amount: 1000000000000000000,
    deliver_amount: 109028,
    fee: 0,
    issued_at: '2022-06-22T13:30:58.078Z',
    expires_at: '2022-06-22T13:31:28.078Z'
  };

  static TRADE_BANK_MODEL: TradeBankModel = {
    guid: TestConstants.TRADE_GUID,
    customer_guid: TestConstants.CUSTOMER_GUID,
    quote_guid: TestConstants.QUOTE_GUID,
    symbol: 'BTC-USD',
    side: 'buy',
    state: 'storing',
    receive_amount: 100000000,
    deliver_amount: 109028,
    fee: 0,
    created_at: '2022-06-24T14:31:33.244Z'
  };
}
