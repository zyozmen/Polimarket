export enum TransactionType {
  AUTHORIZATION_AND_CAPTURE = 'AUTHORIZATION_AND_CAPTURE',
  AUTHORIZATION = 'AUTHORIZATION',
  CAPTURE = 'CAPTURE',
  REFUND = 'REFUND'
}

export interface TransactionTypeOption {
  value: TransactionType;
  label: string;
  description: string;
}

export interface PayerInfo {
  fullName: string;
  email: string;
  document: string;
  phone: string;
  address?: string;
}

export interface PaymentRequest {
  reference: string;
  description: string;
  amount: number;
  currency: 'COP' | 'USD';
  transactionType: TransactionType;
  payer: PayerInfo;
  returnUrl: string;
  confirmationUrl: string;
}

export interface CheckoutSessionResponse {
  success: boolean;
  reference: string;
  status: 'CREATED' | 'PENDING' | 'FAILED';
  redirectUrl?: string;
  message?: string;
  expiresAt?: string;
  raw?: unknown;
}

export interface PaymentStatusResponse {
  reference: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';
  transactionId?: string;
  authorizationCode?: string;
  message?: string;
}

export interface PayuBackendContract {
  checkoutEndpoint: string;
  statusEndpoint: string;
  payloadExample: PaymentRequest;
  responseExample: CheckoutSessionResponse;
}
