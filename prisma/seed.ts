/**
 * Seed inicial de ServiToken V1
 * - Tasa de precio por defecto (SERVI_PER_USD)
 * - Catálogo base de servicios
 *
 * Ejecutar: bun prisma/seed.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SERVICES = [
  {
    slug: "plan-basico",
    name: "Plan Básico ServiApp",
    description: "Acceso mensual a la suite básica de herramientas de ServiToken.",
    priceServi: 500,
    icon: "zap",
  },
  {
    slug: "plan-pro",
    name: "Plan Pro ServiApp",
    description: "Funciones avanzadas, reportes y prioridad en la plataforma durante 30 días.",
    priceServi: 1500,
    icon: "rocket",
  },
  {
    slug: "soporte-prioritario",
    name: "Soporte Prioritario",
    description: "Atención prioritaria 24/7 del equipo de soporte por 7 días.",
    priceServi: 300,
    icon: "headphones",
  },
  {
    slug: "publicidad-destacada",
    name: "Publicidad Destacada",
    description: "Tu anuncio destacado en el directorio de comercios de ServiToken por 30 días.",
    priceServi: 2500,
    icon: "megaphone",
  },
  {
    slug: "verificacion-cuenta",
    name: "Verificación de Cuenta",
    description: "Insignia de verificación para tu cuenta de usuario o comercio.",
    priceServi: 1000,
    icon: "shield",
  },
  {
    slug: "consulta-experta-1h",
    name: "Consulta Experta (1 hora)",
    description: "Una hora de consultoría con un especialista del ecosistema ServiToken.",
    priceServi: 750,
    icon: "star",
  },
];

async function main() {
  await prisma.appConfig.upsert({
    where: { key: "SERVI_PER_USD" },
    update: {},
    create: { key: "SERVI_PER_USD", value: "100" },
  });
  console.log("✔ Config SERVI_PER_USD = 100");

  for (const s of SERVICES) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: {},
      create: s,
    });
  }
  console.log(`✔ ${SERVICES.length} servicios listos`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
