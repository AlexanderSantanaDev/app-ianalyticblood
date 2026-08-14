# 🩸 IAnalytic Blood - Smart Medical Analysis Platform

> © 2026 Alexander Santana. Todos los derechos reservados.

![IAnalytic Blood](https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge) ![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=next.js&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) ![Stripe](https://img.shields.io/badge/Stripe-008CDD?style=for-the-badge&logo=stripe&logoColor=white) ![Python](https://img.shields.io/badge/Python_API-3776AB?style=for-the-badge&logo=python&logoColor=white)

**IAnalytic Blood** es una plataforma _health-tech_ SaaS de última generación diseñada para revolucionar la forma en que los pacientes comprenden sus análisis de sangre. Mediante el uso de Inteligencia Artificial avanzada, la plataforma es capaz de leer informes médicos en PDF o imagen, extraer biomarcadores clave y traducirlos a una interfaz clara, estructurada y visualmente impactante.

---

## 🚀 Características Principales

- **Subida Inteligente de Informes:** Soporte para archivos PDF e imágenes con previsualización inmediata y validación estricta en cliente/servidor.
- **Análisis Clínico Impulsado por IA:** El motor backend interpreta los resultados de laboratorio extrayendo métricas, rangos de referencia y generando conclusiones médicas estructuradas.
- **Dashboard Interactivo:** Un panel de control donde los usuarios pueden visualizar el histórico de sus analíticas, evolución de biomarcadores y alertas críticas de salud.
- **Planes y Suscripciones (SaaS):** Integración con Stripe para gestionar los niveles de acceso:
  - **Plan Básico (Free):** Permite subir análisis básicos, ver resultados generales y acceder a un histórico limitado de informes. Ideal para conocer la plataforma.
  - **Plan Premium:** Análisis ilimitados, extracción avanzada de todos los biomarcadores, conclusiones detalladas, recomendaciones personalizadas de salud y soporte prioritario.
- **UX/UI de Nivel Enterprise:** Diseñado con un enfoque _brutal visual finish_, combinando TailwindCSS, tipografía cuidada, micro-interacciones (Framer Motion) y un sistema de diseño propio basado en Radix UI.
- **Diseño 100% Adaptativo:** Experiencia impecable desde dispositivos móviles (optimizada con unidades `dvh` para evitar saltos del navegador) hasta monitores ultrawide.

---

## 💻 Arquitectura y Stack Tecnológico

El proyecto está dividido en un Frontend robusto desarrollado en TypeScript y un Backend analítico en Python.

### Frontend (Este Repositorio)

- **Framework:** Next.js 15 (App Router) haciendo uso intensivo de React Server Components (RSC) para minimizar el _bundle_ enviado al cliente.
- **Librería UI:** React 18 con TypeScript estricto.
- **Estilado:** TailwindCSS (arquitectura sin SCSS, utilizando selectores arbitrarios, variantes avanzadas y utilidades fluidas).
- **Componentes base:** Radix UI primitives para accesibilidad total (a11y).
- **Pagos y Facturación:** Stripe (Checkout, Customer Portal y Webhooks seguros).
- **Gestión de Formularios:** React Hook Form + Zod para validación tipada end-to-end.
- **Visualización de Datos:** Recharts para gráficas evolutivas de salud.
- **Animaciones:** Framer Motion y Tailwind Animate para transiciones fluidas.

### Backend y Motor de IA

- **API Core:** Desarrollada en Python, diseñada para soportar alta concurrencia.
- **Motor de Inteligencia Artificial:** Integración con modelos de lenguaje de última generación para procesamiento de lenguaje natural (NLP) y visión por computadora (OCR) aplicado a documentos clínicos.
- **Estrategia Stateless:** Procesamiento temporal seguro de los informes sin almacenar datos identificables de los pacientes en el motor de IA.

---

## 🛡️ Ciberseguridad y Blindaje (Security-First)

Al tratar con datos sensibles de salud, la arquitectura ha sido "blindada" aplicando las mejores prácticas de la industria:

### 1. Autenticación y Autorización

- **NextAuth.js (v4/v5):** Implementación de flujos de OAuth seguros y credenciales encriptadas.
- **Gestión de Sesiones:** Tokens JWT almacenados en cookies `HttpOnly`, `Secure` y `SameSite=Lax/Strict` (inaccesibles desde JavaScript).
- **Rutas Protegidas:** El _middleware_ de Next.js verifica la sesión a nivel de red (Edge) antes de renderizar componentes o acceder a la API interna.

### 2. Prevención de Ataques Web (XSS, CSRF, Inyección)

- **Validación Estricta:** Toda entrada de usuario (parámetros de búsqueda, archivos, formularios) es sanitizada y validada matemáticamente con **Zod** antes de tocar el servidor.
- **Protección XSS:** El renderizado de resultados de la IA utiliza el motor de escape nativo de React, evitando a toda costa la inyección de nodos inseguros (`dangerouslySetInnerHTML`).
- **Mitigación CSRF:** Las Server Actions de Next.js 15 y los Route Handlers están protegidos nativamente contra falsificación de peticiones.

### 3. Seguridad en la Subida de Archivos

- **MIME-Type Checking:** Validación profunda del tipo de archivo en el cliente y en el servidor (no solo basada en la extensión).
- **Límites de Tamaño:** Restricción estricta de payloads para prevenir saturación de memoria.
- **Sanitización de Nombres:** Evita inyecciones de _path traversal_ limpiando los nombres de los archivos subidos.

### 4. Hardening de Red y Headers

- **CSP (Content Security Policy):** Políticas estrictas configuradas en `next.config.mjs` para bloquear fuentes externas no autorizadas (incluyendo protección para SVGs externos como avatares).
- **Comunicaciones Cifradas:** Uso mandatorio de HTTPS para toda la comunicación entre el frontend, cliente y la API Python.

---

## ⚡ Rendimiento y Escalabilidad

- **Non-blocking UI:** La subida de informes y el procesamiento por IA se ejecutan de manera asíncrona. Se utilizan _skeletons_ y barras de progreso fluidas para mantener al usuario en contexto.
- **Optimistic Updates:** Cambios de estado inmediatos para una sensación de velocidad absoluta.
- **Caching & Revalidation:** Estrategias de caché a nivel de cliente y servidor (React Cache) para evitar llamadas redundantes a la API al volver a consultar un análisis ya procesado.
- **Lazy Loading:** Carga diferida de componentes pesados (gráficos, modales complejos) e imágenes (`next/image`).

---

## 📂 Estructura de Directorios

```text
├── app/
│   ├── (marketing)/       # Landing page, pricing, auth, legal policies
│   ├── (dashboard)/       # Panel de control, subida de archivos, resultados
│   ├── api/               # Next.js Route handlers (Auth, webhooks)
│   └── components/        # UI System altamente modular (ui/, dashboard/, marketing/)
├── lib/
│   ├── api/               # Clientes de API, fetchers centralizados, tipados (Zod/TS)
│   └── utils.ts           # Helpers, tailwind-merge (cn), formateadores
├── hooks/                 # Custom React hooks (useMobile, loading-context, etc.)
├── middleware.ts          # Seguridad perimetral y protección de rutas
└── tailwind.config.ts     # Sistema de tokens de diseño y animaciones
```

---

> Construido con pasión, enfoque en la experiencia de usuario y arquitectura limpia. Listo para escalar en el ecosistema Health-Tech.
