"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Copy, Check, QrCode, Smartphone, Loader2, AlertCircle, ExternalLink, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import QRCode from "qrcode";

interface WcQrModalProps {
  open: boolean;
  onClose: () => void;
}

const WC_PROJECT_ID = "35ee79d215da0d6202df395063db2dcc";

export function WcQrModal({ open, onClose }: WcQrModalProps) {
  const [wcUri, setWcUri] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "connecting" | "waiting">("idle");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Initialize WalletConnect SignClient directly — bypasses wagmi/viem
  // store proxy that breaks EventEmitter.removeListener under Turbopack.
  useEffect(function () {
    if (!open) {
      cleanupRef.current?.();
      cleanupRef.current = null;
      return;
    }

    let cancelled = false;
    setStatus("connecting");
    setError(null);
    setWcUri(null);

    async function start() {
      try {
        // Dynamic import of SignClient (not the full ethereum-provider)
        const { SignClient } = await import("@walletconnect/sign-client");
        if (cancelled) return;

        const client = await SignClient.init({
          projectId: WC_PROJECT_ID,
          metadata: {
            name: "Servitoken",
            description: "Token de utilidad para pagos de servicios",
            url: "https://servitoken.com",
            icons: ["https://servitoken.com/logo.png"],
          },
        });
        if (cancelled) { await client.close(); return; }

        // Propose a session — this returns a URI for the QR code
        const { uri, approval } = await client.connect({
          requiredNamespaces: {
            eip155: {
              methods: [
                "eth_sendTransaction",
                "eth_signTransaction",
                "eth_sign",
                "personal_sign",
                "eth_signTypedData_v4",
              ],
              chains: ["eip155:56"],
              events: ["chainChanged", "accountsChanged"],
            },
          },
        });
        if (cancelled) { await client.close(); return; }

        if (uri) {
          setWcUri(uri);
          setStatus("waiting");

          // Wait for the mobile wallet to approve
          const session = await approval();
          if (session && !cancelled) {
            const accounts = session.namespaces?.["eip155"]?.accounts;
            if (accounts?.length) {
              const addr = accounts[0].split(":")[2];
              toast.success(
                "Wallet conectada via WalletConnect: " +
                  addr.slice(0, 6) + "..." + addr.slice(-4),
                {
                  description:
                    "Sesion activa. Para swaps y transacciones, usa una extension de wallet.",
                  duration: 7000,
                },
              );
            }
            onClose();
          }
        }

        cleanupRef.current = async function () {
          try { await client.close(); } catch {}
        };
      } catch (err: any) {
        if (cancelled) return;
        console.error("[WC] Error:", err);
        setError(
          err?.shortMessage ||
            err?.message ||
            "WalletConnect no esta disponible en este entorno. Usa una extension de wallet.",
        );
        setStatus("idle");
      }
    }

    start();

    return function () {
      cancelled = true;
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [open]);

  // Draw real QR code when wcUri changes
  useEffect(function () {
    if (!wcUri || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, wcUri, {
      width: 220,
      margin: 1,
      color: { dark: "#000000", light: "#FFFFFF" },
    }).catch(function (err) {
      console.error("[WC] QR render error:", err);
    });
  }, [wcUri]);

  const handleCopy = useCallback(function () {
    if (!wcUri) return;
    navigator.clipboard.writeText(wcUri);
    setCopied(true);
    setTimeout(function () { setCopied(false); }, 2000);
  }, [wcUri]);

  return (
    <Dialog open={open} onOpenChange={function (v) { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-[400px] p-0 gap-0 overflow-hidden sm:rounded-2xl rounded-none sm:top-[50%] sm:left-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] top-0 left-0 translate-x-0 translate-y-0 sm:h-auto sm:max-h-[85vh] h-[100dvh] max-h-[100dvh] sm:w-[400px] w-full flex flex-col bg-background border-border" showCloseButton={false}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <QrCode className="h-4 w-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold leading-tight">WalletConnect</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">Escanea con tu wallet movil</DialogDescription>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-5">
          {error ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="h-7 w-7 text-red-500" />
              </div>
              <p className="text-sm text-red-400 font-medium">No disponible</p>
              <p className="text-xs text-muted-foreground max-w-[280px]">{error}</p>
              <button onClick={onClose} className="mt-2 px-4 py-2 rounded-xl bg-muted/50 hover:bg-muted text-sm transition-colors">
                Cerrar
              </button>
            </div>
          ) : wcUri ? (
            <>
              <div className="bg-white p-3 rounded-2xl shadow-lg">
                <canvas ref={canvasRef} width={220} height={220} className="block" />
              </div>
              <p className="text-sm text-muted-foreground text-center">Abre tu wallet movil y escanea</p>
              <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 hover:bg-muted text-sm text-muted-foreground hover:text-foreground transition-colors">
                {copied ? <><Check className="h-4 w-4 text-green-500" /> <span className="text-green-500">Copiado</span></> : <><Copy className="h-4 w-4" /> <span>Copiar enlace wc:</span></>}
              </button>
              <a
                href={"wc:" + wcUri}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                Abrir en wallet movil
              </a>
              <div className="flex items-start gap-2 mt-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  WalletConnect en este entorno permite verificar tu wallet. Para swaps y transacciones on-chain, conecta usando una extension de wallet (MetaMask, Trust Wallet, etc.) en tu navegador.
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                {status === "connecting" ? (
                  <Loader2 className="h-8 w-8 text-muted-foreground/50 animate-spin" />
                ) : (
                  <Smartphone className="h-8 w-8 text-muted-foreground/50" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {status === "connecting" ? "Generando codigo QR..." : "Esperando..."}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
