/**
 * ============================================================
 *  SERVITOKEN · Datos del proyecto
 * ============================================================
 *  Toda la información configurable del proyecto se concentra
 *  en este archivo. Los campos marcados como `""` (vacíos)
 *  significan "Por confirmar" y se muestran automáticamente con
 *  la etiqueta `PLACEHOLDER` en la interfaz.
 *
 *  >>> REEMPLAZAR con datos oficiales cuando el cliente los
 *  proporcione. NO inventar datos reales. <<<
 * ============================================================
 */

export const PLACEHOLDER = "Por confirmar";

/** Devuelve el valor si existe; si no, el placeholder "Por confirmar". */
export const display = (value?: string | null) =>
  value && value.trim().length > 0 ? value : PLACEHOLDER;

export const project = {
  name: "Servitoken",
  // Descripción corta para metadatos y subtítulos
  shortDescription:
    "Token de utilidad diseñado para conectar usuarios, servicios y comercios dentro de un ecosistema digital de pagos.",

  // ---- DATOS POR CONFIRMAR (vacío = "Por confirmar") ----
  // Dirección del contrato. Vacío hasta que el cliente la proporcione.
  contractAddress: "",
  // Red blockchain del token (ej. "BNB Smart Chain (BEP-20)"). Vacío = Por confirmar.
  network: "",
  // Suminuro total. Vacío = Por confirmar.
  totalSupply: "",
  // Decimales del token. Vacío = Por confirmar.
  decimals: "",
  // Precio actual. Vacío = Por confirmar.
  price: "",
  // URL oficial de compra del token. Vacío = botón deshabilitado.
  buyUrl: "",
  // URL base del explorador de bloques para el botón "Ver en explorador".
  // Ejemplo BscScan: "https://bscscan.com/address/"
  explorerBaseUrl: "",
} as const;

export type NavLink = {
  label: string;
  href: string;
};

export const navLinks: NavLink[] = [
  { label: "Inicio", href: "#inicio" },
  { label: "¿Qué es Servitoken?", href: "#que-es" },
  { label: "Utilidad", href: "#utilidad" },
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Precio y compra", href: "#precio" },
  { label: "FAQ", href: "#faq" },
  { label: "Contacto", href: "#contacto" },
];

export const footerLinks: NavLink[] = [
  { label: "Inicio", href: "#inicio" },
  { label: "Información", href: "#que-es" },
  { label: "Utilidad", href: "#utilidad" },
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Compra", href: "#precio" },
  { label: "Contacto", href: "#contacto" },
];

// Indicadores del hero. Todos "Por confirmar" salvo que el cliente confirme.
export type Indicator = { label: string; value: string };

export const heroIndicators: Indicator[] = [
  { label: "Supply total", value: project.totalSupply },
  { label: "Red", value: project.network },
  { label: "Decimales", value: project.decimals },
  { label: "Contrato", value: project.contractAddress },
];

export type FeatureCard = {
  icon: string; // nombre de icono lucide
  title: string;
  description: string;
};

export const utilityCards: FeatureCard[] = [
  {
    icon: "CreditCard",
    title: "Pagos",
    description:
      "Utiliza Servitoken como una alternativa de pago en servicios y comercios participantes.",
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
      "Las operaciones utilizan tecnología blockchain para registrar las transacciones.",
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
    description:
      "El usuario adquiere el token mediante las plataformas oficiales disponibles.",
    icon: "Coins",
  },
  {
    step: "02",
    title: "Conecta tu wallet",
    description:
      "El usuario administra sus tokens utilizando una wallet compatible.",
    icon: "Wallet",
  },
  {
    step: "03",
    title: "Utiliza Servitoken",
    description:
      "Utiliza el token en los servicios o comercios participantes.",
    icon: "ShoppingBag",
  },
];

export type ExternalPlatform = {
  name: string;
  description: string;
  // URL oficial. Vacío = no disponible todavía (botón deshabilitado).
  url: string;
  icon: string;
  accent: string; // clases tailwind para el icono
};

export const externalPlatforms: ExternalPlatform[] = [
  {
    name: "PancakeSwap",
    description: "DEX para intercambiar tokens de forma descentralizada.",
    url: "", // TODO: URL oficial del cliente
    icon: "Cookie",
    accent: "bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/20",
  },
  {
    name: "MetaMask",
    description: "Wallet compatible para administrar tus Servitoken.",
    url: "", // TODO: URL oficial del cliente
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
      "Una experiencia de pago clara y directa para los servicios y comercios participantes.",
  },
  {
    icon: "Gift",
    title: "Beneficios para usuarios",
    description:
      "Acceso a beneficios o descuentos ofrecidos por los comercios participantes del ecosistema.",
  },
  {
    icon: "Handshake",
    title: "Conexiones entre usuarios y comercios",
    description:
      "Un puente digital entre usuarios, proveedores y comercios dentro del ecosistema Servitoken.",
  },
];

export type Faq = {
  question: string;
  answer: string;
};

export const faqs: Faq[] = [
  {
    question: "¿Qué es Servitoken?",
    answer:
      "Servitoken es un token de utilidad creado con la visión de conectar usuarios y proveedores dentro de un ecosistema de servicios digitales, facilitando nuevas formas de pago y beneficios para los usuarios.",
  },
  {
    question: "¿Para qué puedo utilizar Servitoken?",
    answer:
      "Servitoken está diseñado para utilizarse como medio de pago en servicios y comercios participantes, donde también puede ofrecer acceso a beneficios o descuentos. La disponibilidad depende de cada comercio participante.",
  },
  {
    question: "¿Dónde puedo adquirirlo?",
    answer:
      "Podrás adquirir Servitoken a través de las plataformas oficiales que se anunciarán próximamente. Mantente atento a los canales oficiales para conocer los detalles del lanzamiento.",
  },
  {
    question: "¿Qué wallet puedo utilizar?",
    answer:
      "Podrás administrar tus Servitoken con wallets compatibles con la red del token (por ejemplo, MetaMask). La red oficial será confirmada próximamente.",
  },
  {
    question: "¿Cuál es la red del token?",
    answer:
      "La red oficial del token será confirmada a través de los canales oficiales del proyecto. Esta información se actualizará en esta página cuando esté disponible.",
  },
  {
    question: "¿Dónde puedo consultar el contrato?",
    answer:
      "La dirección del contrato se publicará en esta página y en los canales oficiales cuando esté disponible, e incluirá un enlace al explorador correspondiente para su verificación.",
  },
  {
    question: "¿Qué servicios o comercios aceptan Servitoken?",
    answer:
      "Los servicios y comercios aceptantes se darán a conocer a través de los canales oficiales del proyecto conforme el ecosistema crezca. Utiliza Servitoken en los comercios participantes cuando esté disponible.",
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
  {
    name: "X / Twitter",
    handle: "@Servitoken",
    url: "",
    icon: "Twitter",
  },
  {
    name: "Telegram",
    handle: "t.me/Servitoken",
    url: "",
    icon: "Send",
  },
  {
    name: "Instagram",
    handle: "@Servitoken",
    url: "",
    icon: "Instagram",
  },
  {
    name: "Facebook",
    handle: "Servitoken",
    url: "",
    icon: "Facebook",
  },
  {
    name: "WhatsApp",
    handle: "Servitoken",
    url: "",
    icon: "MessageCircle",
  },
  {
    name: "Email",
    handle: "contacto@servitoken.com",
    url: "",
    icon: "Mail",
  },
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
  title: "¿Qué es Servitoken?",
  body: "Servitoken es un token de utilidad creado con la visión de conectar usuarios y proveedores dentro de un ecosistema de servicios digitales, facilitando nuevas formas de pago y beneficios para los usuarios.",
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
