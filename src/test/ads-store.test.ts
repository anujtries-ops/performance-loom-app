import { describe, expect, it, afterEach } from "vitest";
import { actions, useAds } from "@/lib/ads-store";
import { renderHook, act } from "@testing-library/react";
import { campaignResult, DEMO_NOTIFICATIONS, generateDemoMetrics, rangeMetrics } from "@/lib/ads-demo";

afterEach(() => { act(() => actions.reset()); });

describe("Campaign image previews", () => {
  it("preserves the uploaded creative when creating a campaign", () => {
    const { result } = renderHook(() => useAds(s => s));
    const source = result.current.campaigns[0];
    if (!source) throw new Error("Missing demo campaign");
    const image = "data:image/png;base64,uploaded_photo";
    let id = "";
    act(() => { id = actions.createCampaign({ ...source, ad: { ...source.ad, image } }); });
    expect(result.current.campaigns.find(c => c.id === id)?.ad.image).toBe(image);
  });

  it("preserves the same photo when duplicating a campaign", () => {
    const { result } = renderHook(() => useAds(s => s));
    const source = result.current.campaigns[0];
    if (!source) throw new Error("Missing demo campaign");
    const image = "data:image/png;base64,uploaded_duplicate_photo";
    let id: string | undefined;
    act(() => { actions.updateCampaign(source.id, { ad: { ...source.ad, image } }); id = actions.duplicateCampaign(source.id); });
    expect(result.current.campaigns.find(c => c.id === id)?.ad.image).toBe(image);
  });
});

describe("Requested demo campaign rules", () => {
  it("has exactly four distinct sample notifications", () => {
    expect(DEMO_NOTIFICATIONS).toHaveLength(4);
    expect(new Set(DEMO_NOTIFICATIONS.map(n => n.id)).size).toBe(4);
  });
  it("uses Engagement with Website and Subscribe on the main campaign", () => {
    const { result } = renderHook(() => useAds(s => s.campaigns[0]));
    expect(result.current?.objective).toBe("engagement");
    expect(result.current?.conversionLocation).toBe("website");
    expect(result.current?.conversionEvent).toBe("Subscribe");
    if (!result.current) throw new Error("Missing campaign");
    expect(campaignResult(result.current, "Messaging conversations started")).toBe("Website subscribe");
  });
  it("generates nonzero demo numbers that change with the random input", () => {
    const low = generateDemoMetrics(() => 0);
    const high = generateDemoMetrics(() => 0.99);
    expect(low.results).toBe(12);
    expect(high.results).toBe(199);
    expect(high.impressions).toBeGreaterThan(high.reach);
    expect(high.reach).toBeGreaterThan(high.clicks);
    expect(high.clicks).toBeGreaterThan(high.results);
    expect(high.spent).toBeGreaterThan(low.spent);
  });
  it("marks regenerated metrics as simulated", () => {
    const { result } = renderHook(() => useAds(s => s.campaigns[0]));
    if (!result.current) throw new Error("Missing campaign");
    const id = result.current.id;
    act(() => actions.randomizeResults(id));
    expect(result.current?.demoMetrics).toBe(true);
    expect(result.current?.results).toBeGreaterThanOrEqual(12);
  });
  it("changes numbers for Today and 30 days without mutating Maximum", () => {
    const values = { results: 100, clicks: 200, reach: 1000, impressions: 2000, spent: 300 };
    expect(rangeMetrics(values, "Today").results).toBe(5);
    expect(rangeMetrics(values, "30 days").spent).toBe(255);
    expect(rangeMetrics(values, "Maximum")).toEqual(values);
  });
});