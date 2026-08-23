<div align="center">

# 🔷 Servitoken (SERVI)

**Token de utilidad para pagos de servicios en BNB Smart Chain**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![wagmi](https://img.shields.io/badge/wagmi-3-1E1E1E?logo=ethereum&logoColor=white)](https://wagmi.sh/)
[![BSC](https://img.shields.io/badge/BNB_Smart_Chain-56-F3BA2F?logo=binance&logoColor=white)](https://www.bnbchain.org/)
[![License](https://img.shields.io/badge/Licencia-Código_Abierto-green)](LICENSE)

</div>

---

## 📖 Descripción

**Servitoken (SERVI)** es un token BEP-20 de utilidad desplegado en **BNB Smart Chain**, diseñado para conectar usuarios, servicios y comercios dentro de un ecosistema digital de pagos.

Este repositorio contiene el **sitio web oficial** de Servitoken: una landing page premium oscura construida con Next.js 16, que incluye conexión de billeteras (MetaMask + WalletConnect), visualización de datos del token en tiempo real, gráfico de mercado embebido de DexScreener, y documentos legales completos.

---

## ✨ Características

### 🌐 Sitio Web
- **Landing page premium** con diseño oscuro y efectos glassmorphism
- **14 secciones** informativas: Hero, Datos del Token, ¿Qué es?, Utilidad, Cómo funciona, Precio, Gráfico, Compra, Plataformas externas, Contrato, Beneficios, FAQ, Contacto
- **Totalmente responsive** — optimizado para móvil, tablet y escritorio
- **Navegación por anclas** con scroll suave
- **Modales legales** completos (Aviso Legal, Términos de Uso, Política de Privacidad, Aviso de Riesgo)

### 🔗 Web3 / Wallet
- **Conexión de billeteras** via MetaMask (injected) y WalletConnect (QR)
- **Auto-switch silencioso** a BNB Smart Chain sin mensajes de error
- **Consulta de balances** en tiempo real (BNB, USDT, SERVI)
- **Panel de cotización** USDT → SERVI vía PancakeSwap V2 Router (`getAmountsOut`)
- **Copia de dirección** al portapapeles con un clic

### 📊 Mercado
- **Gráfico embebido** de DexScreener (par SERVI/USDT)
- **Acceso directo** a PancakeSwap y DexScreener
- **Dirección del contrato** con botón de copiar y enlace a explorador de bloques

### ⚖️ Legal
- Aviso Legal completo
- Términos de Uso
- Política de Privacidad
- Aviso de Riesgo (inversión en criptoactivos)

---

## 🛠️ Stack Tecnológico

| Categoría | Tecnología |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Lenguaje** | TypeScript 5 |
| **Estilos** | Tailwind CSS 4 + shadcn/ui (New York) |
| **Animaciones** | Framer Motion 12 |
| **Web3** | wagmi 3 + viem 2 |
| **Wallet** | MetaMask (injected) + WalletConnect v2 |
| **Consultas** | @tanstack/react-query 5 |
| **Iconos** | Lucide React |
| **Notificaciones** | Sonner |
| **Runtime** | Bun |
| **Procesos** | PM2 |
| **Proxy** | Caddy |

---

## 📁 Estructura del Proyecto

```
servitoken/
├── public/
│   ├── servitoken-logo.png          # Logo principal
│   ├── servitoken-logo-sm.png       # Favicon
│   ├── logo.svg                     # Logo SVG
│   ├── pancakeswap-qr.png           # QR de PancakeSwap
│   └── robots.txt                   # SEO crawler config
├── prisma/
│   ├── schema.prisma                # Esquema de base de datos
│   └── migrations/                  # Migraciones
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Layout raíz (fuentes, providers)
│   │   ├── page.tsx                 # Página principal (todas las secciones)
│   │   └── globals.css              # Sistema de diseño Tailwind + tokens
│   ├── components/
│   │   ├── landing/
│   │   │   ├── site-header.tsx          # Navegación sticky + wallet
│   │   │   ├── hero-section.tsx         # Banner hero principal
│   │   │   ├── token-data-section.tsx   # Datos del token (supply, red, etc.)
│   │   │   ├── what-is-section.tsx      # ¿Qué es Servitoken?
│   │   │   ├── utility-section.tsx      # 4 tarjetas de utilidad
│   │   │   ├── how-it-works-section.tsx # 3 pasos de funcionamiento
│   │   │   ├── pricing-section.tsx      # Precio + panel de cotización
│   │   │   ├── chart-section.tsx        # Gráfico DexScreener
│   │   │   ├── purchase-section.tsx     # Compra directa (iframe PancakeSwap)
│   │   │   ├── external-platforms-section.tsx # Links a DEXs
│   │   │   ├── contract-section.tsx     # Dirección del contrato
│   │   │   ├── benefits-section.tsx     # Beneficios del token
│   │   │   ├── faq-section.tsx          # Preguntas frecuentes
│   │   │   ├── contact-section.tsx      # Redes sociales
│   │   │   ├── site-footer.tsx          # Pie de página
│   │   │   ├── connect-wallet.tsx       # Modal de conexión de wallet
│   │   │   ├── swap-panel.tsx           # Panel de cotización USDT→SERVI
│   │   │   ├── client-providers.tsx     # Wrapper cliente para wagmi (SSR-safe)
│   │   │   ├── wallet-provider-inner.tsx # Config wagmi con conectores
│   │   │   ├── legal-modal.tsx          # Modal de documentos legales
│   │   │   ├── section-primitives.tsx   # Componentes reutilizables de sección
│   │   │   └── logo.tsx                 # Componente del logo SVG
│   │   └── ui/                         # 35+ componentes shadcn/ui
│   ├── lib/
│   │   ├── contracts.ts              # Direcciones de contratos + ABIs
│   │   ├── token-data.ts             # Datos centralizados del proyecto
│   │   ├── utils.ts                  # Utilidades (cn, etc.)
│   │   └── db.ts                     # Cliente Prisma
│   └── hooks/
│       ├── use-mobile.ts            # Detección de breakpoint móvil
│       └── use-toast.ts             # Hook de notificaciones
├── ecosystem.config.cjs             # Configuración PM2
├── Caddyfile                        # Reverse proxy Caddy
├── next.config.ts                   # Configuración Next.js
├── tailwind.config.ts               # Configuración Tailwind
├── tsconfig.json                    # Configuración TypeScript
├── package.json                     # Dependencias y scripts
└── bun.lock                         # Lockfile de Bun
```

---

## 📋 Contratos y Red

### Red
| Parametro | Valor |
|---|---|
| **Blockchain** | BNB Smart Chain (BSC) |
| **Chain ID** | 56 |
| **Explorador** | BscScan |

### Contratos
| Token | Dirección |
|---|---|
| **SERVI (BEP-20)** | `0x07e6CB0876653B914Fc3805283a275b90bF7E443` |
| **USDT (BSC)** | `0x55d398326f99059fF775485246999027B3197955` |
| **WBNB** | `0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c` |
| **PancakeSwap Router V2** | `0x10ED43C718714eb63d5aA57B78B54704E256024E` |

### Datos del Token
| Propiedad | Valor |
|---|---|
| **Nombre** | Servitoken |
| **Símbolo** | SERVI |
| **Estándar** | BEP-20 |
| **Decimales** | 18 |
| **Oferta Total** | 500,000,000 SERVI |
| **Par de Trading** | SERVI / USDT |

### Enlaces Externos
| Plataforma | Enlace |
|---|---|
| **PancakeSwap** | [Intercambiar SERVI](https://pancakeswap.finance/swap?inputCurrency=0x55d398326f99059fF775485246999027B3197955&outputCurrency=0x07e6CB0876653B914Fc3805283a275b90bF7E443) |
| **DexScreener** | [Ver gráfico SERVI/USDT](https://dexscreener.com/bsc/0xAd48f36F851cE4dcA85a07BB3D6a573a4c70ed18) |

---

## 🚀 Instalación y Configuración

### Requisitos Previos

- [Bun](https://bun.sh/) (v1.0+)
- [Node.js](https://nodejs.org/) v18+ (alternativo a Bun)
- [Git](https://git-scm.com/)

### 1. Clonar el Repositorio

```bash
git clone https://github.com/osklabsoficial-sys/Servitoken.git
cd Servitoken
```

### 2. Instalar Dependencias

```bash
bun install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# WalletConnect Cloud Project ID (obtener en https://cloud.walletconnect.com/)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=tu_project_id_aqui

# Base de datos SQLite (opcional, para Prisma)
DATABASE_URL=file:./db/custom.db
```

> **Nota:** Para habilitar WalletConnect (conexión QR desde móviles), necesitas un Project ID de [WalletConnect Cloud](https://cloud.walletconnect.com/). MetaMask funciona sin esta configuración.

### 4. Iniciar en Modo Desarrollo

```bash
bun run dev
```

La aplicación estará disponible en `http://localhost:3000`.

### 5. Construir para Producción

```bash
bun run build
```

### 6. Ejecutar en Producción

```bash
# Con PM2 (recomendado)
bun run pm2:start

# O directamente con Node
node .next/standalone/server.js
```

---

## 📜 Scripts Disponibles

| Script | Comando | Descripción |
|---|---|---|
| `dev` | `next dev -p 3000` | Servidor de desarrollo con Turbopack |
| `build` | `next build` | Construcción optimizada para producción |
| `start` | `next start` | Iniciar servidor de producción |
| `lint` | `next lint` | Análisis estático con ESLint |
| `pm2:start` | `pm2 start ecosystem.config.cjs` | Iniciar con PM2 |
| `pm2:stop` | `pm2 stop servitoken-dev` | Detener proceso PM2 |
| `pm2:restart` | `pm2 restart servitoken-dev` | Reiniciar proceso PM2 |
| `pm2:logs` | `pm2 logs servitoken-dev` | Ver logs de PM2 |

---

## 🏗️ Arquitectura

### Enfoque SSR-Safe para Web3

El mayor desafío técnico fue integrar **wagmi + WalletConnect** en un proyecto Next.js con **Turbopack** sin que el análisis estático de SSR causara crashes por dependencias faltantes (`@coinbase/cdp-sdk` → `@x402/evm/exact/client`).

**Solución implementada:**

```
layout.tsx (Server Component)
  └── ClientProviders (Client, next/dynamic ssr:false)
        └── WalletProviderInner (Client)
              ├── Importa desde sub-rutas individuales:
              │   ├── wagmi/connectors/injected     ← Sin dependencias de Coinbase
              │   └── wagmi/connectors/walletConnect ← Sin dependencias de Coinbase
              └── WagmiProvider + QueryClientProvider
```

Las importaciones desde `wagmi/connectors/injected` y `wagmi/connectors/walletConnect` evitan el barrel `wagmi/connectors` que arrastra todo el árbol de dependencias incluyendo `@coinbase/cdp-sdk`.

### Sistema de Diseño

El sistema visual usa **Tailwind CSS 4** con **shadcn/ui** (estilo New York):

- **Tema oscuro premium** con fondo navy profundo (`#0C1426`)
- **Glassmorphism** via clase `.glass-card` (backdrop-blur + bordes translúcidos)
- **Tokens de marca**: `electric` (azul brillante), `gold` (dorado), `brand-green` (verde éxito)
- **Animaciones sutiles** con Framer Motion (fade-in al scroll)
- **Tipografía**: Geist Sans + Geist Mono

### Datos Centralizados

Todos los textos, datos del token, secciones de FAQ, redes sociales y **documentos legales completos** están centralizados en [`src/lib/token-data.ts`](src/lib/token-data.ts) para fácil mantenimiento y actualización.

---

## 🔌 Secciones del Sitio

| # | Sección | ID Anchor | Descripción |
|---|---|---|---|
| 1 | **Header** | — | Navegación sticky con logo, enlaces y wallet |
| 2 | **Hero** | `#inicio` | Banner principal con CTAs |
| 3 | **Datos del Token** | — | Tarjeta con supply, red, estándar, par |
| 4 | **¿Qué es?** | `#que-es` | Explicación del proyecto |
| 5 | **Utilidad** | `#utilidad` | 4 tarjetas: Pagos, Beneficios, Ecosistema, Blockchain |
| 6 | **Cómo funciona** | `#como-funciona` | 3 pasos: Adquirir → Conectar → Usar |
| 7 | **Precio y Compra** | `#precio` | Cotización USDT→SERVI + enlace a mercado |
| 8 | **Gráfico** | — | Gráfico embebido de DexScreener |
| 9 | **Compra** | `#compra` | Iframe de PancakeSwap para compra directa |
| 10 | **Plataformas** | — | Links a PancakeSwap y DexScreener |
| 11 | **Contrato** | — | Dirección del contrato con copiar |
| 12 | **Beneficios** | — | 3 tarjetas de beneficios |
| 13 | **FAQ** | `#faq` | 7 preguntas frecuentes |
| 14 | **Contacto** | `#contacto` | Redes sociales |
| 15 | **Footer** | — | Logo, enlaces, legales, copyright |

---

## ⚠️ Notas Importantes

### Seguridad
- **Nunca** compartas tu WalletConnect Project ID públicamente en repositorios que no sean de código abierto controlado.
- El sitio **no accede** a los fondos de los usuarios. Toda interacción con contratos se realiza directamente desde la wallet del usuario.
- La sección de compra usa un **iframe de PancakeSwap** — la wallet interactúa directamente con el contrato.

### Panel de Cotización
- El `SwapPanel` en la sección de precio consulta cotizaciones en tiempo real via `getAmountsOut` del router de PancakeSwap V2.
- La **ejecución del swap está deshabilitada** (botón "PRÓXIMAMENTE") — es solo consultiva.

### Dependencias
- Algunas dependencias en `package.json` (next-auth, next-intl, @mdxeditor/editor, @dnd-kit, etc.) son remanentes del scaffolding inicial y no se utilizan actualmente en la landing page.
- Prisma/SQLite está configurado pero los modelos User/Post no se usan en la landing.

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para contribuir:

1. **Fork** el repositorio
2. Crea una rama para tu feature: `git checkout -b feature/nombre-feature`
3. Realiza tus cambios y haz commit: `git commit -m 'Add: descripción del cambio'`
4. Sube tu rama: `git push origin feature/nombre-feature`
5. Abre un **Pull Request**

### Convenciones
- Seguir el estilo existente del código
- Usar **TypeScript** estricto
- Mantener los componentes en `src/components/landing/`
- Centralizar textos y datos en `src/lib/token-data.ts`

---

## 📄 Licencia

Este proyecto es de **código abierto**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

<div align="center">

**Servitoken** — Token de utilidad para pagos de servicios

[🌐 Sitio Web](https://servitoken.com) · [📈 DexScreener](https://dexscreener.com/bsc/0xAd48f36F851cE4dcA85a07BB3D6a573a4c70ed18) · [🔗 PancakeSwap](https://pancakeswap.finance/swap?inputCurrency=0x55d398326f99059fF775485246999027B3197955&outputCurrency=0x07e6CB0876653B914Fc3805283a275b90bF7E443)

</div>
