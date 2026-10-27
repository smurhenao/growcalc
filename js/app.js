import { soulSensei } from "./data.js";
import {
    calculateDetailedPlan,
    sanitizeWaterAmount,
    litersToGallons,
    gallonsToLiters
} from "./calculator.js";
import {
    getSavedTheme,
    saveTheme,
    loadAppState,
    saveAppState,
    isInstallBannerDismissed,
    dismissInstallBanner
} from "./storage.js";

/* ==========================================================================
   CONFIGURACIÓN DE PRESETS E ÍCONOS SVG
   ========================================================================== */

const WATER_PRESETS = Object.freeze({
    liters: [1, 5, 10, 20, 50, 100],
    gallons: [1, 2, 5, 10, 20, 50]
});

function createThemeSvg(isDark) {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");

    if (isDark) {
        // Sun icon for switching to Light mode
        const circle = document.createElementNS(svgNS, "circle");
        circle.setAttribute("cx", "12");
        circle.setAttribute("cy", "12");
        circle.setAttribute("r", "4");
        const path = document.createElementNS(svgNS, "path");
        path.setAttribute(
            "d",
            "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
        );
        svg.append(circle, path);
    } else {
        // Moon icon for switching to Dark Samurai mode
        const path = document.createElementNS(svgNS, "path");
        path.setAttribute("d", "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z");
        svg.appendChild(path);
    }

    return svg;
}

/* ==========================================================================
   ESTADO DE LA APLICACIÓN
   ========================================================================== */

const initialState = loadAppState();

let selectedStage = initialState.stage;
let selectedWeek = initialState.week;
let selectedUnit = initialState.unit; // "liters" | "gallons"
let waterLiters = initialState.waterAmount; // Siempre almacenado internamente en litros

/* ==========================================================================
   REFERENCIAS DOM
   ========================================================================== */

const themeToggle = document.getElementById("themeToggle");
const metaThemeColor = document.getElementById("metaThemeColor");
const stageButtons = document.querySelectorAll(".stage-btn");
const stageSummaryBadge = document.getElementById("stageSummaryBadge");
const phaseTitleBadge = document.getElementById("phaseTitleBadge");
const weeksContainer = document.getElementById("weeksContainer");

const unitButtons = document.querySelectorAll(".unit-btn");
const waterInput = document.getElementById("waterInput");
const waterUnitLabel = document.getElementById("waterUnitLabel");
const waterDecBtn = document.getElementById("waterDecBtn");
const waterIncBtn = document.getElementById("waterIncBtn");
const waterPresetsContainer = document.getElementById("waterPresets");
const litersReadout = document.getElementById("litersReadout");
const gallonsReadout = document.getElementById("gallonsReadout");

const activeRecipeSubtitle = document.getElementById("activeRecipeSubtitle");
const totalMlValue = document.getElementById("totalMlValue");
const concentrationPerLiter = document.getElementById("concentrationPerLiter");
const concentrationPerGal = document.getElementById("concentrationPerGal");
const nutrientsContainer = document.getElementById("nutrientsContainer");
const copyRecipeBtn = document.getElementById("copyRecipeBtn");
const copyBtnText = document.getElementById("copyBtnText");

const stepMicroDose = document.getElementById("stepMicroDose");
const stepGrowDose = document.getElementById("stepGrowDose");
const stepBloomDose = document.getElementById("stepBloomDose");
const mixingSteps = document.querySelectorAll(".mixing-step");
const resetChecklistBtn = document.getElementById("resetChecklistBtn");

const openTableBtn = document.getElementById("openTableBtn");
const closeTableBtn = document.getElementById("closeTableBtn");
const tableModal = document.getElementById("tableModal");
const officialTableContainer = document.getElementById("officialTableContainer");

// Caché de referencias DOM para tarjetas de nutrientes (evita recrear nodos en cada pulsación)
const nutrientDomRefs = new Map();
let flushBannerEl = null;

/* ==========================================================================
   TEMA VISUAL (DARK SAMURAI / ZEN DAYLIGHT)
   ========================================================================== */

function applyTheme(theme) {
    const isDark = theme === "dark";
    document.body.classList.toggle("dark", isDark);

    if (metaThemeColor) {
        metaThemeColor.setAttribute("content", isDark ? "#080B09" : "#f2f6f0");
    }

    if (themeToggle) {
        themeToggle.replaceChildren(createThemeSvg(isDark));
        themeToggle.setAttribute(
            "aria-label",
            isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
        );
    }
}

function toggleTheme() {
    const isCurrentlyDark = document.body.classList.contains("dark");
    const nextTheme = isCurrentlyDark ? "light" : "dark";
    applyTheme(nextTheme);
    saveTheme(nextTheme);
}

/* ==========================================================================
   CONSTRUCCIÓN INICIAL DE TARJETAS DE NUTRIENTES
   ========================================================================== */

function initNutrientCards() {
    nutrientsContainer.replaceChildren();
    nutrientDomRefs.clear();

    // Banner informativo para semana de Flush
    flushBannerEl = document.createElement("div");
    flushBannerEl.className = "flush-banner hidden";

    const svgNS = "http://www.w3.org/2000/svg";
    const flushIcon = document.createElementNS(svgNS, "svg");
    flushIcon.setAttribute("class", "flush-icon");
    flushIcon.setAttribute("viewBox", "0 0 24 24");
    flushIcon.setAttribute("fill", "none");
    flushIcon.setAttribute("stroke", "currentColor");
    flushIcon.setAttribute("stroke-width", "2");
    const dropPath = document.createElementNS(svgNS, "path");
    dropPath.setAttribute("d", "M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z");
    flushIcon.appendChild(dropPath);

    const flushText = document.createElement("div");
    const flushStrong = document.createElement("strong");
    flushStrong.textContent = "Semana de Lavado de Raíces (Flush): ";
    const flushSpan = document.createElement("span");
    flushSpan.textContent =
        "Utilice únicamente agua con pH ajustado (5.5 – 6.5) sin añadir nutrientes para limpiar sales acumuladas.";
    flushText.append(flushStrong, flushSpan);
    flushBannerEl.append(flushIcon, flushText);
    nutrientsContainer.appendChild(flushBannerEl);

    // Crear tarjetas para Micro, Grow y Bloom en el orden oficial de mezcla
    soulSensei.nutrientsMeta.forEach((meta) => {
        const card = document.createElement("article");
        card.className = `nutrient nutrient-${meta.className}`;

        const header = document.createElement("div");
        header.className = "nutrient-header";

        const titleGroup = document.createElement("div");
        titleGroup.className = "nutrient-title-group";

        const topRow = document.createElement("div");
        topRow.className = "nutrient-top-row";

        const badge = document.createElement("span");
        badge.className = `nutrient-order-badge badge-${meta.className}`;
        badge.textContent = `Paso ${meta.order}`;

        const nameEl = document.createElement("span");
        nameEl.className = "nutrient-name";
        nameEl.textContent = meta.label;

        topRow.append(badge, nameEl);

        const roleEl = document.createElement("span");
        roleEl.className = "nutrient-role";
        roleEl.textContent = meta.role;

        titleGroup.append(topRow, roleEl);

        const dosageGroup = document.createElement("div");
        dosageGroup.className = "nutrient-dosage-group";

        const valueEl = document.createElement("span");
        valueEl.className = "nutrient-value";
        valueEl.textContent = "0.00 ml";

        const rateSubEl = document.createElement("span");
        rateSubEl.className = "nutrient-rate-sub";
        rateSubEl.textContent = "0 ml/Gal • 0.00 ml/L";

        dosageGroup.append(valueEl, rateSubEl);
        header.append(titleGroup, dosageGroup);

        const progressTrack = document.createElement("div");
        progressTrack.className = "progress";

        const progressBar = document.createElement("div");
        progressBar.className = `progress-bar ${meta.className}`;
        progressBar.style.width = "0%";

        progressTrack.appendChild(progressBar);
        card.append(header, progressTrack);
        nutrientsContainer.appendChild(card);

        nutrientDomRefs.set(meta.id, {
            valueEl,
            rateSubEl,
            progressBar
        });
    });
}

/* ==========================================================================
   RENDERIZADO DE CONTROLES (ETAPAS, SEMANAS, PRESETS)
   ========================================================================== */

function syncStageUI() {
    stageButtons.forEach((btn) => {
        const isActive = btn.dataset.stage === selectedStage;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-pressed", String(isActive));
    });

    if (stageSummaryBadge) {
        stageSummaryBadge.textContent =
            selectedStage === "vegetative" ? "4 Semanas" : "8 Semanas + Flush";
    }
}

function renderWeeks() {
    weeksContainer.replaceChildren();
    const weeks = soulSensei.stages[selectedStage] || [];

    weeks.forEach((weekData) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "week-btn";

        const isFlush = weekData.week === "flush";
        if (isFlush) {
            button.classList.add("is-flush");
        }

        const isActive = String(weekData.week) === String(selectedWeek);
        if (isActive) {
            button.classList.add("active");
        }
        button.setAttribute("aria-pressed", String(isActive));

        const sub = document.createElement("span");
        sub.className = "week-btn-sub";
        sub.textContent = isFlush ? "Lavado" : "Semana";

        const num = document.createElement("span");
        num.className = "week-btn-num";
        num.textContent = isFlush ? "Flush" : String(weekData.week);

        button.append(sub, num);

        button.addEventListener("click", () => {
            selectedWeek = weekData.week;
            renderWeeks();
            updateResults();
            persistCurrentState();
        });

        weeksContainer.appendChild(button);
    });
}

function syncUnitUI() {
    unitButtons.forEach((btn) => {
        const isActive = btn.dataset.unit === selectedUnit;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-pressed", String(isActive));
    });

    if (waterUnitLabel) {
        waterUnitLabel.textContent = selectedUnit === "liters" ? "Litros" : "Galones";
    }

    const displayVal =
        selectedUnit === "liters"
            ? waterLiters
            : Number(litersToGallons(waterLiters).toFixed(2));

    waterInput.value = displayVal > 0 ? String(displayVal) : "";
    renderWaterPresets();
}

function renderWaterPresets() {
    waterPresetsContainer.replaceChildren();
    const presets = WATER_PRESETS[selectedUnit] || WATER_PRESETS.liters;
    const currentInputVal = parseFloat(waterInput.value) || 0;
    const suffix = selectedUnit === "liters" ? "L" : "Gal";

    presets.forEach((amount) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "preset-chip";
        if (Math.abs(currentInputVal - amount) < 0.01) {
            chip.classList.add("active");
        }
        chip.textContent = `${amount} ${suffix}`;

        chip.addEventListener("click", () => {
            waterInput.value = String(amount);
            handleWaterInputChange();
        });

        waterPresetsContainer.appendChild(chip);
    });
}

/* ==========================================================================
   ACTUALIZACIÓN DE CÁLCULOS Y RESULTADOS
   ========================================================================== */

function handleWaterInputChange() {
    const rawValue = sanitizeWaterAmount(waterInput.value);
    waterLiters =
        selectedUnit === "liters" ? rawValue : gallonsToLiters(rawValue);

    renderWaterPresets();
    updateResults();
    persistCurrentState();
}

function updateResults() {
    const plan = calculateDetailedPlan(selectedStage, selectedWeek, waterLiters);

    // Fase de la semana activa
    if (phaseTitleBadge && plan.recipe) {
        phaseTitleBadge.textContent = plan.recipe.phaseTitle || plan.recipe.label;
    }

    // Barra de conversión L ⇄ US Gal
    if (litersReadout) {
        litersReadout.textContent = `${plan.liters.toFixed(2)} L`;
    }
    if (gallonsReadout) {
        gallonsReadout.textContent = `${plan.gallons.toFixed(2)} US Gal`;
    }

    // Subtítulo del bloque de resultados
    const stageName = selectedStage === "vegetative" ? "Vegetativo" : "Floración";
    const weekLabel =
        plan.week === "flush" ? "Semana de Flush" : `Semana ${plan.week}`;
    if (activeRecipeSubtitle) {
        activeRecipeSubtitle.textContent = `${stageName} • ${weekLabel} • ${plan.liters.toFixed(1)} L (${plan.gallons.toFixed(2)} Gal)`;
    }

    // KPIs de concentración
    const sumPerGal =
        plan.perGallon.micro + plan.perGallon.grow + plan.perGallon.bloom;
    const sumPerLiter =
        plan.perLiter.micro + plan.perLiter.grow + plan.perLiter.bloom;

    if (totalMlValue) {
        totalMlValue.textContent = `${plan.totalMl.toFixed(2)} ml`;
    }
    if (concentrationPerLiter) {
        concentrationPerLiter.textContent = `${sumPerLiter.toFixed(2)} ml/L`;
    }
    if (concentrationPerGal) {
        concentrationPerGal.textContent = `${sumPerGal.toFixed(1)} ml/Gal`;
    }

    // Banner de Flush
    if (flushBannerEl) {
        flushBannerEl.classList.toggle("hidden", !plan.isFlush);
    }

    // Actualizar tarjetas de nutrientes
    const maxValue = Math.max(
        plan.totals.micro,
        plan.totals.grow,
        plan.totals.bloom,
        1
    );

    soulSensei.nutrientsMeta.forEach((meta) => {
        const refs = nutrientDomRefs.get(meta.id);
        if (!refs) return;

        const totalDose = plan.totals[meta.id] || 0;
        const rateGal = plan.perGallon[meta.id] || 0;
        const rateL = plan.perLiter[meta.id] || 0;
        const percentage = plan.isFlush || totalDose === 0 ? 0 : (totalDose / maxValue) * 100;

        refs.valueEl.textContent = `${totalDose.toFixed(2)} ml`;
        refs.rateSubEl.textContent = `${rateGal} ml/Gal • ${rateL.toFixed(2)} ml/L`;
        refs.progressBar.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
    });

    // Actualizar dosis en el checklist de orden de mezcla
    if (stepMicroDose) {
        stepMicroDose.textContent = `${plan.totals.micro.toFixed(2)} ml`;
    }
    if (stepGrowDose) {
        stepGrowDose.textContent = `${plan.totals.grow.toFixed(2)} ml`;
    }
    if (stepBloomDose) {
        stepBloomDose.textContent = `${plan.totals.bloom.toFixed(2)} ml`;
    }
}

function persistCurrentState() {
    saveAppState({
        stage: selectedStage,
        week: selectedWeek,
        waterAmount: waterLiters,
        unit: selectedUnit
    });
}

/* ==========================================================================
   TABLA OFICIAL COMPLETA (MODAL INTERACTIVO)
   ========================================================================== */

function renderOfficialTableModal() {
    officialTableContainer.replaceChildren();

    const stagesConfig = [
        { key: "vegetative", title: "Etapa Vegetativa (Semanas 1 – 4)" },
        { key: "flowering", title: "Etapa de Floración (Semanas 1 – 8 + Flush)" }
    ];

    stagesConfig.forEach(({ key, title }) => {
        const block = document.createElement("div");

        const heading = document.createElement("h3");
        heading.className = "table-stage-title";
        heading.textContent = title;

        const wrap = document.createElement("div");
        wrap.className = "official-table-wrap";

        const table = document.createElement("table");
        table.className = "official-table";

        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        ["Semana", "Fase", "Micro (Gal / L)", "Grow (Gal / L)", "Bloom (Gal / L)"].forEach(
            (colText) => {
                const th = document.createElement("th");
                th.textContent = colText;
                headerRow.appendChild(th);
            }
        );
        thead.appendChild(headerRow);

        const tbody = document.createElement("tbody");
        const weeks = soulSensei.stages[key] || [];

        weeks.forEach((item) => {
            const tr = document.createElement("tr");
            const isCurrent =
                key === selectedStage && String(item.week) === String(selectedWeek);
            if (isCurrent) {
                tr.classList.add("active-row");
            }

            const tdWeek = document.createElement("td");
            tdWeek.textContent = item.label || `Semana ${item.week}`;

            const tdPhase = document.createElement("td");
            tdPhase.textContent = item.phaseTitle || "-";

            const formatCell = (valGal) => {
                const td = document.createElement("td");
                td.className = "num-col";
                const valLiter = valGal / soulSensei.conversionFactor;
                td.textContent = `${valGal} ml/Gal (${valLiter.toFixed(2)} ml/L)`;
                return td;
            };

            tr.append(
                tdWeek,
                tdPhase,
                formatCell(item.nutrients.micro),
                formatCell(item.nutrients.grow),
                formatCell(item.nutrients.bloom)
            );

            tr.addEventListener("click", () => {
                selectedStage = key;
                selectedWeek = item.week;
                syncStageUI();
                renderWeeks();
                updateResults();
                persistCurrentState();
                closeModal();
            });

            tbody.appendChild(tr);
        });

        table.append(thead, tbody);
        wrap.appendChild(table);
        block.append(heading, wrap);
        officialTableContainer.appendChild(block);
    });
}

function openModal() {
    renderOfficialTableModal();
    tableModal.classList.remove("hidden");
    closeTableBtn?.focus();
}

function closeModal() {
    tableModal.classList.add("hidden");
}

/* ==========================================================================
   EVENTOS E INTERACCIÓN
   ========================================================================== */

// Tema
applyTheme(getSavedTheme());
themeToggle?.addEventListener("click", toggleTheme);

// Inicialización de tarjetas y estado
initNutrientCards();
syncStageUI();
renderWeeks();
syncUnitUI();
updateResults();

// Selector de etapa
stageButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const nextStage = button.dataset.stage;
        if (!nextStage || nextStage === selectedStage) return;

        selectedStage = nextStage;
        selectedWeek = 1;

        syncStageUI();
        renderWeeks();
        updateResults();
        persistCurrentState();
    });
});

// Selector de unidad (Litros / Galones)
unitButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const nextUnit = button.dataset.unit;
        if (!nextUnit || nextUnit === selectedUnit) return;

        selectedUnit = nextUnit;
        syncUnitUI();
        persistCurrentState();
    });
});

// Entrada de agua y botones +/-
waterInput?.addEventListener("input", handleWaterInputChange);

waterDecBtn?.addEventListener("click", () => {
    const current = parseFloat(waterInput.value) || 0;
    const step = selectedUnit === "liters" ? 1 : 0.5;
    const next = Math.max(0, Number((current - step).toFixed(2)));
    waterInput.value = String(next);
    handleWaterInputChange();
});

waterIncBtn?.addEventListener("click", () => {
    const current = parseFloat(waterInput.value) || 0;
    const step = selectedUnit === "liters" ? 1 : 0.5;
    const next = Math.min(100000, Number((current + step).toFixed(2)));
    waterInput.value = String(next);
    handleWaterInputChange();
});

// Copiar receta al portapapeles
copyRecipeBtn?.addEventListener("click", async () => {
    const plan = calculateDetailedPlan(selectedStage, selectedWeek, waterLiters);
    const stageLabel = selectedStage === "vegetative" ? "Vegetativo" : "Floración";
    const weekLabel =
        plan.week === "flush" ? "Flush (Lavado)" : `Semana ${plan.week}`;

    const text = [
        `🌱 GROWCALC • SOUL SENSEI`,
        `Etapa: ${stageLabel} (${weekLabel})`,
        `Agua: ${plan.liters.toFixed(2)} L (${plan.gallons.toFixed(2)} US Gal)`,
        `────────────────────────`,
        `1️⃣ Micro: ${plan.totals.micro.toFixed(2)} ml`,
        `2️⃣ Grow:  ${plan.totals.grow.toFixed(2)} ml`,
        `3️⃣ Bloom: ${plan.totals.bloom.toFixed(2)} ml`,
        `────────────────────────`,
        `pH objetivo: 5.5 – 6.5`
    ].join("\n");

    try {
        await navigator.clipboard.writeText(text);
        copyRecipeBtn.classList.add("copied");
        if (copyBtnText) copyBtnText.textContent = "¡Copiado!";
        setTimeout(() => {
            copyRecipeBtn.classList.remove("copied");
            if (copyBtnText) copyBtnText.textContent = "Copiar";
        }, 2000);
    } catch {
        // Fallback silencioso si el navegador restringe clipboard
    }
});

// Checklist interactivo del orden de mezcla
function toggleMixingStep(stepEl) {
    const isCompleted = stepEl.classList.toggle("completed");
    stepEl.setAttribute("aria-checked", String(isCompleted));
    const badge = stepEl.querySelector(".step-check");
    if (badge) {
        badge.textContent = isCompleted ? "✓" : stepEl.dataset.step;
    }
}

mixingSteps.forEach((stepEl) => {
    stepEl.addEventListener("click", () => toggleMixingStep(stepEl));
    stepEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleMixingStep(stepEl);
        }
    });
});

resetChecklistBtn?.addEventListener("click", () => {
    mixingSteps.forEach((stepEl) => {
        stepEl.classList.remove("completed");
        stepEl.setAttribute("aria-checked", "false");
        const badge = stepEl.querySelector(".step-check");
        if (badge) {
            badge.textContent = stepEl.dataset.step;
        }
    });
});

// Modal Tabla Oficial
openTableBtn?.addEventListener("click", openModal);
closeTableBtn?.addEventListener("click", closeModal);
tableModal?.addEventListener("click", (e) => {
    if (e.target === tableModal) closeModal();
});
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !tableModal.classList.contains("hidden")) {
        closeModal();
    }
});

/* ==========================================================================
   REGISTRO DE SERVICE WORKER & PWA INSTALL PROMPT
   ========================================================================== */

if ("serviceWorker" in navigator) {
    let isRefreshing = false;

    navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (isRefreshing) return;
        isRefreshing = true;
        window.location.reload();
    });

    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/service-worker.js", { updateViaCache: "none" })
            .then((registration) => {
                registration.update();

                document.addEventListener("visibilitychange", () => {
                    if (document.visibilityState === "visible") {
                        registration.update();
                    }
                });
            })
            .catch(() => {
                // Registro silencioso en producción
            });
    });
}

let deferredPrompt = null;
const installBanner = document.getElementById("installBanner");
const installBtn = document.getElementById("installBtn");
const closeInstallBanner = document.getElementById("closeInstallBanner");
const installDescription = document.getElementById("installDescription");

const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

if (!isStandalone && !isInstallBannerDismissed()) {
    detectIOS();
}

window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (!isInstallBannerDismissed()) {
        installBanner?.classList.remove("hidden");
    }
});

installBtn?.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBanner?.classList.add("hidden");
});

closeInstallBanner?.addEventListener("click", () => {
    installBanner?.classList.add("hidden");
    dismissInstallBanner();
});

function detectIOS() {
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (!isIOS || !installBanner) return;

    installBanner.classList.remove("hidden");
    if (installBtn) {
        installBtn.style.display = "none";
    }
    if (installDescription) {
        installDescription.textContent =
            'En Safari, pulsa "Compartir" y luego "Agregar a inicio" para instalar GrowCalc.';
    }
}
