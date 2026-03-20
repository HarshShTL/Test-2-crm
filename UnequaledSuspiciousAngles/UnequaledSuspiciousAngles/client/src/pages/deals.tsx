import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Deal, type Contact, PIPELINE_STAGES, SCHEMA } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Columns3, Filter, Plus, ChevronLeft, MapPin, Calendar, User,
  Layers, DollarSign, AlertTriangle, CheckCircle2, Clock, Building2, X
} from "lucide-react";

const STAGE_COLORS: Record<string, { card: string; badge: string; dot: string }> = {
  Overviews: {
    card: "border-t-slate-400",
    badge: "bg-muted text-muted-foreground",
    dot: "bg-slate-400",
  },
  "Deal Review": {
    card: "border-t-orange-400",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    dot: "bg-orange-400",
  },
  "LOI Sent": {
    card: "border-t-teal-500",
    badge: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
    dot: "bg-teal-500",
  },
  Sourcing: {
    card: "border-t-blue-400",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    dot: "bg-blue-400",
  },
  Closed: {
    card: "border-t-green-500",
    badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    dot: "bg-green-500",
  },
  "On Hold": {
    card: "border-t-amber-400",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    dot: "bg-amber-400",
  },
  Pass: {
    card: "border-t-red-400",
    badge: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    dot: "bg-red-400",
  },
};

const DD_STATUS_ICONS: Record<string, React.ReactNode> = {
  "Not started": <Clock size={11} className="text-muted-foreground" />,
  "In progress": <CheckCircle2 size={11} className="text-blue-500" />,
  Completed: <CheckCircle2 size={11} className="text-green-500" />,
};

function fmtAmount(n: number | null) {
  if (!n) return null;
  if (n >= 1000000) return `$${(n / 1000000).toFixed(0)}M`;
  return `$${(n / 1000).toFixed(0)}K`;
}

function DealCard({ deal, onClick }: { deal: Deal; onClick: () => void }) {
  const colors = STAGE_COLORS[deal.stage] || STAGE_COLORS.Overviews;
  return (
    <button
      onClick={onClick}
      data-testid={`deal-card-${deal.id}`}
      className={`w-full text-left bg-card border border-border rounded-lg p-3.5 hover:shadow-md transition-all border-t-2 ${colors.card} group`}
    >
      <div className="text-sm font-semibold text-primary mb-2 leading-snug">{deal.name}</div>
      <div className="space-y-1.5">
        {deal.amount && (
          <div className="flex items-center gap-1.5">
            <DollarSign size={11} className="text-muted-foreground shrink-0" />
            <span className="text-xs text-foreground font-medium">{fmtAmount(deal.amount)}</span>
          </div>
        )}
        {deal.location && (
          <div className="flex items-center gap-1.5">
            <MapPin size={11} className="text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground truncate">{deal.location}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Calendar size={11} className="text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground">{deal.closeDate}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <User size={11} className="text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground truncate">{deal.dealOwner}</span>
        </div>
        {deal.assetClass && (
          <div className="flex items-center gap-1.5">
            <Layers size={11} className="text-muted-foreground shrink-0" />
            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">{deal.assetClass}</span>
          </div>
        )}
        {deal.dueDiligenceStatus && (
          <div className="flex items-center gap-1.5">
            {DD_STATUS_ICONS[deal.dueDiligenceStatus]}
            <span className="text-xs text-muted-foreground">{deal.dueDiligenceStatus}</span>
          </div>
        )}
        {deal.overdue && (
          <div className="flex items-center gap-1.5 mt-2">
            <AlertTriangle size={11} className="text-destructive" />
            <span className="text-xs text-destructive font-medium">Overdue</span>
          </div>
        )}
      </div>
    </button>
  );
}

function DealDetailModal({ deal, contacts, onClose }: { deal: Deal; contacts: Contact[]; onClose: () => void }) {
  const updateMutation = useMutation({
    mutationFn: (data: Partial<Deal>) => apiRequest("PATCH", `/api/deals/${deal.id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/deals"] }),
  });

  const colors = STAGE_COLORS[deal.stage] || STAGE_COLORS.Overviews;
  const dealContacts = contacts.filter((c) => deal.contactIds?.includes(c.id));
  const AVATAR_COLORS = [
    "bg-teal-100 text-teal-700",
    "bg-blue-100 text-blue-700",
    "bg-purple-100 text-purple-700",
    "bg-orange-100 text-orange-700",
  ];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${colors.dot}`} />
            <div>
              <DialogTitle className="text-lg font-bold">{deal.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${colors.badge}`}>
                  {deal.stage}
                </span>
                {deal.assetClass && (
                  <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary">
                    {deal.assetClass}
                  </span>
                )}
                {deal.overdue && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-destructive/10 text-destructive">
                    <AlertTriangle size={10} />Overdue
                  </span>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 py-4">
            <DetailField label="Deal Owner" value={deal.dealOwner} />
            <DetailField label="Location" value={deal.location} />
            <DetailField label="Amount" value={fmtAmount(deal.amount) || undefined} />
            <DetailField label="Close Date" value={deal.closeDate} />
            <DetailField label="Create Date" value={deal.createDate} />
            <DetailField label="Due Diligence" value={deal.dueDiligenceStatus} />
            {deal.expectedInvestmentAmount && (
              <DetailField label="Expected Investment" value={fmtAmount(deal.expectedInvestmentAmount) || undefined} />
            )}
          </div>

          {/* Stage change */}
          <div className="border-t border-border pt-4 mt-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Move to Stage</p>
            <div className="flex gap-2 flex-wrap">
              {PIPELINE_STAGES.map((stage) => {
                const sc = STAGE_COLORS[stage] || STAGE_COLORS.Overviews;
                return (
                  <button
                    key={stage}
                    data-testid={`move-stage-${stage.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => updateMutation.mutate({ stage })}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all ${
                      deal.stage === stage
                        ? `${sc.badge} border-current`
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {stage}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contacts */}
          <div className="border-t border-border pt-4 mt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Contacts ({dealContacts.length})
            </p>
            <div className="space-y-2">
              {dealContacts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No contacts associated with this deal.</p>
              ) : dealContacts.map((c) => (
                <div key={c.id} className="flex items-center gap-2.5" data-testid={`deal-contact-${c.id}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${AVATAR_COLORS[(c.name?.charCodeAt(0) || 0) % AVATAR_COLORS.length]}`}>
                    {c.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <Link href={`/contacts/${c.id}`}>
                      <span className="text-sm font-medium text-primary hover:underline cursor-pointer">{c.name}</span>
                    </Link>
                    <p className="text-xs text-muted-foreground">{c.company}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attachments */}
          {deal.attachments && deal.attachments.length > 0 && (
            <div className="border-t border-border pt-4 mt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Attachments ({deal.attachments.length})
              </p>
              <div className="space-y-1.5">
                {deal.attachments.map((att) => (
                  <div key={att} className="flex items-center gap-2 p-2.5 bg-muted rounded-lg">
                    <Layers size={13} className="text-muted-foreground shrink-0" />
                    <span className="text-xs text-foreground">{att}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-border pt-3">
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DetailField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm text-foreground font-medium">{value || <span className="text-muted-foreground/50 font-normal">—</span>}</p>
    </div>
  );
}

function AddDealModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    name: "",
    stage: "Overviews",
    amount: "",
    closeDate: "",
    dealOwner: "Kyle Henrickson",
    assetClass: "",
    location: "",
    dueDiligenceStatus: "",
    expectedInvestmentAmount: "",
    createDate: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }),
    contactIds: [] as string[],
    attachments: [] as string[],
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Deal, "id">) => apiRequest("POST", "/api/deals", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      onClose();
    },
  });

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    createMutation.mutate({
      name: form.name,
      stage: form.stage,
      amount: form.amount ? Number(form.amount) : null,
      closeDate: form.closeDate,
      dealOwner: form.dealOwner,
      assetClass: form.assetClass,
      location: form.location,
      dueDiligenceStatus: form.dueDiligenceStatus,
      expectedInvestmentAmount: form.expectedInvestmentAmount ? Number(form.expectedInvestmentAmount) : null,
      createDate: form.createDate,
      contactIds: [],
      attachments: [],
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Add New Deal</DialogTitle></DialogHeader>
        <div className="space-y-3 py-1">
          <div>
            <Label className="text-xs">Deal Name *</Label>
            <Input data-testid="input-deal-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Hotel Magdalena" className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Stage</Label>
              <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} className="w-full mt-1 text-sm border border-border rounded-md px-2.5 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary">
                {PIPELINE_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Asset Class</Label>
              <select value={form.assetClass} onChange={(e) => setForm({ ...form, assetClass: e.target.value })} className="w-full mt-1 text-sm border border-border rounded-md px-2.5 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="">—</option>
                {SCHEMA.deals.asset_class.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Amount ($)</Label>
              <Input data-testid="input-deal-amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="10000000" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Close Date</Label>
              <Input type="date" value={form.closeDate} onChange={(e) => setForm({ ...form, closeDate: e.target.value })} className="mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Location</Label>
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Austin, TX" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Deal Owner</Label>
            <select value={form.dealOwner} onChange={(e) => setForm({ ...form, dealOwner: e.target.value })} className="w-full mt-1 text-sm border border-border rounded-md px-2.5 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary">
              {SCHEMA.deals.hubspot_owner_id.options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs">Due Diligence Status</Label>
            <select value={form.dueDiligenceStatus} onChange={(e) => setForm({ ...form, dueDiligenceStatus: e.target.value })} className="w-full mt-1 text-sm border border-border rounded-md px-2.5 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="">—</option>
              {SCHEMA.deals.due_diligence_status.options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" disabled={!form.name.trim() || createMutation.isPending} onClick={handleSubmit} data-testid="button-submit-deal">
            {createMutation.isPending ? "Creating..." : "Create Deal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function DealsPage() {
  const { data: deals = [], isLoading } = useQuery<Deal[]>({ queryKey: ["/api/deals"] });
  const { data: contacts = [] } = useQuery<Contact[]>({ queryKey: ["/api/contacts"] });

  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showAddDeal, setShowAddDeal] = useState(false);

  const stageTotals = (stage: string) => {
    const stageDeals = deals.filter((d) => d.stage === stage);
    const total = stageDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
    return { count: stageDeals.length, total };
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-3" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-muted/50">
      {/* Header */}
      <div className="border-b border-border bg-card shrink-0 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Columns3 size={15} className="text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">TREP Pipeline</span>
          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold">{deals.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-xs text-muted-foreground border border-border rounded-md px-2.5 py-1.5 hover:bg-muted flex items-center gap-1.5 transition-colors">
            <Filter size={12} />Filters
          </button>
          <Button size="sm" className="bg-accent text-accent-foreground text-xs" onClick={() => setShowAddDeal(true)} data-testid="button-add-deal">
            <Plus size={13} />Add deal
          </Button>
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto px-4 pt-4 pb-4">
        <div className="flex gap-3 h-full min-w-max">
          {PIPELINE_STAGES.map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage);
            const { count, total } = stageTotals(stage);
            const colors = STAGE_COLORS[stage] || STAGE_COLORS.Overviews;

            return (
              <div key={stage} className="w-56 flex flex-col" data-testid={`pipeline-column-${stage.toLowerCase().replace(/\s+/g, '-')}`}>
                {/* Column header */}
                <div className="flex items-center justify-between mb-2.5 px-0.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${colors.dot}`} />
                    <span className="text-xs font-semibold text-foreground">{stage}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${colors.badge}`}>{count}</span>
                  </div>
                  {total > 0 && (
                    <span className="text-xs text-muted-foreground">{fmtAmount(total)}</span>
                  )}
                </div>

                {/* Cards */}
                <div className="flex-1 space-y-2.5 min-h-24">
                  {stageDeals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} onClick={() => setSelectedDeal(deal)} />
                  ))}
                  {stageDeals.length === 0 && (
                    <div className="h-16 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                      <span className="text-xs text-muted-foreground/50">Empty</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deal detail modal */}
      {selectedDeal && (
        <DealDetailModal
          deal={selectedDeal}
          contacts={contacts}
          onClose={() => setSelectedDeal(null)}
        />
      )}

      {/* Add deal modal */}
      {showAddDeal && <AddDealModal onClose={() => setShowAddDeal(false)} />}
    </div>
  );
}
