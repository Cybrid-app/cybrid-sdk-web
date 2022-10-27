import {
  BehaviorSubject,
  Observable,
  Subject,
  Subscription,
  timer
} from 'rxjs';

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

export interface PollConfig {
  timeout: BehaviorSubject<boolean>;
  interval: number;
  duration: number;
}

export class Poll {
  pollConfig: PollConfig;
  session$ = new Subject<any>();
  sub = new Subscription();

  constructor(pollConfig: PollConfig) {
    this.pollConfig = pollConfig;
  }

  /**
   * Starts a polling session. Tracks an internal timer which handles completing the
   * polling session and calling the timeout.
   *
   * @return {Observable<number>} timer - Observable to be piped from.
   * */
  start(): Observable<number> {
    this.sub = timer(this.pollConfig.duration).subscribe({
      complete: () => {
        this.session$.next('');
        this.pollConfig.timeout.next(true);
      }
    });
    return timer(0, this.pollConfig.interval);
  }

  /**
   * Stops any open polling session, unsubscribes from the internal timer
   * */
  stop(): void {
    this.sub.unsubscribe();
    this.session$.next('');
  }
}
