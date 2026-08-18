/**
 * ============================================================
 *  SERVITOKEN · Datos del proyecto
 * ============================================================
 *  Toda la información configurable del proyecto se concentra
 *  en este archivo. Los campos marcados como `""` (vacíos)
 *  significan "Por confirmar" y se muestran automáticamente
 *  con la etiqueta `PLACEHOLDER` en la interfaz.
 *
 *  >>> REEMPLAZAR con datos oficiales cuando el cliente los
 *  proporcione. NO inventar datos reales. <<<
 * ============================================================
 */

export const PLACEHOLDER = "Por confirmar";

/** Mensaje estándar cuando la información no está disponible todavía. */
export const PENDING_INFO =
  "Esta información será publicada próximamente en los canales oficiales.";

/** Devuelve el valor si existe; si no, el placeholder "Por confirmar". */
export const display = (value?: string | null) =>
  value && value.trim().length > 0 ? value : PLACEHOLDER;

export const project = {
  name: "Servitoken",
  // Descripción corta para metadatos y subtítulos
  shortDescription:
    "Token de utilidad diseñado para conectar usuarios, servicios y comercios dentro de un ecosistema digital de pagos.",

  // ---- DATOS POR CONFIRMAR (vacío = "Por confirmar") ----
  contractAddress: "", // Dirección del contrato.
  network: "", // Red blockchain (ej. "BNB Smart Chain (BEP-20)").
  totalSupply: "", // Suministro total.
  decimals: "", // Decimales del token.
  price: "", // Precio actual.
  buyUrl: "", // URL oficial de compra (botón deshabilitado si vacío).
  // URL base del explorador de bloques. Ej: "https://bscscan.com/address/"
  explorerBaseUrl: "",
} as const;

export type NavLink = { label: string; href: string };

export const navLinks: NavLink[] = [
  { label: "Inicio", href: "#inicio" },
  { label: "¿Qué es?", href: "#que-es" },
  { label: "Utilidad", href: "#utilidad" },
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Precio y compra", href: "#precio" },
  { label: "FAQ", href: "#faq" },
  { label: "Contacto", href: "#contacto" },
];

export const footerLinks: NavLink[] = [
  { label: "Inicio", href: "#inicio" },
  { label: "¿Qué es?", href: "#que-es" },
  { label: "Utilidad", href: "#utilidad" },
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Precio y compra", href: "#precio" },
  { label: "FAQ", href: "#faq" },
  { label: "Contacto", href: "#contacto" },
];

// ---- Indicadores / datos del token (tarjeta horizontal premium) ----
export type Indicator = {
  label: string;
  value: string;
  // nombre de icono lucide minimalista
  icon: string;
  hint: string;
};

export const tokenStats: Indicator[] = [
  {
    label: "Supply total",
    value: project.totalSupply,
    icon: "Coins",
    hint: "Suministro total del token",
  },
  {
    label: "Red",
    value: project.network,
    icon: "Network",
    hint: "Red blockchain del token",
  },
  {
    label: "Decimales",
    value: project.decimals,
    icon: "Hash",
    hint: "Cantidad de decimales",
  },
  {
    label: "Contrato",
    value: project.contractAddress,
    icon: "FileText",
    hint: "Dirección del contrato",
  },
];

export type FeatureCard = {
  icon: string;
  title: string;
  description: string;
};

export const utilityCards: FeatureCard[] = [
  {
    icon: "CreditCard",
    title: "Pagos",
    description:
      "Utiliza Servitoken como alternativa de pago en servicios y comercios participantes.",
  },
  {
    icon: "Gift",
    title: "Beneficios",
    description:
      "Los usuarios pueden acceder a beneficios o descuentos ofrecidos por comercios participantes.",
  },
  {
    icon: "Share2",
    title: "Ecosistema",
    description:
      "Conecta usuarios, comercios y proveedores dentro de una experiencia digital.",
  },
  {
    icon: "Boxes",
    title: "Blockchain",
    description:
      "Utiliza tecnología blockchain para registrar las operaciones.",
  },
];

export type Step = {
  step: string;
  title: string;
  description: string;
  icon: string;
};

export const howItWorks: Step[] = [
  {
    step: "01",
    title: "Adquiere Servitoken",
    description: "Compra el token mediante las plataformas oficiales disponibles.",
    icon: "Coins",
  },
  {
    step: "02",
    title: "Conecta tu wallet",
    description: "Administra tus tokens utilizando una wallet compatible.",
    icon: "Wallet",
  },
  {
    step: "03",
    title: "Utiliza Servitoken",
    description: "Utiliza el token en servicios y comercios participantes.",
    icon: "ShoppingBag",
  },
];

export type ExternalPlatform = {
  name: string;
  description: string;
  url: string; // Vacío = no disponible todavía (botón deshabilitado).
  icon: string;
  accent: string; // clases tailwind para el icono
};

export const externalPlatforms: ExternalPlatform[] = [
  {
    name: "PancakeSwap",
    description: "DEX para intercambiar tokens de forma descentralizada.",
    url: "",
    icon: "Cookie",
    accent: "bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/20",
  },
  {
    name: "MetaMask",
    description: "Wallet compatible para administrar tus Servitoken.",
    url: "",
    icon: "Wallet",
    accent: "bg-orange-400/10 text-orange-300 ring-1 ring-orange-400/20",
  },
];

export type Benefit = {
  icon: string;
  title: string;
  description: string;
};

export const benefits: Benefit[] = [
  {
    icon: "Zap",
    title: "Pagos sencillos",
    description:
      "Una experiencia de pago pensada para ser clara y accesible.",
  },
  {
    icon: "Gift",
    title: "Beneficios",
    description:
      "Posibles beneficios y descuentos en comercios participantes.",
  },
  {
    icon: "Handshake",
    title: "Conexiones reales",
    description:
      "Un ecosistema que busca conectar usuarios y proveedores.",
  },
];

export type Faq = { question: string; answer: string };

export const faqs: Faq[] = [
  {
    question: "¿Qué es Servitoken?",
    answer:
      "Servitoken es un token de utilidad creado con la visión de conectar usuarios y proveedores dentro de un ecosistema de servicios digitales, facilitando nuevas formas de pago y beneficios para los usuarios.",
  },
  {
    question: "¿Para qué sirve Servitoken?",
    answer:
      "Servitoken está diseñado para utilizarse como medio de pago en servicios y comercios participantes, donde también puede ofrecer acceso a beneficios o descuentos. La disponibilidad depende de cada comercio participante.",
  },
  {
    question: "¿Dónde puedo adquirirlo?",
    answer: PENDING_INFO,
  },
  {
    question: "¿Qué wallet puedo utilizar?",
    answer: PENDING_INFO,
  },
  {
    question: "¿Cuál es la red del token?",
    answer: PENDING_INFO,
  },
  {
    question: "¿Dónde puedo consultar el contrato?",
    answer: PENDING_INFO,
  },
  {
    question: "¿Qué servicios aceptan Servitoken?",
    answer: PENDING_INFO,
  },
];

export type SocialChannel = {
  name: string;
  handle: string;
  // URL oficial. Vacío = canal aún no confirmado (se muestra como "Próximamente").
  url: string;
  icon: string;
};

// Redes sociales y canales de contacto.
// url = "" significa que el cliente todavía no lo ha confirmado.
export const socialChannels: SocialChannel[] = [
  { name: "X / Twitter", handle: "@Servitoken", url: "", icon: "Twitter" },
  { name: "Telegram", handle: "t.me/Servitoken", url: "", icon: "Send" },
  { name: "Instagram", handle: "@Servitoken", url: "", icon: "Instagram" },
  { name: "Facebook", handle: "Servitoken", url: "", icon: "Facebook" },
  { name: "WhatsApp", handle: "Servitoken", url: "", icon: "MessageCircle" },
  { name: "Email", handle: "contacto@servitoken.com", url: "", icon: "Mail" },
];

// Datos del hero
export const hero = {
  eyebrow: "Token de utilidad · Ecosistema de pagos",
  title: "Pagos de servicios, ahora con Servitoken",
  subtitle:
    "Un token de utilidad diseñado para conectar usuarios, servicios y comercios dentro de un ecosistema digital.",
  primaryCta: "Comprar Servitoken",
  secondaryCta: "Conocer el proyecto",
};

// Datos "¿Qué es Servitoken?"
export const whatIs = {
  eyebrow: "Un token de utilidad",
  title: "¿Qué es Servitoken?",
  body: "Servitoken es un token de utilidad creado con la visión de conectar usuarios y proveedores dentro de un ecosistema de servicios digitales, facilitando nuevas formas de pago y beneficios para los usuarios.",
  cta: "Conocer el proyecto",
  points: [
    {
      icon: "ShieldCheck",
      title: "Diseñado para la utilidad",
      text: "Pensado para usarse dentro de un ecosistema de servicios y comercios participantes.",
    },
    {
      icon: "Users",
      title: "Conecta usuarios y comercios",
      text: "Une a usuarios, proveedores y comercios dentro de una misma experiencia digital.",
    },
    {
      icon: "Layers",
      title: "Tecnología blockchain",
      text: "Las transacciones se registran utilizando tecnología blockchain.",
    },
  ],
};

// Datos "Utilidad"
export const utility = {
  eyebrow: "Utilidad",
  title: "Una nueva forma de conectar servicios",
  subtitle:
    "Servitoken busca facilitar la interacción entre usuarios, comercios y proveedores dentro de un ecosistema digital.",
};

// Datos "Cómo funciona"
export const howItWorksSection = {
  eyebrow: "Cómo funciona",
  title: "¿Cómo funciona?",
};

// Datos "Precio y compra"
export const pricingSection = {
  eyebrow: "Precio y compra",
  title: "Adquiere Servitoken",
};

// Datos "Plataformas"
export const platformsSection = {
  eyebrow: "Plataformas",
  title: "Compra desde plataformas oficiales",
  subtitle:
    "La adquisición de Servitoken podrá realizarse a través de plataformas y wallets externas. Los enlaces oficiales se habilitarán cuando el cliente los confirme.",
};

// Datos "Contrato"
export const contractSection = {
  eyebrow: "Contrato",
  title: "Consulta el contrato",
  subtitle:
    "Verifica la información oficial del token directamente desde la blockchain.",
};

// Datos "Beneficios"
export const benefitsSection = {
  eyebrow: "Beneficios",
  title: "Más utilidad. Más posibilidades.",
};

// Datos "FAQ"
export const faqSection = {
  eyebrow: "Preguntas frecuentes",
  title: "Resolvemos tus dudas",
  subtitle:
    "Encuentra respuestas claras sobre Servitoken. Si falta información, se irá actualizando conforme se confirmen los datos oficiales.",
};

// Datos "Contacto"
export const contactSection = {
  eyebrow: "Contacto",
  title: "Conecta con Servitoken",
  subtitle:
    "Conoce las novedades, actualizaciones y próximos desarrollos del proyecto.",
};
