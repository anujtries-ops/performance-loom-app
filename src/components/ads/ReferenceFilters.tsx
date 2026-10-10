import { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Circle, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const FILTER_STATUSES = [
  ["all", "All"], ["active", "Active"], ["scheduled", "Scheduled"],
  ["in_review", "In Review"], ["not_approved", "Not Approved"], ["completed", "Completed"],
  ["recently_completed", "Recently Completed"], ["paused", "Off"],
  ["not_delivering", "Not Delivering"], ["deleted", "Deleted"],
] as const;
export type ReferenceDate = "today" | "7d" | "30d" | "max";
const DATE_OPTIONS: { label: string; value: ReferenceDate }[] = [
  { label: "Maximum", value: "max" }, { label: "Today", value: "today" },
  { label: "Yesterday", value: "today" }, { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" }, { label: "This week", value: "7d" },
  { label: "This month", value: "30d" },
];

export function ReferenceFilters({ open, onClose, status, onStatus, onDate }: {
  open: "status" | "date" | "custom" | null; onClose: () => void;
  status: string; onStatus: (value: string) => void; onDate: (value: ReferenceDate, label: string) => void;
}) {
  const [custom, setCustom] = useState(false);
  const [label, setLabel] = useState("Maximum");
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [start, setStart] = useState<number | null>(null);
  const [end, setEnd] = useState<number | null>(null);
  const isCalendar = open === "custom" || custom;
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const offset = (month.getDay() + 6) % 7;
  const close = () => { setCustom(false); onClose(); };
  return <Sheet open={open !== null} onOpenChange={(value) => { if (!value) close(); }}>
    <SheetContent side="bottom" className="reference-sheet">
      <SheetHeader className="reference-sheet-heading"><SheetTitle>{open === "status" ? "Status" : isCalendar ? "Filters" : "Filter by date"}</SheetTitle></SheetHeader>
      {open === "status" ? <div className="reference-choice-list">{FILTER_STATUSES.map(([value, text]) => <Button variant="plain" key={value} role="radio" aria-checked={status === value} className="reference-choice" onClick={() => { onStatus(value); close(); }}><span>{text}</span>{status === value ? <CircleDot /> : <Circle className="text-muted-foreground" />}</Button>)}</div> : isCalendar ? <div className="reference-calendar-panel">
        <p className="font-semibold">{month.toLocaleDateString("en", { month: "short", year: "numeric" })}{start ? ` · ${start}${end ? ` – ${end}` : ""}` : ""}</p>
        <p className="text-xs text-muted-foreground">Demo reporting date range</p>
        <div className="reference-month"><Button variant="ghost" size="icon" aria-label="Previous month" onClick={() => { setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1)); setStart(null); setEnd(null); }}><ChevronLeft /></Button><strong>{month.toLocaleDateString("en", { month: "long", year: "numeric" })}</strong><Button variant="ghost" size="icon" aria-label="Next month" onClick={() => { setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1)); setStart(null); setEnd(null); }}><ChevronRight /></Button></div>
        <div className="reference-calendar">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => <span className="text-xs text-muted-foreground" key={day}>{day}</span>)}{Array.from({ length: offset }, (_, i) => <span key={`empty${i}`} />)}{Array.from({ length: days }, (_, i) => i + 1).map(day => <Button variant="plain" key={day} aria-label={`Select day ${day}`} aria-pressed={start === day || end === day} className={start !== null && day >= start && day <= (end ?? start) ? "bg-accent text-accent-foreground" : ""} onClick={() => { if (start === null || end !== null || day < start) { setStart(day); setEnd(null); } else setEnd(day); }}>{day}</Button>)}</div>
        <div className="grid grid-cols-3 gap-2 border-t pt-3">{DATE_OPTIONS.slice(3, 6).map(option => <Button variant="metaOutline" key={option.label} onClick={() => { setLabel(option.label); onDate(option.value, option.label); close(); }}>{option.label}</Button>)}</div>
        <div className="flex items-center justify-between py-4"><strong>Campaigns</strong><ChevronDown /></div><p className="mb-4 text-sm">All campaigns</p>
        <Button variant="meta" className="w-full" onClick={() => { onDate("max", start ? "Custom date range" : "Maximum"); close(); }}>View campaigns</Button>
      </div> : <div className="reference-choice-list">{DATE_OPTIONS.map(option => <Button variant="plain" key={option.label} role="radio" aria-checked={label === option.label} className="reference-choice" onClick={() => { setLabel(option.label); onDate(option.value, option.label); close(); }}><span>{option.label}</span>{label === option.label ? <CircleDot /> : <Circle className="text-muted-foreground" />}</Button>)}<Button variant="plain" className="reference-choice border-t" onClick={() => setCustom(true)}>Custom date range<ChevronRight /></Button></div>}
      <span className="reference-sheet-handle" />
    </SheetContent>
  </Sheet>;
}