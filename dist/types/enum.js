"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProvinceCode = exports.FunctionMethod = exports.AgencyStatus = exports.DocumentType = exports.ProductType = exports.DeliveredType = exports.Environment = void 0;
var Environment;
(function (Environment) {
    Environment["PROD"] = "PROD";
    Environment["TEST"] = "TEST";
})(Environment || (exports.Environment = Environment = {}));
var DeliveredType;
(function (DeliveredType) {
    DeliveredType["D"] = "D";
    DeliveredType["S"] = "S";
})(DeliveredType || (exports.DeliveredType = DeliveredType = {}));
var ProductType;
(function (ProductType) {
    ProductType["CP"] = "CP";
    ProductType["EP"] = "EP";
})(ProductType || (exports.ProductType = ProductType = {}));
var DocumentType;
(function (DocumentType) {
    DocumentType["DNI"] = "DNI";
    DocumentType["CUIT"] = "CUIT";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
var AgencyStatus;
(function (AgencyStatus) {
    AgencyStatus["ACTIVE"] = "ACTIVE";
    AgencyStatus["INACTIVE"] = "INACTIVE";
})(AgencyStatus || (exports.AgencyStatus = AgencyStatus = {}));
var FunctionMethod;
(function (FunctionMethod) {
    FunctionMethod["generateBasicAuth"] = "generateBasicAuth";
    FunctionMethod["authToken"] = "authToken";
    FunctionMethod["userRegister"] = "userRegister";
    FunctionMethod["userValidate"] = "userValidate";
    FunctionMethod["agencies"] = "agencies";
    FunctionMethod["rates"] = "rates";
    FunctionMethod["shippingImport"] = "shippingImport";
})(FunctionMethod || (exports.FunctionMethod = FunctionMethod = {}));
var ProvinceCode;
(function (ProvinceCode) {
    ProvinceCode["Salta"] = "A";
    ProvinceCode["Provincia de Buenos Aires"] = "B";
    ProvinceCode["Ciudad Aut\u00F3noma de Buenos Aires"] = "C";
    ProvinceCode["San Luis"] = "D";
    ProvinceCode["Entre R\u00EDos"] = "E";
    ProvinceCode["La Rioja"] = "F";
    ProvinceCode["Santiago del Estero"] = "G";
    ProvinceCode["Chaco"] = "H";
    ProvinceCode["San Juan"] = "J";
    ProvinceCode["Catamarca"] = "K";
    ProvinceCode["La Pampa"] = "L";
    ProvinceCode["Mendoza"] = "M";
    ProvinceCode["Misiones"] = "N";
    ProvinceCode["Formosa"] = "P";
    ProvinceCode["Neuqu\u00E9n"] = "Q";
    ProvinceCode["R\u00EDo Negro"] = "R";
    ProvinceCode["Santa Fe"] = "S";
    ProvinceCode["Tucum\u00E1n"] = "T";
    ProvinceCode["Chubut"] = "U";
    ProvinceCode["Tierra del Fuego"] = "V";
    ProvinceCode["Corrientes"] = "W";
    ProvinceCode["C\u00F3rdoba"] = "X";
    ProvinceCode["Jujuy"] = "Y";
    ProvinceCode["Santa Cruz"] = "Z";
})(ProvinceCode || (exports.ProvinceCode = ProvinceCode = {}));
