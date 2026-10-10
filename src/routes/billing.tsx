import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronRight, CreditCard, Trash2, CircleCheck, X, ArrowLeft, Smartphone, Landmark } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Frame, PageHeader } from "@/components/ads/Shell";
import { actions, money, useCurrentAccount } from "@/lib/ads-store";

export const Route = createFileRoute("/billing")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Billing & payments – Ads Manager" },
      { name: "description", content: "Add funds, payment methods, spending limits and see payment activity." },
      { property: "og:title", content: "Billing & payments – Ads Manager" },
      { property: "og:description", content: "Add funds, payment methods, spending limits and see payment activity." },
    ],
  }),
  component: Billing,
});

type Modal = null | "funds" | "method" | "limit" | "tax" | "activity" | "business";

function Billing() {
  const a = useCurrentAccount();
  const [m, setM] = useState<Modal>(null);
  const [amount, setAmount] = useState("");
  const [via, setVia] = useState("UPI");
  const [method, setMethod] = useState({ type: "Card", value: "" });
  const [gst, setGst] = useState("");
  const [fundStep, setFundStep] = useState<"amount" | "success" | null>(null);
  const [added, setAdded] = useState(0);
  const close = () => { setM(null); setAmount(""); };
  const section = "border-b py-4";
  const softBtn = "mt-3 w-full rounded-md bg-accent py-2.5 font-medium text-accent-foreground";

  if (fundStep) return <Frame nav={false}>
    <div className="funds-page">
      <header className="flex h-16 items-center gap-3 border-b px-4">
        <Button variant="ghost" size="icon" aria-label="Back to billing" onClick={() => setFundStep(null)}><ArrowLeft className="h-6 w-6" /></Button>
        <h1 className="flex-1 text-center text-lg font-semibold">Add payment information</h1>
        <Button variant="ghost" size="icon" aria-label="Close payment" onClick={() => setFundStep(null)}><X className="h-6 w-6" /></Button>
      </header>
      {fundStep === "success" ? <div className="funds-success"><CircleCheck /><h2 className="text-xl font-bold">{money(added, a.currency)} successfully added</h2><p className="mt-1 text-lg">You now have {money(a.funds, a.currency)} in available funds.</p><p className="mt-5 text-xs text-muted-foreground">Demo balance · No payment was charged</p></div> : <div className="funds-body">
        <h2 className="text-2xl font-bold">Add funds</h2><p className="mt-2 text-sm text-muted-foreground">Available funds: {money(a.funds, a.currency)}</p>
        <label className="mt-8 block font-semibold">Amount ({a.currency})<input aria-label="Amount" type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} className="mt-2 h-14 w-full rounded-md border bg-card px-4 text-2xl outline-none focus:border-primary" /></label>
        <div className="mt-3 flex gap-2">{[1000,3000,5000].map(v => <Button key={v} variant="metaOutline" className={`h-11 flex-1 ${amount===String(v)?"border-primary bg-accent text-accent-foreground":""}`} onClick={() => setAmount(String(v))}>{money(v,a.currency)}</Button>)}</div>
        <h3 className="mt-8 font-semibold">Payment method</h3><div className="mt-3 divide-y rounded-md border">{[{name:"UPI",icon:Smartphone},{name:"Card",icon:CreditCard},{name:"Net banking",icon:Landmark}].map(({name,icon:Icon}) => <label key={name} className="flex cursor-pointer items-center gap-3 p-4"><Icon className="h-5 w-5" /><span className="flex-1">{name}</span><input type="radio" name="payment" checked={via===name} onChange={() => setVia(name)} /></label>)}</div>
        <p className="mt-6 text-xs text-muted-foreground">Demo payment. No real funds will be charged.</p>
      </div>}
      <div className="funds-footer"><Button variant="meta" disabled={fundStep === "amount" && !(Number(amount)>0 && Number.isFinite(Number(amount)))} onClick={() => { if(fundStep === "success") {setFundStep(null);return;} const value=Number(amount);actions.addFunds(a.id,value,via);setAdded(value);setFundStep("success"); }}>{fundStep === "success" ? "Done" : "Add funds"}</Button></div>
    </div>
  </Frame>;

  return (
    <Frame nav={false}>
      <PageHeader title="Billing & payments" />
      <div className="bg-card px-4">
        {!a.taxVerified && (
          <div className="my-4 rounded-lg border border-l-4 border-l-primary p-3">
            <p className="font-medium">Verify your tax information</p>
            <p className="text-sm text-muted-foreground">Submit your GST number to confirm that you're a registered taxpayer. We need this info to comply with local tax regulations.</p>
            <Button variant="plain" onClick={() => setM("tax")} className="mt-3 w-full rounded-md bg-secondary py-2 font-medium">Verify tax info</Button>
          </div>
        )}
        <div className={section}><p className="font-bold">Your account</p><p className="text-muted-foreground">{a.name} ({a.id})</p></div>
        <div className={section}>
          <Button variant="plain" onClick={() => setM("activity")} className="flex w-full items-start text-left">
            <span className="flex-1"><span className="block font-bold">Available funds</span><span className="text-sm text-muted-foreground">We'll deduct funds about once a day when you run ads. If funds run out, your ads will be paused.</span>
            <span className="mt-2 block text-2xl font-bold">{money(a.funds, a.currency)}</span></span><ChevronRight className="mt-8 h-5 w-5" />
          </Button>
          <Button variant="plain" onClick={() => { setAmount("3000"); setFundStep("amount"); }} className={softBtn}>Add funds</Button>
        </div>
        <div className={section}>
          <p className="font-bold">Payment methods</p>
          {a.paymentMethods.length === 0 ? <p className="text-sm text-muted-foreground">You haven't added any payment methods.</p> : (
            <ul className="mt-2 space-y-2">{a.paymentMethods.map((p) => (
              <li key={p} className="flex items-center gap-3 rounded-md border p-2"><CreditCard className="h-5 w-5" /><span className="flex-1 text-sm">{p}</span>
                <Button variant="plain" aria-label="Remove" onClick={() => { actions.updateAccount(a.id, { paymentMethods: a.paymentMethods.filter((x) => x !== p) }); toast("Payment method removed"); }}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button></li>))}</ul>
          )}
          <Button variant="plain" onClick={() => setM("method")} className={softBtn}>Add payment method</Button>
        </div>
        <div className={section}>
          <Button variant="plain" onClick={() => setM("limit")} className="flex w-full items-center text-left"><span className="flex-1"><span className="block font-bold">Account spending limit</span><span className="text-sm text-muted-foreground">{a.spendingLimit ? money(a.spendingLimit, a.currency) : "No limit set"}</span></span><ChevronRight className="h-5 w-5" /></Button>
        </div>
        <div className={section}>
          <Button variant="plain" onClick={() => setM("activity")} className="flex w-full items-center text-left"><span className="flex-1"><span className="block font-bold">Payment activity</span><span className="text-sm text-muted-foreground">Statements, recent and pending charges</span></span><ChevronRight className="h-5 w-5" /></Button>
        </div>
        <div className={section}>
          <Button variant="plain" onClick={() => setM("business")} className="flex w-full items-center text-left"><span className="flex-1"><span className="block font-bold">Business info</span><span className="text-sm text-muted-foreground">Your name, address and tax info.</span></span><ChevronRight className="h-5 w-5" /></Button>
        </div>
        <div className="py-4"><Button variant="plain" onClick={() => toast("A support request has been opened")} className="w-full rounded-md bg-secondary py-2.5 font-medium">Get support</Button></div>
      </div>

      <Dialog open={m !== null} onOpenChange={(o) => !o && close()}>
        <DialogContent>
          {m === "funds" && (<>
            <DialogHeader><DialogTitle>Add funds</DialogTitle></DialogHeader>
            <div className="flex gap-2">{[500, 1000, 2000, 5000].map((v) => <Button variant="plain" key={v} onClick={() => setAmount(String(v))} className={`flex-1 rounded-md border py-2 text-sm ${amount === String(v) ? "border-primary bg-accent" : ""}`}>{a.currency === "INR" ? "₹" : "$"}{v}</Button>)}</div>
            <input type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" className="rounded-md border px-3 py-2" />
            <select value={via} onChange={(e) => setVia(e.target.value)} className="rounded-md border px-3 py-2"><option>UPI</option><option>Card</option><option>Net banking</option></select>
            <Button variant="plain" disabled={!(Number(amount) > 0)} onClick={() => { actions.addFunds(a.id, Number(amount), via); toast.success(`${money(Number(amount), a.currency)} added`); close(); }} className="rounded-md bg-primary py-2 font-medium text-primary-foreground disabled:opacity-50">Pay {amount ? money(Number(amount), a.currency) : ""}</Button>
          </>)}
          {m === "method" && (<>
            <DialogHeader><DialogTitle>Add payment method</DialogTitle></DialogHeader>
            <select value={method.type} onChange={(e) => setMethod({ ...method, type: e.target.value })} className="rounded-md border px-3 py-2"><option>Card</option><option>UPI</option></select>
            <input value={method.value} onChange={(e) => setMethod({ ...method, value: e.target.value })} placeholder={method.type === "Card" ? "Card number" : "UPI ID (name@bank)"} className="rounded-md border px-3 py-2" />
            <Button variant="plain" disabled={method.value.trim().length < 4} onClick={() => {
              const label = method.type === "Card" ? `Card •••• ${method.value.replace(/\D/g, "").slice(-4)}` : `UPI · ${method.value.trim()}`;
              actions.updateAccount(a.id, { paymentMethods: [...a.paymentMethods, label] }); toast.success("Payment method added"); setMethod({ type: "Card", value: "" }); close();
            }} className="rounded-md bg-primary py-2 font-medium text-primary-foreground disabled:opacity-50">Save</Button>
          </>)}
          {m === "limit" && (<>
            <DialogHeader><DialogTitle>Account spending limit</DialogTitle></DialogHeader>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={a.spendingLimit ? String(a.spendingLimit) : "Set limit"} className="rounded-md border px-3 py-2" />
            <Button variant="plain" onClick={() => { actions.updateAccount(a.id, { spendingLimit: Number(amount) || null }); toast.success("Spending limit updated"); close(); }} className="rounded-md bg-primary py-2 font-medium text-primary-foreground">Save</Button>
            {a.spendingLimit && <Button variant="plain" onClick={() => { actions.updateAccount(a.id, { spendingLimit: null }); close(); }} className="rounded-md bg-secondary py-2 font-medium">Remove limit</Button>}
          </>)}
          {m === "tax" && (<>
            <DialogHeader><DialogTitle>Verify tax info</DialogTitle></DialogHeader>
            <input value={gst} onChange={(e) => setGst(e.target.value.toUpperCase())} maxLength={15} placeholder="15-digit GSTIN" className="rounded-md border px-3 py-2" />
            <Button variant="plain" disabled={gst.length !== 15} onClick={() => { actions.updateAccount(a.id, { taxVerified: true }); toast.success("Tax info verified"); close(); }} className="rounded-md bg-primary py-2 font-medium text-primary-foreground disabled:opacity-50">Submit</Button>
          </>)}
          {m === "activity" && (<>
            <DialogHeader><DialogTitle>Payment activity</DialogTitle></DialogHeader>
            {a.transactions.length === 0 ? <p className="text-sm text-muted-foreground">No payment activity yet.</p> : (
              <ul className="divide-y">{a.transactions.map((t) => <li key={t.id} className="flex justify-between py-2 text-sm"><span>{t.label}<span className="block text-xs text-muted-foreground">{t.date}</span></span><span className="font-medium">{money(t.amount, a.currency)}</span></li>)}</ul>
            )}
          </>)}
          {m === "business" && (<>
            <DialogHeader><DialogTitle>Business info</DialogTitle></DialogHeader>
            <input defaultValue={a.name} onBlur={(e) => e.target.value.trim() && actions.updateAccount(a.id, { name: e.target.value.trim() })} className="rounded-md border px-3 py-2" />
            <p className="text-sm text-muted-foreground">Tax status: {a.taxVerified ? "Verified" : "Not verified"} · Currency: {a.currency}</p>
            <Button variant="plain" onClick={() => { toast.success("Business info saved"); close(); }} className="rounded-md bg-primary py-2 font-medium text-primary-foreground">Done</Button>
          </>)}
        </DialogContent>
      </Dialog>
    </Frame>
  );
}
