"use client";

import Link from "next/link";
import { Coins, ShieldCheck, AlertTriangle } from "lucide-react";
import { navLinks, socialLinks, token } from "@/lib/token-data";
import { LucideIconByName } from "@/components/landing/lucide-icon";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-4">
          {/* Marca */}
          <div className="lg:col-span-2">
            <Link href="#inicio" className="group inline-flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
                <Coins className="size-5" />
              </span>
              <span className="flex flex-col leading-none">
                <span className="text-[15px] font-semibold tracking-tight text-white">
                  {token.name}
                </span>
                <span className="mt-0.5 font-mono text-[11px] font-medium text-emerald-400">
                  ${token.ticker}
                </span>
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
              {token.description}
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
              <ShieldCheck className="size-4 text-emerald-400" />
              <span className="font-mono text-xs text-slate-300">
                {token.contractAddress.slice(0, 10)}…
                {token.contractAddress.slice(-6)}
              </span>
            </div>
          </div>

          {/* Navegación */}
          <div>
            <h4 className="text-sm font-semibold text-white">Navegación</h4>
            <ul className="mt-4 space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors hover:text-emerald-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Redes */}
          <div>
            <h4 className="text-sm font-semibold text-white">Comunidad</h4>
            <ul className="mt-4 space-y-2.5">
              {socialLinks.map((social) => (
                <li key={social.name}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-emerald-400"
                  >
                    <LucideIconByName
                      name={social.icon}
                      className="size-4 text-slate-500 group-hover:text-emerald-400"
                    />
                    {social.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Aviso de riesgo */}
        <div className="mt-10 flex items-start gap-3 rounded-xl border border-amber-900/40 bg-amber-950/20 px-4 py-3.5">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" />
          <p className="text-xs leading-relaxed text-amber-200/90">
            <span className="font-semibold text-amber-200">
              Aviso de riesgo:
            </span>{" "}
            La información presentada en esta página tiene fines informativos.
            Los activos digitales pueden ser volátiles y conllevan riesgos.
            Realiza tu propia investigación antes de adquirir cualquier token.
            Esta página no constituye asesoramiento financiero.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-6 sm:flex-row">
          <p className="text-xs text-slate-500">
            © {year} {token.name}. Todos los derechos reservados.
          </p>
          <p className="text-xs text-slate-500">
            Construido sobre {token.network}
          </p>
        </div>
      </div>
    </footer>
  );
}
