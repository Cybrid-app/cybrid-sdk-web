import { discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';

import { BehaviorSubject } from 'rxjs';
import { Poll, PollConfig } from './poll';
import { Constants } from '@constants';

describe('Poll', () => {
  let timeout$ = new BehaviorSubject(false);
  let pollConfig: PollConfig = {
    timeout: timeout$,
    interval: Constants.POLL_INTERVAL,
    duration: Constants.POLL_DURATION
  };
  let poll = new Poll(pollConfig);

  it('should start() and return an observable timer based on the set interval', fakeAsync(() => {
    let count: number = 0;

    poll.start().subscribe((n) => {
      count = n;
    });
    tick(poll.pollConfig.duration);

    // The count should equal the number of times the timer fires in the set duration
    expect(count).toEqual(5);

    discardPeriodicTasks();
  }));

  it('should unsubscribe and call the supplied timeout observable after the duration', fakeAsync(() => {
    const sessionSpy = spyOn(poll.session$, 'next');
    const timeoutSpy = spyOn(poll.pollConfig.timeout, 'next');

    poll.start();
    tick(poll.pollConfig.duration);

    expect(sessionSpy).toHaveBeenCalledOnceWith('');
    expect(timeoutSpy).toHaveBeenCalledOnceWith(true);

    discardPeriodicTasks();
  }));

  it('should stop() the timer', fakeAsync(() => {
    const sessionSpy = spyOn(poll.session$, 'next');

    poll.start();

    // Set the spy after the subscription has been set
    const subSpy = spyOn(poll.sub, 'unsubscribe');

    poll.stop();
    tick();

    expect(subSpy).toHaveBeenCalled();
    expect(sessionSpy).toHaveBeenCalledOnceWith('');

    discardPeriodicTasks();
  }));
});
