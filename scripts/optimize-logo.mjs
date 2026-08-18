// Procesamiento del logo de Servitoken (one-off).
// - Redimensiona a 512px (suficiente para navbar retina + hero)
// - Elimina el fondo negro puro (#000000) → transparencia
// - Conserva el disco navy interior del logo
import sharp from "sharp";

const SRC = "upload/pasted_image_1787095759403.png";

async function main() {
  const { data, info } = await sharp(SRC)
    .resize(512, 512, { fit: "contain" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;

  // Recorremos los píxeles y eliminamos solo el negro puro del fondo.
  // Conservamos el navy interior (canal azul notable) y degradamos los
  // píxeles transicionales cerca del borde para suavizar.
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);

    if (max <= 6) {
      // Negro puro / casi puro (fondo) → totalmente transparente
      data[i + 3] = 0;
    } else if (max <= 18) {
      // Borde transicional muy oscuro → semitransparente (suavizado)
      data[i + 3] = Math.round((max / 18) * 255);
    }
    // el resto (navy interior, dorado, azul) se mantiene opaco (alpha 255)
  }

  // Logo principal transparente (512px) - alta calidad
  await sharp(data, { raw: { width, height, channels } })
    .png({ quality: 95, compressionLevel: 9 })
    .toFile("public/servitoken-logo.png");

  // Versión pequeña para navbar (128px, retina-ready a ~32-48px display)
  await sharp(data, { raw: { width, height, channels } })
    .resize(128, 128, { fit: "contain" })
    .png({ quality: 95, compressionLevel: 9 })
    .toFile("public/servitoken-logo-sm.png");

  // Stats
  const fs = await import("fs");
  const s1 = fs.statSync("public/servitoken-logo.png").size;
  const s2 = fs.statSync("public/servitoken-logo-sm.png").size;
  console.log(
    `OK: servitoken-logo.png (${(s1 / 1024).toFixed(1)}KB), servitoken-logo-sm.png (${(s2 / 1024).toFixed(1)}KB)`
  );
}

main().catch((e) => {
  console.error("ERR", e);
  process.exit(1);
});
