import { formatServi, formatUsd } from "@/lib/format";
import { ContactlessIcon, EmvChip } from "@/components/brand/payment-logos";

/**
 * ============================================================
 *  TARJETA DE CRÉDITO VIRTUAL SERVI
 * ============================================================
 *  Muestra el saldo del usuario como una tarjeta física:
 *  chip EMV, pago sin contacto, titular, número de cuenta
 *  enmascarado y fecha de alta. El número mostrado es
 *  COSMÉTICO y derivado de forma determinista del id de
 *  cuenta — no expone ningún dato sensible real.
 * ============================================================
 */

function accountNumberFromId(userId: string): string {
  // Derivación determinista y puramente decorativa a partir del id.
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  const g3 = String((hash >>> 13) % 10000).padStart(4, "0");
  const g4 = String((hash >>> 19) % 10000).padStart(4, "0");
  return `•••• •••• ${g3} ${g4}`;
}

export function ServiCard({
  username,
  balance,
  rateServiPerUsd,
  userId,
  memberSince,
  className = "",
}: {
  username: string;
  balance: number;
  rateServiPerUsd: number;
  userId: string;
  memberSince?: Date | string;
  className?: string;
}) {
  const usd = balance / rateServiPerUsd;
  const year = memberSince ? new Date(memberSince).getFullYear() : new Date().getFullYear();

  return (
    <div className={`servi-card servi-card-tilt ${className}`} role="img" aria-label={`Tarjeta virtual SERVI de @${username} con saldo de ${formatServi(balance)} SERVI`}>
      {/* Reflejo que recorre la tarjeta */}
      <span className="card-sheen" aria-hidden />

      {/* Logo marca arriba derecha */}
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <span className="text-right text-[10px] font-semibold uppercase leading-tight tracking-[0.2em] text-white/60">
          Virtual
          <br />
          Card
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

      <div className="relative flex h-full flex-col justify-between p-5 pt-11 sm:p-6 sm:pt-12">
        {/* Chip + NFC */}
        <div className="flex items-center gap-3">
          <EmvChip className="size-9 sm:size-10" />
          <ContactlessIcon className="size-5 rotate-90 text-white/70" />
        </div>

        {/* Número de cuenta */}
        <p className="mt-1 font-mono text-[15px] font-semibold tracking-[0.14em] text-white/95 sm:text-lg">
          {accountNumberFromId(userId)}
        </p>

        {/* Datos de la cuenta */}
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/55">
              Titular
            </p>
            <p className="truncate text-sm font-bold text-white">@{username}</p>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-xl font-bold tabular-nums text-gold-bright drop-shadow-[0_2px_10px_rgba(212,176,106,0.35)] sm:text-2xl">
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
    </div>
  );
}
