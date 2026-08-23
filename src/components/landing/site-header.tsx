"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Logo } from "@/components/landing/logo";
import { ConnectWallet } from "@/components/landing/connect-wallet";
import { navLinks } from "@/lib/token-data";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-background/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="#inicio" className="group flex shrink-0 items-center gap-2">
          <Logo size="md" />
          <span className="hidden items-center gap-1.5 rounded-full border border-brand-green/20 bg-brand-green/10 px-2 py-0.5 sm:flex">
            <BadgeCheck className="size-3 text-brand-green" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-green/90">
              Oficial
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-2.5 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-2 lg:flex">
          <ConnectWallet />
          <Button
            asChild
            size="sm"
            className="bg-gradient-to-r from-electric to-electric-bright text-white shadow-[0_6px_20px_-8px_rgba(46,107,255,0.7)] hover:opacity-95"
          >
            <Link href="#precio">Comprar Servitoken</Link>
          </Button>
        </div>

        {/* Mobile menu trigger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-foreground"
              aria-label="Abrir menú"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-full max-w-[300px] border-white/10 bg-background p-0"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <SheetTitle className="flex items-center">
                  <Logo size="sm" />
                </SheetTitle>
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground"
                    aria-label="Cerrar menú"
                  >
                    <X className="size-5" />
                  </Button>
                </SheetClose>
              </div>
              <nav className="flex flex-col gap-0.5 overflow-y-auto p-4">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto border-t border-white/10 p-4 space-y-2">
                <ConnectWallet />
                <SheetClose asChild>
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-electric to-electric-bright text-white"
                  >
                    <Link href="#precio">Comprar Servitoken</Link>
                  </Button>
                </SheetClose>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
