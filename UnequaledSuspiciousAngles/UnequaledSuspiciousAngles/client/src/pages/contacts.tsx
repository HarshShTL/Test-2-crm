import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute, Link } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Contact, SCHEMA, ALL_CONTACT_COLUMNS } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ChevronLeft, ChevronRight, Search, Filter, ArrowUpDown, ArrowUp, ArrowDown,
  Download, Plus, X, Check, Pencil, ExternalLink, StickyNote, Mail, Phone,
  ListChecks, CalendarDays, MoreHorizontal, Building2
} from "lucide-react";

const AVATAR_COLORS = [
  "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400",
  "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
  "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400",
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400",
];

function getInitials(name: string) {
  return name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
}

function avatarColor(name: string) {
  return AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

function ContactAvatar({ name, size = "sm" }: { name: string; size?: "xs" | "sm" | "lg" }) {
  const s = size === "xs" ? "w-6 h-6 text-xs" : size === "sm" ? "w-8 h-8 text-xs" : "w-11 h-11 text-sm";
  return (
    <div className={`${s} rounded-full ${avatarColor(name)} flex items-center justify-center font-semibold shrink-0`}>
      {getInitials(name)}
    </div>
  );
}

function DropdownFilter({
  label, options, value, onChange, isOpen, onToggle,
}: {
  label: string; options: string[]; value: string;
  onChange: (v: string) => void; isOpen: boolean; onToggle: (v: boolean) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onToggle(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [isOpen, onToggle]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => onToggle(!isOpen)}
        data-testid={`filter-${label.toLowerCase().replace(/\s+/g, '-')}`}
        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
          value !== "All"
            ? "bg-primary/10 border-primary/30 text-primary"
            : "bg-background border-border text-muted-foreground hover:bg-muted"
        }`}
      >
        {label}{value !== "All" && " (1)"}<ChevronRight size={11} className="rotate-90" />
        {value !== "All" && (
          <span onClick={(e) => { e.stopPropagation(); onChange("All"); }} className="ml-0.5 hover:text-destructive">
            <X size={11} />
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 bg-popover border border-popover-border rounded-lg shadow-lg z-50 min-w-52 py-1 max-h-60 overflow-y-auto">
          {options.map((o) => (
            <button
              key={o}
              onClick={() => { onChange(o); onToggle(false); }}
              className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
                value === o
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {value === o && <Check size={12} />}
              <span>{o}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MultiSelectCell({
  value, onSave, options,
}: {
  value: string; onSave: (v: string) => void; options: string[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = value ? value.split(", ").filter(Boolean) : [];

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const toggle = (opt: string) => {
    const next = selected.includes(opt)
      ? selected.filter((s) => s !== opt)
      : [...selected, opt];
    onSave(next.join(", "));
  };

  const displayValue = selected.length > 0
    ? selected.join(", ")
    : null;

  return (
    <div className="relative" ref={ref}>
      <div
        className="group/cell flex items-center gap-1 min-h-7 cursor-pointer"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-sm text-foreground truncate max-w-xs">
          {displayValue
            ? <span className="flex flex-wrap gap-1">
                {selected.map((s) => (
                  <span key={s} className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium">
                    {s}
                  </span>
                ))}
              </span>
            : <span className="text-muted-foreground/50">—</span>
          }
        </span>
        <Pencil size={9} className="text-muted-foreground/30 opacity-0 group-hover/cell:opacity-100 shrink-0 ml-auto" />
      </div>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-popover border border-popover-border rounded-lg shadow-lg z-50 min-w-52 py-1 max-h-60 overflow-y-auto">
          {options.map((opt) => {
            const checked = selected.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => toggle(opt)}
                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2.5 transition-colors ${
                  checked ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                }`}
              >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  checked ? "bg-primary border-primary" : "border-border"
                }`}>
                  {checked && <Check size={10} className="text-primary-foreground" />}
                </div>
                {opt}
              </button>
            );
          })}
          {selected.length > 0 && (
            <div className="border-t border-border mt-1 pt-1 px-3 pb-1">
              <button
                onClick={() => { onSave(""); setOpen(false); }}
                className="text-xs text-destructive hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EditableCell({
  value, onSave, schemaKey, objectType = "contacts",
}: {
  value: string; onSave: (v: string) => void; schemaKey: string; objectType?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);
  const schemaDef = (SCHEMA as Record<string, Record<string, { type: string; options?: string[]; multiSelect?: boolean }>>)[objectType]?.[schemaKey];
  const fieldType = schemaDef?.type || "string";
  const options = schemaDef?.options || [];
  const isMultiSelect = schemaDef?.multiSelect === true;

  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);
  useEffect(() => { setDraft(value); }, [value]);

  const commit = () => { onSave(draft); setEditing(false); };
  const cancel = () => { setDraft(value); setEditing(false); };

  // Multi-select renders its own open/close state
  if (fieldType === "enumeration" && isMultiSelect) {
    return <MultiSelectCell value={value} onSave={onSave} options={options} />;
  }

  if (!editing) {
    return (
      <div className="group/cell flex items-center gap-1 min-h-7 cursor-text" onClick={() => setEditing(true)}>
        <span className="text-sm text-foreground truncate">{value || <span className="text-muted-foreground/50">—</span>}</span>
        <Pencil size={9} className="text-muted-foreground/30 opacity-0 group-hover/cell:opacity-100 shrink-0" />
      </div>
    );
  }

  const cls = "text-sm border border-primary rounded px-1.5 py-0.5 w-full focus:outline-none focus:ring-1 focus:ring-primary bg-background";

  if (fieldType === "enumeration") {
    return (
      <select
        value={draft}
        onChange={(e) => { onSave(e.target.value); setEditing(false); }}
        onBlur={cancel}
        ref={inputRef as React.RefObject<HTMLSelectElement>}
        className={cls}
      >
        <option value="">—</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }
  if (fieldType === "number") {
    return <input ref={inputRef as React.RefObject<HTMLInputElement>} type="number" value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit} onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") cancel(); }} className={cls} />;
  }
  if (fieldType === "date" || fieldType === "datetime") {
    return <input ref={inputRef as React.RefObject<HTMLInputElement>} type="date" value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit} onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") cancel(); }} className={cls} />;
  }
  return <input ref={inputRef as React.RefObject<HTMLInputElement>} value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit} onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") cancel(); }} className={cls} />;
}

const VERIFICATION_STYLES: Record<string, string> = {
  valid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  invalid: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  unknown: "bg-muted text-muted-foreground",
  accept_all_unverifiable: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const LEAD_STATUS_STYLES: Record<string, string> = {
  "Need to Call": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  "Had Call": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "Left VM": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "Sent Email": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  "Tag to Deal": "bg-primary/10 text-primary",
  "Hold off for now": "bg-muted text-muted-foreground",
};

type ListViewDef = {
  id: string;
  label: string;
  filter: (c: Contact) => boolean;
  columns: string[];
};

const DEFAULT_COLUMNS = ALL_CONTACT_COLUMNS.filter((c) => c.default).map((c) => c.key);

function ContactsList() {
  const { data: contacts = [], isLoading } = useQuery<Contact[]>({ queryKey: ["/api/contacts"] });
  const { data: deals = [] } = useQuery<{ id: string; name: string; stage: string; amount: number | null; contactIds: string[] }[]>({ queryKey: ["/api/deals"] });

  const updateMutation = useMutation({
    mutationFn: ({ id, field, value }: { id: string; field: string; value: string }) =>
      apiRequest("PATCH", `/api/contacts/${id}`, { [field]: value }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/contacts"] }),
  });

  const [listViews, setListViews] = useState<ListViewDef[]>([
    { id: "all", label: "All Contacts", filter: () => true, columns: DEFAULT_COLUMNS },
    { id: "kh", label: "KH List", filter: (c) => c.contactOwner === "Kyle Henrickson", columns: ["name", "company", "email", "phone", "leadStatus", "capitalType", "investmentStrategy", "nextSteps"] },
  ]);
  const [activeListId, setActiveListId] = useState("all");
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [filters, setFilters] = useState({ contactOwner: "All", leadStatus: "All" });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showColModal, setShowColModal] = useState(false);
  const [tempColumns, setTempColumns] = useState<string[]>([]);
  const [showNewList, setShowNewList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [showSortModal, setShowSortModal] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 50;

  const activeList = listViews.find((v) => v.id === activeListId) || listViews[0];
  const activeFilterCount = Object.values(filters).filter((v) => v !== "All").length;

  const filtered = useMemo(() => {
    let data = contacts.filter(activeList.filter);
    if (filters.contactOwner !== "All") data = data.filter((c) => c.contactOwner === filters.contactOwner);
    if (filters.leadStatus !== "All") data = data.filter((c) => c.leadStatus === filters.leadStatus);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      data = data.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    }
    if (sortCol) {
      data = [...data].sort((a, b) => {
        const va = ((a as Record<string, string>)[sortCol] || "").toLowerCase();
        const vb = ((b as Record<string, string>)[sortCol] || "").toLowerCase();
        return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      });
    }
    return data;
  }, [contacts, activeList, filters, searchTerm, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageData = filtered.slice((page - 1) * perPage, page * perPage);
  const visibleCols = ALL_CONTACT_COLUMNS.filter((c) => activeList.columns.includes(c.key));

  const handleExport = () => {
    const header = visibleCols.map((c) => c.label).join(",");
    const rows = filtered.map((row) =>
      visibleCols.map((c) => `"${((row as Record<string, string>)[c.key] || "").toString().replace(/"/g, '""')}"`).join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "contacts_export.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-muted-foreground">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-3" />
        <p className="text-sm">Loading contacts...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* List view tabs */}
      <div className="border-b border-border bg-card shrink-0">
        <div className="flex items-center px-4 pt-1 gap-0.5">
          {listViews.map((v) => (
            <button
              key={v.id}
              data-testid={`list-tab-${v.id}`}
              onClick={() => { setActiveListId(v.id); setPage(1); }}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeListId === v.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {v.label}
              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold">
                {contacts.filter(v.filter).length}
              </span>
              {v.id !== "all" && activeListId === v.id && (
                <span
                  onClick={(e) => { e.stopPropagation(); setListViews((vs) => vs.filter((lv) => lv.id !== v.id)); setActiveListId("all"); }}
                  className="ml-0.5 text-muted-foreground hover:text-destructive"
                >
                  <X size={12} />
                </span>
              )}
            </button>
          ))}
          <button
            data-testid="button-new-list"
            onClick={() => setShowNewList(true)}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded ml-0.5"
          >
            <Plus size={14} />
          </button>
          <div className="ml-auto flex items-center gap-2 pb-1 flex-wrap">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                data-testid="input-contact-search"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                placeholder="Search contacts..."
                className="pl-8 pr-3 py-1.5 text-sm border border-border rounded-md w-44 focus:outline-none focus:ring-1 focus:ring-primary bg-background"
              />
            </div>
            <button
              data-testid="button-edit-columns"
              onClick={() => { setTempColumns([...activeList.columns]); setShowColModal(true); }}
              className="text-xs text-muted-foreground border border-border rounded-md px-2.5 py-1.5 hover:bg-muted transition-colors"
            >
              Edit columns
            </button>
            <button
              data-testid="button-sort"
              onClick={() => setShowSortModal(true)}
              className={`text-xs border rounded-md px-2.5 py-1.5 flex items-center gap-1.5 transition-colors ${
                sortCol ? "bg-primary/10 border-primary/30 text-primary" : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <ArrowUpDown size={12} />Sort{sortCol && " (1)"}
            </button>
            <button
              data-testid="button-export"
              onClick={handleExport}
              className="text-xs text-muted-foreground border border-border rounded-md px-2.5 py-1.5 hover:bg-muted flex items-center gap-1.5 transition-colors"
            >
              <Download size={12} />Export
            </button>
            <Button size="sm" variant="default" className="bg-accent text-accent-foreground text-xs" data-testid="button-add-contact">
              <Plus size={13} />Add contact
            </Button>
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-card flex-wrap shrink-0">
        <span className="text-xs text-muted-foreground font-medium">Filter:</span>
        <DropdownFilter
          label="Contact owner"
          options={["All", ...SCHEMA.contacts.contactOwner.options]}
          value={filters.contactOwner}
          onChange={(v) => { setFilters({ ...filters, contactOwner: v }); setPage(1); }}
          isOpen={openFilter === "owner"}
          onToggle={(v) => setOpenFilter(v ? "owner" : null)}
        />
        <DropdownFilter
          label="Lead status"
          options={["All", ...SCHEMA.contacts.hs_lead_status.options]}
          value={filters.leadStatus}
          onChange={(v) => { setFilters({ ...filters, leadStatus: v }); setPage(1); }}
          isOpen={openFilter === "lead"}
          onToggle={(v) => setOpenFilter(v ? "lead" : null)}
        />
        {activeFilterCount > 0 && (
          <button
            onClick={() => setFilters({ contactOwner: "All", leadStatus: "All" })}
            className="text-xs text-primary hover:underline"
          >
            Clear all
          </button>
        )}
        <span className="ml-auto text-xs text-muted-foreground">{filtered.length} records</span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full min-w-max border-collapse">
          <thead className="sticky top-0 bg-muted/80 z-10 backdrop-blur-sm">
            <tr className="border-b border-border">
              <th className="w-10 px-3 py-2.5"><Checkbox /></th>
              {visibleCols.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:bg-muted transition-colors"
                  onClick={() => {
                    if (sortCol === col.key) setSortDir((d) => d === "asc" ? "desc" : "asc");
                    else { setSortCol(col.key); setSortDir("asc"); }
                  }}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {sortCol === col.key
                      ? (sortDir === "asc" ? <ArrowUp size={10} className="text-primary" /> : <ArrowDown size={10} className="text-primary" />)
                      : <ArrowUpDown size={10} className="text-muted-foreground/40" />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((c) => (
              <tr key={c.id} className="border-b border-border/50 hover:bg-primary/5 group transition-colors" data-testid={`contact-row-${c.id}`}>
                <td className="px-3 py-2"><Checkbox /></td>
                {visibleCols.map((col) => (
                  <td key={col.key} className="px-3 py-2 max-w-xs">
                    {col.key === "name" ? (
                      <div className="flex items-center gap-2">
                        <ContactAvatar name={c.name} size="xs" />
                        <Link href={`/contacts/${c.id}`}>
                          <span className="text-sm font-medium text-primary hover:underline truncate cursor-pointer" data-testid={`link-contact-${c.id}`}>
                            {c.name}
                          </span>
                        </Link>
                      </div>
                    ) : col.key === "company" ? (
                      <Link href={`/companies/${encodeURIComponent(c.company)}`}>
                        <span className="text-sm text-primary hover:underline truncate block max-w-xs cursor-pointer">
                          {c.company || "—"}
                        </span>
                      </Link>
                    ) : col.key === "email" ? (
                      c.email ? (
                        <a href={`mailto:${c.email}`} className="text-sm text-primary hover:underline truncate block max-w-xs" title={c.email}>
                          {c.email}<ExternalLink size={9} className="inline ml-1 opacity-60" />
                        </a>
                      ) : <span className="text-sm text-muted-foreground/50">—</span>
                    ) : col.key === "phone" ? (
                      c.phone ? (
                        <a href={`tel:${c.phone}`} className="text-sm text-primary hover:underline">{c.phone}</a>
                      ) : <span className="text-sm text-muted-foreground/50">—</span>
                    ) : col.key === "contactOwner" ? (
                      c.contactOwner && c.contactOwner !== "No owner" ? (
                        <div className="flex items-center gap-1.5">
                          <ContactAvatar name={c.contactOwner} size="xs" />
                          <span className="text-sm text-foreground truncate max-w-xs">{c.contactOwner}</span>
                        </div>
                      ) : <span className="text-sm text-muted-foreground/50">No owner</span>
                    ) : col.key === "emailVerification" ? (
                      c.emailVerification ? (
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${VERIFICATION_STYLES[c.emailVerification] || "bg-muted text-muted-foreground"}`}>
                          {c.emailVerification}
                        </span>
                      ) : <span className="text-sm text-muted-foreground/50">—</span>
                    ) : col.key === "leadStatus" ? (
                      c.leadStatus ? (
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${LEAD_STATUS_STYLES[c.leadStatus] || "bg-muted text-muted-foreground"}`}>
                          {c.leadStatus}
                        </span>
                      ) : <span className="text-sm text-muted-foreground/50">—</span>
                    ) : (
                      <EditableCell
                        value={(c as Record<string, string>)[col.key] || ""}
                        onSave={(v) => updateMutation.mutate({ id: c.id, field: col.key, value: v })}
                        schemaKey={col.schemaKey}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {pageData.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">
            <Search size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No contacts match your search.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-card shrink-0">
        <span className="text-xs text-muted-foreground">
          Showing {Math.min((page - 1) * perPage + 1, filtered.length)}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
        </span>
        <div className="flex items-center gap-1">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="flex items-center gap-0.5 text-xs text-muted-foreground disabled:opacity-30 px-2 py-1 rounded hover:bg-muted transition-colors"
            data-testid="button-prev-page"
          >
            <ChevronLeft size={14} />Prev
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              data-testid={`button-page-${p}`}
              className={`w-7 h-7 rounded text-xs font-medium transition-colors ${page === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
            >
              {p}
            </button>
          ))}
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-0.5 text-xs text-muted-foreground disabled:opacity-30 px-2 py-1 rounded hover:bg-muted transition-colors"
            data-testid="button-next-page"
          >
            Next<ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Edit Columns Modal */}
      <Dialog open={showColModal} onOpenChange={setShowColModal}>
        <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Columns</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground px-1">Toggle visible columns for this list view.</p>
          <div className="flex-1 overflow-y-auto space-y-0.5 mt-2">
            {ALL_CONTACT_COLUMNS.map((col) => {
              const active = tempColumns.includes(col.key);
              const sdef = (SCHEMA.contacts as Record<string, { type: string }>)[col.schemaKey];
              return (
                <label
                  key={col.key}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-muted transition-colors ${col.locked ? "opacity-60" : ""}`}
                >
                  <Checkbox
                    checked={active}
                    disabled={col.locked}
                    onCheckedChange={() => {
                      if (col.locked) return;
                      setTempColumns((tc) => active ? tc.filter((k) => k !== col.key) : [...tc, col.key]);
                    }}
                  />
                  <div>
                    <span className="text-sm text-foreground">{col.label}</span>
                    {sdef && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {sdef.type === "enumeration" ? "Dropdown" : sdef.type === "number" ? "Number" : sdef.type === "date" || sdef.type === "datetime" ? "Date" : "Text"}
                      </span>
                    )}
                  </div>
                  {col.locked && <span className="text-xs text-muted-foreground ml-auto">Required</span>}
                </label>
              );
            })}
          </div>
          <DialogFooter className="mt-4 border-t border-border pt-3">
            <Button variant="outline" size="sm" onClick={() => setShowColModal(false)}>Cancel</Button>
            <Button size="sm" onClick={() => {
              setListViews((vs) => vs.map((v) => v.id === activeListId ? { ...v, columns: tempColumns } : v));
              setShowColModal(false);
            }}>Save columns</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sort Modal */}
      <Dialog open={showSortModal} onOpenChange={setShowSortModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Sort Contacts</DialogTitle></DialogHeader>
          <div className="space-y-0.5">
            {visibleCols.map((col) => (
              <button
                key={col.key}
                onClick={() => { setSortCol(col.key); setSortDir("asc"); setShowSortModal(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between hover:bg-muted transition-colors ${sortCol === col.key ? "bg-primary/10 text-primary font-medium" : "text-foreground"}`}
              >
                {col.label}
                {sortCol === col.key && (sortDir === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
              </button>
            ))}
          </div>
          {sortCol && (
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
              <span className="text-sm text-muted-foreground">Direction:</span>
              <button onClick={() => setSortDir("asc")} className={`px-3 py-1.5 text-xs rounded-md ${sortDir === "asc" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>A→Z</button>
              <button onClick={() => setSortDir("desc")} className={`px-3 py-1.5 text-xs rounded-md ${sortDir === "desc" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>Z→A</button>
              <button onClick={() => { setSortCol(null); setShowSortModal(false); }} className="ml-auto text-xs text-destructive hover:underline">Clear sort</button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New List Modal */}
      <Dialog open={showNewList} onOpenChange={setShowNewList}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Create New List View</DialogTitle></DialogHeader>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">List view name</label>
            <Input
              data-testid="input-new-list-name"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newListName.trim()) {
                  const nid = "c_" + Date.now();
                  setListViews((vs) => [...vs, { id: nid, label: newListName.trim(), filter: () => true, columns: DEFAULT_COLUMNS }]);
                  setActiveListId(nid);
                  setNewListName(""); setShowNewList(false);
                }
              }}
              placeholder="e.g. TREP Active Leads"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowNewList(false)}>Cancel</Button>
            <Button
              size="sm"
              disabled={!newListName.trim()}
              data-testid="button-create-list"
              onClick={() => {
                if (!newListName.trim()) return;
                const nid = "c_" + Date.now();
                setListViews((vs) => [...vs, { id: nid, label: newListName.trim(), filter: () => true, columns: DEFAULT_COLUMNS }]);
                setActiveListId(nid);
                setNewListName(""); setShowNewList(false);
              }}
            >Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ContactDetail({ contactId }: { contactId: string }) {
  const [, navigate] = useLocation();
  const { data: contacts = [] } = useQuery<Contact[]>({ queryKey: ["/api/contacts"] });
  const { data: deals = [] } = useQuery<{ id: string; name: string; stage: string; amount: number | null; contactIds: string[] }[]>({ queryKey: ["/api/deals"] });

  const contact = contacts.find((c) => c.id === contactId);

  const updateMutation = useMutation({
    mutationFn: ({ field, value }: { field: string; value: string }) =>
      apiRequest("PATCH", `/api/contacts/${contactId}`, { [field]: value }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/contacts"] }),
  });

  const relatedDeals = deals.filter((d) => d.contactIds?.includes(contactId));

  const KEY_INFO = [
    ["Phone Number", "phone", undefined],
    ["Contact Owner", "contactOwner", "contactOwner"],
    ["Next Steps", "nextSteps", "next_steps"],
    ["Lead Status", "leadStatus", "hs_lead_status"],
    ["Database Source", "dbSource", "database_source"],
    ["Relationship", "relationship", "relationship"],
    ["Relationship Strength", "relationshipStrength", "relationship_strength"],
    ["Region", "region", "region"],
    ["Asset Class", "assetClass", "asset_class"],
    ["Capital Type", "capitalType", "capital_type"],
    ["Investment Strategy", "investmentStrategy", "investment_strategy"],
    ["Institutional", "institutional", "institutional"],
    ["Family Office", "familyOffice", "family_office"],
    ["Retail", "retail", "retail"],
    ["Indirect", "indirect", "indirect"],
    ["Ownership", "ownership", "ownership"],
    ["TREP Capital Type", "trepCapitalType", "trep_capital_type__prior_outreach"],
    ["TREP Deal, Prior Outreach", "trepDealPriorOutreach", "trep_deal__prior_outreach"],
    ["Message", "message", "message"],
  ] as [string, string, string | undefined][];

  if (!contact) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p className="text-sm">Contact not found.</p>
      </div>
    );
  }

  const ACTIONS = [
    { icon: StickyNote, label: "Note" },
    { icon: Mail, label: "Email" },
    { icon: Phone, label: "Call" },
    { icon: ListChecks, label: "Task" },
    { icon: CalendarDays, label: "Meeting" },
    { icon: MoreHorizontal, label: "More" },
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Breadcrumb */}
      <div className="flex items-center px-4 py-2.5 border-b border-border bg-card shrink-0">
        <button
          onClick={() => navigate("/contacts")}
          className="text-sm text-primary hover:underline flex items-center gap-1"
          data-testid="button-back-contacts"
        >
          <ChevronLeft size={14} />Contacts
        </button>
        <span className="text-muted-foreground mx-2 text-sm">/</span>
        <span className="text-sm text-foreground font-medium truncate">{contact.name}</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL — Contact info */}
        <div className="w-72 border-r border-border overflow-y-auto shrink-0 bg-card">
          <div className="p-5 border-b border-border">
            <div className="flex items-center gap-3 mb-3">
              <ContactAvatar name={contact.name} size="lg" />
              <div>
                <h2 className="text-lg font-bold text-foreground leading-tight">{contact.name}</h2>
                {contact.company && (
                  <Link href={`/companies/${encodeURIComponent(contact.company)}`}>
                    <span className="text-xs text-primary hover:underline cursor-pointer">{contact.company}</span>
                  </Link>
                )}
              </div>
            </div>
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="text-sm text-primary hover:underline block truncate">
                {contact.email}<ExternalLink size={10} className="inline ml-1 opacity-60" />
              </a>
            )}
            {contact.phone && (
              <a href={`tel:${contact.phone}`} className="text-sm text-primary hover:underline block mt-0.5">{contact.phone}</a>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              {ACTIONS.map((a) => (
                <button
                  key={a.label}
                  data-testid={`action-${a.label.toLowerCase()}`}
                  className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary transition-colors"
                >
                  <div className="w-8 h-8 border border-border rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
                    <a.icon size={14} />
                  </div>
                  <span className="text-xs">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Key information */}
          <div className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Key information</h3>
            <div className="space-y-3.5">
              {KEY_INFO.map(([label, key, schemaKey]) => (
                <div key={label}>
                  <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
                  {schemaKey ? (
                    <EditableCell
                      value={(contact as Record<string, string>)[key] || ""}
                      onSave={(v) => updateMutation.mutate({ field: key, value: v })}
                      schemaKey={schemaKey}
                    />
                  ) : (
                    <div className="text-sm text-foreground">
                      {(contact as Record<string, string>)[key] || <span className="text-muted-foreground/50">—</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER — Activity timeline */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b border-border px-6 flex items-center shrink-0 bg-card">
            {["Activity", "Notes", "Emails", "Calls", "Tasks", "Meetings"].map((t, i) => (
              <button
                key={t}
                data-testid={`tab-${t.toLowerCase()}`}
                className={`px-4 py-3 text-sm border-b-2 transition-colors ${
                  i === 0
                    ? "border-primary text-foreground font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-8 bg-background">
            <div className="text-center text-muted-foreground">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <StickyNote size={20} className="text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium">No activity yet</p>
              <p className="text-xs text-muted-foreground mt-1">Log a call, send an email, or add a note to get started.</p>
            </div>
          </div>
        </div>

        {/* RIGHT — Associations */}
        <div className="w-64 border-l border-border overflow-y-auto shrink-0 p-4 space-y-5 bg-card">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground">Companies ({contact.company ? 1 : 0})</h3>
              <button className="text-xs text-primary">+ Add</button>
            </div>
            {contact.company && (
              <div className="border border-border rounded-lg p-3 bg-background">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 size={13} className="text-muted-foreground shrink-0" />
                  <Link href={`/companies/${encodeURIComponent(contact.company)}`}>
                    <span className="text-sm font-medium text-primary hover:underline cursor-pointer">{contact.company}</span>
                  </Link>
                </div>
                <Badge variant="secondary" className="text-xs">Primary</Badge>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground">Deals ({relatedDeals.length})</h3>
              <button className="text-xs text-primary">+ Add</button>
            </div>
            <div className="space-y-2">
              {relatedDeals.map((d) => (
                <div key={d.id} className="border border-border rounded-lg p-3 bg-background" data-testid={`related-deal-${d.id}`}>
                  <Link href="/deals">
                    <span className="text-sm font-medium text-primary hover:underline cursor-pointer block">{d.name}</span>
                  </Link>
                  <div className="text-xs text-muted-foreground mt-1">Stage: {d.stage}</div>
                  <div className="text-xs text-muted-foreground">
                    Amount: {d.amount ? `$${(d.amount / 1000000).toFixed(0)}M` : "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContactsPage() {
  const [, params] = useRoute("/contacts/:id");
  const contactId = params?.id;

  if (contactId) {
    return <ContactDetail contactId={contactId} />;
  }
  return <ContactsList />;
}
