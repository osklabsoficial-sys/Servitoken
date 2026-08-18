"use client";

import {
  ShieldCheck,
  Receipt,
  Zap,
  Eye,
  Wallet,
  HandCoins,
  Send,
  BadgeCheck,
  CreditCard,
  PiggyBank,
  Timer,
  Lock,
  Globe,
  Users,
  Cookie,
  Repeat,
  Landmark,
  Building2,
  Network,
  Import,
  ArrowLeftRight,
  Twitter,
  MessageCircle,
  Github,
  Mail,
  Megaphone,
  LifeBuoy,
  Headphones,
  type LucideIcon,
} from "lucide-react";

const registry: Record<string, LucideIcon> = {
  ShieldCheck,
  Receipt,
  Zap,
  Eye,
  Wallet,
  HandCoins,
  Send,
  BadgeCheck,
  CreditCard,
  PiggyBank,
  Timer,
  Lock,
  Globe,
  Users,
  Cookie,
  Repeat,
  Landmark,
  Building2,
  Network,
  Import,
  ArrowLeftRight,
  Twitter,
  MessageCircle,
  Github,
  Mail,
  Megaphone,
  LifeBuoy,
  Headphones,
};

export function LucideIconByName({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = registry[name] ?? ShieldCheck;
  return <Icon className={className} />;
}
