import { Environment, ProvinceCode } from "../types/enum";
import type { CorreoArgentinoOptions, InitializeMiCorreo, InitializeMiCorreoWithCustomerId, ProductRates, ResponseAgencies, ResponseCustomerId, ResponseRates, ResponseShippingImport, ResponseUserRegister, ShippingImport, UserRegister } from "../types/interface";
/**
 * Wrapper de la API de MiCorreo (Correo Argentino).
 *
 * Permite cotizar envíos, registrar usuarios, listar sucursales, y crear
 * órdenes de envío contra la plataforma MiCorreo. Maneja internamente la
 * autenticación HTTP Basic + JWT requerida por la API.
 *
 * @example Inicialización con email/password (sin customerId previo)
 * ```ts
 * import CorreoArgentinoApi from "ylazzari-correoargentino";
 * import { Environment } from "ylazzari-correoargentino/enums";
 *
 * const api = new CorreoArgentinoApi();
 * await api.initializeAll({
 *   userToken: process.env.USER_TOKEN!,
 *   passwordToken: process.env.PASSWORD_TOKEN!,
 *   email: process.env.EMAIL!,
 *   password: process.env.PASSWORD!,
 *   environment: Environment.TEST,
 * });
 * ```
 *
 * @example Inicialización con customerId ya conocido
 * ```ts
 * const api = new CorreoArgentinoApi();
 * await api.initializeWithCustomerId({
 *   userToken: process.env.USER_TOKEN!,
 *   passwordToken: process.env.PASSWORD_TOKEN!,
 *   customerId: "0090000025",
 *   environment: Environment.PROD,
 * });
 * ```
 */
export default class CorreoArgentinoApi {
    private api;
    private userToken;
    private passwordToken;
    private email;
    private password;
    private token;
    private customerId;
    private environment;
    private debug;
    /**
     * Crea una nueva instancia del wrapper.
     *
     * @param options - Configuración opcional.
     * @param options.debug - Si es `true`, imprime logs informativos. Default: `false`.
     *
     * @remarks
     * El constructor NO realiza ninguna llamada de red. Hay que llamar
     * `initializeAll` o `initializeWithCustomerId` antes de usar el resto de
     * métodos.
     */
    constructor(options?: CorreoArgentinoOptions);
    /**
     * Inicializa la API obteniendo el `customerId` a partir de email + password.
     *
     * Flujo: setea ambiente → POST /token (Basic auth) → POST /users/validate (Bearer).
     *
     * @param data - Credenciales y ambiente.
     * @throws Si falta cualquiera de los 4 campos requeridos, o si la
     *   autenticación contra MiCorreo falla.
     */
    initializeAll(data: InitializeMiCorreo): Promise<void>;
    /**
     * Inicializa la API con un `customerId` ya existente.
     *
     * Flujo: setea ambiente → POST /token (Basic auth). NO se llama a
     * `/users/validate` porque el customerId ya está disponible.
     *
     * @param data - userToken, passwordToken, customerId y ambiente.
     * @throws Si falta userToken, passwordToken o customerId, o si /token falla.
     */
    initializeWithCustomerId(data: InitializeMiCorreoWithCustomerId): Promise<void>;
    /**
     * Genera el token JWT y, opcionalmente, recupera el customerId.
     *
     * @param needCustomerId - Si es `true`, llama a /users/validate luego de /token.
     */
    private generateBasicAuth;
    /**
     * POST /token — obtiene el JWT para autenticar las siguientes llamadas.
     *
     * @remarks
     * El header `Authorization: Basic <base64>` ya está configurado en `this.api`
     * por `setEnvironment` (necesario para llamar /token). Tras obtener el JWT,
     * **recreamos la instancia axios completa** con `Authorization: Bearer <jwt>`.
     *
     * Por qué no usamos `defaults.headers.common.Authorization`:
     * cuando `axios.create({ headers: { Authorization: "Basic ..." } })`
     * registra el Authorization en `defaults.headers.Authorization` (path directo,
     * NO en `.common`). Ese tiene mayor precedencia que `headers.common.<X>`
     * en el merge de headers de axios, por lo cual nunca se aplicaría el Bearer.
     * La forma confiable de cambiar el auth scheme entre Basic y Bearer es
     * recrear la instancia.
     */
    private authToken;
    /**
     * POST /users/validate — valida credenciales y devuelve el customerId.
     *
     * @param email - Email registrado en MiCorreo.
     * @param password - Password del usuario.
     * @returns El customerId + fecha de creación del usuario.
     * @throws Si el token JWT no está disponible, o si el server rechaza las credenciales.
     *
     * @remarks
     * Se invoca automáticamente desde `initializeAll`. Llamarlo manualmente solo
     * tiene sentido si querés re-validar credenciales o cambiar de usuario sin
     * recrear la instancia.
     */
    getCustomerId(email: string, password: string): Promise<ResponseCustomerId>;
    /**
     * POST /rates — cotiza un envío.
     *
     * Recibe un array de productos con sus dimensiones individuales y
     * arma un payload con dimensiones agregadas (peso total, contenedor que los
     * apila verticalmente). Si no se pasa `deliveredType`, MiCorreo devuelve
     * cotización para entrega a domicilio Y a sucursal en `rates`.
     *
     * @param data - Datos de la cotización (origen, destino, productos).
     * @returns Las tarifas disponibles + fecha de validez.
     *
     * @remarks
     * **Cálculo de dimensiones del contenedor:**
     * - `weight`: suma de `weight * quantity` de todos los items.
     * - `length`: máximo entre el largo de cada item por su cantidad.
     * - `width`: máximo entre el ancho de los items (sin multiplicar por cantidad).
     * - `height`: suma de `height * quantity` (los items se apilan verticalmente).
     *
     * Si necesitás otro modelo de empaquetado, calculá las dimensiones en tu
     * código y pasá un solo `ProductDimensions` con los valores finales.
     *
     * MiCorreo rechaza dimensiones superiores a 150cm en cualquier eje, o peso
     * superior a 25000g.
     *
     * Si no pasás `customerId` en `data`, se usa el del estado interno
     * (obtenido en la inicialización).
     */
    getRates(data: ProductRates): Promise<ResponseRates>;
    /**
     * Configura el ambiente (PROD o TEST) y recrea la instancia axios.
     *
     * @param environment - `Environment.PROD` o `Environment.TEST`.
     *
     * @remarks
     * Se invoca automáticamente desde `initializeAll` / `initializeWithCustomerId`.
     * Llamarlo manualmente luego de inicializar resetea el JWT — vas a tener
     * que re-inicializar antes de hacer más llamadas.
     */
    setEnvironment(environment: Environment): void;
    /**
     * POST /register — registra un nuevo usuario en MiCorreo.
     *
     * Soporta dos modos de alta:
     * - **Consumidor final** (`documentType: "DNI"`): todos los campos de `address` son obligatorios.
     * - **Empresa / monotributista** (`documentType: "CUIT"`): solo `address` parcial.
     *
     * @param dataUser - Datos del usuario a registrar.
     * @returns customerId y fecha de creación.
     *
     * @remarks
     * MiCorreo NO valida que el email exista o sea real — la validación es
     * responsabilidad del consumer. Si el email ya existe en MiCorreo, el server
     * devuelve `402 "Email existente"`.
     */
    userRegister(dataUser: UserRegister): Promise<ResponseUserRegister>;
    /**
     * GET /agencies — devuelve las sucursales de una provincia.
     *
     * @param provinceCode - Código de provincia (1 letra). Ver enum `ProvinceCode`.
     * @returns Array de agencias con código, dirección, horarios y servicios disponibles.
     *
     * @remarks
     * El customerId usado en la query es el del estado interno de la instancia.
     * Si no inicializaste con un customerId válido, el server devuelve
     * `402 "Customer ID no valido"`.
     */
    getAgencies(provinceCode: ProvinceCode): Promise<ResponseAgencies>;
    /**
     * POST /shipping/import — crea (importa) un envío en MiCorreo.
     *
     * Este es el endpoint que cierra el flujo de operación: cotizás con
     * `getRates`, decidís un producto, y creás la orden con este método.
     *
     * @param data - Datos del envío. Ver {@link ShippingImport}.
     * @returns `{ createdAt }` con la fecha de creación del envío en MiCorreo.
     *
     * @remarks
     * **Validaciones client-side aplicadas:**
     * - `customerId`, `extOrderId`, `recipient.name`, `recipient.email`,
     *   `shipping.deliveryType` son obligatorios.
     * - Si `deliveryType === "S"`: `shipping.agency` es obligatorio (código de sucursal).
     * - Si `deliveryType === "D"`: `shipping.address` con todos sus campos clave es obligatorio.
     *
     * **Idempotencia:** `extOrderId` debe ser único. MiCorreo rechaza con
     * `"La orden ya fue importada con anterioridad"` si lo repetís.
     *
     * **Sender opcional:** si no pasás `sender`, MiCorreo usa el perfil del
     * customerId. Pasalo solo si necesitás overridear el remitente para un envío puntual.
     */
    shippingImport(data: ShippingImport): Promise<ResponseShippingImport>;
    /**
     * Normaliza el error recibido del server y lo re-lanza como `Error` legible.
     *
     * Tipado como `never` para que TypeScript entienda que esta función nunca
     * retorna — el callsite puede dejar el try/catch sin `return` explícito.
     *
     * @internal
     */
    private errorCapture;
    /**
     * Log condicional: solo imprime si el flag `debug` está activo.
     * @internal
     */
    private log;
    /**
     * @returns El customerId actualmente cargado en la instancia.
     */
    getVarCustomerId(): string;
    /**
     * @returns El JWT actualmente cargado en la instancia.
     * @remarks Cuidado al exponerlo: el JWT habilita TODA la cuenta MiCorreo.
     */
    getVarToken(): string;
    /**
     * @returns El email con el que se inicializó la instancia.
     */
    getVarEmail(): string;
    /**
     * @returns El password con el que se inicializó la instancia.
     * @deprecated Devuelve la contraseña en texto plano. Evitá usar este getter;
     *   guardalo en tu propio gestor de secretos en lugar de leerlo desde acá.
     */
    getVarPassword(): string;
    /**
     * @returns El userToken con el que se inicializó la instancia.
     */
    getVarUserToken(): string;
    /**
     * @returns El passwordToken con el que se inicializó la instancia.
     */
    getVarPasswordToken(): string;
    /**
     * @returns El ambiente actual (`"PROD"` o `"TEST"`).
     */
    getVarEnvironment(): string;
}
export { CorreoArgentinoApi };
