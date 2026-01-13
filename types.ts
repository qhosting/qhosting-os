export enum UserRole {
  CEO = 'ceo',
  ADMIN = 'admin',
  CLIENT = 'client'
}

export enum ServiceStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  PENDING = 'pending_provision'
}

export enum DomainStatus {
  PENDING = 'pending_purchase',
  ACTIVE = 'active',
  EXPIRED = 'expired'
}

export interface User {
  id: number;
  email: string;
  aurumId: string;
  role: UserRole;
}

export interface HostingService {
  id: number;
  domain: string;
  plan: string;
  user: string;
  status: ServiceStatus;
  ip: string;
  dueDate: string;
}

export interface DomainRecord {
  id: number;
  domain: string;
  registrar: string;
  status: DomainStatus;
  expiry: string;
}