"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { LogIn, ShieldCheck, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/**
 * Modal reutilizable de "acción privada requiere cuenta".
 * Ofrece [Iniciar Sesión] / [Crear Cuenta] y, tras autenticarse,
 * el usuario regresa automáticamente a la acción original vía
 * el parámetro returnTo.
 */
export function AuthRequiredDialog({
  open,
  onOpenChange,
  message,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const returnTo = pathname && pathname !== "/" ? pathname : "/inicio";
  const loginHref = `/login?returnTo=${encodeURIComponent(returnTo)}`;
  const registroHref = `/registro?returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-card sm:max-w-md">
        <DialogHeader>
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-gold/15 text-gold ring-1 ring-gold/25">
            <ShieldCheck className="size-6" aria-hidden />
          </span>
          <DialogTitle className="text-center">
            Necesitas una cuenta
          </DialogTitle>
          <DialogDescription className="text-center">
            {message}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 flex flex-col gap-2.5 sm:flex-row">
          <Button
            onClick={() => {
              onOpenChange(false);
              router.push(loginHref);
            }}
            className="flex-1 bg-gradient-to-r from-electric to-electric-bright text-white hover:opacity-95"
          >
            <LogIn className="size-4" /> Iniciar Sesión
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              router.push(registroHref);
            }}
            variant="outline"
            className="flex-1 border-white/15"
          >
            <UserPlus className="size-4" /> Crear Cuenta
          </Button>
        </div>

        <p className="mt-1 text-center text-[11px] text-muted-foreground">
          Después de autenticarte volverás automáticamente a esta acción.
        </p>
      </DialogContent>
    </Dialog>
  );
}
