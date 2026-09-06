import { formatServi, formatUsd } from "@/lib/format";
import { ContactlessIcon, EmvChip } from "@/components/brand/payment-logos";

/**
 * ============================================================
 *  TARJETA DE CRÉDITO VIRTUAL SERVI · EDICIÓN METAL
 * ============================================================
 *  Observidiana + filo metálico dorado, guilloché láser de
 *  doble trama, sello holográfico iris giratorio, chip EMV
 *  original y titular en oro metálico. El @usuario ES la
 *  identidad de la tarjeta (sin números).
 * ============================================================
 */

export function ServiCard({
  username,
  balance,
  rateServiPerUsd,
  memberSince,
  className = "",
}: {
  username: string;
  balance: number;
  rateServiPerUsd: number;
  memberSince?: Date | string;
  className?: string;
}) {
  const usd = balance / rateServiPerUsd;
  const year = memberSince ? new Date(memberSince).getFullYear() : new Date().getFullYear();

  return (
    <div
      className={`servi-card servi-card-tilt ${className}`}
      role="img"
      aria-label={`Tarjeta virtual SERVI de @${username} con saldo de ${formatServi(balance)} SERVI`}
    >
      {/* Reflejo que recorre la tarjeta */}
      <span className="card-sheen" aria-hidden />

      {/* Sello holográfico iris */}
      <span
        className="servi-holo-foil absolute right-14 top-3 size-8 rounded-full ring-1 ring-white/25"
        aria-hidden
      />

      {/* Logo marca arriba derecha */}
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <span className="text-right text-[10px] font-semibold uppercase leading-tight tracking-[0.2em] text-white/60">
          Metal
          <br />
          Edition
        </span>
        <img
          src="/servitoken-logo-sm.png"
          alt=""
          width={34}
          height={34}
          className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
          draggable={false}
        />
      </div>

      {/* Marca SERVI arriba izquierda */}
      <p className="absolute left-5 top-4 text-xs font-bold uppercase tracking-[0.28em] text-white/85">
        Servi<span className="text-gold-bright">token</span>
      </p>

      <div className="relative flex h-full flex-col justify-between p-5 pb-6 pt-11 sm:p-6 sm:pb-7 sm:pt-12">
        {/* Chip EMV original + NFC */}
        <div className="flex items-center gap-3">
          <EmvChip className="h-auto w-12 sm:w-[52px]" />
          <ContactlessIcon className="size-5 rotate-90 text-white/70" />
        </div>

        {/* Titular — oro metálico, sin números */}
        <div className="mt-1 min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/55">
            Titular
          </p>
          <p
            className="text-gold-metal truncate text-lg font-bold leading-tight tracking-wide sm:text-xl"
            title={`@${username}`}
          >
            @{username}
          </p>
        </div>

        {/* Datos de la cuenta */}
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/55">
              Saldo
            </p>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="text-gold-metal text-xl font-bold tabular-nums drop-shadow-[0_2px_10px_rgba(212,176,106,0.35)] sm:text-2xl">
                {formatServi(balance)}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                SERVI
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/55">
              Equivalente
            </p>
            <p className="text-sm font-bold tabular-nums text-white/90">
              ≈ ${formatUsd(usd)} <span className="text-[10px] font-medium text-white/60">USD</span>
            </p>
            <div className="mt-1.5 flex items-center justify-end gap-1.5">
              <span className="size-1.5 rounded-full bg-brand-green shadow-[0_0_8px_rgba(45,212,167,0.9)]" aria-hidden />
              <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/60">
                Activa · {year}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Micro-texto láser inferior */}
      <p className="servi-microtext absolute bottom-1.5 left-5 right-5 overflow-hidden text-[5px] font-medium uppercase sm:text-[6px]" aria-hidden>
        ServiToken · Virtual Card · BNB Smart Chain · Metal Edition · Servi Rewards ·
        ServiToken · Virtual Card · BNB Smart Chain · Metal Edition ·
      </p>
    </div>
  );
}
