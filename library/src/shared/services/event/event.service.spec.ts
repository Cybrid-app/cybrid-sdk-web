import {
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';

import { CODE, EventLog, EventService, LEVEL } from './event.service';

describe('EventService', () => {
  let service: EventService;
  const testEvent: EventLog = {
    level: LEVEL.ERROR,
    code: CODE.DATA_ERROR,
    message: 'test',
    data: {}
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should output events through the event Subject()', (done) => {
    service.event.subscribe((event) => {
      done();
      expect(event).toEqual(testEvent);
    });
    service.handleEvent(LEVEL.ERROR, CODE.DATA_ERROR, 'test', {});
  });

  it('should return events as an observable when getEvent() is called', fakeAsync(() => {
    let event: any = {};
    service.getEvent().subscribe((res) => {
      event = res;
    });
    service.handleEvent(LEVEL.ERROR, CODE.DATA_ERROR, 'test', {});
    tick(5000);
    discardPeriodicTasks();
    expect(event).toEqual(testEvent);
  }));
});
