import { Injectable, OnDestroy } from '@angular/core';

import { map, Subject, takeUntil } from 'rxjs';

// Client
import {
  AccountBankModel,
  AssetBankModel,
  PostQuoteBankModel
} from '@cybrid/cybrid-api-bank-angular';

// Services
import { ComponentConfig, ConfigService } from '@services';

// Utility
import { AssetFormatPipe } from '@pipes';
import { symbolBuild } from '@utility';

@Injectable({
  providedIn: 'root'
})
export class QuoteService implements OnDestroy {
  customer_guid: string = '';

  unsubscribe$ = new Subject();

  constructor(
    private configService: ConfigService,
    private assetFormatPipe: AssetFormatPipe
  ) {
    this.getCustomer();
  }

  ngOnDestroy() {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  getCustomer(): void {
    this.configService
      .getConfig$()
      .pipe(
        takeUntil(this.unsubscribe$),
        map((config: ComponentConfig) => {
          this.customer_guid = config.customer;
        })
      )
      .subscribe();
  }

  getQuote(
    amount: string | number,
    input: AccountBankModel.TypeEnum,
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
        if (input == 'trading') {
          postQuoteBankModel.receive_amount = this.assetFormatPipe.transform(
            amount,
            asset.code,
            'base'
          ) as string;
        } else {
          postQuoteBankModel.deliver_amount = this.assetFormatPipe.transform(
            amount,
            counterAsset.code,
            'base'
          ) as string;
        }
        break;
      }
      case 'sell': {
        if (input == 'fiat') {
          postQuoteBankModel.receive_amount = this.assetFormatPipe.transform(
            amount,
            counterAsset.code,
            'base'
          ) as string;
        } else {
          postQuoteBankModel.deliver_amount = this.assetFormatPipe.transform(
            amount,
            asset.code,
            'base'
          ) as string;
        }
      }
    }
    return postQuoteBankModel;
  }
}
