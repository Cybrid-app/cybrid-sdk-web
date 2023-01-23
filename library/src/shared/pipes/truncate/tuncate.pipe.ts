import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {
  constructor() {}

  transform(value: string | undefined, char?: number) {
    if (char === undefined) {
      return value;
    }

    if (value && value.length > char) {
      return value.substring(0, char) + '...';
    } else {
      return value;
    }
  }
}
