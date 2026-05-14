/**
 * Dev server local para el playground interactivo de la librería.
 *
 * Levanta un Express en localhost que:
 * - Sirve `doc/playground.html` y `doc/ejemplos.html` como estáticos
 * - Expone endpoints REST que invocan a la librería en su nombre
 * - Mantiene una instancia compartida de CorreoArgentinoApi
 * - Lee credenciales desde `.env`
 *
 * Uso: `npm run playground` (corre tsx scripts/dev-server.ts)
 */

import express, { Request, Response, NextFunction } from "express";
import path from "node:path";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

import CorreoArgentinoApi from "../src/miCorreo";
import { DeliveredType, Environment, ProvinceCode } from "../src/types/enum";
import type { ShippingImport } from "../src/types/interface";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.PORT || 3000);

// ────────────────────────────────────────────────────────────
// Instancia compartida (lazy init)
// ────────────────────────────────────────────────────────────
const api = new CorreoArgentinoApi({ debug: true });
let initialized = false;
let lastInitError: string | null = null;

async function ensureInitialized(): Promise<void> {
  if (initialized) return;

  const userToken = process.env.USER_TOKEN || "";
  const passwordToken = process.env.PASSWORD_TOKEN || "";
  const email = process.env.EMAIL || "";
  const password = process.env.PASSWORD || "";
  const customerId = process.env.CUSTOMER_ID || "";
  const environment = (process.env.ENVIRONMENT === "PROD" ? Environment.PROD : Environment.TEST);

  if (!userToken || !passwordToken) {
    throw new Error("Faltan USER_TOKEN y/o PASSWORD_TOKEN en .env");
  }

  if (customerId) {
    await api.initializeWithCustomerId({ userToken, passwordToken, customerId, environment });
  } else {
    if (!email || !password) {
      throw new Error("Sin CUSTOMER_ID, faltan EMAIL y PASSWORD en .env");
    }
    await api.initializeAll({ userToken, passwordToken, email, password, environment });
  }

  initialized = true;
  lastInitError = null;
}

// ────────────────────────────────────────────────────────────
// Shipments log local (audit trail de envíos creados vía API)
// Persiste en JSON. NO se commitea (está en .gitignore).
// ────────────────────────────────────────────────────────────
const LOG_PATH = path.join(__dirname, "shipments-log.json");

interface ShipmentLogEntry {
  loggedAt: string;        // ISO timestamp del lado del server
  extOrderId: string;      // ID interno del consumer
  orderNumber?: string;    // ID visible en panel MiCorreo
  createdAt: string;       // del response de MiCorreo
  recipient: { name: string; email: string };
  deliveryType: "D" | "S";
  destination: string;     // resumen legible: "1425, Buenos Aires" o "Sucursal B0107"
  customerId: string;
  downloaded?: boolean;    // marca manual del operador
}

function loadLog(): ShipmentLogEntry[] {
  if (!existsSync(LOG_PATH)) return [];
  try {
    return JSON.parse(readFileSync(LOG_PATH, "utf8")) as ShipmentLogEntry[];
  } catch {
    return [];
  }
}

function saveLog(entries: ShipmentLogEntry[]): void {
  writeFileSync(LOG_PATH, JSON.stringify(entries, null, 2), "utf8");
}

function appendLog(entry: ShipmentLogEntry): void {
  const log = loadLog();
  log.unshift(entry); // newest first
  saveLog(log);
}

// ────────────────────────────────────────────────────────────
// Validaciones para dry-run de shippingImport (espejo de la lib)
// ────────────────────────────────────────────────────────────
function validateShippingPayload(data: ShippingImport): string[] {
  const errors: string[] = [];
  if (!data.customerId) errors.push("customerId es requerido");
  if (!data.extOrderId) errors.push("extOrderId es requerido");
  if (!data.recipient?.name) errors.push("recipient.name es requerido");
  if (!data.recipient?.email) errors.push("recipient.email es requerido");
  if (!data.shipping?.deliveryType) errors.push("shipping.deliveryType es requerido");

  if (data.shipping?.deliveryType === DeliveredType.S && !data.shipping?.agency) {
    errors.push("shipping.agency es requerido cuando deliveryType es 'S'");
  }
  if (data.shipping?.deliveryType === DeliveredType.D) {
    const addr = data.shipping?.address;
    if (!addr) {
      errors.push("shipping.address es requerida cuando deliveryType es 'D'");
    } else {
      if (!addr.streetName) errors.push("shipping.address.streetName requerido");
      if (!addr.streetNumber) errors.push("shipping.address.streetNumber requerido");
      if (!addr.city) errors.push("shipping.address.city requerido");
      if (!addr.provinceCode) errors.push("shipping.address.provinceCode requerido");
      if (!addr.postalCode) errors.push("shipping.address.postalCode requerido");
    }
  }
  return errors;
}

// ────────────────────────────────────────────────────────────
// App
// ────────────────────────────────────────────────────────────
const app = express();

app.use(express.json({ limit: "1mb" }));

// Logger mínimo
app.use((req, _res, next) => {
  console.log(`→ ${req.method} ${req.path}`);
  next();
});

// Static files (playground.html y ejemplos.html desde /doc/)
app.use("/doc", express.static(path.join(ROOT, "doc")));

// Redirect raíz al playground
app.get("/", (_req, res) => {
  res.redirect("/doc/playground.html");
});

// ────────────────────────────────────────────────────────────
// Endpoints
// ────────────────────────────────────────────────────────────

app.get("/api/status", (_req, res) => {
  res.json({
    initialized,
    environment: api.getVarEnvironment(),
    customerId: api.getVarCustomerId(),
    lastInitError,
  });
});

app.post("/api/init", async (_req, res, next) => {
  try {
    initialized = false; // forzar re-init
    await ensureInitialized();
    res.json({
      ok: true,
      environment: api.getVarEnvironment(),
      customerId: api.getVarCustomerId(),
    });
  } catch (err) {
    lastInitError = err instanceof Error ? err.message : String(err);
    next(err);
  }
});

app.post("/api/rates", async (req, res, next) => {
  try {
    await ensureInitialized();
    const data = { ...req.body, customerId: req.body.customerId || api.getVarCustomerId() };
    const result = await api.getRates(data);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.get("/api/agencies", async (req, res, next) => {
  try {
    await ensureInitialized();
    const provinceCode = String(req.query.provinceCode || "") as ProvinceCode;
    if (!provinceCode) {
      res.status(400).json({ error: "Falta provinceCode en query" });
      return;
    }
    const result = await api.getAgencies(provinceCode);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.post("/api/shipping-import", async (req, res, next) => {
  try {
    const { dryRun, ...payload } = req.body as ShippingImport & { dryRun?: boolean };

    if (dryRun) {
      const errors = validateShippingPayload(payload);
      if (errors.length > 0) {
        res.status(400).json({ dryRun: true, valid: false, errors });
        return;
      }
      res.json({
        dryRun: true,
        valid: true,
        message: "Payload válido. NO se envió a MiCorreo.",
        payload,
      });
      return;
    }

    await ensureInitialized();
    if (!payload.customerId) payload.customerId = api.getVarCustomerId();
    const result = await api.shippingImport(payload);

    // Auditoría local: registro del envío para que el operador humano sepa
    // qué etiquetas tiene que bajar del panel de MiCorreo.
    const ship = payload.shipping;
    const destination =
      ship.deliveryType === "S"
        ? `Sucursal ${ship.agency ?? "?"}`
        : `${ship.address?.postalCode ?? ""} ${ship.address?.city ?? ""}`.trim() || "(sin destino)";

    appendLog({
      loggedAt: new Date().toISOString(),
      extOrderId: payload.extOrderId,
      orderNumber: payload.orderNumber,
      createdAt: result.createdAt,
      recipient: { name: payload.recipient.name, email: payload.recipient.email },
      deliveryType: ship.deliveryType as "D" | "S",
      destination,
      customerId: payload.customerId,
      downloaded: false,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ────────────────────────────────────────────────────────────
// Shipments log endpoints
// ────────────────────────────────────────────────────────────

app.get("/api/shipments-log", (_req, res) => {
  res.json(loadLog());
});

app.delete("/api/shipments-log", (_req, res) => {
  saveLog([]);
  res.json({ ok: true, cleared: true });
});

app.patch("/api/shipments-log/:extOrderId", (req, res) => {
  const { extOrderId } = req.params;
  const { downloaded } = req.body || {};
  const log = loadLog();
  const idx = log.findIndex((e) => e.extOrderId === extOrderId);
  if (idx < 0) {
    res.status(404).json({ error: "extOrderId no encontrado en el log" });
    return;
  }
  log[idx].downloaded = Boolean(downloaded);
  saveLog(log);
  res.json(log[idx]);
});

app.post("/api/user-register", async (req, res, next) => {
  try {
    await ensureInitialized();
    const result = await api.userRegister(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.post("/api/users-validate", async (req, res, next) => {
  try {
    await ensureInitialized();
    const { email, password } = req.body || {};
    if (!email || !password) {
      res.status(400).json({ error: "Faltan email y/o password" });
      return;
    }
    const result = await api.getCustomerId(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Error handler centralizado
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error("✗ Error:", message);
  res.status(500).json({ error: message });
});

// ────────────────────────────────────────────────────────────
// Start
// ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log("");
  console.log("  ╔════════════════════════════════════════════════╗");
  console.log("  ║  ylazzari-correoargentino playground             ");
  console.log("  ╚════════════════════════════════════════════════╝");
  console.log("");
  console.log(`    Playground:  http://localhost:${PORT}/doc/playground.html`);
  console.log(`    Ejemplos:    http://localhost:${PORT}/doc/ejemplos.html`);
  console.log(`    API base:    http://localhost:${PORT}/api`);
  console.log("");
  console.log("    Tip: editá .env con tus credenciales de MiCorreo TEST.");
  console.log("");
});
