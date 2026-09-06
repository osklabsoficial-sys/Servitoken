/**
 * ============================================================
 *  SERVITOKEN · Capa central de métodos de pago
 * ============================================================
 *  Única fuente de verdad sobre qué pasarelas existen, cómo se
 *  llaman y si están realmente configuradas y disponibles.
 *
 *  Reglas:
 *  - Un método solo se anuncia como `enabled: true` si sus
 *    credenciales/variables están presentes en el servidor.
 *  - Ningún secreto vive aquí: solo flags y metadatos públicos.
 *  - Activar/desactivar se hace por entorno:
 *      PAYPAL_ENABLED=false    → oculta PayPal aunque haya credenciales
 *      ONCHAIN_ENABLED=false   → oculta la compra on-chain (BSC)
 *      GOOGLEPAY_ENABLED=true  → activa Google Pay (requiere integración)
 *      APPLEPAY_ENABLED=true   → activa Apple Pay (requiere integración)
 *  - El frontend puede mostrar métodos `knownButDisabled` con el
 *    badge PENDIENTE, pero JAMÁS se pueden seleccionar ni usar:
 *    el servidor es la autoridad final en cada endpoint.
 * ============================================================
 */

import { paypalConfigured } from "@/lib/paypal";

export interface PaymentMethodInfo {
  /** Identificador estable usado por el frontend */
  id: string;
  /** Nombre visible */
  name: string;
  /** Descripción corta visible en el selector */
  description: string;
  /** Proveedor técnico */
  provider: string;
  /** Moneda(s) soportadas */
  currency: string;
  /** true ⇒ seleccionable y usable en /compra */
  enabled: boolean;
  /** Clave de marca para el logo oficial en el frontend */
  brandKey: "paypal" | "onchain" | "googlepay" | "applepay";
}

export function getPaymentMethods(): PaymentMethodInfo[] {
  const paypalEnabled =
    process.env.PAYPAL_ENABLED !== "false" && paypalConfigured();
  const onchainEnabled = process.env.ONCHAIN_ENABLED !== "false";
  // Google Pay / Apple Pay aún NO tienen integración real en el
  // servidor: solo se muestran si alguien los activa explícitamente
  // junto con una futura implementación.
  const googlePayEnabled = process.env.GOOGLEPAY_ENABLED === "true";
  const applePayEnabled = process.env.APPLEPAY_ENABLED === "true";

  return [
    {
      id: "paypal",
      name: "PayPal",
      description:
        "Paga en USD con tu cuenta PayPal o tarjeta asociada. Acreditación inmediata.",
      provider: "PayPal",
      currency: "USD",
      enabled: paypalEnabled,
      brandKey: "paypal",
    },
    {
      id: "onchain",
      name: "BNB Smart Chain",
      description:
        "Compra on-chain con BNB o USDT conectando tu wallet (PancakeSwap).",
      provider: "PancakeSwap",
      currency: "BNB · USDT",
      enabled: onchainEnabled,
      brandKey: "onchain",
    },
    {
      id: "googlepay",
      name: "Google Pay",
      description: "Pago directo con tu cuenta Google. Requiere activación del servidor.",
      provider: "Google",
      currency: "USD",
      enabled: googlePayEnabled,
      brandKey: "googlepay",
    },
    {
      id: "applepay",
      name: "Apple Pay",
      description: "Pago rápido y seguro con Apple. Requiere activación del servidor.",
      provider: "Apple",
      currency: "USD",
      enabled: applePayEnabled,
      brandKey: "applepay",
    },
  ];
}

/** Solo los métodos realmente configurados y disponibles. */
export function getEnabledPaymentMethods(): PaymentMethodInfo[] {
  return getPaymentMethods().filter((m) => m.enabled);
}
