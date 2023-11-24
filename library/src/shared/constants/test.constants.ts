// Client
import {
  AccountBankModel,
  AccountListBankModel,
  AssetListBankModel,
  CustomerBankModel,
  ExternalBankAccountBankModel,
  ExternalBankAccountListBankModel,
  IdentityVerificationListBankModel,
  IdentityVerificationWithDetailsBankModel,
  PostQuoteBankModel,
  PostWorkflowBankModel,
  QuoteBankModel,
  SymbolPriceBankModel,
  TradeBankModel,
  TradeListBankModel,
  TransferBankModel,
  TransferListBankModel,
  WorkflowBankModel,
  WorkflowWithDetailsBankModel
} from '@cybrid/cybrid-api-bank-angular';

// Services
import { ComponentConfig, Asset } from '@services';

// Components
import { SymbolPrice } from '@components';
import { Constants } from '@constants';
import { AccountBankModelWithDetails } from '../services/account/account.service';

export class TestConstants {
  // For JWT validation testing
  static JWT =
    'yJraWQiOiJsWTdPaTI2SXZaWXhwSXJuUzJsZGp1ODZUWGZxcnlKVDlZNnZVc1hzRUNFIiwiYWxnIjoiUlM1MTIifQ.eyJpc3MiOiJodHRwczovL2lkLmRlbW8uY3licmlkLmFwcCIsImF1ZCI6WyJodHRwczovL2JhbmsuZGVtby5jeWJyaWQuYXBwIiwiaHR0cHM6Ly9hcGktaW50ZXJuYWwta2V5Lmhlcm9rdWFwcC5jb20iLCJodHRwczovL2lkLmRlbW8uY3licmlkLmFwcCIsImh0dHBzOi8vYXBpLWludGVybmFsLWFjY291bnRzLmhlcm9rdWFwcC5jb20iLCJodHRwczovL2FwaS1pbnRlcm5hbC1pZGVudGl0eS5oZXJva3VhcHAuY29tIiwiaHR0cHM6Ly9hcGktaW50ZWdyYXRpb24tZXhjaGFuZ2UuaGVyb2t1YXBwLmNvbSJdLCJzdWIiOiJiMzZjZjkwMjhlMjM1NmRlNzczMmU0YzUwNWM4NGZiYyIsInN1Yl90eXBlIjoiYmFuayIsInNjb3BlIjpbImJhbmtzOnJlYWQiLCJiYW5rczp3cml0ZSIsImFjY291bnRzOnJlYWQiLCJhY2NvdW50czpleGVjdXRlIiwiY3VzdG9tZXJzOnJlYWQiLCJjdXN0b21lcnM6d3JpdGUiLCJjdXN0b21lcnM6ZXhlY3V0ZSIsInByaWNlczpyZWFkIiwicXVvdGVzOmV4ZWN1dGUiLCJ0cmFkZXM6ZXhlY3V0ZSIsInRyYWRlczpyZWFkIl0sImlhdCI6MTY1MTU4Njg3OSwiZXhwIjoxNjUxNTg4Njc5LCJqdGkiOiI2YTU2ZDYyZi0zOTk1LTRjZWItOGY5MS02ZDc4MzFiOWNjNWQiLCJ0b2tlbl90eXBlIjoiYWNjZXNzIiwicHJvcGVydGllcyI6eyJ0eXBlIjoic2FuZGJveCJ9fQ.et9mPz-p1X5Y9oalg9TaELpz7THJdv9QqG5Jji_36zTDXbLIxmMTt0wXg172_HFz_0YVnyaY1p92iOa92sbcZtiH-CDNwg-3GXAlK5_aBjgyJ53vxtExUWg1lSjHl4Cq8BlhIBskA1bh1BADixh4RbTeo-XZyAfEt3WecUWtUTxsQvXqnRGeQ4tUUIg8bzUb-9KKiKOdezLKFtzT81-Ma8hpLpa916Y0Nlkgn5UJnE4Tpjlm3IAachG5gSS4qwQfzX7anoqD9FyNMrwXGBqyOkoIRCUodSNPK8sRkjMGG60GiR-Fn3Df4_9jly_SfJ8xqHmDjFamf5CHaJIcRJ8GPi6bGZDS0rqRTEVHhvjqXBYFFqNK5ep9X9DuHEecEH-AexD0qLSgTOJ_FN0N4hAQKgCjaulkHRcnUHoBJrIEmdjbvPsCiLTMdTtCOYtYXnI-v8O8H-euv80aLxIOtL7tuUHIffSzJVwzEfy-zkk2YWIB-xqeM_LiPQKfdk2iyjDx28YNHc8bNyOMtD7u4ZjCIP-pvij8zX834KhRMabYIjx50jkIAdB_5ruoMuZCOJdJDEcmxDZULb5aA6KmXJRzn0JcvDdD_hH71qSCh1NdCIAoquihrmWCzqKsNGMC4rckA-RSXVMeY0qKFchQnKzIDAS9HIn3VZeGgd3U27vGM4E';

  static CONFIG: ComponentConfig = {
    refreshInterval: 5000,
    locale: 'en-US',
    theme: 'LIGHT',
    routing: true,
    customer: 'e8dc9202e0e96a33b5b6a7b0cfb66c60',
    fiat: 'USD',
    features: ['attestation_identity_records', 'backstopped_funding_source'],
    environment: 'staging',
    redirectUri:
      'https://cybrid-app.github.io/cybrid-sdk-web/demo/bank-account-connect'
  };

  static ASSET_LIST_BANK_MODEL: AssetListBankModel = {
    total: '4',
    page: '0',
    per_page: '10',
    objects: [
      {
        type: 'fiat',
        code: 'CAD',
        name: 'Canadian Dollar',
        symbol: '$',
        decimals: '2'
      },
      {
        type: 'fiat',
        code: 'USD',
        name: 'United States Dollar',
        symbol: '$',
        decimals: '2'
      },
      {
        type: 'crypto',
        code: 'BTC',
        name: 'Bitcoin',
        symbol: '₿',
        decimals: '8'
      },
      {
        type: 'crypto',
        code: 'ETH',
        name: 'Ethereum',
        symbol: 'Ξ',
        decimals: '18'
      }
    ]
  };

  // Extension of AssetBankModel to include urls
  static BTC_ASSET: Asset = {
    code: 'BTC',
    decimals: '8',
    name: 'Bitcoin',
    symbol: '₿',
    type: 'crypto',
    url: Constants.ICON_HOST + 'btc.svg'
  };
  static ETH_ASSET: Asset = {
    code: 'ETH',
    decimals: '18',
    name: 'Ethereum',
    symbol: 'Ξ',
    type: 'crypto',
    url: Constants.ICON_HOST + 'eth.svg'
  };
  static CAD_ASSET: Asset = {
    code: 'CAD',
    decimals: '2',
    name: 'Canadian Dollar',
    symbol: '$',
    type: 'fiat',
    url: Constants.ICON_HOST + 'cad.svg'
  };
  static USD_ASSET: Asset = {
    code: 'USD',
    decimals: '2',
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
    buy_price: '0',
    sell_price: '0',
    buy_price_last_updated_at: '',
    sell_price_last_updated_at: ''
  };
  static SYMBOL_PRICE_BANK_MODEL: SymbolPriceBankModel = {
    symbol: 'BTC-CAD',
    buy_price: '1',
    sell_price: '1',
    buy_price_last_updated_at: '',
    sell_price_last_updated_at: ''
  };

  // Trade component test models
  static POST_QUOTE: PostQuoteBankModel = {
    customer_guid: '',
    symbol: 'BTC-USD',
    side: 'buy',
    receive_amount: '100000000'
  };
  static QUOTE_BANK_MODEL: QuoteBankModel = {
    guid: 'ede5f73db305fbd27ec0eb0894ae8aa7',
    customer_guid: '',
    symbol: 'ETH-USD',
    side: 'buy',
    receive_amount: '1000000000000000000',
    deliver_amount: '103331',
    fee: '0',
    issued_at: '2022-06-30T17:04:37.331Z',
    expires_at: '2022-06-30T17:05:07.331Z'
  };

  static TRADE_BANK_MODEL: TradeBankModel = {
    guid: 'c82a16d42415867e8d740cb1691b5af5',
    customer_guid: 'a770abcb07ba7be59bbda2e75be19e66',
    quote_guid: '99914bf69eec4b2007407dfa92936320',
    symbol: 'ETH-USD',
    side: 'buy',
    state: 'settling',
    //@ts-ignore
    failure_code: null,
    receive_amount: '860900000000000',
    deliver_amount: '100',
    fee: '0',
    created_at: '2022-11-23T15:59:26.073Z'
  };

  // Account-list component test models
  static ACCOUNT_GUID = '61dbf15e631571018ff808fa51746b46';

  static SYMBOL_PRICE_BANK_MODEL_ARRAY: SymbolPriceBankModel[] = [
    {
      symbol: 'BTC-USD',
      buy_price: '2129800',
      sell_price: '2129700',
      buy_price_last_updated_at: '2022-07-27T13:28:13.322Z',
      sell_price_last_updated_at: '2022-07-27T13:28:13.322Z'
    },
    {
      symbol: 'ETH-USD',
      buy_price: '147030',
      sell_price: '147050',
      buy_price_last_updated_at: '2022-07-27T13:28:13.322Z',
      sell_price_last_updated_at: '2022-07-27T13:28:13.322Z'
    }
  ];

  static ACCOUNT_LIST_BANK_MODEL: AccountListBankModel = {
    total: '5',
    page: '0',
    per_page: '10',
    objects: [
      {
        type: 'fiat',
        guid: '46d8965271d7da9c981c86ecb5667092',
        created_at: '2022-11-24T18:32:53.196Z',
        asset: 'USD',
        name: 'USD',
        customer_guid: 'e8dc9202e0e96a33b5b6a7b0cfb66c60',
        platform_balance: '100',
        platform_available: '100',
        state: 'created'
      },
      {
        type: 'trading',
        guid: 'c316b337657b351ca301f20606874f0a',
        created_at: '2022-06-15T15:37:20.950Z',
        asset: 'ETH',
        name: 'Ethereum',
        customer_guid: 'e8dc9202e0e96a33b5b6a7b0cfb66c60',
        platform_balance: '4.9977367924308e21',
        platform_available: '0',
        state: 'created'
      },
      {
        type: 'trading',
        guid: '61dbf15e631571018ff808fa51746b46',
        created_at: '2022-06-15T15:36:44.627Z',
        asset: 'BTC',
        name: 'Bitcoin',
        customer_guid: 'e8dc9202e0e96a33b5b6a7b0cfb66c60',
        platform_balance: '23218708499',
        platform_available: '0',
        state: 'created'
      },
      {
        type: 'fee',
        guid: '22e8616e11f21923811871038066d13d',
        created_at: '2022-05-16T01:53:11.842Z',
        asset: 'USD',
        name: 'Fee platform account for bank b36cf9028e2356de7732e4c505c84fbc (generated)',
        bank_guid: 'b36cf9028e2356de7732e4c505c84fbc',
        platform_balance: '0',
        platform_available: '0',
        state: 'created'
      },
      {
        type: 'fiat',
        guid: 'c907b45a8eae49f135dc0d2eee734dce',
        created_at: '2022-04-30T03:40:54.677Z',
        asset: 'USD',
        name: 'Sandbox backstopped platform account for bank b36cf9028e2356de7732e4c505c84fbc (generated)',
        bank_guid: 'b36cf9028e2356de7732e4c505c84fbc',
        platform_balance: '1920329026',
        platform_available: '0',
        state: 'created'
      }
    ]
  };

  static ACCOUNT_BANK_MODEL_BTC: AccountBankModel = {
    type: 'trading',
    guid: '61dbf15e631571018ff808fa51746b46',
    created_at: '2022-06-15T15:36:44.627Z',
    asset: 'BTC',
    name: 'Bitcoin',
    customer_guid: 'e8dc9202e0e96a33b5b6a7b0cfb66c60',
    platform_balance: '23218708499',
    platform_available: '0',
    state: 'created'
  };

  static ACCOUNT_BANK_MODEL_ETH: AccountBankModel = {
    type: 'trading',
    guid: '85f532eff8604acc6aae30da86894eef',
    created_at: '2022-06-15T15:37:20.950Z',
    asset: 'ETH',
    name: 'Ethereum',
    customer_guid: 'e8dc9202e0e96a33b5b6a7b0cfb66c60',
    platform_balance: '4.9977367924308e21',
    platform_available: '0',
    state: 'created'
  };

  static ACCOUNT_BANK_MODEL_WITH_DETAILS: AccountBankModelWithDetails = {
    type: 'trading',
    guid: 'e65a460dc4d7ef94b38c1234399184f7',
    created_at: '2023-10-17T17:33:49.318Z',
    asset: 'BTC',
    name: 'BTC account for 8c29c7ef95cb3cd565618fd081f161a1',
    customer_guid: '8c29c7ef95cb3cd565618fd081f161a1',
    platform_balance: '499000',
    platform_available: '0',
    state: 'created',
    labels: null,
    price: {
      symbol: 'BTC-USD',
      buy_price: '2844140',
      sell_price: '2844052',
      buy_price_last_updated_at: '2023-10-17T18:31:22.095Z',
      sell_price_last_updated_at: '2023-10-17T18:31:22.095Z'
    },
    value: 14191.819479999998
  };

  // Account-details component test models

  static TRADE_LIST_BANK_MODEL: TradeListBankModel = {
    total: '2',
    page: '0',
    per_page: '10',
    objects: [
      {
        guid: '0989a082dbb82dc7e7b4a0e137be2cd4',
        customer_guid: 'e8dc9202e0e96a33b5b6a7b0cfb66c60',
        quote_guid: '5350be1890a2cbf3e2f18642a4740aa9',
        symbol: 'BTC-USD',
        side: 'buy',
        state: 'settling',
        receive_amount: '4298',
        deliver_amount: '100',
        fee: '0',
        created_at: '2023-02-24T20:57:21.846Z'
      },
      {
        guid: '4e958621e5a8a82393c8b3974c60e0ea',
        customer_guid: 'e8dc9202e0e96a33b5b6a7b0cfb66c60',
        quote_guid: '87f73795d5f281cd67d7d3bf0b378843',
        symbol: 'BTC-USD',
        side: 'buy',
        state: 'settling',
        receive_amount: '4297',
        deliver_amount: '100',
        fee: '0',
        created_at: '2023-02-24T20:57:13.734Z'
      }
    ]
  };

  // Identity-verification component test models

  static CUSTOMER_BANK_MODEL: CustomerBankModel = {
    guid: 'e8dc9202e0e96a33b5b6a7b0cfb66c60',
    bank_guid: 'b36cf9028e2356de7732e4c505c84fbc',
    type: 'individual',
    created_at: '2022-06-14T13:14:53.314Z',
    state: 'storing'
  };

  static IDENTITY_VERIFICATION_BANK_MODEL: IdentityVerificationWithDetailsBankModel =
    {
      type: 'kyc',
      guid: '59b0b22359e821028bdbcd925c753336',
      customer_guid: 'e8dc9202e0e96a33b5b6a7b0cfb66c60',
      created_at: '2022-10-26T16:33:40.023Z',
      method: 'id_and_selfie',
      state: 'waiting',
      outcome: null,
      failure_codes: [],
      persona_inquiry_id: 'inq_C5qXinDn8igsrUgrQwMyTzah',
      persona_state: 'waiting'
    };

  static IDENTITY_VERIFICATION_LIST_BANK_MODEL: IdentityVerificationListBankModel =
    {
      total: '1',
      page: '0',
      per_page: '1',
      objects: [TestConstants.IDENTITY_VERIFICATION_BANK_MODEL]
    };

  // Bank-account-management test models

  static EXTERNAL_BANK_ACCOUNT_BANK_MODEL: ExternalBankAccountBankModel = {
    guid: '2e118eeed5cfd69f3d9b45d8efc769ff',
    name: 'USD',
    asset: 'USD',
    account_kind: 'plaid',
    environment: 'sandbox',
    created_at: '2022-12-02T16:54:24.562Z',
    customer_guid: 'e8dc9202e0e96a33b5b6a7b0cfb66c60',
    bank_guid: 'b36cf9028e2356de7732e4c505c84fbc',
    state: 'completed',
    failure_code: null,
    plaid_institution_id: 'ins_56',
    plaid_account_mask: '1111',
    plaid_account_name: 'Plaid Saving'
  };

  static EXTERNAL_BANK_ACCOUNT_LIST_BANK_MODEL: ExternalBankAccountListBankModel =
    {
      total: '6',
      page: '0',
      per_page: '10',
      objects: [
        {
          guid: '2e118eeed5cfd69f3d9b45d8efc769ff',
          name: 'USD',
          asset: 'USD',
          account_kind: 'plaid',
          environment: 'sandbox',
          created_at: '2022-12-02T16:54:24.562Z',
          customer_guid: 'e8dc9202e0e96a33b5b6a7b0cfb66c60',
          bank_guid: 'b36cf9028e2356de7732e4c505c84fbc',
          state: 'completed',
          failure_code: null,
          plaid_institution_id: 'ins_56',
          plaid_account_mask: '1111',
          plaid_account_name: 'Plaid Saving'
        },
        {
          guid: '598bbcc4da21f4bd38daf64c1076217b',
          name: 'USD',
          asset: 'USD',
          account_kind: 'plaid',
          environment: 'sandbox',
          created_at: '2022-12-02T16:45:29.087Z',
          customer_guid: 'e8dc9202e0e96a33b5b6a7b0cfb66c60',
          bank_guid: 'b36cf9028e2356de7732e4c505c84fbc',
          state: 'storing',
          failure_code: null,
          plaid_institution_id: null,
          plaid_account_mask: null,
          plaid_account_name: null
        },
        {
          guid: '598bbcc4da21f23nd8daf64c1076217b',
          name: 'USD',
          asset: 'USD',
          account_kind: 'plaid',
          environment: 'sandbox',
          created_at: '2022-12-02T16:45:29.087Z',
          customer_guid: 'e8dc9202e0e96a33b5b6a7b0cfb66c60',
          bank_guid: 'b36cf9028e2356de7732e4c505c84fbc',
          state: 'failed',
          failure_code: null,
          plaid_institution_id: null,
          plaid_account_mask: null,
          plaid_account_name: null
        },
        {
          guid: 'b2ff9d80c763d206757cd011ab42345d',
          name: 'USD',
          asset: 'USD',
          account_kind: 'plaid',
          environment: 'sandbox',
          created_at: '2023-01-11T18:09:15.550Z',
          customer_guid: 'e8dc9202e0e96a33b5b6a7b0cfb66c60',
          bank_guid: 'b36cf9028e2356de7732e4c505c84fbc',
          state: 'refresh_required',
          failure_code: null,
          plaid_institution_id: 'ins_115614',
          plaid_account_mask: '1111',
          plaid_account_name: 'Plaid Saving'
        },
        {
          guid: '598bbc22kd21f23nd8daf64c1076217b',
          name: 'USD',
          asset: 'USD',
          account_kind: 'plaid',
          environment: 'sandbox',
          created_at: '2022-12-02T16:45:29.087Z',
          customer_guid: 'e8dc9202e0e96a33b5b6a7b0cfb66c60',
          bank_guid: 'b36cf9028e2356de7732e4c505c84fbc',
          state: 'deleting',
          failure_code: null,
          plaid_institution_id: null,
          plaid_account_mask: null,
          plaid_account_name: null
        },
        {
          guid: '883bbc22kd21f23nd8daf64c1076217b',
          name: 'USD',
          asset: 'USD',
          account_kind: 'plaid',
          environment: 'sandbox',
          created_at: '2022-12-02T16:45:29.087Z',
          customer_guid: 'e8dc9202e0e96a33b5b6a7b0cfb66c60',
          bank_guid: 'b36cf9028e2356de7732e4c505c84fbc',
          state: 'deleted',
          failure_code: null,
          plaid_institution_id: null,
          plaid_account_mask: null,
          plaid_account_name: null
        }
      ]
    };

  // Workflow models

  static POST_WORKFLOW_BANK_MODEL: PostWorkflowBankModel = {
    type: 'plaid',
    kind: undefined,
    customer_guid: '72892100b5fdd31a1bf7a3c341e64cb8',
    language: 'en',
    link_customization_name: 'default'
  };

  static WORKFLOW_BANK_MODEL: WorkflowBankModel = {
    guid: '7ede907d414a06f126befcb87ef839bc',
    customer_guid: '72892100b5fdd31a1bf7a3c341e64cb8',
    type: 'plaid',
    created_at: '2022-11-10T21:05:13.932Z'
  };

  static WORKFLOW_BANK_MODEL_WITH_DETAILS: WorkflowWithDetailsBankModel = {
    guid: '7ede907d414a06f126befcb87ef839bc',
    customer_guid: '72892100b5fdd31a1bf7a3c341e64cb8',
    type: 'plaid',
    created_at: '2022-11-10T21:05:13.932Z',
    plaid_link_token: 'link-sandbox-b46225aa-ec75-4de9-b8a7-7ed4c8630401'
  };

  // Transfer models
  static QUOTE_BANK_MODEL_TRANSFER: QuoteBankModel = {
    guid: 'c7f8778ed298afb81cf3bca3c9bb8556',
    product_type: 'funding',
    customer_guid: 'e8dc9202e0e96a33b5b6a7b0cfb66c60',
    side: 'deposit',
    receive_amount: '500',
    deliver_amount: '500',
    fee: '0',
    issued_at: '2022-11-30T21:07:51.448Z'
  };

  static TRANSFER_BANK_MODEL: TransferBankModel = {
    guid: '1d2095b323e17fba5d2a6b75eb82e128',
    transfer_type: 'funding',
    customer_guid: 'e8dc9202e0e96a33b5b6a7b0cfb66c60',
    quote_guid: 'c4e98a5c77bf70138880744e04acc12b',
    asset: 'USD',
    side: 'deposit',
    state: 'pending',
    amount: '500',
    fee: '0',
    created_at: '2022-11-30T17:32:34.123Z'
  };

  static ACCOUNT_BANK_MODEL_USD: AccountBankModel = {
    type: 'fiat',
    guid: '46d8965271d7da9c981c86ecb5667092',
    created_at: '2022-11-24T18:32:53.196Z',
    asset: 'USD',
    name: 'USD',
    customer_guid: 'e8dc9202e0e96a33b5b6a7b0cfb66c60',
    platform_balance: '100',
    platform_available: '100',
    state: 'created'
  };

  static TRANSFER_LIST_BANK_MODEL: TransferListBankModel = {
    total: '2',
    page: '0',
    per_page: '10',
    objects: [
      {
        guid: '31d2ba27e4d1a443583fa05ba3bbd8e6',
        transfer_type: 'funding',
        customer_guid: '16d6aa37d74951c65c4510460cfac71c',
        quote_guid: '26bf698b4c962d35729431982eb4cc3a',
        external_bank_account_guid: '6be6313ef0dd1f345f88242347a15922',
        asset: 'USD',
        side: 'deposit',
        state: 'completed',
        failure_code: null,
        amount: '5000',
        estimated_amount: '5000',
        fee: '0',
        source_account: {
          type: 'external_bank_account',
          guid: '6be6313ef0dd1f345f88242347a15922'
        },
        destination_account: {
          type: 'fiat',
          guid: '5f9e3b002ba59ffa12052992729bcf5d'
        },
        created_at: '2023-06-02T16:07:11.886Z',
        updated_at: '2023-07-05T14:04:23.291Z',
        labels: null
      }
    ]
  };

  static FIAT_TRANSFER_BANK_MODEL: TransferBankModel = {
    guid: '31d2ba27e4d1a443583fa05ba3bbd8e6',
    transfer_type: 'funding',
    customer_guid: '16d6aa37d74951c65c4510460cfac71c',
    quote_guid: '26bf698b4c962d35729431982eb4cc3a',
    external_bank_account_guid: '6be6313ef0dd1f345f88242347a15922',
    asset: 'USD',
    side: 'deposit',
    state: 'completed',
    failure_code: null,
    amount: '5000',
    estimated_amount: '5000',
    fee: '0',
    source_account: {
      type: 'external_bank_account',
      guid: '6be6313ef0dd1f345f88242347a15922'
    },
    destination_account: {
      type: 'fiat',
      guid: '5f9e3b002ba59ffa12052992729bcf5d'
    },
    created_at: '2023-06-02T16:07:11.886Z',
    updated_at: '2023-07-05T14:04:23.291Z',
    labels: null
  };
}
