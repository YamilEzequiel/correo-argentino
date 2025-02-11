import { DeliveredType, Environment } from "../types/enum";
import { InitializeMiCorreoWithCustomerId, ProductRates } from "../types/interface";
import CorreoArgentinoApi from "./index";

/**
 * Función principal que muestra un ejemplo de uso de la API de MiCorreo
 * @returns {void}
 */
async function main() {
  /**
   * Inicializamos la API
   */
  const correoApi = new CorreoArgentinoApi();

  const email = "";
  const password = "";
  const userToken = "";
  const passwordToken = "";
  const environment = Environment.PROD;
  const customerId = "";

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

  } catch (error) {
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
    const data: InitializeMiCorreoWithCustomerId = {
      userToken: userToken,
      passwordToken: passwordToken,
      customerId: customerId,
      environment: environment,
    };
    //await correoApi.initializeWithCustomerId(data);
  } catch (error) {
    console.error("Error al inicializar:", error);
  }

  /**
   * Obtener el costo de envio de un paquete
   * Puedes enviar un array de productos o un solo producto
   * @returns {void}
   * @throws {Error} Si ocurre un error al obtener las tarifas
   */
  const data: ProductRates = {
    dimensions: [{ length: 10, width: 10, height: 10, weight: 100, quantity: 1 }],
    customerId: correoApi.getVarCustomerId(),
    postalCodeOrigin: "2000",
    postalCodeDestination: "2000",
    deliveredType: DeliveredType.D,
  };
  const responseCost = await correoApi.getRates(data);
  console.log(responseCost);
}

main();
