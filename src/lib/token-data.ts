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
  symbol: "SERVI",
  // Descripción corta para metadatos y subtítulos
  shortDescription:
    "Token de utilidad diseñado para conectar usuarios, servicios y comercios dentro de un ecosistema digital de pagos.",

  // ---- DATOS OFICIALES ----
  contractAddress: "0x07e6CB0876653B914Fc3805283a275b90bF7E443",
  network: "BNB Smart Chain (BSC)",
  totalSupply: "500,000,000 SERVI",
  decimals: "18",
  tradingPair: "SERVI / USDT",
  standard: "BEP-20",
  price: "", // Precio actual (pendiente de confirmación oficial).
  buyUrl:
    "https://pancakeswap.finance/swap?inputCurrency=0x55d398326f99059fF775485246999027B3197955&outputCurrency=0x07e6CB0876653B914Fc3805283a275b90bF7E443",
  marketUrl:
    "https://dexscreener.com/bsc/0xad48f36f851ce4dca85a07bb3d6a573a4c70ed18",
  // URL del explorador de bloques (pendiente confirmación del cliente).
  explorerBaseUrl: "",
} as const;

export type NavLink = { label: string; href: string };

export const navLinks: NavLink[] = [
  { label: "Inicio", href: "#inicio" },
  { label: "¿Qué es?", href: "#que-es" },
  { label: "Utilidad", href: "#utilidad" },
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Precio y compra", href: "#precio" },
  { label: "Compra", href: "#compra" },
  { label: "FAQ", href: "#faq" },
  { label: "Contacto", href: "#contacto" },
];

export const footerLinks: NavLink[] = [
  { label: "Inicio", href: "#inicio" },
  { label: "¿Qué es?", href: "#que-es" },
  { label: "Utilidad", href: "#utilidad" },
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Precio y compra", href: "#precio" },
  { label: "Compra", href: "#compra" },
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
    description: "Compra SERVI directamente desde PancakeSwap con el par SERVI/USDT.",
    url: "https://pancakeswap.finance/swap?inputCurrency=0x55d398326f99059fF775485246999027B3197955&outputCurrency=0x07e6CB0876653B914Fc3805283a275b90bF7E443",
    icon: "Cookie",
    accent: "bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/20",
  },
  {
    name: "DexScreener",
    description: "Consulta el precio, volumen y gráficos de SERVI en tiempo real.",
    url: "https://dexscreener.com/bsc/0xad48f36f851ce4dca85a07bb3d6a573a4c70ed18",
    icon: "BarChart3",
    accent: "bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20",
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
      "Servitoken (SERVI) es un token de utilidad creado para formar parte de un ecosistema digital orientado a servicios y pagos. Su objetivo es conectar usuarios y comercios mediante nuevas alternativas de pago y beneficios dentro del ecosistema.",
  },
  {
    question: "¿Qué red utiliza Servitoken?",
    answer:
      "Servitoken opera en BNB Smart Chain (BSC) bajo el estándar BEP-20.",
  },
  {
    question: "¿En qué consiste la utilidad del token?",
    answer:
      "La utilidad de Servitoken se basa en facilitar pagos digitales y ofrecer la posibilidad de acceder a beneficios o descuentos en comercios participantes dentro del ecosistema.",
  },
  {
    question: "¿Cuál es el supply total?",
    answer:
      "El supply total de Servitoken es de 500,000,000 SERVI.",
  },
  {
    question: "¿Cuál es la dirección oficial del contrato?",
    answer:
      "La dirección oficial del contrato de Servitoken es: 0x07e6CB0876653B914Fc3805283a275b90bF7E443. Puedes copiarla directamente desde esta página y verificarla en BscScan cuando el enlace esté disponible.",
  },
  {
    question: "¿Cómo puedo comprar Servitoken?",
    answer:
      "Puedes comprar Servitoken (SERVI) directamente a través de PancakeSwap usando el par SERVI/USDT. También puedes consultar el mercado en DexScreener. Ambos enlaces están disponibles en la sección 'Precio y compra' de esta página.",
  },
  {
    question: "¿Dónde puedo consultar el mercado de SERVI?",
    answer:
      "Puedes consultar el precio y la actividad del mercado de SERVI en DexScreener a través del enlace disponible en la sección 'Precio y compra'. El enlace de BscScan para el contrato se agregará próximamente.",
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

// ============================================================
//  LEGAL · Contenido jurídico del sitio oficial
// ============================================================

export type LegalSection = {
  id: string;
  title: string;
  icon: string;
  content: LegalBlock[];
};

export type LegalBlock = {
  heading?: string;
  body: string;
};

export const legalSections: LegalSection[] = [
  {
    id: "aviso-legal",
    title: "Aviso Legal",
    icon: "Scale",
    content: [
      {
        heading: "1. Datos identificativos",
        body: `Este sitio web (en adelante, el "Sitio") es la presentación oficial del proyecto Servitoken (token con símbolo ${project.symbol}, estándar ${project.standard}, red ${project.network}). El Sitio tiene carácter informativo y constituye el canal oficial de referencia para consultar información del token.

Contrato inteligente (smart contract): ${project.contractAddress}
Suministro total: ${project.totalSupply}
Red: ${project.network}
Estándar: ${project.standard} \(${project.decimals} decimales\)`,
      },
      {
        heading: "2. Naturaleza del token",
        body: `${project.name} (${project.symbol}) es un token de utilidad diseñado para su uso dentro de un ecosistema de pagos y servicios digitales. ${project.symbol} no es un valor negociable, título valor, acción, bono, derivado ni instrumento financiero regulado. ${project.symbol} no confiere derechos de propiedad, dividendos, voto corporativo ni rendimientos garantizados de ningún tipo.

${project.symbol} se emite bajo la tecnología blockchain y opera exclusivamente mediante contratos inteligentes. Su utilidad se limita a las funciones definidas dentro del ecosistema del proyecto.`,
      },
      {
        heading: "3. Finalidad del Sitio",
        body: `Este Sitio es la página oficial de presentación del proyecto ${project.name}. Su finalidad exclusiva es proporcionar información general sobre el token, su ecosistema, las plataformas donde se puede adquirir y su contrato inteligente.

El Sitio no ofrece servicios de intermediación financiera, corretaje, asesoría de inversión ni gestión de activos. Las plataformas de compra referenciadas (como PancakeSwap y DexScreener) son servicios de terceros independientes; ${project.name} no tiene control sobre su funcionamiento, disponibilidad ni políticas.`,
      },
      {
        heading: "4. Propiedad intelectual",
        body: `Todo el contenido del Sitio —incluyendo, sin limitación, textos, diseños, logotipos, marcas, gráficos, código fuente, estructura y composición visual— es propiedad del proyecto ${project.name} o de sus legítimos titulares y está protegido por las leyes de propiedad intelectual aplicables.

Queda expresamente prohibida la reproducción, distribución, modificación, comunicación pública o cualquier otra forma de explotación del contenido del Sitio sin autorización previa y por escrito de los titulares de los derechos.`,
      },
      {
        heading: "5. Exclusión de responsabilidad",
        body: `El proyecto ${project.name} no se hace responsable de:

• Los daños y perjuicios que puedan derivarse del uso o la imposibilidad de uso del Sitio.
• Los errores, omisiones o imprecisiones en la información publicada, sin perjuicio de las actualizaciones que se realicen.
• Las decisiones tomadas por los usuarios con base en la información aquí contenida.
• El funcionamiento, seguridad o disponibilidad de las plataformas de terceros referenciadas.
• La pérdida de fondos, tokens o activos digitales derivada de transacciones realizadas en plataformas de terceros.
• El acceso no autorizado a wallets, cuentas o claves privadas por parte de terceros.`,
      },
      {
        heading: "6. Legislación aplicable",
        body: `Las presentes condiciones se rigen por las leyes aplicables en la jurisdicción correspondiente al proyecto ${project.name}. Cualquier controversia derivada del acceso o uso del Sitio se someterá a la jurisdicción de los tribunales competentes.

El usuario acepta que el acceso al Sitio y la interacción con el ecosistema ${project.symbol} se realizan bajo su propia responsabilidad y cuenta.`,
      },
    ],
  },
  {
    id: "terminos-de-uso",
    title: "Términos de Uso",
    icon: "FileCheck",
    content: [
      {
        heading: "1. Aceptación de los términos",
        body: `Al acceder y/o utilizar este Sitio, el usuario (en adelante, el "Usuario") declara haber leído, comprendido y aceptado los presentes Términos de Uso en su totalidad. En caso de desacuerdo con cualquiera de las condiciones aquí establecidas, el Usuario debe abstenerse de utilizar el Sitio.

El uso continuado del Sitio después de la publicación de modificaciones constituirá la aceptación de dichos cambios.`,
      },
      {
        heading: "2. Usuario del Sitio",
        body: `El Sitio está dirigido a personas que deseen informarse sobre el proyecto ${project.name} (${project.symbol}). El Usuario debe:

• Tener capacidad legal para aceptar los presentes términos.
• No utilizar el Sitio con fines ilícitos, fraudulentos o contrarios a la buena fe.
• No intentar obtener acceso no autorizado a los sistemas, servidores o redes conectados al Sitio.
• No reproducir, distribuir o modificar el contenido del Sitio sin autorización.
• Proporcionar información veraz en caso de interactuar con formularios o canales de contacto.`,
      },
      {
        heading: "3. Servicios ofrecidos",
        body: `Este Sitio proporciona únicamente información sobre el proyecto ${project.name}. Los servicios informativos incluyen:

• Descripción del proyecto y su ecosistema.
• Datos técnicos del token (contrato, suministro, red, estándar).
• Enlaces a plataformas de terceros donde el Usuario puede consultar precios o adquirir ${project.symbol}.
• Canales de contacto oficiales del proyecto.

El Sitio NO ofrece: servicios de exchange, custodia de activos, asesoría financiera, gestión de inversiones ni garantías de rendimiento.`,
      },
      {
        heading: "4. Interacción con plataformas de terceros",
        body: `El Sitio puede contener enlaces o referencias a plataformas externas (como PancakeSwap, DexScreener u otras). El Usuario reconoce y acepta que:

• ${project.name} no opera, controla ni es responsable del contenido, funcionamiento ni políticas de dichas plataformas.
• La adquisición de ${project.symbol} se realiza directamente entre el Usuario y la plataforma de terceros.
• ${project.name} no interviene en la ejecución, confirmación ni resolución de transacciones realizadas en plataformas externas.
• Los riesgos asociados a la interacción con dichas plataformas son exclusivamente del Usuario.`,
      },
      {
        heading: "5. Wallets y seguridad",
        body: `El Usuario es el único responsable de la seguridad de sus wallets, claves privadas (private keys), frases de recuperación (seed phrases) y cualquier credencial de acceso a sus activos digitales.

${project.name} NUNCA solicitará la clave privada o frase de recuperación del Usuario. Cualquier comunicación que solicite dicha información es fraudulenta y no proviene del proyecto oficial.

El Usuario debe tomar todas las medidas de seguridad necesarias para proteger sus activos, incluyendo el uso de wallets de confianza, verificación de direcciones de contrato y protección contra phishing.`,
      },
      {
        heading: "6. Modificaciones y suspensión",
        body: `${project.name} se reserva el derecho de modificar, suspender o discontinuar el Sitio —total o parcialmente— en cualquier momento y sin previo aviso. Asimismo, podrá actualizar el contenido informativo del Sitio para reflejar cambios en el proyecto.

El Usuario no tendrá derecho a reclamación alguna derivada de la modificación, suspensión o discontinuidad del Sitio.`,
      },
      {
        heading: "7. Indemnidad",
        body: `El Usuario se compromete a mantener indemne al proyecto ${project.name}, sus desarrolladores, colaboradores y afiliados frente a cualquier reclamación, demanda, daño, pérdida o gasto (incluyendo honorarios legales) que se derive de:

• El incumplimiento de los presentes Términos de Uso por parte del Usuario.
• El uso indebido del Sitio o de la información contenida en él.
• La violación de derechos de terceros por parte del Usuario.`,
      },
    ],
  },
  {
    id: "politica-privacidad",
    title: "Política de Privacidad",
    icon: "Lock",
    content: [
      {
        heading: "1. Responsable del tratamiento",
        body: `El responsable del tratamiento de los datos personales que se recopilen a través de este Sitio es el proyecto ${project.name}. El presente documento informa al Usuario sobre la política de privacidad aplicable al uso del Sitio oficial de ${project.name}.`,
      },
      {
        heading: "2. Datos recopilados",
        body: `Este Sitio puede recopilar los siguientes tipos de datos:

• Datos de navegación: dirección IP, tipo de navegador, sistema operativo, páginas visitadas, tiempo de permanencia, fuente de tráfico y otros datos analíticos proporcionados por servicios de terceros (como Google Analytics u otros).
• Datos de interacción: clics en enlaces, apertura de secciones, uso de funcionalidades del Sitio.
• Datos de contacto: únicamente si el Usuario los proporciona voluntariamente a través de formularios o canales de contacto (nombre, correo electrónico, mensaje).

El Sitio NO recopila datos de wallets, saldos, transacciones ni claves privadas. ${project.name} no tiene acceso ni almacenamiento de los activos digitales del Usuario.`,
      },
      {
        heading: "3. Finalidad del tratamiento",
        body: `Los datos recopilados se utilizan exclusivamente para:

• Proporcionar y mantener el funcionamiento del Sitio.
• Mejorar la experiencia del Usuario y el contenido del Sitio.
• Elaborar estadísticas de uso anónimas.
• Responder consultas enviadas a través de los canales de contacto.
• Comunicar novedades relevantes del proyecto, únicamente cuando el Usuario lo haya autorizado expresamente.

Los datos NO se utilizarán para crear perfiles comerciales, vender información a terceros ni con fines de marketing no autorizado.`,
      },
      {
        heading: "4. Base legal del tratamiento",
        body: `El tratamiento de datos se basa en:

• El consentimiento del Usuario al utilizar el Sitio y aceptar la presente política.
• El interés legítimo del responsable para mejorar el Sitio y sus servicios.
• Obligaciones legales aplicables.

El Usuario puede retirar su consentimiento en cualquier momento contactando a los canales oficiales del proyecto.`,
      },
      {
        heading: "5. Destinatarios de los datos",
        body: `Los datos del Usuario NO se comparten con terceros, salvo en los siguientes supuestos:

• Proveedores de servicios analíticos necesarios para el funcionamiento del Sitio (con datos anonimizados cuando sea posible).
• Proveedores de infraestructura técnica (hosting, CDN) bajo acuerdos de confidencialidad.
• Cuando sea requerido por autoridad judicial o administrativa competente.
• Para la protección de los derechos e intereses legítimos del responsable.`,
      },
      {
        heading: "6. Derechos del Usuario",
        body: `El Usuario tiene derecho a:

• Acceder a sus datos personales.
• Rectificar datos inexactos.
• Solicitar la supresión de sus datos cuando ya no sean necesarios.
• Oponerse al tratamiento de sus datos en determinadas circunstancias.
• Solicitar la portabilidad de sus datos.
• Retirar el consentimiento prestado.

Para ejercer cualquiera de estos derechos, el Usuario puede contactar al proyecto a través de los canales oficiales indicados en el Sitio.`,
      },
      {
        heading: "7. Cookies y tecnologías similares",
        body: `Este Sitio puede utilizar cookies y tecnologías similares para:

• Garantizar el correcto funcionamiento del Sitio (cookies técnicas).
• Recopilar datos estadísticos anónimos sobre el uso del Sitio (cookies analíticas).

El Usuario puede configurar su navegador para bloquear o eliminar cookies. Sin embargo, esto podría afectar la funcionalidad del Sitio. Al continuar navegando, el Usuario acepta el uso de cookies según lo descrito en esta política.`,
      },
      {
        heading: "8. Seguridad de los datos",
        body: `${project.name} adopta las medidas técnicas y organizativas razonablemente necesarias para proteger los datos personales del Usuario contra accesos no autorizados, pérdida, destrucción o alteración.

No obstante, ninguna transmisión de datos por Internet ni sistema de almacenamiento electrónico es completamente seguro. El Usuario asume los riesgos inherentes a la transmisión de información a través de redes públicas.`,
      },
      {
        heading: "9. Modificaciones de la política",
        body: `${project.name} se reserva el derecho de modificar la presente Política de Privacidad en cualquier momento. Las modificaciones entrarán en vigor desde su publicación en el Sitio.

Se recomienda al Usuario revisar esta página periódicamente para estar al tanto de cualquier actualización.`,
      },
    ],
  },
  {
    id: "aviso-de-riesgo",
    title: "Aviso de Riesgo",
    icon: "AlertTriangle",
    content: [
      {
        heading: "Declaración general de riesgo",
        body: `LA INFORMACIÓN CONTENIDA EN ESTE SITIO TIENE EXCLUSIVAMENTE CARÁCTER INFORMATIVO Y NO CONSTITUYE ASESORAMIENTO FINANCIERO, RECOMENDACIÓN DE INVERSIÓN, OFERTA NI SOLICITUD DE COMPRA O VENTA DE NINGÚN ACTIVO DIGITAL.

La adquisición, tenencia y uso de criptomonedas y tokens conlleva riesgos significativos. El Usuario debe comprender plenamente dichos riesgos antes de interactuar con el ecosistema ${project.name} (${project.symbol}).`,
      },
      {
        heading: "Riesgos del mercado",
        body: `El mercado de criptomonedas es altamente volátil. El precio de ${project.symbol} puede fluctuar de manera significativa en cortos períodos de tiempo, lo que podría resultar en pérdidas sustanciales o totales de la inversión.

• ${project.symbol} puede perder la totalidad o una parte significativa de su valor.
• No existe garantía de liquidez; puede ser difícil comprar o vender ${project.symbol} en determinados momentos.
• El historial de precios pasados no es indicativo de resultados futuros.`,
      },
      {
        heading: "Riesgos tecnológicos",
        body: `La tecnología blockchain, aunque innovadora, conlleva riesgos inherentes:

• Vulnerabilidades en el contrato inteligente (smart contract) que podrían resultar en la pérdida de fondos.
• Riesgos de seguridad en las plataformas de exchange y wallets digitales.
• Posibles ataques informáticos, hacking o fraudes dirigidos al ecosistema cripto.
• Fallos técnicos en la red ${project.network} que podrían afectar las transacciones.
• Riesgos asociados a actualizaciones de la red (hard forks, cambios de protocolo).`,
      },
      {
        heading: "Riesgos regulatorios",
        body: `El marco regulatorio aplicable a las criptomonedas varía según la jurisdicción y está en constante evolución:

• Las autoridades competentes podrían implementar regulaciones que afecten la disponibilidad, uso o valor de ${project.symbol}.
• ${project.symbol} podría ser clasificado como un activo sujeto a regulaciones específicas en determinadas jurisdicciones.
• El Usuario es responsable de verificar que la adquisición y tenencia de ${project.symbol} sea legal en su jurisdicción de residencia.
• Cambios regulatorios podrían impactar negativamente en la utilidad o transferibilidad de ${project.symbol}.`,
      },
      {
        heading: "Riesgos de liquidez",
        body: `${project.symbol} puede no tener liquidez suficiente en los mercados de criptomonedas. Esto significa que:

• Puede ser imposible o muy difícil vender ${project.symbol} en un momento determinado.
• El Usuario podría no encontrar contrapartes dispuestas a comprar al precio deseado.
• La falta de liquidez puede amplificar las caídas de precio.
• No existen garantías de que existirán mercados activos para ${project.symbol} en el futuro.`,
      },
      {
        heading: "Ausencia de garantías",
        body: `${project.name} NO GARANTIZA:

• Rentabilidad, ganancia, apreciación o preservación del valor de ${project.symbol}.
• Disponibilidad continua o ininterrumpida de mercados para ${project.symbol}.
• Estabilidad del precio o resistencia a la volatilidad del mercado.
• Liquidez presente o futura del token.
• Que ${project.symbol} tendrá algún valor de mercado en el futuro.

El Usuario reconoce que la adquisición de ${project.symbol} es una decisión voluntaria y que cualquier inversión realizada es irreversiblemente suya.`,
      },
      {
        heading: "No es asesoramiento financiero",
        body: `Nada en este Sitio debe interpretarse como:

• Asesoramiento financiero, fiscal, legal o de inversión.
• Recomendación de compra, venta o tenencia de ${project.symbol}.
• Promesa o garantía de rendimiento futuro.
• Oferta pública de valores.

El Usuario debe consultar con profesionales calificados (asesores financieros, legales o fiscales) antes de tomar cualquier decisión relacionada con criptomonedas. ${project.name} no se hace responsable de las decisiones de inversión del Usuario.`,
      },
      {
        heading: "Responsabilidad del Usuario",
        body: `Al interactuar con ${project.name} y el ecosistema ${project.symbol}, el Usuario:

• Asume la totalidad de los riesgos asociados.
• Declara haber leído y comprendido el presente Aviso de Riesgo.
• Reconoce que la inversión en criptomonedas puede resultar en la pérdida total del capital invertido.
• Se compromete a no invertir fondos que no pueda permitirse perder.
• Es responsable de verificar la información del contrato inteligente y la legitimidad de las plataformas donde interactúe con ${project.symbol}.

Si no comprende o no está de acuerdo con los riesgos descritos, NO debe adquirir ni interactuar con ${project.symbol}.`,
      },
    ],
  },
];
