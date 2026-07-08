import { soulSensei } from "./data.js";
import { calculateNutrients } from "./calculator.js";
/*
=================================
TEMA
=================================
*/

const themeToggle =
    document.getElementById("themeToggle");

loadTheme();

themeToggle.addEventListener(
    "click",
    toggleTheme
);

function toggleTheme() {

    document.body.classList.toggle("dark");

    const isDark =
        document.body.classList.contains("dark");

    localStorage.setItem(
        "theme",
        isDark ? "dark" : "light"
    );

    themeToggle.textContent =
        isDark ? "☀️" : "🌙";

}

function loadTheme() {

    const savedTheme =
        localStorage.getItem("theme");

    if (savedTheme === "dark") {

        document.body.classList.add("dark");

        themeToggle.textContent = "☀️";

    }

}

let selectedStage = "vegetative";
let selectedWeek = 1;

/*
=================================
ELEMENTOS DOM
=================================
*/

const stageButtons = document.querySelectorAll(".stage-btn");

const weeksContainer =
    document.getElementById("weeksContainer");

const waterInput =
    document.getElementById("waterInput");

const nutrientsContainer =
    document.getElementById("nutrientsContainer");

/*
=================================
INICIALIZAR
=================================
*/

renderWeeks();
updateResults();

/*
=================================
EVENTOS ETAPA
=================================
*/

stageButtons.forEach(button => {

    button.addEventListener("click", () => {

        stageButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        selectedStage =
            button.dataset.stage;

        selectedWeek = 1;

        renderWeeks();

        updateResults();

    });

});

/*
=================================
EVENTO AGUA
=================================
*/

waterInput.addEventListener("input", () => {

    updateResults();

});

/*
=================================
RENDER SEMANAS
=================================
*/

function renderWeeks() {

    weeksContainer.innerHTML = "";

    const weeks =
        soulSensei.stages[selectedStage];

    weeks.forEach((weekData, index) => {

        const button =
            document.createElement("button");

        button.classList.add("week-btn");

        if (index === 0) {
            button.classList.add("active");
        }

        button.textContent =
            weekData.label || weekData.week;

        button.addEventListener("click", () => {

            document
                .querySelectorAll(".week-btn")
                .forEach(btn =>
                    btn.classList.remove("active")
                );

            button.classList.add("active");

            selectedWeek =
                weekData.week;

            updateResults();

        });

        weeksContainer.appendChild(button);

    });

}

/*
=================================
ACTUALIZAR RESULTADOS
=================================
*/

function updateResults() {

    const liters =
        parseFloat(waterInput.value) || 0;

    const result =
        calculateNutrients(
            selectedStage,
            selectedWeek,
            liters
        );

    renderNutrients(result);

}

/*
=================================
PINTAR TARJETAS
=================================
*/

function renderNutrients(data) {

    nutrientsContainer.innerHTML = "";

    const nutrients = [

         {
            id: "micro",
            label: "Micro",
            className: "micro"
        },
        
        {
            id: "grow",
            label: "Grow",
            className: "grow"
        },

        {
            id: "bloom",
            label: "Bloom",
            className: "bloom"
        }

       

    ];

    const maxValue =
        Math.max(
            data.micro,
            data.grow,
            data.bloom,
            
            1
        );

    nutrients.forEach(item => {

        const value =
            data[item.id];

        const percentage =
            (value / maxValue) * 100;

        const nutrient =
            document.createElement("div");

        nutrient.classList.add("nutrient");

        nutrient.innerHTML = `
            <div class="nutrient-header">

                <span class="nutrient-name">
                    ${item.label}
                </span>

                <span class="nutrient-value">
                    ${value.toFixed(2)} ml
                </span>

            </div>

            <div class="progress">

                <div
                    class="progress-bar ${item.className}"
                    style="width:0%">
                </div>

            </div>
        `;

        nutrientsContainer.appendChild(
            nutrient
        );

        const bar =
            nutrient.querySelector(".progress-bar");

        setTimeout(() => {

            bar.style.width =
             `${percentage}%`;

        }, 50);


        

    });

}

if ("serviceWorker" in navigator) {

  window.addEventListener("load", () => {

    navigator.serviceWorker
      .register("/service-worker.js")
      .then(() => {

        console.log("GrowCalc PWA lista 🚀");

      })
      .catch(error => {

        console.error(error);

      });

  });

}
/*
=================================
INSTALL PROMPT
=================================
*/

let deferredPrompt;

const installBanner =
    document.getElementById("installBanner");

const installBtn =
    document.getElementById("installBtn");

const closeInstallBanner =
    document.getElementById("closeInstallBanner");

/*
=================================
YA INSTALADA?
=================================
*/

const isStandalone =
    window.matchMedia(
        "(display-mode: standalone)"
    ).matches;

if (
    !isStandalone &&
    !localStorage.getItem(
        "installBannerDismissed"
    )
) {

    detectIOS();

}

/*
=================================
ANDROID / CHROME
=================================
*/

window.addEventListener(
    "beforeinstallprompt",
    (e) => {

        e.preventDefault();

        deferredPrompt = e;

        installBanner.classList.remove(
            "hidden"
        );

    }
);

installBtn?.addEventListener(
    "click",
    async () => {

        if (!deferredPrompt) return;

        deferredPrompt.prompt();

        await deferredPrompt.userChoice;

        deferredPrompt = null;

        installBanner.classList.add(
            "hidden"
        );

    }
);

/*
=================================
CERRAR
=================================
*/

closeInstallBanner?.addEventListener(
    "click",
    () => {

        installBanner.classList.add(
            "hidden"
        );

        localStorage.setItem(
            "installBannerDismissed",
            "true"
        );

    }
);

/*
=================================
IPHONE
=================================
*/

function detectIOS() {

    const isIOS =

        /iphone|ipad|ipod/i.test(
            navigator.userAgent
        );

    if (!isIOS) return;

    installBanner.classList.remove(
        "hidden"
    );

    installBtn.style.display = "none";

    installBanner.querySelector(
        "p"
    ).innerHTML = `
        Pulsa Compartir y luego
        <strong>
        Añadir a pantalla de inicio
        </strong>
    `;

}