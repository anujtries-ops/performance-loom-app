import { Bell, CheckCheck, CreditCard, Lightbulb, Megaphone } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DEMO_NOTIFICATIONS } from "@/lib/ads-demo";

export function Notifications({ open, onOpenChange, read, onRead, campaignId }: { open: boolean; onOpenChange: (open: boolean) => void; read: string[]; onRead: (ids: string[]) => void; campaignId?: string | undefined }) {
  return <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent side="right" className="w-full max-w-md overflow-y-auto bg-card p-0 sm:max-w-md">
      <SheetHeader className="border-b px-5 py-6 pr-12"><SheetTitle>Notifications</SheetTitle><SheetDescription>4 sample notifications · Demo account</SheetDescription></SheetHeader>
      <div className="flex justify-end border-b px-4 py-2"><Button variant="link" onClick={() => onRead(DEMO_NOTIFICATIONS.map(n => n.id))}><CheckCheck />Mark all as read</Button></div>
      <ul>{DEMO_NOTIFICATIONS.map(n => {
        const Icon = n.kind === "billing" ? CreditCard : n.kind === "recommendation" ? Lightbulb : Megaphone;
        const unread = !read.includes(n.id);
        const content = <><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-primary"><Icon className="h-5 w-5" /></span><span className="min-w-0"><span className="block font-semibold">{n.title}</span><span className="mt-1 block text-sm text-muted-foreground">{n.body}</span><span className="mt-2 block text-xs text-muted-foreground">{n.time}</span></span>{unread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}</>;
        const activate = () => { onRead([...new Set([...read, n.id])]); onOpenChange(false); };
        return <li key={n.id} className={`border-b ${unread ? "bg-accent/30" : "bg-card"}`}><Button asChild variant="plain" className="grid h-auto w-full grid-cols-[44px_minmax(0,1fr)_8px] items-start gap-3 whitespace-normal rounded-none px-5 py-5 text-left">
          {n.kind === "billing" ? <Link to="/billing" onClick={activate}>{content}</Link> : n.kind === "recommendation" ? <Link to="/recommendations" onClick={activate}>{content}</Link> : campaignId ? <Link to="/campaign/$id" params={{ id: campaignId }} onClick={activate}>{content}</Link> : <Link to="/" onClick={activate}>{content}</Link>}
        </Button></li>;
      })}</ul>
      <div className="flex items-center gap-2 px-5 py-5 text-xs text-muted-foreground"><Bell className="h-4 w-4" />No live Meta notifications connected</div>
    </SheetContent>
  </Sheet>;
}