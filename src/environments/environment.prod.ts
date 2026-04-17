export const environment = {
  production: true,
  apiUrl: 'https://ventas-al0w.onrender.com',
  apiTimeout: 30000,
  enableDebug: false,
  payu: {
    enabled: true,
    sandbox: false,
    currency: 'COP' as 'COP' | 'USD',
    backendPath: '/payments/payu',
    merchantId: 'TU_MERCHANT_ID_PROD',
    accountId: 'TU_ACCOUNT_ID_PROD',
    publicKey: 'TU_PUBLIC_KEY_PROD',
    apiKey: 'TU_API_KEY_PROD',
    responseUrl: 'https://tu-frontend.com/pagos/resultado',
    confirmationUrl: 'https://tu-backend.com/webhooks/payu/confirmacion'
  }
};
