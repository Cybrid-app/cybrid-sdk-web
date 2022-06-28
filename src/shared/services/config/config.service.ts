import { Injectable, OnDestroy } from '@angular/core';
import { Constants } from '../../constants/constants';
import { BehaviorSubject, map, Observable, Subject, takeUntil } from 'rxjs';
import { CODE, EventService, LEVEL } from '../event/event.service';
import { ErrorService } from '../error/error.service';
import { TranslateService } from '@ngx-translate/core';
import en from '../../i18n/en';
import fr from '../../i18n/fr';
import { OverlayContainer } from '@angular/cdk/overlay';

export interface ComponentConfig {
  refreshInterval: number;
  locale: string;
  theme: string;
  customer: string; // Temporary solution until the JWT embeds a customer GUID
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService implements OnDestroy {
  defaultConfig: ComponentConfig = {
    refreshInterval: Constants.REFRESH_INTERVAL,
    locale: Constants.LOCALE,
    theme: Constants.THEME,
    customer: ''
  };
  config$: BehaviorSubject<ComponentConfig> =
    new BehaviorSubject<ComponentConfig>(this.defaultConfig);
  private unsubscribe$ = new Subject();

  constructor(
    private eventService: EventService,
    private errorService: ErrorService,
    private translateService: TranslateService,
    private overlay: OverlayContainer
  ) {
    this.initLocale();
    this.initStyle();
  }

  ngOnDestroy() {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  setConfig(hostConfig: ComponentConfig) {
    if (this.validateConfig(hostConfig)) {
      this.eventService.handleEvent(
        LEVEL.INFO,
        CODE.CONFIG_SET,
        'Component configuration has been set'
      );
      this.config$.next(hostConfig);
    } else {
      this.config$.next(this.defaultConfig);
      const err = new Error('Invalid host configuration: reset to default');
      this.eventService.handleEvent(
        LEVEL.ERROR,
        CODE.CONFIG_ERROR,
        'Invalid host configuration: reset to default'
      );
      this.errorService.handleError(err);
    }
  }

  getConfig$(): Observable<ComponentConfig> {
    return this.config$.asObservable();
  }

  validateConfig(hostConfig: object): hostConfig is ComponentConfig {
    const refreshInterval = (hostConfig as ComponentConfig).refreshInterval;
    const locale = (hostConfig as ComponentConfig).locale;
    const theme = (hostConfig as ComponentConfig).theme;
    return (
      refreshInterval !== undefined &&
      refreshInterval !== null &&
      locale !== undefined &&
      locale !== null &&
      Constants.SUPPORTED_LOCALES.includes(locale) &&
      theme !== undefined &&
      theme !== null
    );
  }

  initLocale(): void {
    this.translateService.setTranslation('en-US', en);
    this.translateService.setTranslation('fr-CA', fr);
    this.translateService.setDefaultLang(Constants.LOCALE);
    this.config$
      .pipe(
        takeUntil(this.unsubscribe$),
        map((cfg) => {
          this.translateService.use(cfg.locale);
        })
      )
      .subscribe();
  }

  initStyle(): void {
    document.documentElement.style.setProperty('--cybrid-t-font', 'Roboto');

    /*
    Toggles dark mode theme for Angular Material components that use overlays
    outside the scope of other component styles
    * */
    this.config$
      .pipe(
        takeUntil(this.unsubscribe$),
        map((config) => {
          if (config.theme === 'DARK') {
            this.overlay
              .getContainerElement()
              .classList.add('cybrid-dark-theme');
          } else {
            this.overlay
              .getContainerElement()
              .classList.remove('cybrid-dark-theme');
          }
        })
      )
      .subscribe();
  }
}
