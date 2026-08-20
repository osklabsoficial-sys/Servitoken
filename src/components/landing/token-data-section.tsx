"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, ExternalLink } from "lucide-react";
import { LucideIconByName } from "./lucide-icon";
import { Reveal } from "./section-primitives";
import { tokenStats, project } from "@/lib/token-data";
import { toast } from "sonner";

function abbreviateAddress(addr: string) {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function TokenDataSection() {
  const [copied, setCopied] = useState(false);
  const hasExplorerUrl = project.explorerBaseUrl.trim().length > 0;

  const copyContract = async () => {
    try {
      await navigator.clipboard.writeText(project.contractAddress);
      setCopied(true);
      toast.success("Contrato copiado");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar la dirección");
    }
  };

  return (
    <section id="datos-token" className="relative scroll-mt-16 bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 -mt-2 sm:px-6 lg:px-8">
        <Reveal delay={0.05}>
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent p-1.5 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:rounded-3xl">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-electric/40 to-transparent" />

            <div className="rounded-[1rem] bg-navy-2/40 p-1 sm:p-1.5">
              <dl className="grid grid-cols-2 divide-y divide-white/[0.06] sm:grid-cols-4 sm:divide-x sm:divide-y-0">
                {tokenStats.map((stat, i) => {
                  const isContract = stat.label === "Contrato";
                  const displayValue = isContract
                    ? abbreviateAddress(stat.value)
                    : stat.value;

                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.45,
                        delay: 0.05 * i,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className={`group relative px-3 py-3.5 sm:px-5 sm:py-5 ${isContract ? "col-span-2 sm:col-span-1" : ""}`}
                    >
                      <span
                        aria-hidden
                        className="absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-electric/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      />

                      <div className="flex items-center gap-2.5">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-electric/10 text-electric-bright ring-1 ring-electric/20 transition-colors group-hover:bg-electric/20">
                          <LucideIconByName name={stat.icon} className="size-3.5" />
                        </span>
                        <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          {stat.label}
                        </dt>
                      </div>

                      {isContract ? (
                        <>
                          <dd className="mt-2 font-mono text-xs font-semibold leading-snug text-foreground">
                            {displayValue}
                          </dd>
                          <div className="mt-2 flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={copyContract}
                              className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-gold"
                              aria-label="Copiar contrato"
                            >
                              {copied ? (
                                <Check className="size-3.5 text-brand-green" />
                              ) : (
                                <Copy className="size-3.5" />
                              )}
                            </button>
                            {hasExplorerUrl && (
                              <a
                                href={`${project.explorerBaseUrl}${project.contractAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-electric-bright"
                                aria-label="Ver contrato en explorador"
                              >
                                <ExternalLink className="size-3.5" />
                              </a>
                            )}
                          </div>
                        </>
                      ) : (
                        <dd className="mt-2 font-mono text-xs font-semibold leading-snug text-foreground">
                          {displayValue}
                        </dd>
                      )}
                    </motion.div>
                  );
                })}
              </dl>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}