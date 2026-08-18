import { cn } from "@/lib/utils";

/**
 * ============================================================
 *  LOGO DE SERVITOKEN
 * ============================================================
 *  Logo oficial integrado desde `/public`.
 *
 *  Activos:
 *  - /public/servitoken-logo.png     (512px, transparente)
 *  - /public/servitoken-logo-sm.png  (128px, transparente)
 *
 *  Para reemplazar por una nueva versión profesional:
 *  sustituye estos archivos (manteniendo transparencia) o
 *  actualiza las rutas en `LOGO_SRC` / `LOGO_SRC_SM`.
 * ============================================================
 */

const LOGO_SRC = "/servitoken-logo.png";
const LOGO_SRC_SM = "/servitoken-logo-sm.png";

function LogoMark({
  size,
  className,
  alt = "Logo de Servitoken",
}: {
  size: "sm" | "md" | "lg";
  className?: string;
  alt?: string;
}) {
  // display size en px (el asset ya es retina-ready)
  const display = size === "sm" ? 28 : size === "lg" ? 96 : 36;
  const src = size === "lg" ? LOGO_SRC : LOGO_SRC_SM;

  return (
    <img
      src={src}
      alt={alt}
      width={display}
      height={display}
      className={cn("select-none object-contain", className)}
      draggable={false}
    />
  );
}

export function Logo({
  className,
  showWordmark = true,
  size = "md",
  alt,
}: {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
  alt?: string;
}) {
  const word =
    size === "sm"
      ? "text-sm"
      : size === "lg"
      ? "text-xl"
      : "text-[15px]";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} alt={alt} className={cn(size === "sm" ? "size-7" : size === "lg" ? "size-24" : "size-9")} />
      {showWordmark ? (
        <span className="flex flex-col leading-none">
          <span className={cn("font-semibold tracking-tight text-foreground", word)}>
            Servitoken
          </span>
          {size === "lg" ? (
            <span className="mt-1 text-[11px] font-medium text-gold">
              Token de utilidad
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
