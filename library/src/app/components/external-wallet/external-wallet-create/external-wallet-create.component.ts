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
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
    AccountBankModel,
    ExternalWalletBankModel,
    PostExternalWalletBankModel
} from '@cybrid/cybrid-api-bank-angular';

// Services
import {
    ExternalWalletService,
    AccountService,
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

// Utility
import { AssetFormatPipe } from '@pipes';
import { Account } from '@models';

export interface NewWalletFormGroup {
    account: FormControl<AccountBankModel | null>;
    name: FormControl<string | null>;
    address: FormControl<string | null>;
    tag: FormControl<string | null>;
  }

@Component({
    selector: 'external-wallet-create',
    templateUrl: './external-wallet-create.component.html',
    styleUrls: ['./external-wallet-create.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExternalWalletCreateComponent
  implements OnInit, AfterContentInit, OnDestroy
{   
    accounts$ = new BehaviorSubject<AccountBankModel[] | null>(null);
    newWallet$ = new BehaviorSubject<ExternalWalletBankModel | null>(null);
    newWalletFormGroup!: FormGroup<NewWalletFormGroup>;

    accountAssets: AccountBankModel[] = [];

    isLoadingAccounts$ = this.accounts$.pipe(
        switchMap((accounts) => (accounts ? of(false) : of(true)))
    );

    isLoadingResults$ = new BehaviorSubject(true);
    isRecoverable$ = new BehaviorSubject(true);
    refreshDataSub!: Subscription;
    unsubscribe$ = new Subject();

    routingData: RoutingData = {
        route: 'external-wallet-list',
        origin: 'external-wallet-create'
    };

    constructor(
        public configService: ConfigService,
        private eventService: EventService,
        private externalWalletService: ExternalWalletService,
        private assetService: AssetService,
        private accountService: AccountService,
        private route: ActivatedRoute,
        private routingService: RoutingService,
        private assetFormatPipe: AssetFormatPipe
    ) {}

    ngOnInit() {
        this.eventService.handleEvent(
          LEVEL.INFO,
          CODE.COMPONENT_INIT,
          'Initializing external-wallet-create component'
        );
        this.listAccounts();
    }

    ngAfterContentInit() {}

    ngOnDestroy(): void {
        this.unsubscribe$.next('');
        this.unsubscribe$.complete();
    }

    listAccounts(): void {
        this.accountService
            .listAccounts()
            .pipe(
                tap((accounts) => {
                    let tradingAccounts = accounts.objects.filter((account) => account.type == 'trading');
                  this.accounts$.next(tradingAccounts);
                  this.initForm();
                }),
                catchError((err) => {
                  this.refreshDataSub?.unsubscribe();
                  this.isRecoverable$.next(false);
                  return of(err);
                })
              )
              .subscribe();
    }

    initForm(): void {
        this.newWalletFormGroup = new FormGroup<NewWalletFormGroup>({
            account: new FormControl(this.accounts$.value![0]),
          name: new FormControl(null),
          address: new FormControl(null),
          tag: new FormControl(null)
        });
        this.newWalletFormGroup.valueChanges.subscribe();
    }

    onCreateWallet(): void {

        const asset = this.newWalletFormGroup.controls.account.value?.asset;
        const name = <string> this.newWalletFormGroup.controls.name.value?.toString();
        const address = <string> this.newWalletFormGroup.controls.address.value?.toString();
        const tag = <string> this.newWalletFormGroup.controls.tag.value?.toString();
        if (!this.validateForm(name, address)) { return; }

        const postExternalWalletBankModel = this.createPostExternalWalletBankModel(
            asset!,
            name,
            address,
            tag
        )
        this.externalWalletService
            .createExternalWallet(postExternalWalletBankModel)
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

    validateForm(name: string|undefined, address: string|undefined): boolean {
        var ret = true;
        if (name == undefined || name == "") {
            this.newWalletFormGroup.controls.name.setErrors({ empty: true });
            ret = false;
        }
        if (address == undefined || address == "") {
            this.newWalletFormGroup.controls.address.setErrors({ empty: true });
            ret = false;
        }
        return ret;
    }

    createPostExternalWalletBankModel(asset: string, name: string, address: string, tag: string|undefined): PostExternalWalletBankModel {

        const postExternalWalletBankModel: PostExternalWalletBankModel = {
            name: <string> name,
            asset: <string> asset,
            address: <string> address,
            tag: (tag == undefined || tag == "") ? null : tag
        }
        return postExternalWalletBankModel;
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
              }
              this.routingService.handleRoute({
                  route: 'external-wallet-list',
                  origin: 'external-wallet-create',
                  extras
              });
            }
          })
        )
        .subscribe();
    }
}