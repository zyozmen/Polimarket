export const environment = {
  production: false,
  apiUrl: '/ventas-api',
  apiTimeout: 30000,
  enableDebug: true,
  payu: {
    enabled: true,
    sandbox: true,
    currency: 'COP' as 'COP' | 'USD',
    backendPath: '/payments/payu',
    merchantId: 'TU_MERCHANT_ID_SANDBOX',
    accountId: 'TU_ACCOUNT_ID_SANDBOX',
    publicKey: 'TU_PUBLIC_KEY_SANDBOX',
    apiKey: 'TU_API_KEY_SANDBOX',
    responseUrl: 'http://localhost:4200/pagos/resultado',
    confirmationUrl: 'https://tu-backend.com/webhooks/payu/confirmacion'
  }
};
