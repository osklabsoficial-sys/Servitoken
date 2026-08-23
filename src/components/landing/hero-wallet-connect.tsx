"use client";

import { useAccount, useConnect } from "wagmi";
import { Smartphone, Monitor, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function HeroWalletConnect() {
  const { isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();

  const wcConnector = connectors.find((c) => c.id !== "injected");
  const injectedConnector = connectors.find((c) => c.id === "injected");

  const handleConnect = (connector: (typeof connectors)[number]) => {
    connect({ connector });
  };

  // Si ya está conectado, no mostrar
  if (isConnected) return null;

  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm">
      {/* Header con WalletConnect */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-3.5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-[#3B99FC]/15 ring-1 ring-[#3B99FC]/20">
          <WalletConnectLogo />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Conectar por WalletConnect
          </p>
          <p className="text-[11px] text-muted-foreground">
            Desde tu wallet móvil · BNB Smart Chain
          </p>
        </div>
      </div>

      {/* Botones de conexión */}
      <div className="flex flex-col gap-2 p-3">
        {/* WalletConnect — primario para móviles */}
        {wcConnector && (
          <button
            type="button"
            onClick={() => handleConnect(wcConnector)}
            disabled={isPending}
            className="group flex w-full items-center gap-3 rounded-xl bg-[#3B99FC]/10 px-4 py-3.5 text-left ring-1 ring-[#3B99FC]/20 transition-all hover:bg-[#3B99FC]/20 disabled:opacity-50"
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-[#3B99FC]/20">
              <Smartphone className="size-5 text-[#3B99FC]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                WalletConnect
              </p>
              <p className="text-[11px] text-muted-foreground">
                Escanea el código QR con Trust Wallet, MetaMask Mobile u otra wallet
              </p>
            </div>
            {isPending ? (
              <Loader2 className="size-4 animate-spin text-[#3B99FC]" />
            ) : (
              <ArrowRight className="size-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-[#3B99FC]" />
            )}
          </button>
        )}

        {/* MetaMask / Injected — secundario para escritorio */}
        {injectedConnector && (
          <button
            type="button"
            onClick={() => handleConnect(injectedConnector)}
            disabled={isPending}
            className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-white/5 disabled:opacity-50"
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-[#E2761B]/10 ring-1 ring-[#E2761B]/20">
              <MetaMaskLogo />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                MetaMask
              </p>
              <p className="text-[11px] text-muted-foreground">
                Extensión de navegador (escritorio)
              </p>
            </div>
            <Monitor className="size-4 text-muted-foreground/40" />
          </button>
        )}
      </div>

      {/* Nota de red */}
      <div className="border-t border-white/[0.06] px-5 py-2.5">
        <p className="flex items-center gap-2 text-[10px] text-muted-foreground/70">
          <span className="size-1.5 rounded-full bg-[#F3BA2F]" />
          Red: BNB Smart Chain · Auto-switch activado
        </p>
      </div>
    </div>
  );
}

/* WalletConnect blue logo */
function WalletConnectLogo() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none">
      <path
        d="M6.09 9.55c3.26-3.19 8.56-3.19 11.82 0l.39.38a.4.4 0 010 .57l-1.34 1.3a.22.22 0 01-.3 0l-.54-.53c-2.27-2.22-5.96-2.22-8.23 0l-.58.56a.22.22 0 01-.3 0L5.67 10.5a.4.4 0 010-.57l.42-.38zm14.6 2.68l1.19 1.16a.4.4 0 010 .57l-5.4 5.28a.42.42 0 01-.58 0l-3.83-3.75a.12.12 0 00-.17 0l-3.83 3.75a.42.42 0 01-.58 0L2.09 14a.4.4 0 010-.57l1.19-1.16a.42.42 0 01.59 0l3.83 3.75a.12.12 0 00.17 0l3.83-3.75a.42.42 0 01.59 0l3.83 3.75a.12.12 0 00.17 0l3.83-3.75a.42.42 0 01.59 0z"
        fill="#3B99FC"
      />
    </svg>
  );
}

/* MetaMask orange logo */
function MetaMaskLogo() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none">
      <path d="M21.3 2L13.2 8.2L14.7 4.5L21.3 2Z" fill="#E2761B" stroke="#E2761B" strokeWidth="0.2" />
      <path d="M2.7 2L10.7 8.3L9.3 4.5L2.7 2Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.2" />
      <path d="M18.4 16.8L15.9 20.7L20.8 22.1L22.2 16.9L18.4 16.8Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.2" />
      <path d="M1.8 16.9L3.2 22.1L8.1 20.7L5.6 16.8L1.8 16.9Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.2" />
      <path d="M7.9 10.5L6.5 12.3L11.4 12.5L11.2 7.2L7.9 10.5Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.2" />
      <path d="M16.1 10.5L12.7 7.1L12.6 12.5L17.5 12.3L16.1 10.5Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.2" />
      <path d="M8.1 20.7L11.1 19.3L8.6 17.2L8.1 20.7Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.2" />
      <path d="M12.9 19.3L15.9 20.7L15.4 17.2L12.9 19.3Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.2" />
    </svg>
  );
}
