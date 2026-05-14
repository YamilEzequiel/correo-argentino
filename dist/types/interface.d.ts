import { AgencyStatus, DeliveredType, DocumentType, Environment, ProductType } from "./enum";
/**
 * Opciones de configuración de la clase CorreoArgentinoApi.
 */
export interface CorreoArgentinoOptions {
    /**
     * Si es `true`, la librería imprime logs informativos en consola
     * (entorno seteado, customerId obtenido, payloads enviados, etc.).
     *
     * @default false
     * @remarks
     * NUNCA actives `debug` en producción: aunque ya no se logea el JWT,
     * los payloads pueden contener PII (emails, direcciones).
     */
    debug?: boolean;
}
/**
 * Interfaz que define la respuesta exitosa de autenticación
 */
export interface ResponseAuthToken {
    /**
     * Token JWT de autenticación
     */
    token: string;
    /**
     * Fecha de expiración del token (string ISO 8601 con offset).
     * Ejemplo: "2022-04-26 21:16:20"
     */
    expires: string;
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
     * Fecha de creación del cliente (string ISO).
     * Ejemplo: "2021-03-10" o "2022-04-28 12:08:16.847"
     */
    createdAt: string;
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
 * Interfaz que define los datos necesarios para una cotización de envío.
 *
 * @remarks
 * Si se omite `deliveredType`, MiCorreo devuelve cotización para AMBOS tipos
 * de entrega (domicilio y sucursal) en el array `rates` de la respuesta.
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
     * Tipo de entrega del envío (opcional).
     * "D" para entrega a domicilio, "S" para entrega en sucursal.
     * Si se omite, se cotizan ambas modalidades.
     */
    deliveredType?: DeliveredType.D | DeliveredType.S;
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
     * Mensaje descriptivo de la respuesta.
     * @remarks No es parte estándar de la respuesta de MiCorreo, pero se conserva
     * como opcional por compatibilidad con versiones anteriores.
     */
    message?: string;
    /**
     * Identificador único del cliente
     */
    customerId: string;
    /**
     * Fecha hasta la cual la cotización es válida (string ISO 8601 con offset).
     * Ejemplo: "2022-06-07T10:31:27.881-03:00"
     */
    validTo: string;
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
 * Respuesta del endpoint GET /agencies.
 *
 * MiCorreo devuelve un array plano de agencias, no un objeto envolvente.
 * @remarks
 * El tipo previo `{ agencies: Agency[] }` era incorrecto y nunca coincidió
 * con la respuesta real del server. Si tu código usaba `response.agencies`,
 * cambialo a `response` directamente (es el array).
 */
export type ResponseAgencies = Agency[];
/**
 * Dirección utilizada en /shipping/import.
 * A diferencia de Address, no incluye locality (no la requiere MiCorreo en este endpoint).
 */
export interface ShippingAddress {
    /**
     * Nombre de la calle
     */
    streetName: string;
    /**
     * Altura o número de la dirección
     */
    streetNumber: string;
    /**
     * Piso de la dirección (se trunca a 3 caracteres del lado de MiCorreo)
     */
    floor?: string;
    /**
     * Departamento de la dirección (se trunca a 3 caracteres del lado de MiCorreo)
     */
    apartment?: string;
    /**
     * Ciudad de la dirección
     */
    city: string;
    /**
     * Código de la provincia (ver enum ProvinceCode)
     */
    provinceCode: string;
    /**
     * Código Postal de la dirección
     */
    postalCode: string;
}
/**
 * Información del remitente. Todos los campos son opcionales: si no se envía,
 * MiCorreo usa los datos del perfil del customerId.
 */
export interface Sender {
    /**
     * Nombre del remitente
     */
    name?: string | null;
    /**
     * Teléfono del remitente
     */
    phone?: string | null;
    /**
     * Celular del remitente
     */
    cellPhone?: string | null;
    /**
     * Email del remitente
     */
    email?: string | null;
    /**
     * Dirección de origen del remitente. Todos sus campos son opcionales.
     */
    originAddress?: Partial<ShippingAddress> | null;
}
/**
 * Información del destinatario del envío.
 */
export interface Recipient {
    /**
     * Nombre del destinatario (requerido)
     */
    name: string;
    /**
     * Email del destinatario (requerido)
     */
    email: string;
    /**
     * Teléfono del destinatario
     */
    phone?: string;
    /**
     * Celular del destinatario
     */
    cellPhone?: string;
}
/**
 * Información del envío (paquete + tipo de entrega + dirección/sucursal).
 */
export interface ShippingInfo {
    /**
     * Tipo de entrega: "D" para domicilio, "S" para sucursal.
     */
    deliveryType: DeliveredType.D | DeliveredType.S;
    /**
     * Código de sucursal de destino. Requerido cuando deliveryType = "S".
     * Para deliveryType = "D" debe ir null o no enviarse.
     */
    agency?: string | null;
    /**
     * Dirección de entrega. Requerida cuando deliveryType = "D".
     * Para deliveryType = "S" debe ir null o no enviarse.
     */
    address?: ShippingAddress | null;
    /**
     * Peso del envío en gramos (entero).
     */
    weight: number;
    /**
     * Valor declarado del envío.
     */
    declaredValue: number;
    /**
     * Alto en centímetros del envío (entero, máximo 255).
     */
    height: number;
    /**
     * Largo en centímetros del envío (entero, máximo 255).
     */
    length: number;
    /**
     * Ancho en centímetros del envío (entero, máximo 255).
     */
    width: number;
}
/**
 * Body del endpoint POST /shipping/import.
 * Importa un envío a la plataforma MiCorreo.
 */
export interface ShippingImport {
    /**
     * Identificador de usuario de MiCorreo. Requerido.
     */
    customerId: string;
    /**
     * Identificador externo de la orden (tu sistema). Requerido.
     * MiCorreo rechaza con "La orden ya fue importada con anterioridad" si se repite.
     */
    extOrderId: string;
    /**
     * Identificador externo visible en el panel de MiCorreo.
     */
    orderNumber?: string;
    /**
     * Información del remitente. Opcional: si se omite, MiCorreo usa el perfil del customerId.
     */
    sender?: Sender;
    /**
     * Información del destinatario. Requerido.
     */
    recipient: Recipient;
    /**
     * Información del envío. Requerido.
     */
    shipping: ShippingInfo;
}
/**
 * Respuesta del endpoint POST /shipping/import.
 */
export interface ResponseShippingImport {
    /**
     * Fecha de creación del envío en MiCorreo (ISO 8601 con offset).
     * Ejemplo: "2022-06-07T16:15:04.996-03:00"
     */
    createdAt: string;
}
