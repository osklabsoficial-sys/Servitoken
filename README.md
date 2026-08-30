# Servitoken (SERVI) - Landing Page Oficial

<p align="center">
  <img src="public/servitoken-logo.png" alt="Servitoken Logo" width="120" height="120" />
</p>

<p align="center">
  <strong>Servitoken (SERVI)</strong><br />
  Token BEP-20 de utilidad en BNB Smart Chain
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Red-BNB_Smart_Chain-yellow?logo=binance" alt="BSC" />
  <img src="https://img.shields.io/badge/Estandard-BEP__20-blue" alt="BEP-20" />
  <img src="https://img.shields.io/badge/Supply-500M-orange" alt="Supply" />
  <img src="https://img.shields.io/badge/Framework-Next.js_16-black?logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT" />
</p>

---

## Descripción

Página web oficial de **Servitoken (SERVI)**, un token de utilidad diseñado para conectar usuarios, servicios y comercios dentro de un ecosistema digital de pagos en BNB Smart Chain.

### Contrato

| Dato | Valor |
|------|-------|
| **Red** | BNB Smart Chain (BSC) |
| **Contrato** | `0x07e6CB0876653B914Fc3805283a275b90bF7E443` |
| **Estándar** | BEP-20 |
| **Supply** | 500,000,000 SERVI |
| **Decimales** | 18 |
| **Par** | SERVI / USDT |
| **Router** | PancakeSwap V2 `0x10ED43C718714eb63d5aA57B78B54704E256024E` |
| **DexScreener** | [Ver par](https://dexscreener.com/bsc/0xAd48f36F851cE4dcA85a07BB3D6a573a4c70ed18) |

---

## Stack Tecnológico

- **Framework**: [Next.js 16](https://nextjs.org/) con App Router
- **Lenguaje**: [TypeScript 5](https://www.typescriptlang.org/)
- **Estilos**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Componentes UI**: [shadcn/ui](https://ui.shadcn.com/) (New York style)
- **Iconos**: [Lucide React](https://lucide.dev/)
- **Animaciones**: [Framer Motion](https://www.framer.com/motion/)
- **Wallet**: [wagmi v3](https://wagmi.sh/) + [viem v2](https://viem.sh/) + [WalletConnect v2](https://walletconnect.com/)
- **Estado servidor**: [@tanstack/react-query 5](https://tanstack.com/query)
- **Base de datos**: [Prisma](https://www.prisma.io/) + SQLite (opcional)
- **Runtime**: [Bun](https://bun.sh/)

---

## Estructura del Proyecto

```
servitoken/
├── public/
│   ├── servitoken-logo.png          # Logo principal
│   ├── servitoken-logo-sm.png       # Logo pequeño (favicon)
│   └── pancakeswap-qr.png           # QR para consulta de compra
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Layout raíz con ClientProviders (wagmi)
│   │   ├── page.tsx                  # Página principal (todas las secciones)
│   │   └── globals.css               # Estilos globales + tema oscuro
│   ├── components/
│   │   ├── landing/
│   │   │   ├── client-providers.tsx      # Wrapper client-side (ssr: false)
│   │   │   ├── wallet-provider-inner.tsx # Config wagmi + BSC + WalletConnect
│   │   │   ├── connect-wallet.tsx        # Conexión multi-wallet (100+ extensiones)
│   │   │   ├── hero-wallet-connect.tsx   # Widget de wallet prominente en hero
│   │   │   ├── hero-section.tsx          # Sección hero principal
│   │   │   ├── token-data-section.tsx    # Stats del token (supply, red, etc.)
│   │   │   ├── what-is-section.tsx       # Qué es Servitoken
│   │   │   ├── utility-section.tsx       # Utilidad del token
│   │   │   ├── how-it-works-section.tsx  # Cómo funciona (3 pasos)
│   │   │   ├── purchase-section.tsx      # Iframe PancakeSwap (comprar SERVI)
│   │   │   ├── pricing-section.tsx       # Precio, QR, dirección contrato
│   │   │   ├── external-platforms-section.tsx # PancakeSwap, DexScreener
│   │   │   ├── contract-section.tsx      # Dirección del contrato
│   │   │   ├── benefits-section.tsx      # Beneficios
│   │   │   ├── faq-section.tsx           # Preguntas frecuentes
│   │   │   ├── contact-section.tsx       # Contacto
│   │   │   ├── site-header.tsx           # Header con nav + wallet
│   │   │   ├── site-footer.tsx           # Footer con legal
│   │   │   ├── legal-modal.tsx           # Modal reutilizable para secciones legales
│   │   │   ├── logo.tsx                  # Logo SVG del token
│   │   │   ├── lucide-icon.tsx           # Utilidad de iconos dinámicos
│   │   │   └── section-primitives.tsx    # Wrappers de sección (Reveal, SectionHeading)
│   │   └── ui/                        # Componentes shadcn/ui
│   └── lib/
│       └── token-data.ts             # Datos centralizados del proyecto
├── prisma/
│   └── schema.prisma                # Esquema de BD (opcional)
├── next.config.ts                   # Configuración de Next.js
├── tailwind.config.ts               # Configuración de Tailwind
├── package.json
├── tsconfig.json
└── README.md
```

---

## Funcionalidades

### Conexión de Wallet

Soporte para **100+ wallets** mediante detección automática de extensiones EIP-1193:

- **WalletConnect** (primario): Escanea QR desde cualquier wallet móvil
- **Extensiones detectadas**: MetaMask, Trust Wallet, OKX Wallet, Rabby, Coinbase Wallet, Binance Wallet, Phantom, Bitget Wallet, Rainbow, OneKey, MathWallet, y muchas más
- **Resolución de nombres**: Mapea `window.ethereum` providers a nombres reales de wallets
- **Sin wallets detectadas**: Muestra panel con enlaces de descarga a 12 wallets populares
- **Auto-switch**: Selecciona BNB Smart Chain automáticamente al conectar

### Secciones de la Página

| Sección | Descripción |
|---------|-------------|
| Hero | Presentación principal con wallet connect prominente |
| Datos del Token | Supply, red, decimales, contrato |
| Qué es | Descripción del proyecto |
| Utilidad | Pagos, beneficios, ecosistema, blockchain |
| Cómo funciona | 3 pasos: adquirir, conectar, utilizar |
| Comprar | Iframe embebido de PancakeSwap V2 |
| Precio y Compra | Precio, QR, dirección contrato |
| Plataformas | Enlaces a PancakeSwap y DexScreener |
| Contrato | Dirección copiable del contrato BEP-20 |
| Beneficios | Pagos sencillos, beneficios, conexiones |
| FAQ | 6 preguntas frecuentes |
| Contacto | Información de contacto |
| Legal | Aviso Legal, Términos, Privacidad, Riesgos (modales) |

---

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/osklabsoficial-sys/Servitoken.git
cd Servitoken

# Instalar dependencias
bun install

# Iniciar servidor de desarrollo
bun run dev
```

La aplicación estará disponible en `http://localhost:3000`.

---

## Arquitectura de Wallet

La conexión de wallet utiliza un patrón de **carga diferida client-side** para evitar crashs de SSR:

```
layout.tsx (Server Component)
  └── ClientProviders ("use client", next/dynamic ssr:false)
        └── WalletProviderInner ("use client", wagmi config)
              └── WagmiProvider + QueryClientProvider
                    └── ConnectWallet, HeroWalletConnect, etc.
```

### Imports anti-crash

Se usan **subpath imports individuales** de wagmi para evitar la cadena de dependencias de `@coinbase/cdp-sdk` que causa crash en SSR con Turbopack:

```typescript
// ✅ Correcto (subpath imports)
import { injected } from "wagmi/connectors/injected";
import { walletConnect } from "wagmi/connectors/walletConnect";

// ❌ Evitar (barrel import que tira de Coinbase SDK)
import { injected, walletConnect } from "wagmi/connectors";
```

### Detección de extensiones

El componente `connect-wallet.tsx` escanea `window.ethereum` y `window.ethereum.providers` (EIP-6963) para detectar todas las extensiones instaladas. Un mapa de 70+ providers (`PROVIDER_NAME_MAP`) resuelve nombres genéricos como `isMetaMask` a nombres amigables como "MetaMask".

---

## Scripts

| Comando | Descripción |
|---------|-------------|
| `bun run dev` | Servidor de desarrollo (puerto 3000) |
| `bun run build` | Build de producción |
| `bun run lint` | Lint con ESLint |
| `bun run db:push` | Push del schema Prisma a SQLite |
| `bun run db:generate` | Generar Prisma Client |

---

## Variables de Entorno

No se requieren variables de entorno para la landing page. El WalletConnect Project ID está configurado directamente en `wallet-provider-inner.tsx`.

Para producción, se recomienda usar variables de entorno:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=tu_project_id
NEXT_PUBLIC_EXPLORER_URL=https://bscscan.com
```

---

## Despliegue

La aplicación está configurada para desplegarse en cualquier plataforma que soporte Next.js:

- **Vercel** (recomendado)
- **Docker** (standalone output)
- **VPS** con Node.js/Bun

---

## Contribución

1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nombre`
3. Commits descriptivos: `git commit -m 'feat: descripción'`
4. Push a la rama: `git push origin feature/nombre`
5. Abrir Pull Request

---

## Licencia

MIT

---

## Contacto

- **Repositorio**: [github.com/osklabsoficial-sys/Servitoken](https://github.com/osklabsoficial-sys/Servitoken)
- **Contrato**: [`0x07e6CB0876653B914Fc3805283a275b90bF7E443`](https://bscscan.com/address/0x07e6CB0876653B914Fc3805283a275b90bF7E443)
- **PancakeSwap**: [Intercambiar SERVI](https://pancakeswap.finance/swap?outputCurrency=0x07e6CB0876653B914Fc3805283a275b90bF7E443&chain=bsc)
- **DexScreener**: [Ver mercado](https://dexscreener.com/bsc/0xAd48f36F851cE4dcA85a07BB3D6a573a4c70ed18)
