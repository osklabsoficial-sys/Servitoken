/**
 * ============================================================
 *  DATOS DEL PROYECTO DE TOKEN
 * ============================================================
 *  Este archivo centraliza toda la información configurable de
 *  la landing page. Reemplaza los valores de ejemplo por los
 *  datos reales de tu proyecto antes de publicar.
 * ============================================================
 */

export type NavLink = {
  label: string;
  href: string;
};

export type StatItem = {
  label: string;
  value: string;
};

export type FeatureItem = {
  title: string;
  description: string;
  icon: string; // nombre del icono de lucide-react
};

export type StepItem = {
  step: string;
  title: string;
  description: string;
  icon: string;
};

export type BuyPlatform = {
  name: string;
  description: string;
  url: string;
  icon: string;
  accent: string; // clases de color de tailwind para el icono
};

export type SocialLink = {
  name: string;
  handle: string;
  url: string;
  icon: string;
};

export type SupportChannel = {
  name: string;
  detail: string;
  url: string;
  icon: string;
};

export type PricePoint = {
  t: string;
  price: number;
};

export const token = {
  name: "Token de Servicios",
  ticker: "SVS",
  tagline: "El token pensado para pagar servicios de forma simple, rápida y segura.",
  description:
    "Un proyecto de token diseñado específicamente para el pago de servicios. Construimos una herramienta digital confiable, transparente y de bajo costo para que cualquier persona pueda gestionar sus pagos cotidianos con claridad y sin intermediarios innecesarios.",
  network: "BNB Smart Chain (BEP-20)",
  contractAddress: "0x7A2c91F3a1BdE48c0c4d9b03f4E2a6C7d8e9F012",
  symbol: "SVS",
  decimals: 18,
  totalSupply: "1,000,000,000",
  circulatingSupply: "425,000,000",
  holders: "12,480",
  price: {
    current: 0.0124,
    currency: "USD",
    change24h: 3.42, // porcentaje
    marketCap: "5,270,000",
    volume24h: "182,400",
  },
} as const;

export const navLinks: NavLink[] = [
  { label: "Inicio", href: "#inicio" },
  { label: "Información", href: "#informacion" },
  { label: "Precio y compra", href: "#precio" },
  { label: "Contacto", href: "#contacto" },
];

export const heroStats: StatItem[] = [
  { label: "Titulares", value: token.holders },
  { label: "Suministro total", value: token.totalSupply },
  { label: "Red", value: "BEP-20" },
  { label: "Decimales", value: String(token.decimals) },
];

export const tokenHighlights: FeatureItem[] = [
  {
    title: "Contrato verificado",
    description:
      "El contrato del token está verificado públicamente en el explorador de la red para total transparencia.",
    icon: "ShieldCheck",
  },
  {
    title: "Bajas comisiones",
    description:
      "Diseñado para pagos frecuentes con costos reducidos por transacción frente a métodos tradicionales.",
    icon: "Receipt",
  },
  {
    title: "Transacciones rápidas",
    description:
      "Los pagos se confirman en segundos gracias a la red blockchain sobre la que opera el token.",
    icon: "Zap",
  },
  {
    title: "Suministro transparente",
    description:
      "El suministro total y en circulación es auditable en cualquier momento por la comunidad.",
    icon: "Eye",
  },
];

export const howItWorks: StepItem[] = [
  {
    step: "01",
    title: "Adquiere el token",
    description:
      "Compra SVS en cualquiera de las plataformas de intercambio soportadas y guárdalo en tu billetera.",
    icon: "Wallet",
  },
  {
    step: "02",
    title: "Selecciona un servicio",
    description:
      "Elige entre los servicios disponibles dentro del ecosistema asociado al proyecto.",
    icon: "HandCoins",
  },
  {
    step: "03",
    title: "Paga con el token",
    description:
      "Confirma el pago directamente desde tu billetera. Sin intermediarios y en pocos segundos.",
    icon: "Send",
  },
  {
    step: "04",
    title: "Recibe tu confirmación",
    description:
      "Obtén un comprobante on-chain verificable que respalda la operación realizada.",
    icon: "BadgeCheck",
  },
];

export const benefits: FeatureItem[] = [
  {
    title: "Pago de servicios",
    description:
      "Usa el token para abonar servicios digitales, suscripciones y consumos del ecosistema asociado.",
    icon: "CreditCard",
  },
  {
    title: "Comisiones reducidas",
    description:
      "Disfruta de costos por transacción notablemente menores frente a pasarelas tradicionales.",
    icon: "PiggyBank",
  },
  {
    title: "Velocidad de confirmación",
    description:
      "Las transacciones se confirman en segundos, ideal para pagos cotidianos.",
    icon: "Timer",
  },
  {
    title: "Seguridad y transparencia",
    description:
      "Todas las operaciones quedan registradas en la blockchain y son auditables públicamente.",
    icon: "Lock",
  },
  {
    title: "Acceso global",
    description:
      "Envía y recibe pagos desde cualquier lugar sin restricciones geográficas ni horarios.",
    icon: "Globe",
  },
  {
    title: "Sin intermediarios",
    description:
      "Operaciones persona a persona y directa con el proveedor de servicios, sin terceros.",
    icon: "Users",
  },
];

export const buyPlatforms: BuyPlatform[] = [
  {
    name: "PancakeSwap",
    description: "Intercambio descentralizado en BNB Smart Chain.",
    url: "https://pancakeswap.finance/",
    icon: "Cookie",
    accent: "bg-amber-100 text-amber-700",
  },
  {
    name: "UniSwap",
    description: "DEX de referencia para intercambiar tokens BEP-20.",
    url: "https://uniswap.org/",
    icon: "Repeat",
    accent: "bg-pink-100 text-pink-700",
  },
  {
    name: "Binance",
    description: "Exchange centralizado con alta liquidez.",
    url: "https://www.binance.com/",
    icon: "Landmark",
    accent: "bg-yellow-100 text-yellow-700",
  },
  {
    name: "Gate.io",
    description: "Plataforma global de intercambio de activos.",
    url: "https://www.gate.io/",
    icon: "Building2",
    accent: "bg-emerald-100 text-emerald-700",
  },
];

export const howToBuy: StepItem[] = [
  {
    step: "1",
    title: "Crea una billetera",
    description:
      "Descarga una billetera compatible con BNB Smart Chain, como MetaMask o Trust Wallet.",
    icon: "Wallet",
  },
  {
    step: "2",
    title: "Añade la red BNB",
    description:
      "Configura la red BNB Smart Chain en tu billetera y carga saldo de BNB para gas.",
    icon: "Network",
  },
  {
    step: "3",
    title: "Importa el token",
    description:
      "Agrega la dirección del contrato del SVS a tu billetera para visualizar tu saldo.",
    icon: "Import",
  },
  {
    step: "4",
    title: "Realiza el intercambio",
    description:
      "Entra a una de las plataformas soportadas y cambia BNB por SVS al precio de mercado.",
    icon: "ArrowLeftRight",
  },
];

// Datos simulados de precio histórico para el mini gráfico
export const priceHistory: PricePoint[] = [
  { t: "00:00", price: 0.0118 },
  { t: "02:00", price: 0.0116 },
  { t: "04:00", price: 0.0119 },
  { t: "06:00", price: 0.0121 },
  { t: "08:00", price: 0.0117 },
  { t: "10:00", price: 0.0122 },
  { t: "12:00", price: 0.0125 },
  { t: "14:00", price: 0.0123 },
  { t: "16:00", price: 0.0126 },
  { t: "18:00", price: 0.0124 },
  { t: "20:00", price: 0.0127 },
  { t: "22:00", price: 0.0124 },
];

export const socialLinks: SocialLink[] = [
  {
    name: "X (Twitter)",
    handle: "@servicetoken",
    url: "https://x.com/",
    icon: "Twitter",
  },
  {
    name: "Telegram",
    handle: "t.me/servicetoken",
    url: "https://telegram.org/",
    icon: "Send",
  },
  {
    name: "Discord",
    handle: "discord.gg/servicetoken",
    url: "https://discord.com/",
    icon: "MessageCircle",
  },
  {
    name: "GitHub",
    handle: "github.com/servicetoken",
    url: "https://github.com/",
    icon: "Github",
  },
];

export const supportChannels: SupportChannel[] = [
  {
    name: "Correo de soporte",
    detail: "soporte@servicetoken.com",
    url: "mailto:soporte@servicetoken.com",
    icon: "Mail",
  },
  {
    name: "Canal de Telegram",
    detail: "Anuncios y novedades oficiales",
    url: "https://telegram.org/",
    icon: "Megaphone",
  },
  {
    name: "Centro de ayuda",
    detail: "Guías y preguntas frecuentes",
    url: "#",
    icon: "LifeBuoy",
  },
  {
    name: "Comunidad Discord",
    detail: "Soporte directo de la comunidad",
    url: "https://discord.com/",
    icon: "Headphones",
  },
];

export const faqs = [
  {
    question: "¿Qué es SVS y para qué sirve?",
    answer:
      "SVS es un token creado para el pago de servicios dentro de su ecosistema. Permite abonar consumos digitales de forma rápida y con bajas comisiones.",
  },
  {
    question: "¿En qué red opera el token?",
    answer:
      "El token opera sobre BNB Smart Chain (BEP-20). Necesitarás una billetera compatible con esta red para recibirlo y enviarlo.",
  },
  {
    question: "¿Cómo verifico el contrato del token?",
    answer:
      "Puedes consultar la dirección del contrato en un explorador de bloques como BscScan para revisar el suministro, los titulares y el código verificado.",
  },
  {
    question: "¿Cuál es el suministro total del token?",
    answer:
      `El suministro total es de ${token.totalSupply} de tokens, de los cuales una parte está en circulación y es auditable públicamente.`,
  },
];
