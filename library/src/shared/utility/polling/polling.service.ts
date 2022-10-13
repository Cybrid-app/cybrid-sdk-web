/**
 * Creates a polling timer and provides methods to manage it.
 */

export class Poll {
  constructor() {}

  // startPolling(): Observable<any> {
  //   this.isPolling$.next(true);
  //   this.pollingSubscription = this.pollingDuration$.subscribe({
  //     complete: () => {
  //       this.isPolling$.next(false);
  //       this.pollingSession$.next('');
  //     }
  //   });
  //
  //   return timer(0, 1000);
  // }
  //
  // stopPolling() {
  //   this.isPolling$.next(false);
  //   this.pollingSubscription.unsubscribe();
  //   this.pollingSession$.next('');
  // }
}
