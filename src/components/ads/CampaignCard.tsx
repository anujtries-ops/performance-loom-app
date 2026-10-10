import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Lightbulb, MoreVertical, BadgePlus } from "lucide-react";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { actions, money, num, OBJECTIVES, STATUS_LABEL, type Campaign } from "@/lib/ads-store";
import { Card, ObjectiveIcon } from "./Shell";
import { Button } from "@/components/ui/button";
import { campaignResult } from "@/lib/ads-demo";

export const statusColor = (s: Campaign["status"]) =>
  s === "active" ? "text-success" : s === "in_review" ? "text-warning" : "text-muted-foreground";
export const statusDot = (s: Campaign["status"]) =>
  s === "active" ? "bg-success" : s === "in_review" ? "bg-warning" : "bg-muted-foreground";

export function CampaignCard({ c, currency, factor }: { c: Campaign; currency: "INR" | "USD"; factor: number }) {
  const nav = useNavigate();
  const results = Math.round(c.results * factor);
  const spent = c.spent * factor;
  const cpr = results ? spent / results : 0;
  const resultLabel = campaignResult(c, OBJECTIVES[c.objective].result);
  return (
    <Card className="min-w-0 p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-1 text-xs font-semibold"><BadgePlus className="h-3.5 w-3.5" />New</div>
      <div className="flex items-start gap-3">
        <div className="relative">
          {c.ad.image ? <img src={c.ad.image} alt={`${c.name} creative`} className="campaign-thumb" /> : <ObjectiveIcon k={c.objective} />}
          <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${statusDot(c.status)}`} />
        </div>
        <Link to="/campaign/$id" params={{ id: c.id }} className="min-w-0 flex-1">
          <p className="truncate text-lg font-medium">{c.name}</p>
          <p className="text-sm"><span className={statusColor(c.status)}>{STATUS_LABEL[c.status]}</span><span className="text-muted-foreground"> • {OBJECTIVES[c.objective].label}</span></p>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Campaign options" className="h-9 w-8 shrink-0 rounded-full p-0"><MoreVertical className="h-5 w-5" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => nav({ to: "/campaign/$id", params: { id: c.id } })}>View insights</DropdownMenuItem>
            <DropdownMenuItem onClick={() => nav({ to: "/create/$objective", params: { objective: c.objective }, search: { edit: c.id } })}>Edit</DropdownMenuItem>
            {c.status !== "completed" && (
              <DropdownMenuItem onClick={() => { actions.updateCampaign(c.id, { status: c.status === "paused" ? "active" : "paused" }); toast.success(c.status === "paused" ? "Campaign turned on" : "Campaign turned off"); }}>
                {c.status === "paused" ? "Turn on" : "Turn off"}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => { actions.duplicateCampaign(c.id); toast.success("Campaign duplicated"); }}>Duplicate</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => { if (confirm(`Delete "${c.name}"?`)) { actions.deleteCampaign(c.id); toast("Campaign deleted"); } }}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="campaign-stat-grid mt-3 divide-x text-[13px] sm:text-sm">
        <div className="pr-2"><p className="metric-value">{num(results)}</p><p className="text-muted-foreground leading-tight">{resultLabel}</p></div>
        <div className="px-2"><p className="metric-value">{money(cpr, currency)}</p><p className="text-muted-foreground leading-tight">Cost per {resultLabel.replace(/s$/, "")}</p></div>
        <div className="pl-2"><p className="metric-value">{money(spent, currency)}</p><p className="text-muted-foreground">Spent</p></div>
      </div>
      {c.recommendations > 0 && (
        <Link to="/recommendations" className="mt-3 flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground">
          <Lightbulb className="h-4 w-4" /><span className="flex-1">{c.recommendations} recommendation{c.recommendations > 1 ? "s" : ""}</span><ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </Card>
  );
}
