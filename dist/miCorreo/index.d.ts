import { Environment, FunctionMethod, ProvinceCode } from "../types/enum";
import type { InitializeMiCorreo, InitializeMiCorreoWithCustomerId, ProductRates, ResponseAgencies, ResponseCustomerId, ResponseRates, ResponseUserRegister, UserRegister } from "../types/interface";
export default class CorreoArgentinoApi {
    private api;
    private userToken;
    private passwordToken;
    private email;
    private password;
    private token;
    private customerId;
    private environment;
    /**
     * Constructor de la clase CorreoArgentinoApi
     * @returns {void}
     */
    constructor();
    /**
     * Inicializa la API sin CustomerId este se obtiene en el método getCustomerId
     * Por lo cual debes enviar email y password del usuario de MiCorreo
     * @param {InitializeMiCorreo} data - Datos necesarios para inicializar la API
     * @returns {Promise<void>}
     */
    initializeAll(data: InitializeMiCorreo): Promise<void>;
    /**
     * Inicializa la API con un CustomerId ya existente
     * @param data - Datos necesarios para inicializar la API
     * @returns {Promise<void>}
     */
    initializeWithCustomerId(data: InitializeMiCorreoWithCustomerId): Promise<void>;
    /**
     * Genera el token de autenticación y obtiene el CustomerId si es necesario
     * @param needCustomerId - Indica si se necesita obtener el CustomerId
     * @returns {Promise<{ message: string; customerId: string }>}
     */
    private generateBasicAuth;
    /**
     * Obtiene el token de autenticación para la API mediante el userToken y passwordToken
     * @returns {Promise<ResponseAuthToken>}
     */
    private authToken;
    /**
     * Obtiene el CustomerId
     * @param email - Email del usuario de MiCorreo
     * @param password - Password del usuario de MiCorreo
     * @returns {Promise<ResponseCustomerId>}
     */
    getCustomerId(email: string, password: string): Promise<ResponseCustomerId>;
    /**
     * Obtiene las tarifas de envío
     * @param ProductRates - Datos necesarios para obtener las tarifas de envío
     * @returns {Promise<ResponseRates>}
     */
    getRates(data: ProductRates): Promise<ResponseRates>;
    /**
     * Cambia el entorno de la API
     * @param environment - Entorno a cambiar
     * @returns {void}
     */
    setEnvironment(environment: Environment): void;
    /**
     *Registra un nuevo usuario en la plataforma MiCorreo. Hay dos tipos de alta de usuario posibles, consumidor
     * final o con CUIT, para monotributistas o responsables inscriptos.
     * @param UserRegister - Datos necesarios para registrar un usuario
     * @returns {Promise<ResponseUserRegister>}
     */
    userRegister(dataUser: UserRegister): Promise<ResponseUserRegister>;
    /**
     * Obtiene las agencias de envío
     * @param provinceCode - Código de la provincia
     * @param customerId - CustomerId del usuario de MiCorreo auto
     * @returns {Promise<ResponseAgencies>}
     */
    getAgencies(provinceCode: ProvinceCode): Promise<ResponseAgencies>;
    /**
     * Captura el error y lo lanza con un mensaje de error personalizado
     * @param error - Error capturado
     * @param module - Módulo donde se produjo el error
     * @returns {void}
     */
    errorCapture(error: any, module: FunctionMethod): void;
    /**
     * Obtiene el CustomerId
     * @returns {string} CustomerId
     */
    getVarCustomerId(): string;
    /**
     * Obtiene el token de autenticación
     * @returns {string} Token
     */
    getVarToken(): string;
    /**
     * Obtiene el email del usuario de MiCorreo
     * @returns {string} Email
     */
    getVarEmail(): string;
    /**
     * Obtiene el password del usuario de MiCorreo
     * @returns {string} Password
     */
    getVarPassword(): string;
    /**
     * Obtiene el userToken
     * @returns {string} UserToken
     */
    getVarUserToken(): string;
    /**
     * Obtiene el passwordToken
     * @returns {string} PasswordToken
     */
    getVarPasswordToken(): string;
    /**
     * Obtiene el environment
     * @returns {string} Environment
     */
    getVarEnvironment(): string;
}
export { CorreoArgentinoApi };
