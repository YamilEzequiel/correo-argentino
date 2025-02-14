# Correo Argentino API Client

> ⚠️ **AVISO**: Esta librería está en desarrollo activo y aún no está finalizada. Algunas funcionalidades podrían cambiar o estar incompletas. 

Cliente API no oficial para integrar los servicios de Correo Argentino en aplicaciones Node.js.

## Estado de Endpoints

- 🟩 register [POST] - Registro de usuario en MiCorreo
- 🟩 token [POST] - Obtención de token de autenticación
- 🟩 users/validate [POST] - Validación y obtención de customerId
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

Hay dos formas de inicializar la API:

### 1. Inicialización Completa (Recomendada)

Para cuando no se tiene el customerId previamente:

```typescript
import CorreoArgentinoApi from "ylazzari-correoargentino";
import { Environment } from "ylazzari-correoargentino/enums";

// Opcional
import { Environment } from 'ylazzari-correoargentino/dist/types/enum';

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

Para cuando ya se tiene el customerId:

```typescript
import CorreoArgentinoApi from "ylazzari-correoargentino";
import { Environment } from "ylazzari-correoargentino/enums";

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
const usuario = await correoApi.userRegister({
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

### 2. Obtención de CustomerId (users/validate)

```typescript
const customerId = await correoApi.getCustomerId("email@ejemplo.com", "password");
```

### 3. Cotización de Envío (rates)

```typescript
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
const agencias = await correoApi.getAgencies(ProvinceCode["Ciudad Autónoma de Buenos Aires"]);
```

## Getters Disponibles

La API proporciona varios métodos getter para acceder a la información actual:

```typescript
// Obtener el CustomerId actual
const customerId = correoApi.getVarCustomerId();

// Obtener el token de autenticación actual
const token = correoApi.getVarToken();

// Obtener el email configurado
const email = correoApi.getVarEmail();

// Obtener el password configurado
const password = correoApi.getVarPassword();

// Obtener el userToken configurado
const userToken = correoApi.getVarUserToken();

// Obtener el passwordToken configurado
const passwordToken = correoApi.getVarPasswordToken();

// Obtener el environment actual
const environment = correoApi.getVarEnvironment();
```

## Enumeraciones

### Environment
```typescript
enum Environment {
  PROD = "PROD",
  TEST = "TEST"
}
```

### DeliveredType
```typescript
enum DeliveredType {
  D = "D", // Entrega a domicilio
  S = "S"  // Entrega en sucursal
}
```

### ProductType
```typescript
enum ProductType {
  CP = "CP", // Paquete
  EP = "EP"  // Envío de encomienda
}
```

### DocumentType
```typescript
enum DocumentType {
  DNI = "DNI",
  CUIT = "CUIT"
}
```

### AgencyStatus
```typescript
enum AgencyStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE"
}
```

### ProvinceCode
```typescript
enum ProvinceCode {
  "Salta" = "A",
  "Provincia de Buenos Aires" = "B",
  "Ciudad Autónoma de Buenos Aires" = "C",
  "San Luis" = "D",
  "Entre Ríos" = "E",
  // ... y más provincias
}
```

## Interfaces Principales

### ProductDimensions
```typescript
interface ProductDimensions {
  weight: number;    // Peso en gramos (máx 25000)
  height: number;    // Alto en cm (máx 150)
  width: number;     // Ancho en cm (máx 150)
  length: number;    // Largo en cm (máx 150)
  quantity?: number; // Cantidad de productos
}
```

### Address
```typescript
interface Address {
  streetName: string;    // Nombre de la calle
  streetNumber: string;  // Número
  floor: string;         // Piso
  apartment: string;     // Departamento
  locality: string;      // Localidad
  city: string;         // Ciudad
  provinceCode: string; // Código de provincia
  postalCode: string;   // Código postal
}
```

### UserRegister
```typescript
interface UserRegister {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  documentType: DocumentType;
  documentId: string;
  phone: string;
  cellPhone: string;
  address: Address;
}
```

### ProductRates
```typescript
interface ProductRates {
  customerId: string;
  postalCodeOrigin: string;
  postalCodeDestination: string;
  deliveredType: DeliveredType;
  dimensions: ProductDimensions[];
}
```

### Agency
```typescript
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
```

### ResponseRates
```typescript
interface ResponseRates {
  message: string;
  customerId: string;
  validTo: Date;
  rates: Rate[];
}
```

### Rate
```typescript
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

[Yamil Lazzari](https://github.com/YamilEzequiel)
