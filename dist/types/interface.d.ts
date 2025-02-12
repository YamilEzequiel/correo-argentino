import { AgencyStatus, DeliveredType, DocumentType, Environment, ProductType } from "./enum";
/**
 * Interfaz que define la respuesta exitosa de autenticación
 */
export interface ResponseAuthToken {
    /**
     * Token de autenticación generado
     */
    token: string;
    /**
     * Fecha de expiración del token
     */
    expires: Date;
}
/**
 * Interfaz que define la respuesta de error en la autenticación
 */
export interface ResponseAuthTokenError {
    /**
     * Código o tipo de error
     */
    error: string;
    /**
     * Mensaje descriptivo del error
     */
    message: string;
}
/**
 * Interfaz que define la respuesta con el ID del cliente
 */
export interface ResponseCustomerId {
    /**
     * Identificador único del cliente
     */
    customerId: string;
    /**
     * Fecha de creación del cliente
     */
    createdAt: Date;
}
/**
 * Interfaz para inicializar MiCorreo con credenciales completas
 */
export interface InitializeMiCorreo {
    /**
     * Token de usuario proporcionado por MiCorreo
     */
    userToken: string;
    /**
     * Token de contraseña proporcionado por MiCorreo
     */
    passwordToken: string;
    /**
     * Correo electrónico del usuario
     */
    email: string;
    /**
     * Contraseña del usuario
     */
    password: string;
    /**
     * Ambiente de ejecución
     * @remarks Puede ser PROD para producción o TEST para pruebas
     */
    environment: Environment.PROD | Environment.TEST;
}
/**
 * Interfaz para inicializar MiCorreo con customerId existente
 */
export interface InitializeMiCorreoWithCustomerId {
    /**
     * Identificador único del cliente existente
     */
    customerId: string;
    /**
     * Ambiente de ejecución
     * @remarks Puede ser PROD para producción o TEST para pruebas
     */
    environment: Environment.PROD | Environment.TEST;
    /**
     * Token de usuario proporcionado por MiCorreo
     */
    userToken: string;
    /**
     * Token de contraseña proporcionado por MiCorreo
     */
    passwordToken: string;
}
/**
 * Interfaz que define las dimensiones y características físicas de un producto
 */
export interface ProductDimensions {
    /**
     * Peso en gramos del envío
     * @minimum 1
     * @maximum 25000
     */
    weight: number;
    /**
     * Alto en centímetros del envío
     * @maximum 150
     */
    height: number;
    /**
     * Ancho en centímetros del envío
     * @maximum 150
     */
    width: number;
    /**
     * Largo en centímetros del envío
     * @maximum 150
     */
    length: number;
    /**
     * Cantidad de productos
     * @minimum 1
     */
    quantity?: number;
}
/**
 * Interfaz que define los datos necesarios para una cotización de envío
 */
export interface ProductRates {
    /**
     * Identificador de usuario de MiCorreo
     */
    customerId: string;
    /**
     * CP de origen del envío a cotizar
     */
    postalCodeOrigin: string;
    /**
     * CP de destino del envío a cotizar
     */
    postalCodeDestination: string;
    /**
     * Tipo de entrega del envío
     * @remarks "D" para entrega a domicilio, "S" para entrega en sucursal
     */
    deliveredType: DeliveredType.D | DeliveredType.S;
    /**
     * Dimensiones de los productos a cotizar
     */
    dimensions: ProductDimensions[];
}
/**
 * Interfaz que define la respuesta de la autenticación básica
 */
export interface ResponseGenerateBasicAuth {
    /**
     * Mensaje descriptivo de la respuesta
     */
    message: string;
    /**
     * Identificador único del cliente
     */
    customerId: string;
    /**
     * Token de autenticación
     */
    token: string;
}
/**
 * Interfaz que define la respuesta de la cotización de envío
 */
export interface ResponseRates {
    /**
     * Mensaje descriptivo de la respuesta
     */
    message: string;
    /**
     * Identificador único del cliente
     */
    customerId: string;
    /**
     * Fecha de expiración del token
     */
    validTo: Date;
    /**
     * Tarifas disponibles
     */
    rates: Rate[];
}
/**
 * Interfaz que define la respuesta de la tarifa de envío
 */
export interface Rate {
    /**
     * Tipo de entrega del envío
     */
    deliveredType: DeliveredType.D | DeliveredType.S;
    /**
     * Tipo de producto del envío
     */
    productType: ProductType.CP | ProductType.EP;
    /**
     * Nombre del producto
     */
    productName: string;
    /**
     * Precio del producto
     */
    price: number;
    /**
     * Tiempo de entrega mínimo
     */
    deliveryTimeMin: string;
    /**
     * Tiempo de entrega máximo
     */
    deliveryTimeMax: string;
}
/**
 * Interfaz que define los datos necesarios para registrar un usuario con DNI
 * @example
 * {
 *   "firstName": "Yamil",
 *   "lastName": "Lazzari",
 *   "email": "yamillazzari@gmail.com",
 *   "password": "123456",
 *   "documentType": "DNI",
 *   "documentId": "32471960",
 *   "phone": "1165446544",
 *   "cellPhone": "1165446544",
 *   "address": {
 *     "streetName": "Vicente Lopez",
 *     "streetNumber": "448",
 *     "floor": "1",
 *     "apartment": "D",
 *     "locality": "Monte Grande",
 *     "city": "Esteban Echeverria",
 *     "provinceCode": "B",
 *     "postalCode": "B1842ZAB"
 *   }
 * }
 */
export interface UserRegister {
    /**
     * Nombre del usuario
     */
    firstName: string;
    /**
     * Apellido del usuario
     */
    lastName: string;
    /**
     * Correo electrónico del usuario
     */
    email: string;
    /**
     * Contraseña del usuario
     */
    password: string;
    /**
     * Tipo de documento del usuario
     */
    documentType: DocumentType.DNI | DocumentType.CUIT;
    /**
     * Número de documento del usuario
     */
    documentId: string;
    /**
     * Teléfono del usuario
     */
    phone: string;
    /**
     * Celular del usuario
     */
    cellPhone: string;
    /**
     * Dirección del usuario
     */
    address: Address;
}
/**
 * Interfaz que define la dirección del usuario
 * @example
 * {
 *   "streetName": "Vicente Lopez",
 *   "streetNumber": "448",
 *   "floor": "1",
 *   "apartment": "D",
 *   "locality": "Monte Grande",
 *   "city": "Esteban Echeverria",
 *   "provinceCode": "B",
 *   "postalCode": "B1842ZAB"
 * }
 */
export interface Address {
    /**
     * Nombre de la calle
     */
    streetName: string;
    /**
     * Número de la calle
     */
    streetNumber: string;
    /**
     * Piso
     */
    floor: string;
    /**
     * Departamento
     */
    apartment: string;
    /**
     * Localidad
     */
    locality: string;
    /**
     * Ciudad
     */
    city: string;
    /**
     * Código de provincia
     */
    provinceCode: string;
    /**
     * Código postal
     */
    postalCode: string;
}
/**
 * Interfaz que define la respuesta de la creación de un usuario
 */
export interface ResponseUserRegister {
    /**
     * Fecha de creación del usuario
     */
    createdAt: string;
    /**
     * Identificador único del cliente
     */
    customerId: string;
}
/**
 * Interfaz que define la respuesta de la creación de un usuario
 */
export interface ResponseUserRegisterError {
    /**
     * Mensaje descriptivo del error
     */
    message: string;
    /**
     * Código del error
     */
    code: string;
}
/**
 * Interfaz que define los horarios de atención
 */
export interface BusinessHours {
    start: string;
    end: string;
}
/**
 * Interfaz que define los horarios semanales
 */
export interface WeeklySchedule {
    sunday: BusinessHours | null;
    monday: BusinessHours | null;
    tuesday: BusinessHours | null;
    wednesday: BusinessHours | null;
    thursday: BusinessHours | null;
    friday: BusinessHours | null;
    saturday: BusinessHours | null;
    holidays: BusinessHours | null;
}
/**
 * Interfaz que define los servicios disponibles
 */
export interface AgencyServices {
    /**
     * Recibo de paquetes
     */
    packageReception: boolean;
    /**
     * Recogida de paquetes
     */
    pickupAvailability: boolean;
}
/**
 * Interfaz que define la ubicación de la agencia
 */
export interface AgencyLocation {
    address: Address;
    latitude: string;
    longitude: string;
}
/**
 * Interfaz que define una agencia
 */
export interface Agency {
    /**
     * Código único de la agencia
     */
    code: string;
    /**
     * Nombre de la agencia
     */
    name: string;
    /**
     * Nombre del gerente
     */
    manager: string;
    /**
     * Correo electrónico de contacto
     */
    email: string;
    /**
     * Teléfono de contacto
     */
    phone: string;
    /**
     * Servicios disponibles
     */
    services: AgencyServices;
    /**
     * Ubicación de la agencia
     */
    location: AgencyLocation;
    /**
     * Horarios de atención
     */
    hours: WeeklySchedule;
    /**
     * Estado de la agencia
     */
    status: AgencyStatus.ACTIVE | AgencyStatus.INACTIVE;
}
/**
 * Interfaz que define la respuesta de las agencias de envío
 */
export interface ResponseAgencies {
    /**
     * Lista de agencias
     */
    agencies: Agency[];
}
