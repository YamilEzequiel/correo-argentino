import axios from "axios";
import { URL_PROD, URL_TEST } from "../setting/enviroment";
import { Environment, FunctionMethod, ProvinceCode } from "../types/enum";
import type {
  InitializeMiCorreo,
  InitializeMiCorreoWithCustomerId,
  ProductDimensions,
  ProductRates,
  ResponseAgencies,
  ResponseAuthToken,
  ResponseCustomerId,
  ResponseGenerateBasicAuth,
  ResponseRates,
  ResponseUserRegister,
  UserRegister,
} from "../types/interface";

export default class CorreoArgentinoApi {
  private api: any;
  private userToken: string;
  private passwordToken: string;
  private email: string;
  private password: string;
  private token: string;
  private customerId: string;
  private environment: string;
  /**
   * Constructor de la clase CorreoArgentinoApi
   * @returns {void}
   */
  constructor() {
    /**
     * Inicializa las variables necesarias para la API
     * @type {string}
     * @default ""
     * @example
     * this.userToken = ""; // Token de usuario de MiCorreo
     * this.passwordToken = ""; // Token de contraseña de MiCorreo
     * this.email = ""; // Email del usuario de MiCorreo
     * this.password = ""; // Password del usuario de MiCorreo
     * this.customerId = ""; // CustomerId del usuario de MiCorreo (Opcional) obtenido en el método getCustomerId
     * this.token = ""; // Token de autenticación de MiCorreo obtenido en el método authToken
     */
    this.userToken = "";
    this.passwordToken = "";
    this.email = "";
    this.password = "";
    this.customerId = "";
    this.token = "";
    this.environment = Environment.PROD;
  }

  /**
   * Inicializa la API sin CustomerId este se obtiene en el método getCustomerId
   * Por lo cual debes enviar email y password del usuario de MiCorreo
   * @param {InitializeMiCorreo} data - Datos necesarios para inicializar la API
   * @returns {Promise<void>}
   */
  async initializeAll(data: InitializeMiCorreo): Promise<void> {
    const { userToken, passwordToken, email, password, environment } = data;
    if (!userToken || !passwordToken || !email || !password) {
      throw new Error("UserToken, PasswordToken, Email y Password son requeridos");
    }

    this.userToken = userToken;
    this.passwordToken = passwordToken;
    this.email = email;
    this.password = password;

    this.setEnvironment(environment);

    await this.generateBasicAuth(true);
  }

  /**
   * Inicializa la API con un CustomerId ya existente
   * @param data - Datos necesarios para inicializar la API
   * @returns {Promise<void>}
   */
  async initializeWithCustomerId(data: InitializeMiCorreoWithCustomerId): Promise<void> {
    const { userToken, passwordToken, customerId, environment } = data;
    if (!userToken || !passwordToken || !customerId) {
      throw new Error(" UserToken, PasswordToken y CustomerId son requeridos");
    }

    this.userToken = userToken;
    this.passwordToken = passwordToken;
    this.customerId = customerId;

    this.setEnvironment(environment);

    await this.generateBasicAuth(false);
  }

  /**
   * Genera el token de autenticación y obtiene el CustomerId si es necesario
   * @param needCustomerId - Indica si se necesita obtener el CustomerId
   * @returns {Promise<{ message: string; customerId: string }>}
   */
  private async generateBasicAuth(needCustomerId: boolean = false): Promise<ResponseGenerateBasicAuth> {
    try {
      if (!this.userToken || !this.passwordToken) {
        throw new Error("UserToken y PasswordToken no inicializados");
      }

      await this.authToken();

      if (needCustomerId) {
        await this.getCustomerId(this.email, this.password);
      }

      return {
        message: "Autenticación exitosa",
        customerId: this.customerId,
        token: this.token,
      };
    } catch (error) {
      throw this.errorCapture(error, FunctionMethod.generateBasicAuth);
    }
  }

  /**
   * Obtiene el token de autenticación para la API mediante el userToken y passwordToken
   * @returns {Promise<ResponseAuthToken>}
   */
  private async authToken(): Promise<ResponseAuthToken> {
    try {
      const { data } = await this.api.post("/token");

      if (!data.token) {
        throw new Error("Token no disponible en la respuesta");
      }
      this.token = data.token;

      console.log("🔑 Token obtenido correctamente:", this.token);

      // Actualizamos los headers para todas las llamadas futuras
      this.api.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;

      // Recreamos la instancia de axios con los nuevos headers
      const basicAuth = Buffer.from(`${this.userToken}:${this.passwordToken}`).toString("base64");
      this.api = axios.create({
        baseURL: this.environment === Environment.PROD ? URL_PROD : URL_TEST,
        headers: {
          Authorization: `Bearer ${this.token}`,
          Basic: basicAuth,
          "Content-Type": "application/json",
        },
      });

      return data;
    } catch (error: any) {
      throw this.errorCapture(error, FunctionMethod.authToken);
    }
  }

  /**
   * Obtiene el CustomerId
   * @param email - Email del usuario de MiCorreo
   * @param password - Password del usuario de MiCorreo
   * @returns {Promise<ResponseCustomerId>}
   */
  public async getCustomerId(email: string, password: string): Promise<ResponseCustomerId> {
    try {
      if (!this.token) {
        throw new Error("Token no disponible");
      }

      // Aseguramos que los headers estén correctamente configurados
      const basicAuth = Buffer.from(`${this.userToken}:${this.passwordToken}`).toString("base64");
      const headers = {
        Authorization: `Bearer ${this.token}`,
        Basic: basicAuth,
        "Content-Type": "application/json",
      };

      const dataSend = {
        email,
        password,
      };

      const { data } = await this.api.post(`/users/validate`, dataSend, { headers });

      this.customerId = data.customerId;

      if (!this.customerId) {
        throw new Error("CustomerId no disponible en la respuesta");
      }

      console.log("🆔 CustomerId generado correctamente");

      return data;
    } catch (error: any) {
      throw this.errorCapture(error, FunctionMethod.userValidate);
    }
  }

  /**
   * Obtiene las tarifas de envío
   * @param ProductRates - Datos necesarios para obtener las tarifas de envío
   * @returns {Promise<ResponseRates>}
   */
  public async getRates(data: ProductRates): Promise<ResponseRates> {
    /**
     * Calcula el peso total de todos los items considerando su cantidad
     * @param data.dimensions - Array de dimensiones de productos
     * @returns {number} Peso total en gramos
     * @example
     * Para un array con un item de 500g y cantidad 2
     * El resultado será 1000g (500g * 2)
     */

    /**
     * Calcula las dimensiones máximas de la caja que contiene los productos
     * @param data.dimensions - Array de dimensiones de productos
     * @returns {Object} Dimensiones máximas de la caja
     * @example
     * Para un array con un item de 50x30x20cm y cantidad 2
     * El resultado será { length: 100, width: 60, height: 40 }
     */
    const totalWeight: number = data.dimensions.reduce((sum, item: ProductDimensions) => sum + item.weight * (item.quantity || 1), 0);

    /**
     * Si no se envía el largo, ancho y alto, se toma el largo, ancho y alto del primer item
     * o se toma 1cm, 1cm y 1cm respectivamente
     * Si no se envía el peso, se toma 1gr
     * Si envias dimenciones superiores a 150cm el sistema no acepta el envío y genera un error
     */
    const containerDimensions = data.dimensions.reduce(
      (acc, item: ProductDimensions) => {
        return {
          length: Math.max(acc.length, item.length * (item.quantity || 1)),
          width: Math.max(acc.width, item.width || 1),
          height: acc.height + item.height * (item.quantity || 1),
        };
      },
      { length: 1, width: 1, height: 1 }
    );

    /**
     * Se envía el peso total, el largo, ancho y alto de la caja que contiene los productos
     * Si no se envía el peso, se toma 1gr
     * Si envias dimenciones superiores a 150cm el sistema no acepta el envío y genera un error
     */

    const payload: ProductRates | any = {
      ...data,
      dimensions: {
        weight: totalWeight || 1,
        length: containerDimensions.length || 1,
        width: containerDimensions.width || 1,
        height: containerDimensions.height || 1,
      },
    };

    console.log("🔍 Payload:", payload);

    try {
      const { data } = await this.api.post("/rates", payload);
      return data;
    } catch (error: any) {
      throw this.errorCapture(error, FunctionMethod.rates);
    }
  }

  /**
   * Cambia el entorno de la API
   * @param environment - Entorno a cambiar
   * @returns {void}
   */
  public setEnvironment(environment: Environment): void {
    this.environment = environment;
    const url = environment === Environment.PROD ? URL_PROD : URL_TEST;

    const basicAuth = Buffer.from(`${this.userToken}:${this.passwordToken}`).toString("base64");

    this.api = axios.create({
      baseURL: url,
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      },
    });

    console.log("🌍 Entorno cambiado a:", url);

    console.log("✅ API inicializada correctamente");
  }

  /**
   *Registra un nuevo usuario en la plataforma MiCorreo. Hay dos tipos de alta de usuario posibles, consumidor
   * final o con CUIT, para monotributistas o responsables inscriptos.
   * @param UserRegister - Datos necesarios para registrar un usuario
   * @returns {Promise<ResponseUserRegister>}
   */
  async userRegister(dataUser: UserRegister): Promise<ResponseUserRegister> {
    try {
      const { data } = await this.api.post("/register", dataUser);
      return data;
    } catch (error: any) {
      throw this.errorCapture(error, FunctionMethod.userRegister);
    }
  }

  /**
   * Obtiene las agencias de envío
   * @param provinceCode - Código de la provincia
   * @param customerId - CustomerId del usuario de MiCorreo auto
   * @returns {Promise<ResponseAgencies>}
   */
  async getAgencies(provinceCode: ProvinceCode): Promise<ResponseAgencies> {
    try {
      const { data } = await this.api.get(`/agencies/provinceCode=${provinceCode}&customerId=${this.customerId}`);
      return data;
    } catch (error: any) {
      throw this.errorCapture(error, FunctionMethod.agencies);
    }
  }

  /**
   * Captura el error y lo lanza con un mensaje de error personalizado
   * @param error - Error capturado
   * @param module - Módulo donde se produjo el error
   * @returns {void}
   */
  errorCapture(error: any, module: FunctionMethod): void {
    const { code, message } = error.response?.data || { code: "Código desconocido", message: "Mensaje desconocido" };
    throw new Error(`🔴 Error en ${module}: ${code} - ${message}`);
  }

  /**
   * Obtiene el CustomerId
   * @returns {string} CustomerId
   */
  public getVarCustomerId(): string {
    return this.customerId;
  }

  /**
   * Obtiene el token de autenticación
   * @returns {string} Token
   */
  public getVarToken(): string {
    return this.token;
  }

  /**
   * Obtiene el email del usuario de MiCorreo
   * @returns {string} Email
   */
  public getVarEmail(): string {
    return this.email;
  }

  /**
   * Obtiene el password del usuario de MiCorreo
   * @returns {string} Password
   */
  public getVarPassword(): string {
    return this.password;
  }

  /**
   * Obtiene el userToken
   * @returns {string} UserToken
   */
  public getVarUserToken(): string {
    return this.userToken;
  }

  /**
   * Obtiene el passwordToken
   * @returns {string} PasswordToken
   */
  public getVarPasswordToken(): string {
    return this.passwordToken;
  }

  /**
   * Obtiene el environment
   * @returns {string} Environment
   */
  public getVarEnvironment(): string {
    return this.environment;
  }
}

export { CorreoArgentinoApi };
