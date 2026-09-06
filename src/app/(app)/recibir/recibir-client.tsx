"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownLeft, Check, Copy, Info, Send, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TokenLiveTicker } from "@/components/app/token-pulse";

export function RecibirClient({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(`@${username}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* portapapeles no disponible */
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-5">
        <TokenLiveTicker />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          <ArrowDownLeft className="size-6 text-brand-green" aria-hidden />
          Recibir SERVI
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Otros usuarios pueden enviarte SERVI utilizando tu nombre de usuario. Sin wallets, sin
          direcciones complicadas.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="mt-6 overflow-hidden border-white/10 bg-gradient-to-br from-card via-card to-navy-2">
          <CardContent className="flex flex-col items-center gap-5 p-8 text-center sm:p-10">
            <span className="flex size-16 items-center justify-center rounded-full bg-brand-green/15 text-brand-green ring-1 ring-brand-green/30">
              <ArrowDownLeft className="size-8" aria-hidden />
            </span>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tu nombre de usuario
              </p>
              <p className="mt-2 text-4xl font-bold tracking-tight text-gold-bright sm:text-5xl">
                @{username}
              </p>
            </div>

            <Button
              onClick={copy}
              variant="outline"
              className="border-gold/30 bg-gold/10 text-gold-bright hover:bg-gold/15 hover:text-gold-bright"
            >
              {copied ? (
                <>
                  <Check className="size-4 text-brand-green" /> ¡Copiado!
                </>
              ) : (
                <>
                  <Copy className="size-4" /> Copiar mi usuario
                </>
              )}
            </Button>

            <div className="w-full rounded-2xl border border-white/10 bg-navy-2/60 p-4 text-left">
              <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <Info className="mt-0.5 size-3.5 shrink-0 text-electric-bright" aria-hidden />
                <span>
                  Comparte <span className="font-semibold text-foreground">@{username}</span> con
                  quien quiera enviarte SERVI. La transferencia aparece en tu saldo y en tu
                  historial al instante.
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mt-5 grid gap-3 sm:grid-cols-2">
        <Link
          href="/enviar"
          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-card p-4 transition-all hover:-translate-y-0.5 hover:bg-white/5"
        >
          <Send className="size-5 text-electric-bright" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-foreground">Enviar SERVI</p>
            <p className="text-xs text-muted-foreground">Transfiere a otros usuarios</p>
          </div>
        </Link>
        <Link
          href="/historial"
          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-card p-4 transition-all hover:-translate-y-0.5 hover:bg-white/5"
        >
          <ShieldCheck className="size-5 text-brand-green" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-foreground">Ver historial</p>
            <p className="text-xs text-muted-foreground">Revisa tus recibidos</p>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
