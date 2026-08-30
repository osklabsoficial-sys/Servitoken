"use client";

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react";
import {
  Bell,
  BellRing,
  Plus,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Reveal, SectionHeading } from "@/components/landing/section-primitives";

interface Alert {
  id: string;
  price: number;
  direction: "above" | "below";
  active: boolean;
  triggered: boolean;
}

const STORAGE_KEY = "servi_price_alerts";

function getAlertsSnapshot(): Alert[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function subscribeToAlerts(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function saveAlerts(alerts: Alert[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  window.dispatchEvent(new Event("storage"));
}

export function PriceAlerts() {
  const [price, setPrice] = useState<number | null>(null);
  const [inputPrice, setInputPrice] = useState("");
  const [direction, setDirection] = useState<"above" | "below">("above");
  const [notifGranted, setNotifGranted] = useState(() => {
    if (typeof window === "undefined") return false;
    if ("Notification" in window) return Notification.permission === "granted";
    return false;
  });
  const [showForm, setShowForm] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const alertsRef = useRef<Alert[]>([]);
  const [alertsVersion, setAlertsVersion] = useState(0);

  const notifGrantedSync = useSyncExternalStore(
    () => () => {},
    () => notifGranted,
    () => false
  );

  // notifGranted is initialized from Notification API via useState lazy init
  // so no effect needed here

  const requestNotifPermission = async () => {
    if ("Notification" in window) {
      const perm = await Notification.requestPermission();
      setNotifGranted(perm === "granted");
    }
  };

  const checkAlerts = useCallback(
    (currentPrice: number) => {
      const prev = getAlertsSnapshot();
      let changed = false;
      const updated = prev.map((a) => {
        if (!a.active || a.triggered) return a;
        const hit =
          (a.direction === "above" && currentPrice >= a.price) ||
          (a.direction === "below" && currentPrice <= a.price);
        if (hit) {
          changed = true;
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(`Alerta de Precio SERVI`, {
              body: `El precio ${a.direction === "above" ? "subió por encima" : "bajó por debajo"} de $${a.price}. Precio actual: $${currentPrice.toFixed(10)}`,
              icon: "/servitoken-logo-sm.png",
              tag: a.id,
            });
          }
          return { ...a, triggered: true, active: false };
        }
        return a;
      });
      if (changed) {
        saveAlerts(updated);
        alertsRef.current = updated;
        setAlertsVersion((n) => n + 1);
      }
    },
    []
  );

  const fetchPrice = useCallback(async () => {
    try {
      const res = await fetch("/api/token-stats");
      const data = await res.json();
      if (data.priceUsd) {
        const p = parseFloat(data.priceUsd);
        setPrice(p);
        checkAlerts(p);
      }
    } catch { /* silent */ }
  }, [checkAlerts]);

  useEffect(() => {
    const load = async () => { await fetchPrice(); };
    load();
    intervalRef.current = setInterval(load, 15_000);
    return () => clearInterval(intervalRef.current);
  }, [fetchPrice]);

  const addAlert = () => {
    const num = parseFloat(inputPrice);
    if (isNaN(num) || num <= 0) return;
    const newAlert: Alert = {
      id: Date.now().toString(),
      price: num,
      direction,
      active: true,
      triggered: false,
    };
    const current = getAlertsSnapshot();
    const updated = [newAlert, ...current];
    saveAlerts(updated);
    alertsRef.current = updated;
    setAlertsVersion((n) => n + 1);
    setInputPrice("");
    setShowForm(false);
  };

  const removeAlert = (id: string) => {
    const current = getAlertsSnapshot();
    const updated = current.filter((a) => a.id !== id);
    saveAlerts(updated);
    alertsRef.current = updated;
    setAlertsVersion((n) => n + 1);
  };

  const alerts = getAlertsSnapshot();
  const activeAlerts = alerts.filter((a) => a.active);

  return (
    <section id="alertas" className="relative border-t border-white/5 bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="ALERTAS INTELIGENTES"
            title="Notificaciones de Precio"
            description="Configura alertas y recibe notificaciones en tu navegador cuando el precio de SERVI alcance tu objetivo."
          />
        </Reveal>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Reveal delay={0.05}>
            <Card className="border-white/[0.08] bg-white/[0.02]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Bell className="h-4 w-4 text-electric" />
                  Crear Alerta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!notifGranted && (
                  <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3">
                    <p className="text-xs text-yellow-400">
                      Activa las notificaciones del navegador para recibir alertas.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                      onClick={requestNotifPermission}
                    >
                      Activar Notificaciones
                    </Button>
                  </div>
                )}

                {price && (
                  <p className="text-sm text-muted-foreground">
                    Precio actual: <span className="font-mono text-foreground font-medium">${price.toFixed(10)}</span>
                  </p>
                )}

                {showForm ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={direction === "above" ? "default" : "outline"}
                        className={direction === "above" ? "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30" : ""}
                        onClick={() => setDirection("above")}
                      >
                        <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                        Por encima
                      </Button>
                      <Button
                        size="sm"
                        variant={direction === "below" ? "default" : "outline"}
                        className={direction === "below" ? "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30" : ""}
                        onClick={() => setDirection("below")}
                      >
                        <ArrowDownRight className="h-3.5 w-3.5 mr-1" />
                        Por debajo
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="any"
                        placeholder="Precio objetivo USD"
                        value={inputPrice}
                        onChange={(e) => setInputPrice(e.target.value)}
                        className="font-mono text-sm"
                      />
                      <Button onClick={addAlert} disabled={!inputPrice} size="sm">
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => setShowForm(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Nueva Alerta de Precio
                  </Button>
                )}
              </CardContent>
            </Card>
          </Reveal>

          <Reveal delay={0.1}>
            <Card className="border-white/[0.08] bg-white/[0.02]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <BellRing className="h-4 w-4 text-gold" />
                    Alertas Activas
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {activeAlerts.length} activa{activeAlerts.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="mx-auto h-8 w-8 text-muted-foreground/30" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      No tienes alertas configuradas.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`flex items-center justify-between rounded-lg border px-3 py-2.5 transition-colors ${
                          alert.triggered
                            ? "border-green-500/20 bg-green-500/5"
                            : alert.active
                            ? "border-white/[0.06] bg-white/[0.02]"
                            : "border-white/[0.04] bg-white/[0.01] opacity-50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {alert.triggered ? (
                            <Check className="h-4 w-4 text-green-400" />
                          ) : alert.direction === "above" ? (
                            <ArrowUpRight className="h-4 w-4 text-green-400" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-400" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              ${alert.price}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {alert.triggered
                                ? "Disparada"
                                : alert.direction === "above"
                                ? "Por encima"
                                : "Por debajo"}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-red-400"
                          onClick={() => removeAlert(alert.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
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