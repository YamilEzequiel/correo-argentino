"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const enum_1 = require("../types/enum");
const index_1 = __importDefault(require("./index"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**
 * Función principal que muestra un ejemplo de uso de la API de MiCorreo
 * @returns {void}
 */
async function main() {
    /**
     * Inicializamos la API
     */
    const correoApi = new index_1.default();
    const email = process.env.EMAIL || "";
    const password = process.env.PASSWORD || "";
    const userToken = process.env.USER_TOKEN || "";
    const passwordToken = process.env.PASSWORD_TOKEN || "";
    const environment = process.env.ENVIRONMENT || enum_1.Environment.PROD;
    const customerId = process.env.CUSTOMER_ID || "";
    /**
     * Tenemos dos formas de inicializar la API
     * 1. Inicializar la API con las credenciales del usuario
     * Este es el caso mas comun, ya que se necesita el customerId
     * 2. Inicializar la API con el customerId ya existente
     * Este es el caso en el que ya tienes el customerId y no necesitas las credenciales del usuario
     */
    /**
     * Inicializamos la API con las credenciales del usuario en el entorno de pruebas
     * Esta configuración es necesaria para poder usar la API sin tener el customerId
     * @returns {void}
     * @throws {Error} Si ocurre un error al inicializar la API
     * Se recomienda inicializar la API con las variables en un archivo de configuración .env
     */
    try {
        // Inicializamos con las credenciales
        await correoApi.initializeAll({
            userToken: userToken,
            passwordToken: passwordToken,
            email: email,
            password: password,
            environment: environment,
        });
    }
    catch (error) {
        console.error("Error al inicializar:", error);
    }
    /**
     * Inicializar la api solo con userToken y passwordToken
     * Esto significa que ya tienes el customerId configurado
     * Por lo cual el email y password no son necesarios
     * @returns {void}
     * @throws {Error} Si ocurre un error al inicializar la API
     */
    try {
        const data = {
            userToken: userToken,
            passwordToken: passwordToken,
            customerId: customerId,
            environment: environment,
        };
        //await correoApi.initializeWithCustomerId(data);
    }
    catch (error) {
        console.error("Error al inicializar:", error);
    }
    /**
     * Obtener el costo de envio de un paquete
     * Puedes enviar un array de productos o un solo producto
     * @returns {ResponseUserRegister}
     * @throws {Error} Si ocurre un error al obtener las tarifas
     */
    const data = {
        dimensions: [{ length: 10, width: 10, height: 10, weight: 100, quantity: 1 }],
        customerId: correoApi.getVarCustomerId(),
        postalCodeOrigin: "2000",
        postalCodeDestination: "2000",
        deliveredType: enum_1.DeliveredType.D,
    };
    const responseCost = await correoApi.getRates(data);
    console.log(responseCost);
    /**
     * Registrar un nuevo usuario
     */
    const dataUser = {
        email: "test@test.com",
        password: "123456",
        firstName: "Test",
        lastName: "Test",
        documentType: enum_1.DocumentType.DNI,
        documentId: "12345678",
        phone: "444555666",
        cellPhone: "1234567890",
        address: {
            streetName: "Test",
            streetNumber: "123",
            floor: "1",
            apartment: "1",
            locality: "Test",
            city: "Test",
            provinceCode: "B",
            postalCode: "B1234",
        },
    };
    const responseUser = await correoApi.userRegister(dataUser);
    console.log(responseUser);
    /**
     * Obtener las agencias de envío
     */
    const responseAgencies = await correoApi.getAgencies(enum_1.ProvinceCode["Ciudad Autónoma de Buenos Aires"]);
    console.log(responseAgencies);
}
main();
