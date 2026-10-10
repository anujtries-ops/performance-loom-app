import { Button } from "@/components/ui/button";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Bell, ChevronDown, ChevronRight, Copy, ListFilter, Plus, Search, Settings, Table2, X, Info, MoreVertical, Gauge, CircleArrowUp, MonitorUp } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ReferenceFilters } from "@/components/ads/ReferenceFilters";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CampaignCard, statusColor } from "@/components/ads/CampaignCard";
import { AssistantIcon } from "@/components/ads/AssistantIcon";
import { Card, Frame } from "@/components/ads/Shell";
import { AdPreview } from "@/components/ads/AdPreview";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DuplicateSheet } from "@/components/ads/DuplicateSheet";
import { Notifications } from "@/components/ads/Notifications";
import { DEMO_NOTIFICATIONS } from "@/lib/ads-demo";
import { actions, money, num, OBJECTIVES, STATUS_LABEL, useAds, useCurrentAccount } from "@/lib/ads-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Ads Manager – Campaigns" },
      { name: "description", content: "View and manage all your ad campaigns, spend and results in one place." },
      { property: "og:title", content: "Ads Manager – Campaigns" },
      { property: "og:description", content: "View and manage all your ad campaigns, spend and results in one place." },
    ],
  }),
  component: Home,
});

const DATES = { today: ["Today", 0.05], "7d": ["Last 7 days", 0.3], "30d": ["Last 30 days", 0.85], max: ["Maximum", 1] } as const;
type DateKey = keyof typeof DATES;

function Home() {
  const acct = useCurrentAccount();
  const all = useAds((s) => s.campaigns);
  const nav = useNavigate();
  const [date, setDate] = useState<DateKey>("max");
  const [status, setStatus] = useState("all");
  const [filterOpen, setFilterOpen] = useState<"status" | "date" | "custom" | null>(null);
  const [dateLabel, setDateLabel] = useState("Date");
  const [q, setQ] = useState("");
  const [searching, setSearching] = useState(false);
  const [table, setTable] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [dupOpen, setDupOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [readNotifications, setReadNotifications] = useState<string[]>([]);
  const unread = DEMO_NOTIFICATIONS.length - readNotifications.length;
  const factor = DATES[date][1];

  const mine = all.filter((c) => c.accountId === acct.id);
  const list = useMemo(
    () => mine.filter((c) => (status === "all" || c.status === status) && c.name.toLowerCase().includes(q.toLowerCase())),
    [mine, status, q],
  );
  const recommended = mine.find((c) => c.recommendations > 0);
  const activeCount = mine.filter((c) => c.status === "active").length;
  const totalSpent = mine.reduce((s, c) => s + c.spent * factor, 0);

  return (
    <Frame>
      <header className="meta-account-header">
        <Link to="/billing" aria-label="Settings" className="flex h-12 w-12 items-center justify-center rounded-full border bg-card"><Settings className="h-5 w-5" /></Link>
        <Link to="/accounts" className="min-w-0 flex-1">
          <p className="flex min-w-0 items-center justify-between gap-1 text-2xl font-bold"><span className="truncate">{acct.name}</span><ChevronDown className="h-5 w-5 shrink-0" /></p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-success" />{activeCount} active campaign{activeCount === 1 ? "" : "s"}</p>
        </Link>
        <Button variant="plain" size="icon" aria-label={`Notifications, ${unread} unread`} onClick={() => setNotificationsOpen(true)} className="relative h-11 w-9 shrink-0 p-0 [&_svg]:size-6"><Bell />{unread > 0 && <span className="absolute -right-0.5 top-0 grid h-4 w-4 place-items-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">{unread}</span>}</Button>
        <Button variant="create" aria-label="Create" onClick={() => setCreateOpen(true)} className="h-12 w-12 shrink-0 [&_svg]:size-7"><Plus className="h-6 w-6" /></Button>
      </header>

      <div className="meta-filter-bar">
        <Button variant="metaOutline" aria-label="Filters" onClick={() => setFilterOpen("custom")}><ListFilter /></Button>
        <Button variant="metaOutline" onClick={() => setFilterOpen("date")}><span className="truncate">{dateLabel}</span><ChevronDown /></Button>
        <Button variant="metaOutline" onClick={() => setFilterOpen("status")}><span className="truncate">{status === "all" ? "Status" : status.replaceAll("_", " ").replace("paused", "Off")}</span><ChevronDown /></Button>
      </div>
      <ReferenceFilters open={filterOpen} onClose={() => setFilterOpen(null)} status={status} onStatus={setStatus} onDate={(value, label) => { setDate(value); setDateLabel(label === "Maximum" ? "Date" : label); }} />

      <Card className="meta-spend-summary">
        <Button variant="plain" asChild className="w-full p-0 text-left"><Link to="/billing"><span className="min-w-0"><span className="block text-sm text-muted-foreground">Total amount spent</span><strong className="mt-1 block text-xl font-semibold">{money(totalSpent, acct.currency)}</strong></span><span className="min-w-0 text-sm text-muted-foreground">{acct.spendingLimit ? money(acct.spendingLimit, acct.currency) : "No spending limit"}</span><ChevronRight className="shrink-0" /></Link></Button>
      </Card>
      {recommended && <Card className="meta-recommendation">
        <Link to="/recommendations" className="meta-opportunity-row"><span className="min-w-0"><span className="block text-xs text-muted-foreground">Opportunity score</span><span className="flex items-center gap-1"><Gauge className="h-8 w-8 shrink-0 text-primary" /><strong className="text-2xl">82</strong><span className="text-sm text-muted-foreground">points</span></span></span><span className="flex items-center gap-1 text-sm"><strong>{mine.reduce((sum, c) => sum + c.recommendations, 0)}</strong><span className="text-muted-foreground">recommendations</span><span className="h-1.5 w-1.5 rounded-full bg-destructive" /></span></Link>
        <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-1"><span className="flex min-w-0 flex-wrap items-center gap-1 text-xs font-semibold text-accent-foreground"><span className="reference-points"><CircleArrowUp className="h-3.5 w-3.5" />+18 points</span><span className="reference-points">New</span></span><Button variant="metaOutline" onClick={() => setAssistantOpen(true)} className="h-9 px-2"><AssistantIcon />Analyze</Button><Button variant="metaOutline" size="icon" aria-label="Dismiss recommendation" onClick={() => actions.dismissRecommendation(recommended.id)}><MoreVertical /></Button></div>
        <h2 className="mt-3 max-w-2xl text-xl font-bold leading-snug">Explore more Advantage+ creative enhancements</h2>
        <p className="mt-3 text-base">Potential outcome: <span className="font-semibold text-tint">More ways to connect with your audience</span></p>
        <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">Creative recommendation <Info className="h-3.5 w-3.5" /></p>
        <div className="mt-4 flex min-w-0 items-center gap-3 border-t pt-4">{recommended.ad.image && <img src={recommended.ad.image} className="h-8 w-8 shrink-0 rounded object-cover" alt="Recommended ad" />}<span className="min-w-0 truncate">{recommended.name}</span></div>
        <Button variant="metaOutline" className="mt-3 h-11 w-full text-base" onClick={() => { setPreview(true); toast("Demo ad preview opened; desktop transfer is not connected."); }}><MonitorUp />Send to desktop</Button>
        <Button variant="link" className="mt-1 h-8 w-full" onClick={() => nav({ to: "/recommendations" })}>Review recommendations</Button>
      </Card>}
      <div className="meta-section-title">
        <h2>Campaigns</h2>
        <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setSearching((v) => !v)} className="[&_svg]:size-6"><Search /></Button>
        <Button variant="ghost" size="icon" aria-label="Table view" onClick={() => setTable((v) => !v)} className={`[&_svg]:size-6 ${table ? "bg-accent text-accent-foreground" : ""}`}><Table2 /></Button>
      </div>
      <Dialog open={preview} onOpenChange={setPreview}><DialogContent className="max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>Ad preview</DialogTitle></DialogHeader>{recommended && <AdPreview name={acct.name} ad={recommended.ad} />}</DialogContent></Dialog>
      {searching && (
        <div className="relative px-4 pt-2">
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search campaigns" className="w-full rounded-full border bg-card px-4 py-2 text-sm outline-none focus:border-primary" />
          {q && <Button variant="plain" aria-label="Clear" onClick={() => setQ("")} className="absolute right-7 top-4"><X className="h-4 w-4" /></Button>}
        </div>
      )}

      <p className="demo-results-note px-4 pb-3 sm:px-7">Demo results · Simulated numbers, not live Meta data</p>
      <div className={table ? "px-4 pb-6 sm:px-7" : "campaign-grid"}>
        {list.length === 0 && (
          <Card className="p-6 text-center">
            <p className="font-medium">No campaigns found</p>
            <p className="mt-1 text-sm text-muted-foreground">Create a campaign to start reaching people.</p>
            <Button variant="plain" onClick={() => nav({ to: "/create" })} className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Create campaign</Button>
          </Card>
        )}
        {table && list.length > 0 ? (
          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left text-xs text-muted-foreground"><tr><th className="p-2">Campaign</th><th className="p-2">Status</th><th className="p-2 text-right">Results</th><th className="p-2 text-right">Spent</th></tr></thead>
              <tbody>{list.map((c) => (
                <tr key={c.id} className="border-t" onClick={() => nav({ to: "/campaign/$id", params: { id: c.id } })}>
                  <td className="p-2 font-medium">{c.name}<div className="text-xs text-muted-foreground">{OBJECTIVES[c.objective].label}</div></td>
                  <td className={`p-2 ${statusColor(c.status)}`}>{STATUS_LABEL[c.status]}</td>
                  <td className="p-2 text-right">{num(Math.round(c.results * factor))}</td>
                  <td className="p-2 text-right">{money(c.spent * factor, acct.currency)}</td>
                </tr>))}</tbody>
            </table>
          </Card>
        ) : list.map((c) => <CampaignCard key={c.id} c={c} currency={acct.currency} factor={factor} />)}
      </div>

      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-2xl p-0">
          <SheetHeader className="p-4"><SheetTitle className="text-center">Create</SheetTitle></SheetHeader>
          <Button variant="plain" onClick={() => { setCreateOpen(false); nav({ to: "/create" }); }} className="flex w-full items-center gap-4 px-4 py-4 text-left hover:bg-muted">
            <span className="rounded-lg border p-3"><Plus className="h-5 w-5" /></span>
            <span className="flex-1"><span className="block font-medium">Create campaign</span><span className="text-sm text-muted-foreground">Create and publish a new campaign</span></span><ChevronRight className="h-5 w-5" />
          </Button>
          <Button variant="plain" onClick={() => { setCreateOpen(false); setDupOpen(true); }} className="mb-6 flex w-full items-center gap-4 border-t px-4 py-4 text-left hover:bg-muted">
            <span className="rounded-lg border p-3"><Copy className="h-5 w-5" /></span>
            <span className="flex-1"><span className="block font-medium">Duplicate existing</span><span className="text-sm text-muted-foreground">Create using an existing campaign</span></span><ChevronRight className="h-5 w-5" />
          </Button>
        </SheetContent>
      </Sheet>
      <DuplicateSheet open={dupOpen} onOpenChange={setDupOpen} />
      <Notifications open={notificationsOpen} onOpenChange={setNotificationsOpen} read={readNotifications} onRead={setReadNotifications} campaignId={mine[0]?.id} />
      <Button variant="outline" size="icon" aria-label="Open assistant" title="Assistant" className="meta-assistant-launcher" onClick={() => setAssistantOpen(true)}><AssistantIcon /></Button>
      <Dialog open={assistantOpen} onOpenChange={setAssistantOpen}><DialogContent><DialogHeader><DialogTitle className="flex items-center gap-2"><AssistantIcon className="h-6 w-6" />Campaign assistant</DialogTitle></DialogHeader><p className="text-xs text-muted-foreground">Demo assistant · Not connected to Meta AI</p><p>{recommended ? "Explore more Advantage+ creative enhancements" : "No recommendations available"}</p>{recommended && <Button variant="meta" onClick={() => { setAssistantOpen(false); nav({ to: "/recommendations" }); }}>Review recommendations<ChevronRight /></Button>}</DialogContent></Dialog>
    </Frame>
  );
}

