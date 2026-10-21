# Skillign

Catálogo de skills de frontend para agentes de IA con frontend **React + Vite** y backend **Flask**. La interfaz usa el sistema de diseño neobrutalista de la skill `neobrutalist-css-ui`: CSS plano con tokens, bordes negros de 2px, sombras duras y pantallas de autenticación split-screen con orbes.

## Stack

- **Frontend:** React 19, React Router 7 y Vite 8. CSS plano, sin Tailwind ni UI kits.
- **Backend:** Flask 3 + SQLite. API JSON con sesiones, CSRF, contraseñas hasheadas y OTP.
- **Dev:** Vite en `5173` con proxy `/api` hacia Flask en `5000` (mismo origen, cookies incluidas).
- **Prod:** Vite compila a `frontend/dist` y Flask sirve la SPA y la API desde el mismo puerto.

## Skill de diseño

La skill está copiada dentro del proyecto en `.opencode/skills/neobrutalist-css-ui`. Los estilos base están en `frontend/src/styles/tokens.css` y `frontend/src/styles/neobrutalist.css`.

La skill exige CSS puro para el diseño; React se usa solo para la estructura y la interacción. La propia skill aparece como primera tarjeta del catálogo y su archivo `.skill` se puede descargar desde su ficha.

## Desarrollo

Requisitos: Python 3.11+, Node 20+ y npm.

### 1. Backend

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Flask queda en `http://127.0.0.1:5000`. La base SQLite se crea en `instance/skillign.sqlite`.

### 2. Frontend

En otra terminal:

```powershell
cd frontend
npm install
npm run dev
```

Abre `http://127.0.0.1:5173`. Vite reenvía `/api` a Flask y las cookies de sesión funcionan en local.

### Producción local

```powershell
cd frontend
npm run build
cd ..
python app.py
```

Abre `http://127.0.0.1:5000`: Flask sirve `frontend/dist` y la API en el mismo origen. Si cambias el frontend, vuelve a ejecutar `npm run build`.

## Firebase + VPS

El frontend se publica en Firebase Hosting (`skillign.web.app`) y la API Flask corre en un VPS con HTTPS.

### Backend en el VPS

Configura estas variables antes de arrancar Flask:

```powershell
$env:SECRET_KEY = "una-clave-larga-y-aleatoria"
$env:CORS_ORIGINS = "https://skillign.web.app"
$env:SESSION_COOKIE_SECURE = "1"
$env:SESSION_COOKIE_SAMESITE = "None"
$env:SEED_DEMO = "0"
$env:SHOW_OTP = "0"
```

La API debe servirse por HTTPS: la cookie de sesión cross-site usa `SameSite=None; Secure`. El dominio del VPS debe estar disponible antes de compilar el frontend.

### Frontend en Firebase

```powershell
cd frontend
$env:VITE_API_URL = "https://api.tudominio.com"
npm run build
cd ..
npx firebase-tools deploy --only hosting --project skillign
```

`firebase.json` ya configura el rewrite de SPA y el caché de assets. El proyecto de Firebase debe llamarse `skillign` para que el sitio sea `https://skillign.web.app`.

El login con cuenta y la recuperación por OTP necesitan que el VPS tenga SMTP configurado o `SHOW_OTP=1` en un entorno de demostración.

### Cuenta de demostración

- Email: `demo@skillign.dev`
- Contraseña: `demo1234`

La cuenta demo arranca con tres skills guardadas. Desactiva el seed con `SEED_DEMO=0`.

### OTP en local

No hay SMTP configurado. En modo demo, el código de 6 dígitos se muestra en la pantalla de verificación y se guarda hasheado en SQLite con expiración de 10 minutos. Ocúltalo con `SHOW_OTP=0`; en producción habría que enviarlo por email.

Los botones de Google y Microsoft están maquetados y muestran un aviso de "pendiente de configurar". No hay OAuth real.

## Rutas del frontend

| Ruta | Descripción |
|---|---|
| `/` | Catálogo con estanterías, búsqueda y recomendaciones |
| `/skills/:slug` | Detalle de la skill, recursos y guardado |
| `/mi-coleccion` | Skills guardadas |
| `/login` | Inicio de sesión |
| `/crear-cuenta` | Registro |
| `/recuperar` | Solicitud de OTP |
| `/verificar` | Verificación del código |
| `/nueva-contrasena` | Cambio de contraseña |
| `*` | Página 404 |

## API

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/session` | Usuario actual, contador de colección y CSRF token |
| GET | `/api/catalog?q=&category=` | Catálogo, búsqueda, categorías y recomendaciones |
| GET | `/api/skills/<slug>` | Detalle, relacionados y estado guardado |
| POST | `/api/skills/<slug>/save` | Guardar / quitar de la colección |
| GET | `/api/saved` | Skills guardadas |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/signup` | Registro |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/forgot` | Solicitar OTP |
| GET/POST | `/api/auth/verify` | Estado / validación del OTP |
| GET/POST | `/api/auth/reset` | Estado / cambio de contraseña |
| GET | `/api/health` | Health check |

Los POST requieren el header `X-CSRF-Token` obtenido de `/api/session`.

## Estructura

```
app.py                     Entry point de Flask
skillign/
  __init__.py              App factory, CSRF, errores, SPA y seed demo
  auth.py                  Login, registro, OTP y reset
  views.py                 Catálogo, detalle, colección y guardado
  catalog.py               Categorías, 49 skills y portadas
  db.py                    SQLite helpers
  security.py              Tokens CSRF
  schema.sql               Tablas
frontend/
  src/
    api.js                 Cliente fetch con CSRF
    auth.jsx               Sesión y usuario en React
    App.jsx                Rutas
    components/            Navbar, cards, portadas SVG, formularios
    pages/                 Catálogo, detalle, colección y auth
    styles/                tokens.css + neobrutalist.css
  index.html
  vite.config.js           Proxy /api y build
tests/test_app.py          Tests de API con pytest
```

## Tests

```powershell
pip install -r requirements-dev.txt
pytest -q
```

Cubren catálogo, búsqueda, detalle de las 49 skills, registro, login, logout, guardado, recomendaciones, flujo de OTP, CSRF, validaciones y 404.

Para verificar el build del frontend:

```powershell
cd frontend
npm run build
```

## Licencia

Source-available bajo **PolyForm Noncommercial 1.0.0**. Puedes usar, modificar y compartir el proyecto para fines no comerciales, incluyendo uso personal, educativo, investigación y organizaciones sin ánimo de lucro.

**Para monetizar o hacer uso comercial necesitas una licencia aparte.** Contacto: [@cxsxrrrr en GitHub](https://github.com/cxsxrrrr).

Este proyecto no es open source según la definición de la OSI.

## Seguridad

- Contraseñas con `werkzeug.security` (scrypt).
- CSRF en todos los POST, vía header `X-CSRF-Token`.
- Cookies `HttpOnly` y `SameSite=Lax`.
- Consultas parametrizadas, escape automático de React y SQLite con foreign keys.
- OTP hasheado, con expiración y límite de intentos.
- `SECRET_KEY` aleatoria por proceso si no defines la variable de entorno. En producción configura `SECRET_KEY`, sirve con un WSGI server y pon `SESSION_COOKIE_SECURE=True`.
- La cuenta demo es solo para pruebas. En producción desactiva el seed con `SEED_DEMO=0` o cambia las credenciales.
