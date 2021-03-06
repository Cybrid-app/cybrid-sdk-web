import { Injectable } from '@angular/core';
import {
  AssetBankModel,
  PostQuoteBankModel,
  QuotesService
} from '@cybrid/cybrid-api-bank-angular';
import { AssetPipe } from '../../pipes/asset/asset.pipe';
import { symbolBuild } from '../../utility/symbol-build';
import { map, take } from 'rxjs';
import { ComponentConfig, ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class QuoteService {
  customer_guid: string = '';

  constructor(
    private configService: ConfigService,
    private quotesService: QuotesService,
    private assetPipe: AssetPipe
  ) {
    this.getCustomer();
  }

  getCustomer(): void {
    this.configService
      .getConfig$()
      .pipe(
        take(1),
        map((config: ComponentConfig) => {
          this.customer_guid = config.customer;
        })
      )
      .subscribe();
  }

  getQuote(
    amount: string | number,
    input: string,
    side: PostQuoteBankModel.SideEnum,
    asset: AssetBankModel,
    counterAsset: AssetBankModel
  ): PostQuoteBankModel {
    const symbol = symbolBuild(asset.code, counterAsset.code);
    let postQuoteBankModel: PostQuoteBankModel = {
      customer_guid: this.customer_guid,
      symbol: symbol,
      side: side
    };

    switch (side) {
      case 'buy': {
        if (input == 'asset') {
          postQuoteBankModel.receive_amount = this.assetPipe.transform(
            amount,
            asset,
            'base'
          ) as string;
        } else {
          postQuoteBankModel.deliver_amount = this.assetPipe.transform(
            amount,
            counterAsset,
            'base'
          ) as string;
        }
        break;
      }
      case 'sell': {
        if (input == 'counter_asset') {
          postQuoteBankModel.receive_amount = this.assetPipe.transform(
            amount,
            counterAsset,
            'base'
          ) as string;
        } else {
          postQuoteBankModel.deliver_amount = this.assetPipe.transform(
            amount,
            asset,
            'base'
          ) as string;
        }
      }
    }
    return postQuoteBankModel;
  }
}
