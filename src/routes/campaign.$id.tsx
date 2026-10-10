import { Button } from "@/components/ui/button";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Copy, Pencil, Trash2, ArrowLeft, RefreshCw, Globe, CalendarDays, ChevronDown, ChevronUp, CreditCard } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AdPreview } from "@/components/ads/AdPreview";
import { statusColor } from "@/components/ads/CampaignCard";
import { Card, Frame, ObjectiveIcon, PageHeader } from "@/components/ads/Shell";
import { actions, money, num, OBJECTIVES, STATUS_LABEL, useAds, useStoreReady } from "@/lib/ads-store";
import { campaignResult, rangeMetrics } from "@/lib/ads-demo";

export const Route = createFileRoute("/campaign/$id")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Campaign insights – Ads Manager" },
      { name: "description", content: "Results, spend, budget, audience and ad preview for this campaign." },
      { property: "og:title", content: "Campaign insights – Ads Manager" },
      { property: "og:description", content: "Results, spend, budget, audience and ad preview for this campaign." },
    ],
  }),
  component: Detail,
});

function Detail() {
  const { id } = Route.useParams();
  const c = useAds((s) => s.campaigns.find((x) => x.id === id));
  const acct = useAds((s) => s.accounts.find((a) => a.id === c?.accountId));
  const nav = useNavigate();
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [budget, setBudget] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [setupExpanded, setSetupExpanded] = useState(false);
  const [range, setRange] = useState("Maximum");
  const ready = useStoreReady();

  if (!ready && !c) return <Frame><PageHeader title="Campaign" /></Frame>;

  if (!c || !acct) return (
    <Frame><PageHeader title="Campaign" /><p className="p-8 text-center text-muted-foreground">This campaign no longer exists. <Link to="/" className="text-primary">Go back</Link></p></Frame>
  );
  const cur = acct.currency;
  const o = OBJECTIVES[c.objective];
  const resultLabel = campaignResult(c, o.result);
  const metrics = rangeMetrics(c, range);
  const stats: [string, string][] = [
    [resultLabel, num(metrics.results)],
    ["Cost per result", money(metrics.results ? metrics.spent / metrics.results : 0, cur)],
    ["Amount spent", money(metrics.spent, cur)],
    ["Reach", num(metrics.reach)],
    ["Impressions", num(metrics.impressions)],
    ["Link clicks", num(metrics.clicks)],
    ["CTR", `${metrics.impressions ? ((metrics.clicks / metrics.impressions) * 100).toFixed(2) : "0.00"}%`],
    ["CPM", money(metrics.impressions ? (metrics.spent / metrics.impressions) * 1000 : 0, cur)],
    ["Frequency", metrics.reach ? (metrics.impressions / metrics.reach).toFixed(2) : "0.00"],
  ];
  const pct = c.budgetType === "lifetime" ? Math.min(100, (c.spent / c.budget) * 100) : null;

  return (
    <Frame>
      <div className="campaign-detail-header flex items-center gap-3 px-5 pt-7">
        <Button variant="ghost" size="icon" aria-label="Back to campaigns" onClick={() => nav({to:"/"})}><ArrowLeft /></Button>
        <div className="relative shrink-0">{c.ad.image ? <img src={c.ad.image} alt={`${c.name} creative`} className="campaign-thumb" /> : <ObjectiveIcon k={c.objective} />}<span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[3px] border-background ${c.status==="active"?"bg-success":"bg-muted-foreground"}`} /></div>
        <div className="min-w-0 flex-1"><h1 className="truncate text-xl font-medium">{c.name}</h1><p className="text-sm"><span className={statusColor(c.status)}>{STATUS_LABEL[c.status]}</span><span className="text-muted-foreground"> · {o.label}</span></p></div>
        <Switch aria-label="Campaign active" disabled={c.status==="in_review" || c.status==="completed"} checked={c.status==="active"} onCheckedChange={v => actions.updateCampaign(c.id,{status:v?"active":"paused"})} />
      </div>
      <div className="flex gap-3 px-6 py-7"><Button variant="metaOutline" className="h-12 flex-1 text-base" onClick={() => nav({to:"/create/$objective",params:{objective:c.objective},search:{edit:c.id}})}><Pencil />Edit</Button><Button variant="metaOutline" className="h-12 flex-1 text-base" onClick={() => {const id=actions.duplicateCampaign(c.id);if(id)nav({to:"/campaign/$id",params:{id}});}}><Copy />Duplicate</Button></div>
      <div className="campaign-detail-body space-y-4 px-6 pb-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center pt-3"><h2 className="text-2xl font-bold">Results</h2><Button variant="link" onClick={() => setExpanded(true)} className="px-0 text-sm sm:text-base">View performance</Button></div>
        <div className="flex items-center justify-between gap-2"><p className="demo-results-note">Demo results · Simulated, not live</p><Button variant="ghost" size="icon" title="Refresh demo results" aria-label="Refresh demo results" onClick={() => actions.randomizeResults(c.id)}><RefreshCw /></Button></div>
        <Card className="meta-results">
          <div className="meta-range"><CalendarDays className="h-5 w-5" />{["30 days","Maximum","Today"].map(label=><Button key={label} variant="plain" aria-pressed={range===label} onClick={()=>setRange(label)}>{label}</Button>)}</div>
          <div className="meta-metrics"><div><strong>{num(metrics.results)}</strong><span>{resultLabel}</span></div><div><strong>{metrics.results ? money(metrics.spent/metrics.results,cur) : money(0,cur)}</strong><span>Cost per {resultLabel.replace(/s$/, "")}</span></div><div><strong>{money(metrics.spent,cur)}</strong><span>Amount spent</span></div></div>
          <div className="flex justify-end px-5"><Button variant="link" onClick={()=>{setBudget(String(c.budget));setBudgetOpen(true);}}>{money(c.budget,cur)} {c.budgetType} budget<Pencil className="h-3.5 w-3.5" /></Button></div>
          <div className="mt-6 grid grid-cols-2 divide-x px-5 pb-5"><div className="pr-4"><p className="text-3xl font-bold">{num(metrics.reach)}</p><p className="mt-1 text-sm text-muted-foreground">Reach</p></div><div className="pl-4"><p className="text-3xl font-bold">{num(metrics.impressions)}</p><p className="mt-1 text-sm text-muted-foreground">Impressions</p></div></div>
          {expanded && <div className="grid grid-cols-2 gap-5 px-5 pb-5">{stats.slice(5).map(([label,value])=><div key={label} className="border-t pt-4"><p className="text-2xl font-bold">{value}</p><p className="mt-1 text-sm text-muted-foreground">{label}</p></div>)}</div>}
          <Button variant="plain" className="h-14 w-full border-t text-base" onClick={()=>setExpanded(v=>!v)}>{expanded?<ChevronUp />:<ChevronDown />}{expanded?"Show less":"Show more"}</Button>
        </Card>
        <div className="flex items-center justify-between pt-6"><h2 className="text-2xl font-bold">Setup</h2><Button variant="link" className="text-base" onClick={()=>nav({to:"/create/$objective",params:{objective:c.objective},search:{edit:c.id}})}>Edit setup</Button></div>
        <Card className="px-5">
          {c.conversionLocation === "website" && <div className="flex items-start gap-4 border-b py-5"><Globe className="mt-1 h-6 w-6 shrink-0" /><div className="min-w-0"><h3 className="text-lg font-medium">Website</h3><p className="mt-1 text-sm text-muted-foreground">Objective: {o.label} · Event: {c.conversionEvent ?? "—"}</p></div></div>}
          <div className="flex items-center gap-4 py-5"><CreditCard className="h-6 w-6" /><div className="flex-1"><h3 className="text-lg font-medium">Budget</h3><p className="mt-1 text-sm text-muted-foreground">{money(c.budget,cur)} {cur} per {c.budgetType==="daily"?"day":"campaign"}. Highest volume</p></div><Button variant="ghost" size="icon" aria-label="Edit budget" onClick={()=>{setBudget(String(c.budget));setBudgetOpen(true);}}><Pencil /></Button></div>
          <div className="flex items-center gap-4 border-t py-5"><CalendarDays className="h-6 w-6" /><div className="flex-1"><h3 className="text-lg font-medium">Schedule</h3><p className="mt-1 text-sm text-muted-foreground">{c.startDate} – {c.endDate??"ongoing"}</p></div><Button variant="ghost" size="icon" aria-label="Edit schedule" onClick={()=>nav({to:"/create/$objective",params:{objective:c.objective},search:{edit:c.id}})}><Pencil /></Button></div>
          {setupExpanded && <div className="border-t py-5 text-sm"><h3 className="font-semibold">Audience</h3><p className="mt-1 text-muted-foreground">{c.audience.location} · Age {c.audience.ageMin}–{c.audience.ageMax} · {c.audience.gender}</p><h3 className="mt-4 font-semibold">Placements</h3><p className="mt-1 text-muted-foreground">{c.placements==="advantage"?"Advantage+ placements":c.platforms.join(", ")}</p></div>}
          <Button variant="plain" className="h-14 w-full border-t text-base" onClick={()=>setSetupExpanded(v=>!v)}>{setupExpanded?<ChevronUp />:<ChevronDown />}{setupExpanded?"Show less":"Show more"}</Button>
        </Card>
        <AdPreview name={acct.name} ad={c.ad} />

        <div className="flex gap-2">
          <Button variant="plain" onClick={() => { const nid = actions.duplicateCampaign(c.id); toast.success("Campaign duplicated"); if (nid) nav({ to: "/campaign/$id", params: { id: nid } }); }} className="flex flex-1 items-center justify-center gap-2 rounded-md bg-secondary py-2.5 font-medium"><Copy className="h-4 w-4" />Duplicate</Button>
          <Button variant="plain" onClick={() => { if (confirm(`Delete "${c.name}"?`)) { actions.deleteCampaign(c.id); toast("Campaign deleted"); nav({ to: "/" }); } }} className="flex flex-1 items-center justify-center gap-2 rounded-md bg-secondary py-2.5 font-medium text-destructive"><Trash2 className="h-4 w-4" />Delete</Button>
        </div>
      </div>

      <Dialog open={budgetOpen} onOpenChange={setBudgetOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit {c.budgetType} budget</DialogTitle></DialogHeader>
          <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className="rounded-md border px-3 py-2" />
          <Button variant="plain" disabled={!(Number(budget) > 0)} onClick={() => { actions.updateCampaign(c.id, { budget: Number(budget) }); setBudgetOpen(false); toast.success("Budget updated"); }} className="rounded-md bg-primary py-2 font-medium text-primary-foreground disabled:opacity-50">Save</Button>
        </DialogContent>
      </Dialog>
    </Frame>
  );
}
