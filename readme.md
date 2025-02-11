# Correo Argentino API Client

> ⚠️ **AVISO**: Esta librería está en desarrollo activo y aún no está finalizada. Algunas funcionalidades podrían cambiar o estar incompletas.

Cliente API no oficial para integrar los servicios de Correo Argentino en aplicaciones Node.js.

## Instalación

```bash
npm install ylazzari-correoargentino
```

## Configuración Inicial

### Obtener Credenciales

Como primer paso, se debe obtener el token de acceso. Este lo deben solicitar a través de un formulario en la página de correo argentino.

- [Documentación oficial](https://www.correoargentino.com.ar/MiCorreo/public/img/pag/apiMiCorreo.pdf)
- [Web Mi Correo](https://www.correoargentino.com.ar/MiCorreo/public/)

Para solicitar el token, ingrese a la web con su usuario y contraseña y complete el formulario en: [Solicitar token](https://www.correoargentino.com.ar/MiCorreo/public/contact)

### URLs de la API

- TEST = https://apitest.correoargentino.com.ar/v1
- PROD = https://api.correoargentino.com.ar/micorreo/v1

## Uso Básico

Hay dos formas de inicializar la API:

### 1. Inicialización Completa (Recomendada)
Útil cuando no se tiene el customerId previamente:

```typescript
import { CorreoArgentinoApi, Environment } from 'correo-argentino-api';

const correoApi = new CorreoArgentinoApi();

await correoApi.initializeAll({
  userToken: "YOUR_USER_TOKEN",
  passwordToken: "YOUR_PASSWORD_TOKEN",
  email: "your@email.com",
  password: "your_password",
  environment: Environment.PROD
});
```

### 2. Inicialización con CustomerId
Para cuando ya se tiene el customerId:

```typescript
import { CorreoArgentinoApi, Environment } from 'correo-argentino-api';

const correoApi = new CorreoArgentinoApi();

await correoApi.initializeWithCustomerId({
  userToken: "YOUR_USER_TOKEN",
  passwordToken: "YOUR_PASSWORD_TOKEN",
  customerId: "YOUR_CUSTOMER_ID",
  environment: Environment.PROD
});
```

## Obtener Costos de Envío

```typescript
const cotizacion = await correoApi.getRates({
  dimensions: [
    { 
      length: 10, 
      width: 10, 
      height: 10, 
      weight: 100, 
      quantity: 1 
    }
  ],
  customerId: correoApi.getVarCustomerId(),
  postalCodeOrigin: "2000",
  postalCodeDestination: "2000",
  deliveredType: DeliveredType.D
});
```

## Tipos de Datos

### Enumeraciones

```typescript
enum Environment {
  PROD = "prod",
  TEST = "test"
}

enum DeliveredType {
  D = "D", // Entrega a domicilio
  S = "S"  // Entrega en sucursal
}

enum ProductType {
  CP = "CP",
  EP = "EP"
}
```

### Interfaces Principales

```typescript
interface ProductDimensions {
  weight: number;   // Peso en gramos (max 25000)
  height: number;   // Alto en cm (max 150)
  width: number;    // Ancho en cm (max 150)
  length: number;   // Largo en cm (max 150)
  quantity?: number; // Cantidad de productos
}

interface ProductRates {
  customerId: string;
  postalCodeOrigin: string;
  postalCodeDestination: string;
  deliveredType: DeliveredType;
  dimensions: ProductDimensions[];
}
```

## Respuestas de la API

### Cotización de Envío

```typescript
interface ResponseRates {
  message: string;
  customerId: string;
  validTo: Date;
  rates: Rate[];
}

interface Rate {
  deliveredType: DeliveredType;
  productType: ProductType;
  productName: string;
  price: number;
  deliveryTimeMin: string;
  deliveryTimeMax: string;
}
```

## Contribución

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría realizar.

## Licencia

MIT

## Autor

[Yamil Lazzari](https://github.com/yamillazzari)
