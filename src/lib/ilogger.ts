import { promises as fs } from "fs";
import * as path from "path";

const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), "logs");

/** yyyy-mm-dd */
function dayStamp(d = new Date()) {
    return d.toISOString().slice(0, 10);
}

async function ensureDir(p: string) {
    await fs.mkdir(p, { recursive: true });
}

function safeJson(v: unknown) {
    try { return JSON.stringify(v); }
    catch { return JSON.stringify({ _nonSerializable_: String(v) }); }
}

/**
 * Crée un “logger” avec un namespace (sous-dossier).
 * Pas de niveaux. Un seul appel: log(message, extra?)
 * - message: string | objet (sera sérialisé)
 * - extra:   objet optionnel (merge dans la ligne)
 */
export function createILog(namespace = "app") {
    async function write(level: string, message: unknown, extra?: Record<string, unknown>) {
        const dir = path.join(LOG_DIR, namespace);
        const file = path.join(dir, `${dayStamp()}.log`);
        await ensureDir(dir);

        const payload = {
            ts: new Date().toISOString(),
            ns: namespace,
            level,
            ...(typeof message === "string" ? { msg: message } : { msg: message }),
            ...(extra ? { ...extra } : {}),
        };
        const line = safeJson(payload) + "\n";
        await fs.appendFile(file, line, { encoding: "utf8" });
    }

    return {
        log: (message: unknown, extra?: Record<string, unknown>) =>
            write("info", message, extra),
        error: (message: unknown, extra?: Record<string, unknown>) =>
            write("error", message, extra),
        warn: (message: unknown, extra?: Record<string, unknown>) =>
            write("warn", message, extra),
    };
}

/** Logger général */
export const ilog = createILog("app");

/** Logger erreurs */
export const elog = createILog("error");
