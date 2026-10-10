export const DEMO_NOTIFICATIONS = [
  { id: "review", title: "Campaign review complete", body: "Your Engagement campaign is active in this demo.", time: "5 min ago", kind: "campaign" },
  { id: "subscribe", title: "New website subscriptions", body: "Sample Subscribe events are available in your results.", time: "22 min ago", kind: "campaign" },
  { id: "creative", title: "Creative recommendation", body: "Review Advantage+ creative enhancements for your ad.", time: "1 hr ago", kind: "recommendation" },
  { id: "billing", title: "Check your payment settings", body: "Review your demo balance and payment information.", time: "2 hr ago", kind: "billing" },
] as const;

export function generateDemoMetrics(random: () => number = Math.random) {
  const results = 12 + Math.floor(random() * 189);
  const clicks = results + 100 + Math.floor(random() * 1000);
  const reach = clicks + 1500 + Math.floor(random() * 12000);
  const impressions = reach + 300 + Math.floor(random() * 6000);
  const spent = Math.round((results * (4 + random() * 16)) * 100) / 100;
  return { results, clicks, reach, impressions, spent };
}

export function campaignResult(c: { objective: string; conversionLocation?: string | undefined; conversionEvent?: string | undefined }, fallback: string) {
  return c.conversionLocation === "website" && c.conversionEvent === "Subscribe" ? "Website subscribe" : fallback;
}

export function rangeMetrics(c: { results: number; clicks: number; reach: number; impressions: number; spent: number }, range: string) {
  const factor = range === "Today" ? 0.05 : range === "30 days" ? 0.85 : 1;
  return { results: Math.round(c.results * factor), clicks: Math.round(c.clicks * factor), reach: Math.round(c.reach * factor), impressions: Math.round(c.impressions * factor), spent: Math.round(c.spent * factor * 100) / 100 };
}