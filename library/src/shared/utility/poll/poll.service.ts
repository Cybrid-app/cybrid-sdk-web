import {
  BehaviorSubject,
  Observable,
  Subject,
  Subscription,
  timer
} from 'rxjs';

import { Constants } from '@constants';

/**
 * Creates a new polling class that handles tracking duration, and provides a timeout observable.
 *
 * @param {BehaviorSubject} timeout - Observable that fires when the polling duration completes.
 * @param {number} [interval] - The polling interval in milliseconds.
 * @param {number} [duration] - The duration of the polling session in milliseconds.
 *
 * @example Call another observable with each interval.
 * ```ts
 * poll = new Poll();
 * poll.start().pipe(switchMap(() => anotherObservable$))
 * ```
 */

export class Poll {
  timeout: BehaviorSubject<boolean>;
  interval: number;
  duration: number;
  session$ = new Subject<any>();
  sub = new Subscription();

  constructor(
    timeout: BehaviorSubject<boolean>,
    interval: number = Constants.POLL_INTERVAL,
    duration: number = Constants.POLL_DURATION
  ) {
    this.timeout = timeout;
    this.interval = interval;
    this.duration = duration;
  }

  /**
   * Starts a polling session. Tracks an internal timer which handles completing the
   * polling session and calling the timeout.
   *
   * @return {Observable<number>} timer - Observable to be piped from.
   * */
  start(): Observable<number> {
    this.sub = timer(this.duration).subscribe({
      complete: () => {
        this.session$.next('');
        this.timeout.next(true);
      }
    });
    return timer(0, this.interval);
  }

  /**
   * Stops any open polling session, unsubscribes from the internal timer
   * */
  stop(): void {
    this.sub.unsubscribe();
    this.session$.next('');
  }
}
