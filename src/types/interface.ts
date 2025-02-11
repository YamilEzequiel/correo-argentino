import { DeliveredType, Environment, ProductType } from "./enum";

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
