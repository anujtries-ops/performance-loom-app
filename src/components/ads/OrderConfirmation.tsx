import { Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function OrderConfirmation({ open, onClose, onDuplicate }: { open: boolean; onClose: () => void; onDuplicate: () => void }) {
  return <Dialog open={open} onOpenChange={value => { if (!value) onClose(); }}><DialogContent className="reference-order">
    <div className="reference-order-progress"><span><Check /></span><i /><Clock /><i /><span className="reference-order-pending" /></div>
    <DialogHeader><DialogTitle>Your Order Was Received</DialogTitle><DialogDescription>Demo campaign saved · No ad was sent to Meta.</DialogDescription></DialogHeader>
    <p>Your campaign is now in the demo review flow. Live advertising review and delivery are not connected.</p>
    <p>You can duplicate this ad to create more ads that can then be edited. Try using new targeting, images or text to learn more about what resonates with your audience.</p>
    <div className="grid grid-cols-2 gap-2"><Button variant="metaOutline" onClick={onClose}>Not Now</Button><Button variant="meta" onClick={onDuplicate}>Duplicate</Button></div>
  </DialogContent></Dialog>;
}