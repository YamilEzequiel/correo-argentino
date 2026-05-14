// Post-build step para soporte dual CJS/ESM.
//
// Node decide cómo cargar un archivo `.js` según el `"type"` del `package.json`
// más cercano. Como la raíz declara `"type": "commonjs"`, los archivos en
// `./dist/esm/` serían tratados como CJS si no hiciéramos esto.
//
// Solución estándar: dejar un `package.json` pequeño dentro de `dist/esm`
// que declare `"type": "module"`. Así Node trata esa carpeta como ESM
// independientemente del root.
//
// Doc: https://nodejs.org/api/packages.html#dual-commonjses-module-packages

import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const esmDir = resolve(__dirname, "..", "dist", "esm");

if (!existsSync(esmDir)) {
  mkdirSync(esmDir, { recursive: true });
}

const esmPkg = { type: "module" };
writeFileSync(resolve(esmDir, "package.json"), JSON.stringify(esmPkg, null, 2) + "\n", "utf8");

console.log("✅ Wrote dist/esm/package.json with { type: 'module' }");
