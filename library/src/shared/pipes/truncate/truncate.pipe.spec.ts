import { TruncatePipe } from '@pipes';

describe('AssetPipe', () => {
  it('create an instance', () => {
    const pipe = new TruncatePipe();
    expect(pipe).toBeTruthy();
  });

  it('should return the value if no character number is set', () => {
    const pipe = new TruncatePipe();
    const test = pipe.transform('test');
    expect(test).toEqual('test');
  });

  it('should truncateString the value by the number of characters set if the value.length is greater', () => {
    const pipe = new TruncatePipe();
    const test = pipe.transform('test', 2);
    expect(test).toEqual('te...');
  });

  it('should return the value if the number of characters is less than the value.length', () => {
    const pipe = new TruncatePipe();
    const test = pipe.transform('test', 4);
    expect(test).toEqual('test');
  });
});
