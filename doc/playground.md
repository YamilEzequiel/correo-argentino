# Playground interactivo — Guía del usuario

El playground es un mini servidor local con una página web que te permite **probar todos los métodos de la librería** sin escribir código.

> No es parte del paquete publicado en npm — son herramientas internas para development/testing. Los usuarios finales que consumen la librería NO necesitan nada de esto.

---

## Tabla de contenidos

- [¿Qué es?](#qué-es)
- [Arquitectura](#arquitectura)
- [Instalación (3 pasos)](#instalación-3-pasos)
- [Configuración del `.env`](#configuración-del-env)
- [Cómo usar el playground](#cómo-usar-el-playground)
- [El toggle "dry run"](#el-toggle-dry-run)
- [Endpoints expuestos](#endpoints-expuestos)
- [Probarlo con `curl`](#probarlo-con-curl)
- [Troubleshooting](#troubleshooting)

---

## ¿Qué es?

Un combo de:

- **`scripts/dev-server.ts`** — un mini Express local que importa la librería y expone REST endpoints
- **`doc/playground.html`** — una página HTML con forms para cada operación, que llama a los endpoints

Sirve para:

- Validar visualmente que la lib anda contra MiCorreo TEST
- Probar payloads de `shippingImport` SIN crear envíos reales (modo dry-run)
- Demos / pruebas rápidas sin levantar un proyecto consumidor entero

---

## Arquitectura

```
┌───────────────────────────────┐
│  navegador                    │
│  doc/playground.html          │
│  (forms + fetch)              │
└──────────┬────────────────────┘
           │ HTTP localhost:3000/api/*
           ▼
┌───────────────────────────────┐
│  Express server               │
│  scripts/dev-server.ts        │
│  (lee .env)                   │
└──────────┬────────────────────┘
           │ import desde src/
           ▼
┌───────────────────────────────┐
│  CorreoArgentinoApi (la lib)  │
└──────────┬────────────────────┘
           │ HTTPS
           ▼
┌───────────────────────────────┐
│  apitest.correoargentino...   │
└───────────────────────────────┘
```

El servidor importa la lib desde `../src/miCorreo` (no desde `dist/`). Eso significa **no hay que compilar** para usar el playground — `tsx` ejecuta TypeScript directo.

---

## Instalación (3 pasos)

### 1. Instalar dependencias

```bash
npm install
```

Esto baja `express`, `tsx` y `@types/express` (devDependencies). Si ya las tenés, salta este paso.

### 2. Configurar credenciales

Renombrá el template:

```bash
# PowerShell:
Rename-Item env.example.txt .env

# Git Bash / WSL / Linux / macOS:
mv env.example.txt .env
```

Y editá `.env` con tus credenciales reales de MiCorreo (ver siguiente sección).

### 3. Arrancar el server

```bash
npm run playground
```

Vas a ver:

```
  ╔════════════════════════════════════════════════╗
  ║  ylazzari-correoargentino playground             
  ╚════════════════════════════════════════════════╝

    Playground:  http://localhost:3000/doc/playground.html
    Ejemplos:    http://localhost:3000/doc/ejemplos.html
    API base:    http://localhost:3000/api
```

Abrí `http://localhost:3000` en el navegador — te redirige al playground.

---

## Configuración del `.env`

```env
# Credenciales obligatorias
USER_TOKEN=tu-user-token-de-correo
PASSWORD_TOKEN=tu-password-token-de-correo

# Ambiente: TEST | PROD
ENVIRONMENT=TEST

# Modo de inicialización — elegí UNO:

# Opción A: si ya tenés customerId, dejá email/password vacíos
CUSTOMER_ID=0090000025

# Opción B: si NO tenés customerId, dejá CUSTOMER_ID vacío
# y completá email + password (la lib obtiene el customerId vía /users/validate)
EMAIL=
PASSWORD=

# Puerto del playground (opcional, default 3000)
PORT=3000
```

### Auto-detección del modo

El server detecta automáticamente qué modo usar:

- Si `CUSTOMER_ID` está seteado → `initializeWithCustomerId` (omite `/users/validate`)
- Si está vacío → `initializeAll` con `EMAIL` + `PASSWORD`

### Ambiente

Recordá que **las credenciales son distintas por ambiente**. Las que te dan para TEST no andan en PROD y viceversa. Para jugar, usá TEST.

---

## Cómo usar el playground

### Status bar arriba

La barra superior muestra el estado de conexión:

| Color  | Significado                                  |
|--------|----------------------------------------------|
| 🟡 amarillo | Sin inicializar (apretá "Inicializar")  |
| 🟢 verde   | Conectado — muestra ambiente + customerId |
| 🔴 rojo    | Error de inicialización o server caído  |

Hace polling cada 10 segundos automáticamente.

### Forms disponibles

| Sección               | Endpoint                | Qué hace                                          |
|-----------------------|-------------------------|---------------------------------------------------|
| Inicializar API       | `POST /api/init`        | Lee `.env` y autentica contra MiCorreo            |
| Cotizar envío         | `POST /api/rates`       | Cotiza precio de envío (D, S, o ambos)            |
| Listar agencias       | `GET /api/agencies`     | Lista sucursales por provincia                    |
| Crear envío           | `POST /api/shipping-import` | Importa un envío en MiCorreo *(ver dry-run)*  |
| Registrar usuario     | `POST /api/user-register` | Alta nueva de usuario (textarea con JSON crudo) |

### Panel de respuesta

Cada form tiene su panel a la derecha con la respuesta JSON sintaxis-coloreada. Status `200 OK` en verde, `ERROR` en rojo.

---

## El toggle "dry run"

🚨 **El form de "Crear envío" es el único que puede modificar estado en MiCorreo.** Por eso tiene un toggle especial.

### Cómo funciona

- ☑️ **Dry run ON** (default): el server **NO** llama a MiCorreo. Solo corre las validaciones client-side de la librería contra tu payload y devuelve si es válido o qué falta. Botón azul "**Validar (dry run)**".
- ☐ **Dry run OFF**: el server llama al endpoint real de MiCorreo. **Crea un envío real en TEST**. Botón rojo "**🚨 ENVIAR A MICORREO**".

### Cuándo apagarlo

Apagalo solamente cuando querés verificar el flujo end-to-end real. Si solo estás iterando sobre el shape del payload, dejá dry-run prendido — vas a ahorrar envíos basura en tu panel de MiCorreo.

### Auto-bump del extOrderId

El campo `extOrderId` se prellena con `ORDER-{timestamp}` y se renueva después de cada submit. Eso evita el clásico error "La orden ya fue importada con anterioridad" cuando hacés clicks consecutivos.

---

## Endpoints expuestos

Todos los endpoints viven bajo `http://localhost:3000/api/`.

### `GET /api/status`

Devuelve estado actual de la lib.

```json
{
  "initialized": true,
  "environment": "TEST",
  "customerId": "0090000025",
  "lastInitError": null
}
```

### `POST /api/init`

Fuerza re-inicialización leyendo `.env`. Acepta body vacío.

```json
{
  "ok": true,
  "environment": "TEST",
  "customerId": "0090000025"
}
```

### `POST /api/rates`

Body: el shape de `ProductRates` (sin `customerId` — lo agrega el server). Devuelve `ResponseRates`.

### `GET /api/agencies?provinceCode=B`

Devuelve array de agencias (`Agency[]`).

### `POST /api/shipping-import`

Body: `ShippingImport` + un campo opcional `dryRun: boolean`.

- `dryRun: true` → solo validación, no llama a MiCorreo
- `dryRun: false` (o ausente) → llama real

Response en dry-run:

```json
{
  "dryRun": true,
  "valid": true,
  "message": "Payload válido. NO se envió a MiCorreo.",
  "payload": { /* lo que se hubiera enviado */ }
}
```

Response real:

```json
{
  "createdAt": "2026-05-14T16:15:04.996-03:00"
}
```

### `POST /api/user-register`

Body: shape completo de `UserRegister`. Devuelve `ResponseUserRegister`.

### `POST /api/users-validate`

Body: `{ "email": "...", "password": "..." }`. Devuelve `ResponseCustomerId`.

---

## Probarlo con `curl`

Si querés saltar el HTML y pegarle a los endpoints directo:

```bash
# Estado
curl http://localhost:3000/api/status

# Inicializar
curl -X POST http://localhost:3000/api/init

# Cotizar
curl -X POST http://localhost:3000/api/rates \
  -H "Content-Type: application/json" \
  -d '{
    "postalCodeOrigin": "1757",
    "postalCodeDestination": "1704",
    "deliveredType": "D",
    "dimensions": [{ "weight": 1500, "length": 30, "width": 20, "height": 10 }]
  }'

# Agencias
curl "http://localhost:3000/api/agencies?provinceCode=B"

# Dry-run de envío
curl -X POST http://localhost:3000/api/shipping-import \
  -H "Content-Type: application/json" \
  -d '{
    "dryRun": true,
    "extOrderId": "TEST-001",
    "recipient": { "name": "María", "email": "m@mail.com" },
    "shipping": {
      "deliveryType": "D",
      "address": {
        "streetName": "Av. Corrientes",
        "streetNumber": "1234",
        "city": "CABA",
        "provinceCode": "C",
        "postalCode": "1043"
      },
      "weight": 1000, "declaredValue": 500,
      "height": 20, "length": 40, "width": 20
    }
  }'
```

---

## Troubleshooting

### `Faltan USER_TOKEN y/o PASSWORD_TOKEN en .env`

El archivo `.env` no existe o no tiene esas variables. Renombrá `env.example.txt → .env` y completalo.

### `Error: listen EADDRINUSE: address already in use :::3000`

El puerto 3000 está ocupado por otro proceso. Cambiá `PORT=3001` (u otro) en `.env`.

### `tsx: command not found`

No corriste `npm install`. Hacelo ahora.

### El status bar dice "Error init: ..."

Las credenciales en `.env` están mal, o estás apuntando a TEST con credenciales de PROD (o viceversa). Verificá `ENVIRONMENT` y las credenciales.

### El playground muestra "Server no responde"

El server crasheó o no se levantó. Mirá la terminal donde corriste `npm run playground` — debería haber un stack trace.

### Cambié el `.env` pero el server sigue con valores viejos

Tenés que reiniciar el server (Ctrl+C en la terminal y `npm run playground` de nuevo). El `.env` se lee una sola vez al arrancar.

### Mis envíos en dry-run dicen "valid: false" pero el payload me parece correcto

El servidor devuelve `errors: []` con la lista de campos que faltan. Leelos — son los mismos checks que hace la lib internamente antes de pegarle al server de MiCorreo.

---

## Notas finales

- El playground NO se publica a npm. `scripts/`, `doc/`, `.env*` etc. quedan fuera del paquete (ver `package.json#files`, que solo declara `["dist", "README.md"]`).
- El server escucha solamente en `localhost` — no es accesible desde otras máquinas en tu red por seguridad.
- Si querés exponerlo a tu red local para probar desde otro dispositivo, vas a tener que modificar `app.listen` en `scripts/dev-server.ts` para escuchar en `0.0.0.0`. Hacelo bajo tu propio riesgo y NUNCA con credenciales de PROD.
