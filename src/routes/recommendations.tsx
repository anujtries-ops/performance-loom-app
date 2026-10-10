import { Button } from "@/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Lightbulb, Info, Settings, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Card, Frame } from "@/components/ads/Shell";
import { actions, useAds, useCurrentAccount, type Campaign } from "@/lib/ads-store";
import { AssistantIcon } from "@/components/ads/AssistantIcon";
import recommendationBanner from "@/assets/recommendations-banner.jpg";

export const Route = createFileRoute("/recommendations")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Opportunities – Ads Manager" },
      { name: "description", content: "Recommendations to improve your campaign performance." },
      { property: "og:title", content: "Opportunities – Ads Manager" },
      { property: "og:description", content: "Recommendations to improve your campaign performance." },
    ],
  }),
  component: Recs,
});

const TIPS: { title: string; body: string; apply: (c: Campaign) => Partial<Campaign> }[] = [
  { title: "Use Advantage+ placements", body: "Expand where your ads are shown to get more results at a lower cost.", apply: () => ({ placements: "advantage" }) },
  { title: "Review your ad creative", body: "Explore your ad preview and consider a clear headline and a relevant image.", apply: () => ({}) },
  { title: "Broaden your audience", body: "Expanding the age range can help the delivery system find more people.", apply: (c) => ({ audience: { ...c.audience, ageMin: 18, ageMax: 65 } }) },
];

function Recs() {
  const acct = useCurrentAccount();
  const [tab, setTab] = useState<"available" | "dismissed">("available");
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const list = useAds((s) => s.campaigns).filter((c) => c.accountId === acct.id && c.recommendations > 0);
  return (
    <Frame>
      <header className="reference-recs-header"><h1 className="min-w-0 text-2xl font-bold">Recommendations</h1><Button variant="ghost" size="icon" aria-label="Recommendation settings" onClick={() => setSetupOpen(value => !value)}><Settings /></Button></header>
      <section className="reference-score-section"><div className="reference-score-ring"><strong>100</strong><span>points</span></div><p className="flex items-center justify-center gap-1 font-semibold">Opportunity score<Info className="h-3.5 w-3.5" /></p></section>
      <div className="reference-recs-tabs" role="tablist" aria-label="Recommendations"><Button variant="plain" role="tab" aria-selected={tab === "available"} onClick={() => setTab("available")}>Available</Button><Button variant="plain" role="tab" aria-selected={tab === "dismissed"} onClick={() => setTab("dismissed")}>Dismissed</Button></div>
      <div className="space-y-3 p-4">
        {(tab === "available" ? !bannerDismissed : bannerDismissed) && <Card className="overflow-hidden"><img src={recommendationBanner} alt="Relaxed woman reclining in a lounge chair" width={1280} height={512} className="reference-recs-banner" /><div className="p-4"><div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2"><h2 className="min-w-0 text-lg font-semibold leading-snug">Optimize your campaigns with automatic adjustments</h2><Button variant="ghost" size="icon" aria-label={bannerDismissed ? "Restore recommendation" : "Dismiss automatic adjustments"} onClick={() => setBannerDismissed(value => !value)}><X /></Button></div><p className="my-3">Save time and stay optimized by automatically applying the most impactful performance recommendations.</p><Button variant="meta" className="w-full" onClick={() => { setSetupOpen(value => !value); setTab("available"); }}>Set up now</Button></div></Card>}
        {setupOpen && <div className="border-b py-2 text-sm text-muted-foreground">Demo recommendations only · Automatic adjustments are not connected to Meta.</div>}
        {tab === "dismissed" && !bannerDismissed && <p className="py-4 text-center text-sm text-muted-foreground">No dismissed recommendations.</p>}
        {tab === "available" && setupOpen && <>
        {list.length === 0 && <Card className="p-6 text-center text-muted-foreground">You're all caught up. No recommendations right now.</Card>}
        {list.flatMap((c) => TIPS.slice(0, c.recommendations).map((t, i) => (
          <Card key={c.id + i} className="p-4">
            <div className="flex gap-3"><Lightbulb className="h-5 w-5 shrink-0 text-primary" /><div className="min-w-0">
              <p className="font-medium">{t.title}</p><p className="text-sm text-muted-foreground">{t.body}</p>
              <Link to="/campaign/$id" params={{ id: c.id }} className="mt-1 block text-xs text-primary">{c.name}</Link>
            </div></div>
            <div className="mt-3 flex gap-2">
              <Button variant="plain" onClick={() => { actions.updateCampaign(c.id, t.apply(c)); actions.dismissRecommendation(c.id); toast.success("Recommendation applied"); }} className="flex-1 rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground">Apply</Button>
              <Button variant="plain" onClick={() => { actions.dismissRecommendation(c.id); toast("Dismissed"); }} className="flex-1 rounded-md bg-secondary py-2 text-sm font-medium">Dismiss</Button>
            </div>
          </Card>
        )))}
        </>}
      </div>
      <Button variant="outline" size="icon" className="meta-assistant-launcher" aria-label="Open assistant" onClick={() => { setSetupOpen(value => !value); setTab("available"); }}><AssistantIcon /></Button>
    </Frame>
  );
}
