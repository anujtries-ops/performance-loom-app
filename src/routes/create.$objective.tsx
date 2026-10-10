import { Button } from "@/components/ui/button";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Pencil, CreditCard, CalendarDays, Users, Target, PanelsTopLeft, BriefcaseBusiness, LayoutGrid, ChevronDown, ChevronUp, CircleAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AdPreview } from "@/components/ads/AdPreview";
import { Card, Frame, ObjectiveIcon, PageHeader } from "@/components/ads/Shell";
import { actions, CTAS, money, OBJECTIVES, useAds, useCurrentAccount, type Campaign, type ObjectiveKey } from "@/lib/ads-store";
import { OrderConfirmation } from "@/components/ads/OrderConfirmation";

export const Route = createFileRoute("/create/$objective")({
  validateSearch: (s: Record<string, unknown>): { edit?: string } => (typeof s["edit"] === "string" ? { edit: s["edit"] as string } : {}),
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Set up campaign – Ads Manager" },
      { name: "description", content: "Set budget, audience, placements and ad creative, then publish your campaign." },
      { property: "og:title", content: "Set up campaign – Ads Manager" },
      { property: "og:description", content: "Set budget, audience, placements and ad creative." },
    ],
  }),
  component: Builder,
});

const STEPS = ["Campaign", "Budget", "Audience", "Placements", "Ad", "Review"];
const PLATFORMS = ["Facebook", "Instagram", "Messenger", "Audience Network", "WhatsApp"];
const today = new Date().toISOString().slice(0, 10);

function Builder() {
  const { objective } = Route.useParams();
  const { edit } = Route.useSearch();
  const obj = (objective in OBJECTIVES ? objective : "traffic") as ObjectiveKey;
  const acct = useCurrentAccount();
  const existing = useAds((s) => s.campaigns.find((c) => c.id === edit));
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [campaignExpanded, setCampaignExpanded] = useState(false);
  const [setExpanded, setSetExpanded] = useState(true);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [publishedId, setPublishedId] = useState<string | null>(null);
  type Form = Omit<Campaign, "id" | "results" | "spent" | "impressions" | "reach" | "clicks" | "createdAt" | "recommendations" | "status">;
  const [f, setF] = useState<Form>(() => existing ?? {
    accountId: acct.id,
    name: `New ${OBJECTIVES[obj].label} Campaign`,
    objective: obj,
    ...(obj === "engagement" ? { conversionLocation: "website" as const, conversionEvent: "Subscribe" as const } : {}),
    budgetType: "daily",
    budget: acct.currency === "INR" ? 200 : 5,
    startDate: today,
    endDate: null as string | null,
    audience: { location: "India", ageMin: 18, ageMax: 65, gender: "all", interests: "" },
    placements: "advantage",
    platforms: ["Facebook", "Instagram", "Messenger"],
    ad: { headline: "", primaryText: "", cta: obj === "engagement" ? "Subscribe" : "Learn more", url: "https://", image: "" },
  });
  const up = (p: Partial<Campaign>) => setF((x) => ({ ...x, ...p }));
  const aud = (p: Partial<Campaign["audience"]>) => setF((x) => ({ ...x, audience: { ...x.audience, ...p } }));
  const ad = (p: Partial<Campaign["ad"]>) => setF((x) => ({ ...x, ad: { ...x.ad, ...p } }));

  const minBudget = acct.currency === "INR" ? 85 : 1;
  const errors = [
    !f.name.trim() && "Campaign name is required",
    f.budget < minBudget && `Minimum daily budget is ${money(minBudget, acct.currency)}`,
    f.endDate && f.endDate < f.startDate && "End date must be after start date",
    f.audience.ageMin > f.audience.ageMax && "Minimum age must be lower than maximum",
    f.placements === "manual" && f.platforms.length === 0 && "Select at least one platform",
    !f.ad.primaryText.trim() && "Primary text is required",
    !f.ad.headline.trim() && "Headline is required",
    !/^https?:\/\/.+\..+/.test(f.ad.url) && "Enter a valid website URL",
  ].filter(Boolean) as string[];
  const reach = Math.round(f.budget * (acct.currency === "INR" ? 12 : 900) * (f.audience.gender === "all" ? 1 : 0.55));

  const publish = () => {
    if (errors.length) { toast.error(errors[0]); return; }
    if (existing) {
      actions.updateCampaign(existing.id, f);
      toast.success("Changes published");
      setPublishedId(existing.id);
    } else {
      const id = actions.createCampaign({ ...f, accountId: acct.id });
      toast.success("Campaign published · In review", { description: acct.paymentMethods.length ? "Your ad will start running after review." : "Add a payment method so your ads can run." });
      setPublishedId(id);
    }
  };

  const input = "mt-1 w-full rounded-md border bg-card px-3 py-2 outline-none focus:border-primary";
  const label = "block text-sm font-medium";

  return (
    <Frame nav={false}>
      <PageHeader title={step === 5 ? "Review new campaign" : existing ? "Edit campaign" : OBJECTIVES[obj].label} close={step !== 5} />
      {step !== 5 && <div className="flex gap-1 overflow-x-auto bg-card px-3 pb-3">
        {STEPS.map((s, i) => (
          <Button variant="plain" key={s} onClick={() => setStep(i)} className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${i === step ? "bg-primary text-primary-foreground" : i < step ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
            {i < step && <Check className="h-3 w-3" />}{s}
          </Button>
        ))}
      </div>}

      <div className={step === 5 ? "reference-review" : "space-y-4 p-4 pb-24"}>
        {step === 0 && (
          <Card className="space-y-4 p-4">
            <div className="flex items-center gap-3"><ObjectiveIcon k={obj} /><div><p className="font-medium">{OBJECTIVES[obj].label}</p><p className="text-xs text-muted-foreground">{OBJECTIVES[obj].desc}</p></div></div>
            <label className={label}>Campaign name<input className={input} value={f.name} onChange={(e) => up({ name: e.target.value })} /></label>
            {obj === "engagement" && <>
              <label className={label}>Conversion location<select className={input} value={f.conversionLocation ?? "messages"} onChange={e => up({ conversionLocation: e.target.value === "website" ? "website" : "messages", conversionEvent: e.target.value === "website" ? "Subscribe" : undefined })}><option value="website">Website</option><option value="messages">Messaging apps</option></select></label>
              {f.conversionLocation === "website" && <label className={label}>Conversion event<select className={input} value={f.conversionEvent ?? "Subscribe"} onChange={() => up({ conversionEvent: "Subscribe" })}><option value="Subscribe">Subscribe</option></select></label>}
            </>}
            <p className="text-sm text-muted-foreground">Ad account: <b className="text-foreground">{acct.name}</b> ({acct.id})</p>
          </Card>
        )}
        {step === 1 && (
          <Card className="space-y-4 p-4">
            <div className="flex gap-2">{(["daily", "lifetime"] as const).map((t) => <Button variant="plain" key={t} onClick={() => up({ budgetType: t })} className={`flex-1 rounded-md border py-2 text-sm font-medium capitalize ${f.budgetType === t ? "border-primary bg-accent text-accent-foreground" : ""}`}>{t} budget</Button>)}</div>
            <label className={label}>Budget ({acct.currency})<input type="number" className={input} value={f.budget} onChange={(e) => up({ budget: Number(e.target.value) })} /></label>
            <label className={label}>Start date<input type="date" className={input} value={f.startDate} onChange={(e) => up({ startDate: e.target.value })} /></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.endDate !== null} onChange={(e) => up({ endDate: e.target.checked ? f.startDate : null })} />Set an end date</label>
            {f.endDate !== null && <label className={label}>End date<input type="date" className={input} value={f.endDate} onChange={(e) => up({ endDate: e.target.value })} /></label>}
          </Card>
        )}
        {step === 2 && (
          <Card className="space-y-4 p-4">
            <label className={label}>Locations<input className={input} value={f.audience.location} onChange={(e) => aud({ location: e.target.value })} /></label>
            <div className="flex gap-3">
              <label className={`${label} flex-1`}>Min age<input type="number" min={13} max={65} className={input} value={f.audience.ageMin} onChange={(e) => aud({ ageMin: Number(e.target.value) })} /></label>
              <label className={`${label} flex-1`}>Max age<input type="number" min={13} max={65} className={input} value={f.audience.ageMax} onChange={(e) => aud({ ageMax: Number(e.target.value) })} /></label>
            </div>
            <div><p className={label}>Gender</p><div className="mt-1 flex gap-2">{(["all", "men", "women"] as const).map((g) => <Button variant="plain" key={g} onClick={() => aud({ gender: g })} className={`flex-1 rounded-md border py-2 text-sm capitalize ${f.audience.gender === g ? "border-primary bg-accent text-accent-foreground" : ""}`}>{g}</Button>)}</div></div>
            <label className={label}>Detailed targeting (interests)<input className={input} placeholder="e.g. Fashion, Travel" value={f.audience.interests} onChange={(e) => aud({ interests: e.target.value })} /></label>
            <div className="rounded-md bg-muted p-3 text-sm">Estimated daily reach: <b>{(reach * 0.7).toFixed(0)} – {reach}</b> people</div>
          </Card>
        )}
        {step === 3 && (
          <Card className="space-y-3 p-4">
            {(["advantage", "manual"] as const).map((p) => (
              <Button variant="plain" key={p} onClick={() => up({ placements: p })} className={`w-full rounded-md border p-3 text-left ${f.placements === p ? "border-primary bg-accent" : ""}`}>
                <p className="font-medium">{p === "advantage" ? "Advantage+ placements (Recommended)" : "Manual placements"}</p>
                <p className="text-sm text-muted-foreground">{p === "advantage" ? "Let us place your ads where they're likely to perform best." : "Manually choose where your ads appear."}</p>
              </Button>
            ))}
            {f.placements === "manual" && PLATFORMS.map((p) => (
              <label key={p} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.platforms.includes(p)} onChange={(e) => up({ platforms: e.target.checked ? [...f.platforms, p] : f.platforms.filter((x) => x !== p) })} />{p}</label>
            ))}
          </Card>
        )}
        {step === 4 && (
          <>
            <Card className="space-y-4 p-4">
              <label className={label}>Primary text<textarea rows={3} className={input} value={f.ad.primaryText} onChange={(e) => ad({ primaryText: e.target.value })} /></label>
              <label className={label}>Headline<input className={input} value={f.ad.headline} onChange={(e) => ad({ headline: e.target.value })} /></label>
              <label className={label}>Website URL<input className={input} value={f.ad.url} onChange={(e) => ad({ url: e.target.value })} /></label>
              <label className={label}>Call to action<select className={input} value={f.ad.cta} onChange={(e) => ad({ cta: e.target.value })}>{CTAS.map((c) => <option key={c}>{c}</option>)}</select></label>
              <label className={label}>Image
                <input type="file" accept="image/*" className={input} onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; const r = new FileReader(); r.onload = () => ad({ image: String(r.result) }); r.readAsDataURL(file); }} />
              </label>
            </Card>
            <AdPreview name={acct.name} ad={f.ad} />
          </>
        )}
        {step === 5 && (
          <>
          <section className="reference-review-preview"><div className="grid grid-cols-[minmax(0,1fr)_auto] items-center"><h2 className="text-xl font-semibold">Ad Preview</h2><Button variant="link" onClick={() => setPreviewExpanded(value => !value)}>{previewExpanded ? "See less" : "See all"}</Button></div>{previewExpanded ? <AdPreview name={acct.name} ad={f.ad} /> : <div className="reference-preview-strip">{["Facebook", "Instagram"].map(platform => <Button variant="plain" key={platform} aria-label={`Preview on ${platform}`} onClick={() => setPreviewExpanded(true)} className="reference-preview-phone">{f.ad.image ? <img src={f.ad.image} alt={`${platform} ad preview`} /> : <span><ObjectiveIcon k={obj} /><span className="mt-3 text-xs">{platform}</span></span>}</Button>)}</div>}</section>
          <section className="reference-review-band"><h2><BriefcaseBusiness />{f.name}</h2><div className="reference-review-row"><CreditCard /><div><h3>Budget</h3><p>{money(f.budget, acct.currency)} {acct.currency} {f.budgetType === "daily" ? "per day" : "lifetime"}, Highest volume</p></div><Button variant="ghost" size="icon" aria-label="Edit budget" onClick={() => setStep(1)}><Pencil /></Button></div><div className="reference-review-row"><CircleAlert /><div><h3>Campaign details</h3><p>Auction · {OBJECTIVES[obj].label}</p></div><span /></div>{campaignExpanded && <div className="reference-review-row"><CircleAlert /><div><h3>Special ad category</h3><p>None</p></div><Button variant="ghost" size="icon" aria-label="Edit campaign details" onClick={() => setStep(0)}><Pencil /></Button></div>}<Button variant="plain" className="reference-review-expand" onClick={() => setCampaignExpanded(value => !value)}>{campaignExpanded ? <ChevronUp /> : <ChevronDown />}{campaignExpanded ? "Show less" : "Show more"}</Button></section>
          <section className="reference-review-band"><h2><LayoutGrid />New {OBJECTIVES[obj].label} Ad Set</h2>{setExpanded && <>{[{ icon: CalendarDays, title: "Schedule", value: `${f.startDate} – ${f.endDate ?? "ongoing"}`, edit: 1 }, { icon: Users, title: "Audience", value: `${f.audience.location}, ${f.audience.ageMin}–${f.audience.ageMax}, ${f.audience.gender}`, edit: 2 }, { icon: Target, title: "Conversion", value: f.conversionLocation === "website" ? `Website · ${f.conversionEvent ?? "Subscribe"}` : "Message destination", edit: 0 }, { icon: PanelsTopLeft, title: "Placements", value: f.placements === "advantage" ? "Advantage+ placements" : f.platforms.join(", "), edit: 3 }].map(({ icon: Icon, title, value, edit: editStep }) => <div className="reference-review-row" key={title}><Icon /><div><h3>{title}</h3><p>{value}</p></div><Button variant="ghost" size="icon" aria-label={`Edit ${title.toLowerCase()}`} onClick={() => setStep(editStep)}><Pencil /></Button></div>)}</>}<Button variant="plain" className="reference-review-expand" onClick={() => setSetExpanded(value => !value)}>{setExpanded ? <ChevronUp /> : <ChevronDown />}{setExpanded ? "Show less" : "Show more"}</Button></section>
          {errors.length > 0 && <ul className="space-y-1 p-4 text-sm text-destructive">{errors.map(e => <li key={e}>• {e}</li>)}</ul>}
          </>
        )}
      </div>

      <div className="reference-builder-footer">
        {step > 0 && step !== 5 && <Button variant="plain" onClick={() => setStep(step - 1)} className="flex-1 rounded-md bg-secondary py-2.5 font-medium">Back</Button>}
        {step < STEPS.length - 1
           ? <Button variant="meta" onClick={() => setStep(step + 1)} className="flex-1">Next</Button>
           : <Button variant="publish" onClick={publish} className="flex-1">{existing ? "Publish changes" : "Publish"}</Button>}
      </div>
      <OrderConfirmation open={publishedId !== null} onClose={() => { if (publishedId) nav({ to: "/campaign/$id", params: { id: publishedId } }); }} onDuplicate={() => { if (!publishedId) return; const id = actions.duplicateCampaign(publishedId); if (id) nav({ to: "/campaign/$id", params: { id } }); }} />
    </Frame>
  );
}
