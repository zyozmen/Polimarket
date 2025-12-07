const PROXY_CONFIG = {
  "/ventas-api": {
    "target": "https://ventas-al0w.onrender.com",
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": {
      "^/ventas-api": ""
    }
  },
  "/rrhh-api": {
    "target": "https://akira.sedbaq.com.co",
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": {
      "^/rrhh-api": "/rrhh"
    }
  },
  "/api/auth": {
    "target": "http://localhost:8081",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
};

module.exports = PROXY_CONFIG;
