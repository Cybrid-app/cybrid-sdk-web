import { Injectable } from '@angular/core';
import { MatLegacyPaginatorIntl as MatPaginatorIntl } from '@angular/material/legacy-paginator';

import { Subject } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';

@Injectable()
export class CustomPaginatorIntl implements MatPaginatorIntl {
  changes = new Subject<void>();

  constructor(private translate: TranslatePipe) {}

  firstPageLabel = this.translate.transform('paginator.firstPageLabel');
  itemsPerPageLabel = this.translate.transform('paginator.itemsPerPageLabel');
  lastPageLabel = this.translate.transform('paginator.lastPageLabel');
  nextPageLabel = this.translate.transform('paginator.nextPageLabel');
  previousPageLabel = this.translate.transform('paginator.previousPageLabel');

  getRangeLabel(page: number, pageSize: number, length: number): string {
    const pageLabel = this.translate.transform('paginator.page');
    const ofLabel = this.translate.transform('paginator.of');

    if (length === 0) {
      return pageLabel + '' + 1 + '' + ofLabel + '' + 1;
    }
    const amountPages = Math.ceil(length / pageSize);
    return `${pageLabel + ''} ${page + 1} ${ofLabel + ''} ${amountPages}`;
  }
}
