import { JwtPayload } from 'jwt-decode';

export interface CybridJWTPayload extends JwtPayload {
  sub_type: SubType;
}

export enum SubType {
  Bank = 'bank',
  Customer = 'customer'
}
