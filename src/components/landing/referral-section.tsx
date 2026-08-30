"use client";

import { useState, useEffect, useCallback } from "react";
import { useWalletStore } from "@/lib/wallet-store";
import {
  Share2,
  Trophy,
  Link2,
  Copy,
  Check,
  Loader2,
  Crown,
  Medal,
  User,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal, SectionHeading } from "@/components/landing/section-primitives";

interface ReferralData {
  code: string;
  clicks: number;
  rank: number;
  leaderboard: Array<{ code: string; clicks: number; isYou: boolean }>;
}

export function ReferralSection() {
  const { address, isConnected } = useWalletStore();
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchReferral = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/referral?wallet=${address}`);
      const json = await res.json();
      if (!json.error) setData(json);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [address]);

  useEffect(() => {
    fetchReferral();
  }, [fetchReferral]);

  const referralUrl = data
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/?ref=${data.code}`
    : "";

  const copyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareNative = () => {
    if (navigator.share) {
      navigator.share({
        title: "Compra SERVI - Servitoken",
        text: "Únete al ecosistema Servitoken y compra SERVI en BNB Smart Chain",
        url: referralUrl,
      });
    } else {
      copyLink();
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-4 w-4 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-slate-300" />;
    if (rank === 3) return <Medal className="h-4 w-4 text-amber-600" />;
    return <span className="text-xs font-mono text-muted-foreground w-4 text-center">{rank}</span>;
  };

  if (!isConnected) {
    return (
      <section id="referidos" className="relative border-t border-white/5 bg-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <Reveal>
            <Card className="border-white/[0.08] bg-white/[0.02]">
              <CardContent className="flex flex-col items-center gap-4 py-16">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10 text-gold">
                  <Share2 className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold">Programa de Referidos</h3>
                <p className="max-w-sm text-center text-sm text-muted-foreground">
                  Conecta tu wallet para obtener tu enlace de referido unico y rastrear tus invitaciones.
                </p>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </section>
    );
  }

  return (
    <section id="referidos" className="relative border-t border-white/5 bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="PROGRAMA DE REFERIDOS"
            title="Invita y Gana"
            description="Comparte tu enlace de referido. Cada clic queda registrado y subes en el ranking."
          />
        </Reveal>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Your Link */}
          <Reveal delay={0.05}>
            <Card className="border-white/[0.08] bg-white/[0.02]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-electric" />
                  Tu Enlace de Referido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading && (
                  <div className="flex items-center justify-center gap-2 py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}
                {!loading && data && (
                  <>
                    <div className="rounded-lg bg-white/[0.04] border border-white/[0.06] p-3">
                      <p className="font-mono text-xs text-muted-foreground break-all">
                        {referralUrl}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 gap-2"
                        onClick={copyLink}
                      >
                        {copied ? (
                          <><Check className="h-4 w-4 text-green-400" /> Copiado</>
                        ) : (
                          <><Copy className="h-4 w-4" /> Copiar Link</>
                        )}
                      </Button>
                      <Button className="gap-2 bg-gradient-to-r from-gold to-gold-bright text-black" onClick={shareNative}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                        <p className="text-2xl font-bold font-mono text-foreground">{data.clicks}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                          Clics Recibidos
                        </p>
                      </div>
                      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                        <p className="text-2xl font-bold font-mono text-foreground">#{data.rank}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                          Tu Ranking
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </Reveal>

          {/* Leaderboard */}
          <Reveal delay={0.1}>
            <Card className="border-white/[0.08] bg-white/[0.02]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-gold" />
                    Ranking de Referidos
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    Top {data?.leaderboard.length ?? 0}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {loading && (
                  <div className="flex items-center justify-center gap-2 py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}
                {!loading && data && data.leaderboard.length > 0 && (
                  <div className="space-y-1.5 max-h-80 overflow-y-auto">
                    {data.leaderboard.map((entry, i) => (
                      <div
                        key={entry.code}
                        className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.03]"
                        style={entry.isYou ? { border: "1px solid rgba(var(--electric), 0.3)", background: "rgba(var(--electric), 0.05)" } : undefined}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-5 flex justify-center">
                            {getRankIcon(i + 1)}
                          </div>
                          <div>
                            <p className={"text-sm font-medium " + (entry.isYou ? "text-electric" : "text-foreground")}>
                              {entry.code}
                              {entry.isYou && (
                                <Badge className="ml-2 bg-electric/15 text-electric border-electric/30 text-[9px] px-1.5">
                                  TU
                                </Badge>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-sm font-semibold text-foreground">
                            {entry.clicks}
                          </span>
                          <span className="text-[10px] text-muted-foreground">clics</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {!loading && (!data || data.leaderboard.length === 0) && (
                  <div className="text-center py-8">
                    <Trophy className="mx-auto h-8 w-8 text-muted-foreground/30" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      Aun no hay datos en el ranking.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
