import axios from "axios";
import { URL_PROD, URL_TEST } from "../setting/enviroment";
import { DeliveredType, Environment, FunctionMethod } from "../types/enum";
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
    constructor(options = {}) {
        var _a;
        this.userToken = "";
        this.passwordToken = "";
        this.email = "";
        this.password = "";
        this.customerId = "";
        this.token = "";
        this.environment = Environment.PROD;
        this.debug = (_a = options.debug) !== null && _a !== void 0 ? _a : false;
    }
    /**
     * Inicializa la API obteniendo el `customerId` a partir de email + password.
     *
     * Flujo: setea ambiente → POST /token (Basic auth) → POST /users/validate (Bearer).
     *
     * @param data - Credenciales y ambiente.
     * @throws Si falta cualquiera de los 4 campos requeridos, o si la
     *   autenticación contra MiCorreo falla.
     */
    async initializeAll(data) {
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
     * Inicializa la API con un `customerId` ya existente.
     *
     * Flujo: setea ambiente → POST /token (Basic auth). NO se llama a
     * `/users/validate` porque el customerId ya está disponible.
     *
     * @param data - userToken, passwordToken, customerId y ambiente.
     * @throws Si falta userToken, passwordToken o customerId, o si /token falla.
     */
    async initializeWithCustomerId(data) {
        const { userToken, passwordToken, customerId, environment } = data;
        if (!userToken || !passwordToken || !customerId) {
            throw new Error("UserToken, PasswordToken y CustomerId son requeridos");
        }
        this.userToken = userToken;
        this.passwordToken = passwordToken;
        this.customerId = customerId;
        this.setEnvironment(environment);
        await this.generateBasicAuth(false);
    }
    /**
     * Genera el token JWT y, opcionalmente, recupera el customerId.
     *
     * @param needCustomerId - Si es `true`, llama a /users/validate luego de /token.
     */
    async generateBasicAuth(needCustomerId = false) {
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
        }
        catch (error) {
            this.errorCapture(error, FunctionMethod.generateBasicAuth);
        }
    }
    /**
     * POST /token — obtiene el JWT para autenticar las siguientes llamadas.
     *
     * @remarks
     * El header `Authorization: Basic <base64>` ya está configurado en `this.api`
     * por `setEnvironment`. Tras obtener el JWT, se actualiza el header default
     * de la instancia axios a `Authorization: Bearer <jwt>` para que todas las
     * llamadas siguientes lo usen automáticamente.
     */
    async authToken() {
        try {
            const { data } = await this.api.post("/token");
            if (!data.token) {
                throw new Error("Token no disponible en la respuesta");
            }
            this.token = data.token;
            this.log("🔑 Token obtenido correctamente");
            // Reemplaza el Basic auth por el Bearer en todas las requests siguientes.
            this.api.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;
            return data;
        }
        catch (error) {
            this.errorCapture(error, FunctionMethod.authToken);
        }
    }
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
    async getCustomerId(email, password) {
        try {
            if (!this.token) {
                throw new Error("Token no disponible. Llamá initializeAll o initializeWithCustomerId primero.");
            }
            const { data } = await this.api.post(`/users/validate`, { email, password });
            this.customerId = data.customerId;
            if (!this.customerId) {
                throw new Error("CustomerId no disponible en la respuesta");
            }
            this.log("🆔 CustomerId obtenido correctamente");
            return data;
        }
        catch (error) {
            this.errorCapture(error, FunctionMethod.userValidate);
        }
    }
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
    async getRates(data) {
        const totalWeight = data.dimensions.reduce((sum, item) => sum + item.weight * (item.quantity || 1), 0);
        const containerDimensions = data.dimensions.reduce((acc, item) => ({
            length: Math.max(acc.length, item.length * (item.quantity || 1)),
            width: Math.max(acc.width, item.width || 1),
            height: acc.height + item.height * (item.quantity || 1),
        }), { length: 1, width: 1, height: 1 });
        const payload = Object.assign(Object.assign({}, data), { customerId: data.customerId || this.customerId, dimensions: {
                weight: totalWeight || 1,
                length: containerDimensions.length || 1,
                width: containerDimensions.width || 1,
                height: containerDimensions.height || 1,
            } });
        this.log("🔍 Payload getRates:", payload);
        try {
            const { data: response } = await this.api.post("/rates", payload);
            return response;
        }
        catch (error) {
            this.errorCapture(error, FunctionMethod.rates);
        }
    }
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
    setEnvironment(environment) {
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
        this.log("🌍 Ambiente configurado:", url);
    }
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
    async userRegister(dataUser) {
        try {
            const { data } = await this.api.post("/register", dataUser);
            return data;
        }
        catch (error) {
            this.errorCapture(error, FunctionMethod.userRegister);
        }
    }
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
    async getAgencies(provinceCode) {
        try {
            const { data } = await this.api.get(`/agencies?provinceCode=${provinceCode}&customerId=${this.customerId}`);
            return data;
        }
        catch (error) {
            this.errorCapture(error, FunctionMethod.agencies);
        }
    }
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
    async shippingImport(data) {
        if (!data.customerId) {
            throw new Error("customerId es requerido");
        }
        if (!data.extOrderId) {
            throw new Error("extOrderId es requerido");
        }
        if (!data.recipient || !data.recipient.name || !data.recipient.email) {
            throw new Error("recipient.name y recipient.email son requeridos");
        }
        if (!data.shipping || !data.shipping.deliveryType) {
            throw new Error("shipping.deliveryType es requerido");
        }
        if (data.shipping.deliveryType === DeliveredType.S && !data.shipping.agency) {
            throw new Error("shipping.agency es requerido cuando deliveryType es 'S' (envío a sucursal)");
        }
        if (data.shipping.deliveryType === DeliveredType.D) {
            const addr = data.shipping.address;
            if (!addr || !addr.streetName || !addr.streetNumber || !addr.city || !addr.provinceCode || !addr.postalCode) {
                throw new Error("shipping.address (streetName, streetNumber, city, provinceCode, postalCode) es requerida cuando deliveryType es 'D' (envío a domicilio)");
            }
        }
        try {
            const { data: response } = await this.api.post("/shipping/import", data);
            return response;
        }
        catch (error) {
            this.errorCapture(error, FunctionMethod.shippingImport);
        }
    }
    /**
     * Normaliza el error recibido del server y lo re-lanza como `Error` legible.
     *
     * Tipado como `never` para que TypeScript entienda que esta función nunca
     * retorna — el callsite puede dejar el try/catch sin `return` explícito.
     *
     * @internal
     */
    errorCapture(error, module) {
        var _a, _b, _c, _d, _e;
        const err = error;
        const responseData = (_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.data;
        const code = (_c = (_b = responseData === null || responseData === void 0 ? void 0 : responseData.code) !== null && _b !== void 0 ? _b : err === null || err === void 0 ? void 0 : err.code) !== null && _c !== void 0 ? _c : "Código desconocido";
        const message = (_e = (_d = responseData === null || responseData === void 0 ? void 0 : responseData.message) !== null && _d !== void 0 ? _d : err === null || err === void 0 ? void 0 : err.message) !== null && _e !== void 0 ? _e : "Mensaje desconocido";
        throw new Error(`🔴 Error en ${module}: ${code} - ${message}`);
    }
    /**
     * Log condicional: solo imprime si el flag `debug` está activo.
     * @internal
     */
    log(...args) {
        if (this.debug) {
            // eslint-disable-next-line no-console
            console.log(...args);
        }
    }
    /**
     * @returns El customerId actualmente cargado en la instancia.
     */
    getVarCustomerId() {
        return this.customerId;
    }
    /**
     * @returns El JWT actualmente cargado en la instancia.
     * @remarks Cuidado al exponerlo: el JWT habilita TODA la cuenta MiCorreo.
     */
    getVarToken() {
        return this.token;
    }
    /**
     * @returns El email con el que se inicializó la instancia.
     */
    getVarEmail() {
        return this.email;
    }
    /**
     * @returns El password con el que se inicializó la instancia.
     * @deprecated Devuelve la contraseña en texto plano. Evitá usar este getter;
     *   guardalo en tu propio gestor de secretos en lugar de leerlo desde acá.
     */
    getVarPassword() {
        return this.password;
    }
    /**
     * @returns El userToken con el que se inicializó la instancia.
     */
    getVarUserToken() {
        return this.userToken;
    }
    /**
     * @returns El passwordToken con el que se inicializó la instancia.
     */
    getVarPasswordToken() {
        return this.passwordToken;
    }
    /**
     * @returns El ambiente actual (`"PROD"` o `"TEST"`).
     */
    getVarEnvironment() {
        return this.environment;
    }
}
export { CorreoArgentinoApi };
