import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, HelpCircle, Home, Lightbulb, X, MessageCircle, Megaphone, MousePointer2, ClipboardList, ShoppingBag, Smartphone } from "lucide-react";
import type { ReactNode } from "react";
import { OBJECTIVES, type ObjectiveKey } from "@/lib/ads-store";

export function Frame({ children, nav = true }: { children: ReactNode; nav?: boolean }) {
  return (
    <div className="meta-frame">
      <div className="meta-content">{children}</div>
      {nav && <BottomNav />}
    </div>
  );
}

function BottomNav() {
  return (
    <nav className="meta-nav" aria-label="Main navigation">
      <Link to="/" aria-label="Home" activeOptions={{ exact: true }}><Home /></Link>
      <Link to="/recommendations" aria-label="Recommendations"><Lightbulb /></Link>
      <Link to="/help" aria-label="Help"><HelpCircle /></Link>
    </nav>
  );
}

export function PageHeader({ title, close, right }: { title: string; close?: boolean; right?: ReactNode }) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b bg-card px-3 py-3">
      <Button variant="plain" aria-label="Back" onClick={() => router.history.back()} className="rounded-full p-1.5 hover:bg-muted">
        {close ? <X className="h-6 w-6" /> : <ArrowLeft className="h-6 w-6" />}
      </Button>
      <h1 className="flex-1 truncate text-center text-lg font-semibold">{title}</h1>
      <div className="min-w-9 flex justify-end">{right}</div>
    </header>
  );
}

const bg: Record<ObjectiveKey, string> = {
  engagement: "bg-obj-engagement", awareness: "bg-obj-awareness", traffic: "bg-obj-traffic",
  leads: "bg-obj-leads", sales: "bg-obj-sales", app: "bg-obj-app",
};
export function ObjectiveIcon({ k, size = "md" }: { k: ObjectiveKey; size?: "md" | "lg" }) {
  const s = size === "lg" ? "h-16 w-16 text-3xl" : "h-10 w-10 text-lg";
  const icons = { engagement: MessageCircle, awareness: Megaphone, traffic: MousePointer2, leads: ClipboardList, sales: ShoppingBag, app: Smartphone };
  const Icon = icons[k];
  return <div className={`${bg[k]} ${s} flex shrink-0 items-center justify-center rounded-full`}><Icon className="h-6 w-6" /></div>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`meta-card ${className}`}>{children}</div>;
}
