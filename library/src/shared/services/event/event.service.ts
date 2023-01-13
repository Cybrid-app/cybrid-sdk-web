import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export enum LEVEL {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  FATAL = 'FATAL'
}

export enum CODE {
  APPLICATION_INIT = 'APPLICATION_INIT',
  APPLICATION_ERROR = 'APPLICATION_ERROR',
  ROUTING_START = 'ROUTING_START',
  ROUTING_END = 'ROUTING_END',
  ROUTING_REQUEST = 'ROUTING_REQUEST',
  ROUTING_DENIED = 'ROUTING_DENIED',
  COMPONENT_INIT = 'COMPONENT_INIT',
  COMPONENT_ERROR = 'COMPONENT_ERROR',
  SERVICE_INIT = 'SERVICE_INIT',
  SERVICE_ERROR = 'SERVICE_ERROR',
  DATA_FETCHING = 'DATA_FETCHING',
  DATA_REFRESHED = 'DATA_REFRESHED',
  DATA_INIT = 'DATA_INIT',
  DATA_ERROR = 'DATA_ERROR',
  INPUT_ERROR = 'INPUT_ERROR',
  CONFIG_ERROR = 'CONFIG_ERROR',
  CONFIG_SET = 'CONFIG_SET',
  AUTH_SET = 'AUTH_SET',
  AUTH_ERROR = 'AUTH_ERROR',
  AUTH_EXPIRED = 'AUTH_EXPIRED',
  AUTH_EXPIRING = 'AUTH_EXPIRING',
  ASSET_ERROR = 'ASSET_ERROR',
  PERSONA_SDK_ERROR = 'PERSONA_SDK_ERROR'
}

export interface EventLog {
  level: LEVEL;
  code: CODE;
  message: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  event: Subject<EventLog> = new Subject();
  constructor() {}

  getEvent(): Observable<EventLog> {
    return this.event.asObservable();
  }
  handleEvent(level: LEVEL, code: CODE, message: string, data?: any): void {
    const log: EventLog = { level, code, message, data };
    this.event.next(log);
  }
}
