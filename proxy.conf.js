const PROXY_CONFIG = {
  "/ventas-api": {
    "target": "https://ventas-al0w.onrender.com",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug",
    "pathRewrite": {
      "^/ventas-api": ""
    },
    "onProxyReq": function(proxyReq, req, res) {
      console.log("[PROXY] Interceptando:", req.method, req.url);
    },
    "onProxyRes": function(proxyRes, req, res) {
      console.log("[PROXY] Respuesta:", proxyRes.statusCode, req.url);
    },
    "onError": function(err, req, res) {
      console.error("[PROXY ERROR]:", err.message);
    }
  },
  "/rrhh-api": {
    "target": "https://akira.sedbaq.com.co",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug",
    "pathRewrite": {
      "^/rrhh-api": "/rrhh"
    }
  }
};

module.exports = PROXY_CONFIG;
