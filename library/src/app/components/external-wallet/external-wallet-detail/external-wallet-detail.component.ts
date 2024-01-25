import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';

import {
  BehaviorSubject,
  catchError,
  combineLatest,
  map,
  Observable,
  of,
  startWith,
  Subject,
  Subscription,
  switchMap,
  take,
  takeUntil,
  tap,
  timer,
  withLatestFrom
} from 'rxjs';

// Client
import {
  AssetBankModel,
  ExternalWalletBankModel,
  TransferBankModel,
  TransferListBankModel,
  TransfersService
} from '@cybrid/cybrid-api-bank-angular';

// Services
import {
  ExternalWalletService,
  TransferService,
  AssetService,
  CODE,
  ComponentConfig,
  ConfigService,
  ErrorService,
  EventService,
  LEVEL,
  RoutingData,
  RoutingService
} from '@services';

// Components
import { TransferSummaryComponent } from '@components';

// Utility
import { AssetFormatPipe } from '@pipes';

@Component({
  selector: 'app-external-wallet-detail',
  templateUrl: './external-wallet-detail.component.html',
  styleUrls: ['./external-wallet-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExternalWalletDetailComponent implements OnInit, OnDestroy {
  walletGuid: string | null = null;
  asset: AssetBankModel | null = null;
  currentWallet$ = new BehaviorSubject<ExternalWalletBankModel | null>(null);

  isLoadingWallet$ = this.currentWallet$.pipe(
    switchMap((wallet) => (wallet ? of(false) : of(true)))
  );

  isLoadingResults$ = new BehaviorSubject(true);
  isRecoverable$ = new BehaviorSubject(true);
  refreshDataSub!: Subscription;
  unsubscribe$ = new Subject();

  routingData: RoutingData = {
    route: 'external-wallet-list',
    origin: 'external-wallet-detail'
  };

  constructor(
    public configService: ConfigService,
    private eventService: EventService,
    private externalWalletService: ExternalWalletService,
    private transferService: TransferService,
    private assetService: AssetService,
    private route: ActivatedRoute,
    private routingService: RoutingService,
    private assetFormatPipe: AssetFormatPipe
  ) {
    this.route.queryParams
      .pipe(
        take(1),
        tap((params) => {
          this.walletGuid = params['walletGuid'];
        })
      )
      .subscribe();
  }

  ngOnInit() {
    this.eventService.handleEvent(
      LEVEL.INFO,
      CODE.COMPONENT_INIT,
      'Initializing external-wallet-detail component'
    );
    this.getWallet();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  getWallet(): void {
    this.externalWalletService
      .getExternalWallet(<string>this.walletGuid)
      .pipe(
        tap((wallet) => {
          this.currentWallet$.next(wallet);
          this.asset = this.assetService.getAsset(<string>wallet.asset);
        }),
        catchError((err) => {
          this.refreshDataSub?.unsubscribe();
          this.isRecoverable$.next(false);
          return of(err);
        })
      )
      .subscribe();
  }

  onDeleteWallet(): void {
    this.externalWalletService
      .deleteExternalWallet(<string>this.walletGuid)
      .pipe(
        tap((wallet) => {
          this.onWallets();
        }),
        catchError((err) => {
          this.refreshDataSub?.unsubscribe();
          this.isRecoverable$.next(false);
          return of(err);
        })
      )
      .subscribe();
  }

  onWallets(): void {
    this.configService
      .getConfig$()
      .pipe(
        take(1),
        map((config: ComponentConfig) => {
          if (config.routing) {
            const extras: NavigationExtras = {
              queryParams: {}
            };
            this.routingService.handleRoute({
              route: 'external-wallet-list',
              origin: 'external-wallet-detail',
              extras
            });
          }
        })
      )
      .subscribe();
  }
}
