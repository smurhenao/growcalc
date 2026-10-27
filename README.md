# GrowCalc • Soul Sensei Nutrient System 🌱⚔️

Calculadora de precisión de nutrientes para cultivos basada en la tabla oficial de **Soul Sensei** (`Micro`, `Grow`, `Bloom`).

## ✨ Características Principales

- **Identidad Visual Soul Sensei**: Diseño moderno *Dark Samurai / Botanical Precision* inspirado en el emblema oficial de la aplicación, con soporte nativo para modo oscuro y modo claro (alta visibilidad en sala de cultivo o invernadero).
- **Fidelidad Total de Datos y Cálculo**: Respeta íntegramente las dosis por galón (`1 US Gal = 3.78541 L`) para **Vegetativo** (Semanas 1–4) y **Floración** (Semanas 1–8 + Flush).
- **Conversión Bidireccional en Tiempo Real**: Entrada en **Litros (L)** o **Galones (US Gal)** con presets rápidos (`1`, `5`, `10`, `20`, `50`, `100`), botones incrementales y lectura simultánea de concentración (`ml/L` y `ml/Gal`).
- **Protocolo Interactivo de Mezcla y pH**: Lista de verificación paso a paso (`Micro` → `Grow` → `Bloom` → Ajuste de pH `5.5 – 6.5`) y copia rápida de la receta al portapapeles.
- **Tabla Oficial Integrada**: Vista interactiva de todas las semanas del ciclo con carga directa al hacer clic en cualquier fila.
- **Seguridad y Escalabilidad**:
  - Política de Seguridad de Contenido (**CSP**) estricta (`script-src 'self'`, `object-src 'none'`).
  - Estructura de datos profundamente inmutable (`deepFreeze`) y sanitización de entradas numéricas.
  - Renderizado DOM seguro (`createElement` / `textContent` sin inyección de `innerHTML` no confiable) y actualización reactiva de nodos en memoria sin *layout thrashing*.
  - **PWA Offline-First**: Service Worker con rutas relativas compatibles tanto con dominios raíz como con GitHub Pages (`/growcalc/`).

## 🛠️ Arquitectura

```text
growcalc/
├── index.html          # Interfaz semántica accesible con cabecera CSP
├── manifest.json       # Manifiesto PWA instalable
├── service-worker.js   # Caché offline seguro con validación de respuestas
├── css/
│   └── styles.css      # Sistema de diseño con variables CSS y layout responsive
├── icons/
│   ├── favicon.svg     # Emblema vectorial ligero Soul Sensei
│   ├── icon-192.png    # Ícono oficial PWA 192x192
│   └── icon-512.png    # Ícono oficial PWA 512x512
└── js/
    ├── data.js         # Tabla oficial inmutable de Soul Sensei
    ├── calculator.js   # Motor puro de cálculo y conversión L ⇄ US Gal
    ├── storage.js      # Persistencia segura y validada en localStorage
    └── app.js          # Controlador de interfaz reactivo
```

## 👤 Autor

**smur.henao@gmail.com** • EKE Software
