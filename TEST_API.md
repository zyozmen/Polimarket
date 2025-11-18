# 🧪 Test de Conectividad API

## Pasos para verificar que las APIs funcionan

### 1. Verificar que el servidor está corriendo CON PROXY

En la terminal donde ejecutaste `npm start`, deberías ver algo como:

```
✔ Browser application bundle generation complete.

Initial Chunk Files   | Names         |  Raw Size
main.js               | main          |   2.3 MB |
styles.css            | styles        |  50.5 kB |

** Angular Live Development Server is listening on localhost:4200, open your browser on http://localhost:4200/ **

** Proxy created: /ventas-api -> https://ventas-al0w.onrender.com **
** Proxy created: /rrhh-api -> https://akira.sedbaq.com.co **

✔ Compiled successfully.
```

⚠️ **IMPORTANTE**: Si NO ves las líneas que dicen "Proxy created", significa que el servidor NO se inició con el proxy. Detén el servidor (Ctrl+C) y ejecuta:

```bash
npm start
```

---

### 2. Probar manualmente las URLs del proxy

Abre estas URLs directamente en el navegador:

#### Productos (debería funcionar inmediatamente):
```
http://localhost:4200/ventas-api/products
```
**Respuesta esperada**: JSON con array de productos

#### Clientes:
```
http://localhost:4200/ventas-api/customers
```
**Respuesta esperada**: JSON con array de clientes

#### Ventas:
```
http://localhost:4200/ventas-api/sales
```
**Respuesta esperada**: JSON con array de ventas (puede tardar 30-60 segundos la primera vez)

---

### 3. Verificar en Chrome DevTools Network

1. Abre Chrome DevTools (F12)
2. Ve a la pestaña **Network**
3. **IMPORTANTE**: Filtra por **"XHR"** o **"Fetch"**
   - NO mires las peticiones tipo "document" o "navigation"
4. Recarga la aplicación
5. Navega al módulo de Ventas
6. Deberías ver peticiones a:
   - `/ventas-api/customers`
   - `/ventas-api/products`
   - `/ventas-api/sales`

---

### 4. ¿Qué significa cada tipo de petición en Network?

| Tipo | Significado | ¿Es una API? |
|------|-------------|--------------|
| **XHR** | Petición AJAX (API) | ✅ SÍ |
| **Fetch** | Petición moderna (API) | ✅ SÍ |
| **document** | Navegación de página | ❌ NO |
| **script** | Archivos JavaScript | ❌ NO |
| **stylesheet** | Archivos CSS | ❌ NO |
| **img** | Imágenes | ❌ NO |

**Tu screenshot mostraba una petición a `/ventas` que probablemente es tipo "document" (navegación)**. Eso es normal y no es un error.

**Lo que necesitas verificar son las peticiones tipo XHR/Fetch a `/ventas-api/...`**

---

### 5. Errores comunes y soluciones

#### Error: "Proxy created" NO aparece en la terminal

**Causa**: El servidor se inició con `ng serve` en lugar de `npm start`

**Solución**:
```bash
# Detener el servidor (Ctrl+C)
npm start
```

#### Error: Las URLs `/ventas-api/...` devuelven 404

**Causa**: El proxy no está funcionando

**Solución**:
```bash
# Detener servidor (Ctrl+C)
# Verificar que proxy.conf.json existe y está correcto
# Reiniciar con:
npm start
```

#### Error: Las URLs `/ventas-api/...` devuelven 502 o timeout

**Causa**: El backend de Render.com está "dormido"

**Solución**: Espera 60 segundos. Los servidores gratuitos de Render se duermen después de 15 minutos sin uso.

#### Error: CORS policy

**Causa**: Estás haciendo peticiones directas a `https://ventas-al0w.onrender.com` sin pasar por el proxy

**Solución**: Verifica que los servicios usen `${environment.apiUrl}` que apunta a `/ventas-api`

---

### 6. Comando de diagnóstico completo

Ejecuta esto en PowerShell (desde la raíz del proyecto):

```powershell
Write-Host "`n=== TEST CONECTIVIDAD ===" -ForegroundColor Cyan

# 1. Verificar que npm start está corriendo
Write-Host "`n1. Verificar proceso ng serve:" -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Select-Object Id, ProcessName

# 2. Verificar puerto 4200
Write-Host "`n2. Verificar puerto 4200:" -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 4200 -ErrorAction SilentlyContinue

# 3. Test backend (puede tardar 60 segundos)
Write-Host "`n3. Test Backend Ventas:" -ForegroundColor Yellow
Write-Host "   (Puede tardar hasta 60 segundos...)" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4200/ventas-api/products" -Method Get -TimeoutSec 60
    Write-Host "✅ Backend responde. Productos encontrados: $($response.Count)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== FIN TEST ===" -ForegroundColor Cyan
```

---

### 7. Test desde la consola del navegador

Abre la consola del navegador (F12 → Console) y ejecuta:

```javascript
// Test rápido de productos
fetch('/ventas-api/products')
  .then(res => res.json())
  .then(data => console.log('✅ Productos:', data))
  .catch(err => console.error('❌ Error:', err));

// Test de clientes
fetch('/ventas-api/customers')
  .then(res => res.json())
  .then(data => console.log('✅ Clientes:', data))
  .catch(err => console.error('❌ Error:', err));
```

Si estos comandos funcionan en la consola pero no funcionan en Angular, el problema está en el código TypeScript, no en la configuración del proxy.

---

## ✅ Checklist de verificación

- [ ] `npm start` está corriendo (NO `ng serve`)
- [ ] La terminal muestra "Proxy created: /ventas-api"
- [ ] `http://localhost:4200/ventas-api/products` devuelve JSON en el navegador
- [ ] En Network → XHR/Fetch aparecen peticiones a `/ventas-api/...`
- [ ] Las peticiones XHR tienen status 200 (verde) o 304 (gris)
- [ ] El backend de Render ya "despertó" (primera petición tardó 30-60 seg, las siguientes son rápidas)
