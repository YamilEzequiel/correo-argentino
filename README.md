# ylazzari-correoargentino

API wrapper en TypeScript para la API **MiCorreo** de Correo Argentino.

Permite cotizar envíos, registrar usuarios, listar sucursales y **crear órdenes de envío** contra la plataforma MiCorreo. Maneja internamente el flujo HTTP Basic + JWT que exige la API.

[![Downloads](https://img.shields.io/npm/dt/ylazzari-correoargentino.svg)](http://npmjs.com/package/ylazzari-correoargentino)

- ✅ Soporte dual **CommonJS + ESM**
- ✅ Tipos TypeScript completos
- ✅ Validaciones client-side previas a cada request
- ✅ Sin dependencias runtime (axios es peer dep)

## Estado de Endpoints

- 🟩 `register` [POST] — Registro de usuario en MiCorreo
- 🟩 `token` [POST] — Obtención de token de autenticación
- 🟩 `users/validate` [POST] — Validación y obtención de customerId
- 🟩 `rates` [POST] — Cotización de envíos
- 🟩 `agencies` [GET] — Consulta de sucursales por provincia
- 🟩 `shipping/import` [POST] — **Importación / alta de envíos** *(nuevo en v0.1.0)*

---

## Tabla de contenidos

- [Instalación](#instalación)
- [Configuración inicial](#configuración-inicial)
- [Inicio rápido](#inicio-rápido)
- [Opciones del constructor](#opciones-del-constructor)
- [Ambientes](#ambientes)
- [Referencia de la API](#referencia-de-la-api)
  - [`initializeAll(data)`](#initializealldata)
  - [`initializeWithCustomerId(data)`](#initializewithcustomeriddata)
  - [`getCustomerId(email, password)`](#getcustomeridemail-password)
  - [`getRates(data)`](#getratesdata)
  - [`userRegister(dataUser)`](#userregisterdatauser)
  - [`getAgencies(provinceCode)`](#getagenciesprovincecode)
  - [`shippingImport(data)`](#shippingimportdata)
  - [`setEnvironment(environment)`](#setenvironmentenvironment)
  - [Getters](#getters)
- [Tipos](#tipos)
- [Enums](#enums)
- [Manejo de errores](#manejo-de-errores)
- [Códigos de provincia](#códigos-de-provincia)
- [ESM vs CommonJS](#esm-vs-commonjs)
- [Troubleshooting](#troubleshooting)
- [Changelog](#changelog)
- [Licencia](#licencia)

---

## Instalación

```bash
npm install ylazzari-correoargentino axios
```

`axios` es **peerDependency** — instalalo en tu proyecto. Funciona con cualquier versión `^1.x`.

### Requisitos

- Node.js `>= 14`
- Credenciales de MiCorreo (userToken, passwordToken, email, password)

---

## Configuración inicial

### Obtener credenciales

1. Solicitar token de acceso vía el [formulario de Correo Argentino](https://www.correoargentino.com.ar/MiCorreo/public/contact).
2. Referencias útiles:
   - [Documentación oficial (PDF)](https://www.correoargentino.com.ar/MiCorreo/public/img/pag/apiMiCorreo.pdf)
   - [Web MiCorreo](https://www.correoargentino.com.ar/MiCorreo/public/)

Las credenciales son **distintas por ambiente** — pediselas a Correo para TEST y PROD por separado.

---

## Inicio rápido

### Modo 1: con email + password (obtiene `customerId` automáticamente)

```ts
import CorreoArgentinoApi from "ylazzari-correoargentino";
import { Environment } from "ylazzari-correoargentino/enums";

const api = new CorreoArgentinoApi();

await api.initializeAll({
  userToken: process.env.USER_TOKEN!,
  passwordToken: process.env.PASSWORD_TOKEN!,
  email: process.env.EMAIL!,
  password: process.env.PASSWORD!,
  environment: Environment.TEST,
});

const customerId = api.getVarCustomerId();
```

### Modo 2: con `customerId` ya conocido (omite `/users/validate`)

```ts
import CorreoArgentinoApi from "ylazzari-correoargentino";
import { Environment } from "ylazzari-correoargentino/enums";

const api = new CorreoArgentinoApi();

await api.initializeWithCustomerId({
  userToken: process.env.USER_TOKEN!,
  passwordToken: process.env.PASSWORD_TOKEN!,
  customerId: "0090000025",
  environment: Environment.PROD,
});
```

---

## Opciones del constructor

```ts
const api = new CorreoArgentinoApi({ debug: true });
```

| Opción  | Tipo      | Default | Descripción                                                                              |
|---------|-----------|---------|------------------------------------------------------------------------------------------|
| `debug` | `boolean` | `false` | Si es `true`, imprime logs informativos (ambiente, customerId obtenido, payloads). |

> ⚠️ **No actives `debug` en producción.** Aunque la librería ya no logea el JWT, los payloads contienen PII (emails, direcciones).

---

## Ambientes

| Ambiente             | URL base                                              |
|----------------------|-------------------------------------------------------|
| `Environment.TEST`   | `https://apitest.correoargentino.com.ar/micorreo/v1`  |
| `Environment.PROD`   | `https://api.correoargentino.com.ar/micorreo/v1`      |

---

## Referencia de la API

### `initializeAll(data)`

Obtiene el JWT y el `customerId` a partir de email + password.

- **Parámetros:** [`InitializeMiCorreo`](#initializemicorreo)
- **Devuelve:** `Promise<void>`
- **Flujo:** `setEnvironment` → `POST /token` (Basic auth) → `POST /users/validate` (Bearer).

```ts
await api.initializeAll({
  userToken: "...",
  passwordToken: "...",
  email: "vendedor@empresa.com",
  password: "secret",
  environment: Environment.PROD,
});
```

---

### `initializeWithCustomerId(data)`

Igual que `initializeAll` pero salta `/users/validate` porque ya conocés el `customerId`.

- **Parámetros:** [`InitializeMiCorreoWithCustomerId`](#initializemicorreowithcustomerid)
- **Devuelve:** `Promise<void>`

```ts
await api.initializeWithCustomerId({
  userToken: "...",
  passwordToken: "...",
  customerId: "0090000025",
  environment: Environment.PROD,
});
```

---

### `getCustomerId(email, password)`

Valida credenciales contra `POST /users/validate` y devuelve el `customerId`.

Lo invoca automáticamente `initializeAll`. Llamarlo manualmente solo tiene sentido si querés re-validar o cambiar de usuario sin recrear la instancia.

- **Devuelve:** `Promise<`[`ResponseCustomerId`](#responsecustomerid)`>`

```ts
const { customerId, createdAt } = await api.getCustomerId("user@mail.com", "secret");
```

---

### `getRates(data)`

Cotiza un envío contra `POST /rates`. Aceptás un array de productos con dimensiones individuales — la librería arma un contenedor virtual.

- **Parámetros:** [`ProductRates`](#productrates)
- **Devuelve:** `Promise<`[`ResponseRates`](#responserates)`>`

```ts
import { DeliveredType } from "ylazzari-correoargentino/enums";

const cotizacion = await api.getRates({
  customerId: api.getVarCustomerId(),
  postalCodeOrigin: "1757",
  postalCodeDestination: "1704",
  deliveredType: DeliveredType.D,
  dimensions: [
    { length: 30, width: 20, height: 10, weight: 1500, quantity: 1 },
    { length: 20, width: 15, height: 5, weight: 500, quantity: 2 },
  ],
});

console.log(cotizacion.rates);
// [{ deliveredType: "D", productType: "CP", productName: "Paq.ar Clásico", price: 498.06 }]
```

#### Cómo se calcula el contenedor virtual

Si pasás varios productos en `dimensions`, se combinan así:

| Campo    | Fórmula                                                          |
|----------|------------------------------------------------------------------|
| `weight` | suma de `weight × quantity` de cada item                         |
| `length` | máximo de `length × quantity` (caben en una sola fila por largo) |
| `width`  | máximo de `width` (no se multiplica por quantity)                |
| `height` | suma de `height × quantity` (items apilados verticalmente)       |

Si tu modelo de empaquetado es otro, calculá las dimensiones en tu código y pasá un único `ProductDimensions` con los valores finales.

#### Cotizar ambas modalidades (D y S) en un mismo request

Omití `deliveredType`:

```ts
const cotizacion = await api.getRates({
  customerId: api.getVarCustomerId(),
  postalCodeOrigin: "1757",
  postalCodeDestination: "1704",
  // sin deliveredType → MiCorreo devuelve ambas
  dimensions: [{ length: 30, width: 20, height: 10, weight: 1500 }],
});

// cotizacion.rates contiene 2 entradas: una para "D" y otra para "S"
```

#### Límites de MiCorreo

| Atributo | Límite       |
|----------|--------------|
| `weight` | 1 – 25000 g  |
| `length` | hasta 150 cm |
| `width`  | hasta 150 cm |
| `height` | hasta 150 cm |

---

### `userRegister(dataUser)`

Registra un nuevo usuario en MiCorreo vía `POST /register`.

Hay dos modos: consumidor final (`DNI`) y empresa/monotributista (`CUIT`).

- **Parámetros:** [`UserRegister`](#userregister)
- **Devuelve:** `Promise<`[`ResponseUserRegister`](#responseuserregister)`>`

```ts
import { DocumentType } from "ylazzari-correoargentino/enums";

const nuevoUsuario = await api.userRegister({
  firstName: "Juan",
  lastName: "Pérez",
  email: "juan@mail.com",
  password: "secret",
  documentType: DocumentType.DNI,
  documentId: "32471960",
  phone: "1165446544",
  cellPhone: "1165446544",
  address: {
    streetName: "Vicente Lopez",
    streetNumber: "448",
    floor: "1",
    apartment: "D",
    locality: "Monte Grande",
    city: "Esteban Echeverria",
    provinceCode: "B",
    postalCode: "B1842ZAB",
  },
});

console.log(nuevoUsuario.customerId); // "0090000024"
```

> ⚠️ MiCorreo no valida que el email sea real. Si el email ya existe, devuelve `402 "Email existente"`.

---

### `getAgencies(provinceCode)`

Lista las sucursales de una provincia vía `GET /agencies`.

- **Parámetros:** `provinceCode: ProvinceCode` (1 letra)
- **Devuelve:** `Promise<`[`ResponseAgencies`](#responseagencies)`>` (= `Agency[]`)

```ts
import { ProvinceCode } from "ylazzari-correoargentino/enums";

const sucursales = await api.getAgencies(ProvinceCode["Provincia de Buenos Aires"]);

sucursales.forEach((suc) => {
  console.log(suc.code, suc.name, suc.location.address.postalCode);
});
```

> ⚠️ **Breaking change en v0.1.0:** el tipo `ResponseAgencies` ahora es `Agency[]` (antes `{ agencies: Agency[] }`, que nunca coincidió con la respuesta real del server). Si tu código usaba `response.agencies.map(...)`, cambialo a `response.map(...)`.

---

### `shippingImport(data)`

Crea (importa) un envío en MiCorreo vía `POST /shipping/import`. Este es el endpoint que **cierra el flujo de operación**.

- **Parámetros:** [`ShippingImport`](#shippingimport)
- **Devuelve:** `Promise<`[`ResponseShippingImport`](#responseshippingimport)`>`

#### Envío a domicilio

```ts
import { DeliveredType } from "ylazzari-correoargentino/enums";

const envio = await api.shippingImport({
  customerId: api.getVarCustomerId(),
  extOrderId: "ORDER-12345",
  orderNumber: "102",
  recipient: {
    name: "María González",
    email: "maria@mail.com",
    phone: "1144556677",
    cellPhone: "1144556677",
  },
  shipping: {
    deliveryType: DeliveredType.D,
    address: {
      streetName: "Av. Corrientes",
      streetNumber: "1234",
      floor: "5",
      apartment: "B",
      city: "Buenos Aires",
      provinceCode: "B",
      postalCode: "1425",
    },
    weight: 1000,
    declaredValue: 500.0,
    height: 20,
    length: 40,
    width: 20,
  },
});

console.log(envio.createdAt); // "2022-06-07T16:15:04.996-03:00"
```

#### Envío a sucursal

```ts
const envio = await api.shippingImport({
  customerId: api.getVarCustomerId(),
  extOrderId: "ORDER-12346",
  recipient: {
    name: "María González",
    email: "maria@mail.com",
  },
  shipping: {
    deliveryType: DeliveredType.S,
    agency: "B0107", // código obtenido vía getAgencies
    weight: 1000,
    declaredValue: 500.0,
    height: 20,
    length: 40,
    width: 20,
  },
});
```

#### Validaciones client-side aplicadas

Antes de pegarle al server, la librería valida:

- `customerId`, `extOrderId`, `recipient.name`, `recipient.email`, `shipping.deliveryType` → obligatorios.
- Si `deliveryType === "S"` → `shipping.agency` obligatorio.
- Si `deliveryType === "D"` → `shipping.address` con `streetName`, `streetNumber`, `city`, `provinceCode`, `postalCode` obligatorios.

Si algo falla, se tira `Error` con el campo faltante antes de hacer el roundtrip al server.

#### Idempotencia

`extOrderId` debe ser **único**. MiCorreo rechaza con `"La orden ya fue importada con anterioridad"` si lo repetís. Usá un identificador propio (UUID, ID de tu DB, etc.) y persistilo de tu lado.

#### `sender` opcional

Si no pasás `sender`, MiCorreo usa los datos del perfil de tu `customerId`. Pasalo solo si necesitás overridear el remitente para un envío puntual.

---

### `setEnvironment(environment)`

Cambia el ambiente y recrea la instancia axios interna.

- **Parámetros:** `environment: Environment` (`PROD` o `TEST`)
- **Devuelve:** `void`

```ts
api.setEnvironment(Environment.TEST);
```

> ⚠️ Llamarlo después de inicializar **resetea el JWT**. Vas a tener que re-inicializar antes de hacer más llamadas. Se invoca automáticamente desde `initializeAll` / `initializeWithCustomerId`.

---

### Getters

Métodos para inspeccionar el estado interno. Todos devuelven `string`.

| Método                 | Descripción                                                      |
|------------------------|------------------------------------------------------------------|
| `getVarCustomerId()`   | El customerId cargado actualmente.                               |
| `getVarToken()`        | El JWT actualmente cargado. ⚠️ NO lo loguees.                   |
| `getVarEmail()`        | El email con el que se inicializó la instancia.                  |
| `getVarPassword()`     | El password en plano. ⚠️ Deprecado, no lo uses.                 |
| `getVarUserToken()`    | El userToken con el que se inicializó.                           |
| `getVarPasswordToken()`| El passwordToken con el que se inicializó.                       |
| `getVarEnvironment()`  | El ambiente actual (`"PROD"` o `"TEST"`).                        |

---

## Tipos

Disponibles vía `ylazzari-correoargentino/interfaces`:

```ts
import type {
  CorreoArgentinoOptions,
  InitializeMiCorreo,
  InitializeMiCorreoWithCustomerId,
  ProductRates,
  ProductDimensions,
  ResponseRates,
  Rate,
  UserRegister,
  Address,
  ResponseUserRegister,
  ResponseAgencies,
  Agency,
  ShippingImport,
  ShippingAddress,
  ShippingInfo,
  Sender,
  Recipient,
  ResponseShippingImport,
  ResponseCustomerId,
  ResponseAuthToken,
} from "ylazzari-correoargentino/interfaces";
```

### `InitializeMiCorreo`

```ts
interface InitializeMiCorreo {
  userToken: string;
  passwordToken: string;
  email: string;
  password: string;
  environment: Environment.PROD | Environment.TEST;
}
```

### `InitializeMiCorreoWithCustomerId`

```ts
interface InitializeMiCorreoWithCustomerId {
  userToken: string;
  passwordToken: string;
  customerId: string;
  environment: Environment.PROD | Environment.TEST;
}
```

### `ProductRates`

```ts
interface ProductRates {
  customerId: string;
  postalCodeOrigin: string;
  postalCodeDestination: string;
  deliveredType?: DeliveredType.D | DeliveredType.S; // opcional desde v0.1.0
  dimensions: ProductDimensions[];
}
```

### `ProductDimensions`

```ts
interface ProductDimensions {
  weight: number;   // gramos (1–25000)
  height: number;   // cm (≤150)
  width: number;    // cm (≤150)
  length: number;   // cm (≤150)
  quantity?: number;
}
```

### `ResponseRates`

```ts
interface ResponseRates {
  message?: string;     // opcional, no siempre presente
  customerId: string;
  validTo: string;      // ISO 8601, ej: "2022-06-07T10:31:27.881-03:00"
  rates: Rate[];
}
```

### `Rate`

```ts
interface Rate {
  deliveredType: "D" | "S";
  productType: "CP" | "EP";
  productName: string;
  price: number;
  deliveryTimeMin: string;
  deliveryTimeMax: string;
}
```

### `UserRegister`

```ts
interface UserRegister {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  documentType: "DNI" | "CUIT";
  documentId: string;
  phone: string;
  cellPhone: string;
  address: Address;
}
```

### `Address`

```ts
interface Address {
  streetName: string;
  streetNumber: string;
  floor: string;
  apartment: string;
  locality: string;
  city: string;
  provinceCode: string;
  postalCode: string;
}
```

### `ResponseUserRegister`

```ts
interface ResponseUserRegister {
  customerId: string;
  createdAt: string;
}
```

### `ResponseAgencies`

```ts
type ResponseAgencies = Agency[];

interface Agency {
  code: string;
  name: string;
  manager: string;
  email: string;
  phone: string;
  services: { packageReception: boolean; pickupAvailability: boolean };
  location: { address: Address; latitude: string; longitude: string };
  hours: WeeklySchedule;
  status: "ACTIVE" | "INACTIVE";
}
```

### `ShippingImport`

```ts
interface ShippingImport {
  customerId: string;
  extOrderId: string;            // único — idempotencia
  orderNumber?: string;          // identificador visible en panel MiCorreo
  sender?: Sender;               // opcional; default = perfil del customerId
  recipient: Recipient;          // requerido
  shipping: ShippingInfo;        // requerido
}
```

### `Sender`

```ts
interface Sender {
  name?: string | null;
  phone?: string | null;
  cellPhone?: string | null;
  email?: string | null;
  originAddress?: Partial<ShippingAddress> | null;
}
```

### `Recipient`

```ts
interface Recipient {
  name: string;     // requerido
  email: string;    // requerido
  phone?: string;
  cellPhone?: string;
}
```

### `ShippingInfo`

```ts
interface ShippingInfo {
  deliveryType: "D" | "S";       // requerido
  agency?: string | null;        // requerido si deliveryType = "S"
  address?: ShippingAddress | null; // requerido si deliveryType = "D"
  weight: number;                // gramos (entero)
  declaredValue: number;
  height: number;                // cm (entero, ≤255)
  length: number;                // cm (entero, ≤255)
  width: number;                 // cm (entero, ≤255)
}
```

### `ShippingAddress`

```ts
interface ShippingAddress {
  streetName: string;
  streetNumber: string;
  floor?: string;
  apartment?: string;
  city: string;
  provinceCode: string;
  postalCode: string;
}
```

> ⚠️ Esta interfaz NO incluye `locality` (diferencia con `Address`). MiCorreo no la requiere en `/shipping/import`.

### `ResponseShippingImport`

```ts
interface ResponseShippingImport {
  createdAt: string; // ISO 8601, ej: "2022-06-07T16:15:04.996-03:00"
}
```

### `ResponseCustomerId`

```ts
interface ResponseCustomerId {
  customerId: string;
  createdAt: string;
}
```

### `ResponseAuthToken`

```ts
interface ResponseAuthToken {
  token: string;
  expires: string;
}
```

---

## Enums

Disponibles vía `ylazzari-correoargentino/enums`:

```ts
import {
  Environment,
  DeliveredType,
  ProductType,
  DocumentType,
  AgencyStatus,
  ProvinceCode,
} from "ylazzari-correoargentino/enums";
```

### `Environment`

```ts
enum Environment {
  PROD = "PROD",
  TEST = "TEST",
}
```

### `DeliveredType`

```ts
enum DeliveredType {
  D = "D", // Entrega a domicilio
  S = "S", // Entrega en sucursal
}
```

### `ProductType`

```ts
enum ProductType {
  CP = "CP", // Paq.ar Clásico
  EP = "EP", // Paq.ar Express
}
```

### `DocumentType`

```ts
enum DocumentType {
  DNI = "DNI",
  CUIT = "CUIT",
}
```

### `AgencyStatus`

```ts
enum AgencyStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}
```

### `ProvinceCode`

Ver [Códigos de provincia](#códigos-de-provincia).

---

## Manejo de errores

Todos los métodos tiran `Error` con un mensaje del formato:

```
🔴 Error en {method}: {code} - {message}
```

`code` y `message` vienen del response del server cuando está disponible. Si el server no respondió o el payload no es JSON, se usan los campos del objeto error de axios como fallback.

```ts
try {
  await api.shippingImport(envio);
} catch (err) {
  console.error(err.message);
  // "🔴 Error en shippingImport: 402 - La orden ya fue importada con anterioridad."
}
```

### Códigos HTTP típicos

| Código | Significado                                                              |
|--------|--------------------------------------------------------------------------|
| `200`  | OK                                                                       |
| `400`  | Falta un parámetro obligatorio                                           |
| `401`  | Token JWT inválido o no provisto                                         |
| `402`  | Los parámetros son válidos pero la solicitud falló (regla de negocio)    |
| `403`  | Tu cuenta no tiene permisos                                              |
| `404`  | Recurso inexistente                                                      |
| `409`  | Conflicto (ej: idempotency key repetida)                                 |
| `429`  | Rate limit (aplicá backoff exponencial)                                  |
| `5xx`  | Error del lado de Correo                                                 |

### Mensajes de error frecuentes en `shippingImport`

- `La orden ya fue importada con anterioridad` — `extOrderId` duplicado.
- `Peso no valido` / `El peso debe ser mayor a 0` / `El peso excede el maximo permitido para el producto`
- `Tipo de entrega invalido`
- `Verifique la sucursal de destino` — código de `agency` inexistente.
- `El codigo Postal del emisor debe tener valor` — falta data en el perfil del customerId.
- `La provincia es invalida.`
- `El alto/ancho/largo debe estar entre 0 y 255.`

---

## Códigos de provincia

| Código | Provincia                            |
|--------|--------------------------------------|
| `A`    | Salta                                |
| `B`    | Provincia de Buenos Aires            |
| `C`    | Ciudad Autónoma de Buenos Aires      |
| `D`    | San Luis                             |
| `E`    | Entre Ríos                           |
| `F`    | La Rioja                             |
| `G`    | Santiago del Estero                  |
| `H`    | Chaco                                |
| `J`    | San Juan                             |
| `K`    | Catamarca                            |
| `L`    | La Pampa                             |
| `M`    | Mendoza                              |
| `N`    | Misiones                             |
| `P`    | Formosa                              |
| `Q`    | Neuquén                              |
| `R`    | Río Negro                            |
| `S`    | Santa Fe                             |
| `T`    | Tucumán                              |
| `U`    | Chubut                               |
| `V`    | Tierra del Fuego                     |
| `W`    | Corrientes                           |
| `X`    | Córdoba                              |
| `Y`    | Jujuy                                |
| `Z`    | Santa Cruz                           |

Acceso programático:

```ts
import { ProvinceCode } from "ylazzari-correoargentino/enums";

ProvinceCode["Provincia de Buenos Aires"]; // "B"
ProvinceCode["Ciudad Autónoma de Buenos Aires"]; // "C"
```

---

## ESM vs CommonJS

La librería se publica como **dual package**: funciona en ambos sistemas de módulos sin cambios de tu lado.

### CommonJS

```js
const { CorreoArgentinoApi } = require("ylazzari-correoargentino");
const { Environment } = require("ylazzari-correoargentino/enums");
```

### ESM

```ts
import CorreoArgentinoApi from "ylazzari-correoargentino";
import { Environment } from "ylazzari-correoargentino/enums";
```

Los `exports` del `package.json` declaran ambas variantes con condiciones `"import"` y `"require"`, y un `dist/esm/package.json` interno con `"type": "module"` para que Node interprete los archivos `.js` de esa carpeta como ESM.

---

## Troubleshooting

### `Error: Token no disponible. Llamá initializeAll o initializeWithCustomerId primero.`

Estás llamando un método antes de inicializar. Hacé `await api.initializeAll(...)` (o `initializeWithCustomerId`) antes de cualquier otra cosa.

### `Error en authToken: 401 - Unauthorized`

`userToken` y/o `passwordToken` incorrectos para el ambiente. Recordá que las credenciales son **distintas por ambiente** (TEST vs PROD).

### `Error en agencies: 402 - Customer ID no valido`

El `customerId` no existe en el ambiente que estás usando. Si estás en TEST, asegurate de haber registrado al usuario en TEST. Si en PROD, en PROD.

### `Error en shippingImport: 402 - no se encontro datos de remitente`

Tu perfil de MiCorreo no tiene datos de remitente cargados. Cargalos en el panel de MiCorreo o pasá `sender` explícito en el request.

### `Error en shippingImport: 402 - La orden ya fue importada con anterioridad.`

Estás reusando un `extOrderId`. Usá un identificador único por orden.

### Logs ruidosos en consola

Asegurate de NO pasar `debug: true` en el constructor. Por default está desactivado.

---

## Changelog

### v0.1.0 — *current*

**Nuevas funcionalidades**

- **`shippingImport(data)`** — implementación del endpoint `POST /shipping/import` que faltaba. Cierra el flujo: ahora se pueden crear envíos, no solo cotizarlos.
- **`CorreoArgentinoOptions`** — el constructor acepta `{ debug?: boolean }` para activar/desactivar logs.
- **Validaciones client-side** para `shippingImport` que evitan el roundtrip al server cuando faltan campos.

**Breaking changes**

- `ResponseAgencies` ahora es `Agency[]` (antes `{ agencies: Agency[] }`, que nunca coincidió con el shape real de la respuesta de MiCorreo). Reemplazá `response.agencies` por `response`.
- `ResponseAuthToken.expires`, `ResponseCustomerId.createdAt` y `ResponseRates.validTo` cambian de `Date` a `string` — JSON nunca devolvió `Date`, el tipo previo era incorrecto.
- `ResponseRates.message` pasa a ser opcional (no siempre viene en la respuesta).
- `ProductRates.deliveredType` pasa a ser opcional — omitiéndolo MiCorreo devuelve cotización para D y S simultáneamente.
- Eliminados los `console.log` no-condicionales (incluyendo el que imprimía el JWT). Reactivables vía `new CorreoArgentinoApi({ debug: true })`.

**Bug fixes**

- `getAgencies` armaba la URL con `/` en vez de `?` para la query string — siempre devolvía 404.
- Header HTTP inválido `Basic: ...` eliminado de los requests (no es un header estándar, se confundía con `Authorization: Basic ...`).
- `errorCapture` cambió su return type de `void` a `never` para que TS infiera correctamente que el path nunca retorna.
- Build script ahora compila CJS y ESM correctamente; antes el output ESM nunca se generaba en `prepare`.

**Mejoras internas**

- `api: AxiosInstance` (antes `any`).
- `package.json`: eliminado bloque `compilerOptions` inválido (era ignorado por npm).
- `dotenv` movido de `peerDependencies` a `devDependencies` (la lib no lo usa, solo el ejemplo).
- Documentación JSDoc completa en todos los métodos públicos.

### v0.0.7

Soporte inicial de dual ESM/CommonJS (incompleto, arreglado en v0.1.0).

---

## Playground interactivo

El repo incluye un **playground local con HTML interactivo** para probar todos los métodos contra MiCorreo TEST sin escribir código:

```bash
npm install
# renombrá env.example.txt → .env y completalo con tus credenciales
npm run playground
# abrí http://localhost:3000
```

Tenés forms para cada método y un toggle de "dry run" para validar payloads de `shippingImport` sin generar envíos reales en MiCorreo. **Guía completa: [`doc/playground.md`](doc/playground.md).**

> Solo es útil para development local — no se publica con el paquete a npm.

## Ejemplos visuales

`doc/ejemplos.html` — documentación HTML autocontenida con casos de uso paso a paso. Abrila con doble click o serviéndola desde el playground en `http://localhost:3000/doc/ejemplos.html`.

## Contribución

Las contribuciones son bienvenidas. Por favor abrí un issue antes para discutir los cambios.

## Licencia

[MIT](LICENSE) — [Yamil Lazzari](https://github.com/YamilEzequiel)
