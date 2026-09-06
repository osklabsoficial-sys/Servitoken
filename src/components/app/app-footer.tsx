import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:flex-row sm:px-6 lg:px-8">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} ServiToken · Billetera interna de SERVI
        </p>
        <nav className="flex items-center gap-4 text-xs text-muted-foreground" aria-label="Legal">
          <Link href="/" className="transition-colors hover:text-foreground">
            Sitio web
          </Link>
          <Link href="/inicio" className="transition-colors hover:text-foreground">
            Mi panel
          </Link>
        </nav>
      </div>
    </footer>
  );
}
