# Correo Argentino API Client

> ⚠️ **AVISO**: Esta librería está en desarrollo activo y aún no está finalizada. Algunas funcionalidades podrían cambiar o estar incompletas.

Cliente API no oficial para integrar los servicios de Correo Argentino en aplicaciones Node.js.

## Estado de Endpoints

- 🟩 register [POST] - Registro de usuario en MiCorreo
- 🟩 users/validate [POST] - Validación de usuario existente
- 🟩 rates [POST] - Cotización de envíos
- 🟩 agencies [GET] - Consulta de sucursales por provincia
- 🟨 shipping/import [POST] - Importación de envíos (pendiente)

## Instalación

```bash
npm install ylazzari-correoargentino
```

## Configuración Inicial

### Obtener Credenciales

1. Solicitar token de acceso a través del [formulario de Correo Argentino](https://www.correoargentino.com.ar/MiCorreo/public/contact)
2. Referencias útiles:
   - [Documentación oficial](https://www.correoargentino.com.ar/MiCorreo/public/img/pag/apiMiCorreo.pdf)
   - [Web Mi Correo](https://www.correoargentino.com.ar/MiCorreo/public/)

### URLs de la API
- TEST: https://apitest.correoargentino.com.ar/micorreo/v1
- PROD: https://api.correoargentino.com.ar/micorreo/v1

## Inicialización

### 1. Inicialización Completa (Recomendada)

Útil cuando no se tiene el customerId previamente:

```typescript
import CorreoArgentinoApi from 'ylazzari-correoargentino';

const correoApi = new CorreoArgentinoApi();
await correoApi.initializeAll({
  userToken: "YOUR_USER_TOKEN",
  passwordToken: "YOUR_PASSWORD_TOKEN",
  email: "your@email.com",
  password: "your_password",
  environment: Environment.PROD,
});
```

### 2. Inicialización con CustomerId

Útil cuando se tiene el customerId previamente:

```typescript
import { CorreoArgentinoApi, Environment } from "correo-argentino-api";

const correoApi = new CorreoArgentinoApi();
await correoApi.initializeWithCustomerId({
  userToken: "YOUR_USER_TOKEN",
  passwordToken: "YOUR_PASSWORD_TOKEN",
  customerId: "YOUR_CUSTOMER_ID",
  environment: Environment.PROD,
});
```

## Métodos Disponibles

### 1. Registro de Usuario (register)

```typescript
// Parámetros de entrada
interface UserRegister {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  documentType: DocumentType.DNI | DocumentType.CUIT;
  documentId: string;
  phone: string;
  cellPhone: string;
  address: Address;
}

// Respuesta exitosa
interface ResponseUserRegister {
  createdAt: string;
  customerId: string;
}

// Ejemplo de uso
const usuario = await correoApi.register({
  firstName: "Nombre",
  lastName: "Apellido",
  email: "email@ejemplo.com",
  password: "contraseña",
  documentType: DocumentType.DNI,
  documentId: "32471960",
  phone: "1165446544",
  cellPhone: "1165446544",
  address: {
    streetName: "Nombre Calle",
    streetNumber: "123",
    floor: "1",
    apartment: "A",
    locality: "Localidad",
    city: "Ciudad",
    provinceCode: "B",
    postalCode: "1234"
  }
});
```

### 2. Validación de Usuario (users/validate)

```typescript
// Respuesta
interface ResponseCustomerId {
  customerId: string;
  createdAt: Date;
}

// Ejemplo de uso
const validacion = await correoApi.validateUser();
```

### 3. Cotización de Envío (rates)

```typescript
// Parámetros de entrada
interface ProductRates {
  customerId: string;
  postalCodeOrigin: string;
  postalCodeDestination: string;
  deliveredType: DeliveredType;
  dimensions: ProductDimensions[];
}

interface ProductDimensions {
  weight: number;    // gramos (máx 25000)
  height: number;    // cm (máx 150)
  width: number;     // cm (máx 150)
  length: number;    // cm (máx 150)
  quantity?: number;
}

// Respuesta
interface ResponseRates {
  message: string;
  customerId: string;
  validTo: Date;
  rates: Rate[];
}

// Ejemplo de uso
const cotizacion = await correoApi.getRates({
  customerId: correoApi.getVarCustomerId(),
  postalCodeOrigin: "2000",
  postalCodeDestination: "2000",
  deliveredType: DeliveredType.D,
  dimensions: [{
    weight: 100,
    height: 10,
    width: 10,
    length: 10,
    quantity: 1
  }]
});
```

### 4. Consulta de Agencias (agencies)

```typescript
// Respuesta
interface ResponseAgencies {
  agencies: Agency[];
}

interface Agency {
  code: string;
  name: string;
  manager: string;
  email: string;
  phone: string;
  services: AgencyServices;
  location: AgencyLocation;
  hours: WeeklySchedule;
  status: AgencyStatus;
}

// Ejemplo de uso
const agencias = await correoApi.getAgencies("B"); // Código de provincia
```

## Enumeraciones

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
  CP = "CP", // Paquete
  EP = "EP"  // Envío de encomienda
}

enum DocumentType {
  DNI = "DNI",
  CUIT = "CUIT"
}

enum AgencyStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE"
}
```

## Contribución

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría realizar.

## Licencia

MIT

## Autor

[Yamil Lazzari](https://github.com/YamilEzequiel)
