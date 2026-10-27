/**
 * @fileoverview Capa segura de persistencia en localStorage con validación de esquema
 * y manejo resiliente de errores (modo incógnito, almacenamiento bloqueado o cuota llena).
 */

import { soulSensei } from "./data.js";
import { sanitizeWaterAmount } from "./calculator.js";

const STORAGE_KEYS = Object.freeze({
    THEME: "theme",
    STATE: "growcalc_state_v2",
    INSTALL_DISMISSED: "installBannerDismissed"
});

const ALLOWED_THEMES = new Set(["dark", "light"]);
const ALLOWED_UNITS = new Set(["liters", "gallons"]);

function safeGet(key) {
    try {
        return window.localStorage.getItem(key);
    } catch {
        return null;
    }
}

function safeSet(key, value) {
    try {
        window.localStorage.setItem(key, value);
        return true;
    } catch {
        return false;
    }
}

/**
 * Obtiene el tema preferido del usuario.
 * Por identidad visual de Soul Sensei (Dark Samurai), el tema predeterminado es "dark".
 * @returns {"dark" | "light"}
 */
export function getSavedTheme() {
    const saved = safeGet(STORAGE_KEYS.THEME);
    if (saved && ALLOWED_THEMES.has(saved)) {
        return saved;
    }
    return "dark";
}

/**
 * Guarda el tema preferido del usuario.
 * @param {"dark" | "light"} theme
 */
export function saveTheme(theme) {
    if (ALLOWED_THEMES.has(theme)) {
        safeSet(STORAGE_KEYS.THEME, theme);
    }
}

/**
 * Carga el estado de la calculadora validando cada propiedad contra la tabla oficial.
 */
export function loadAppState() {
    const defaults = {
        stage: "vegetative",
        week: 1,
        waterAmount: 10,
        unit: "liters"
    };

    const raw = safeGet(STORAGE_KEYS.STATE);
    if (!raw) {
        return defaults;
    }

    try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") {
            return defaults;
        }

        const stage = Object.prototype.hasOwnProperty.call(soulSensei.stages, parsed.stage)
            ? parsed.stage
            : defaults.stage;

        const validWeeks = soulSensei.stages[stage].map((w) => w.week);
        const week = validWeeks.includes(parsed.week) ? parsed.week : validWeeks[0];

        const unit = ALLOWED_UNITS.has(parsed.unit) ? parsed.unit : defaults.unit;
        const waterAmount = sanitizeWaterAmount(parsed.waterAmount ?? defaults.waterAmount);

        return {
            stage,
            week,
            waterAmount: waterAmount > 0 ? waterAmount : defaults.waterAmount,
            unit
        };
    } catch {
        return defaults;
    }
}

/**
 * Guarda el estado actual de la calculadora de forma segura.
 * @param {{ stage: string, week: number|string, waterAmount: number, unit: string }} state
 */
export function saveAppState(state) {
    if (!state || typeof state !== "object") return;
    const payload = JSON.stringify({
        stage: state.stage,
        week: state.week,
        waterAmount: sanitizeWaterAmount(state.waterAmount),
        unit: ALLOWED_UNITS.has(state.unit) ? state.unit : "liters"
    });
    safeSet(STORAGE_KEYS.STATE, payload);
}

export function isInstallBannerDismissed() {
    return safeGet(STORAGE_KEYS.INSTALL_DISMISSED) === "true";
}

export function dismissInstallBanner() {
    safeSet(STORAGE_KEYS.INSTALL_DISMISSED, "true");
}
