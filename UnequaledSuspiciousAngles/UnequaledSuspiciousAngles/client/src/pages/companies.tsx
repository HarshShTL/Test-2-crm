import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation, Link } from "wouter";
import { type Contact, type Company } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Building2, ChevronLeft, ExternalLink, Users, Globe } from "lucide-react";

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

function ContactMini({ name }: { name: string }) {
  return (
    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ring-2 ring-card ${avatarColor(name)}`}>
      {getInitials(name)}
    </div>
  );
}

const COMPANY_LOGO_COLORS = [
  "bg-teal-500",
  "bg-blue-500",
  "bg-violet-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-cyan-500",
  "bg-emerald-500",
];

function companyLogoColor(name: string) {
  return COMPANY_LOGO_COLORS[(name?.charCodeAt(0) || 0) % COMPANY_LOGO_COLORS.length];
}

function CompaniesListPage() {
  const { data: contacts = [] } = useQuery<Contact[]>({ queryKey: ["/api/contacts"] });
  const { data: companies = [] } = useQuery<Company[]>({ queryKey: ["/api/companies"] });

  const firms = useMemo(() => {
    return companies.map((co) => ({
      ...co,
      contacts: contacts.filter((c) => c.company === co.name),
    })).filter((f) => f.contacts.length > 0 || f.name);
  }, [contacts, companies]);

  const FUND_TYPE_STYLES: Record<string, string> = {
    "Private Equity": "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
    "Hedge Fund": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    "Real Estate Investment Trust": "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
    "Family Office": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="border-b border-border bg-card px-5 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Building2 size={15} className="text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Companies</span>
          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold">{firms.length}</span>
        </div>
        <button className="text-xs bg-accent text-accent-foreground px-3 py-1.5 rounded-md font-medium" data-testid="button-add-company">
          + Add company
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-muted/80 z-10 backdrop-blur-sm">
            <tr className="border-b border-border">
              <th className="w-10 px-4 py-2.5" />
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company Name</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Domain</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Fund Type</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Industry</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contacts</th>
            </tr>
          </thead>
          <tbody>
            {firms.map((f) => (
              <tr
                key={f.id}
                className="border-b border-border/50 hover:bg-primary/5 cursor-pointer transition-colors group"
                data-testid={`company-row-${f.id}`}
              >
                <td className="px-4 py-3">
                  <div className={`w-7 h-7 rounded-md ${companyLogoColor(f.name)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {f.name.charAt(0)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/companies/${encodeURIComponent(f.name)}`}>
                    <span className="text-sm font-medium text-primary hover:underline cursor-pointer" data-testid={`link-company-${f.id}`}>
                      {f.name}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {f.domain ? (
                    <a href={`https://${f.domain}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {f.domain}<ExternalLink size={9} className="opacity-60" />
                    </a>
                  ) : <span className="text-sm text-muted-foreground/50">—</span>}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  {f.fundType ? (
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${FUND_TYPE_STYLES[f.fundType] || "bg-muted text-muted-foreground"}`}>
                      {f.fundType}
                    </span>
                  ) : <span className="text-sm text-muted-foreground/50">—</span>}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-sm text-muted-foreground">{f.industry || "—"}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <div className="flex -space-x-1.5">
                      {f.contacts.slice(0, 4).map((c) => (
                        <ContactMini key={c.id} name={c.name} />
                      ))}
                    </div>
                    {f.contacts.length > 0 && (
                      <span className="text-xs text-muted-foreground ml-2 font-medium">{f.contacts.length}</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {firms.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">
            <Building2 size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No companies found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CompanyDetailPage({ companyName }: { companyName: string }) {
  const [, navigate] = useLocation();
  const { data: contacts = [] } = useQuery<Contact[]>({ queryKey: ["/api/contacts"] });
  const { data: companies = [] } = useQuery<Company[]>({ queryKey: ["/api/companies"] });
  const { data: deals = [] } = useQuery<{ id: string; name: string; stage: string; amount: number | null; contactIds: string[] }[]>({ queryKey: ["/api/deals"] });

  const company = companies.find((c) => c.name === companyName);
  const companyContacts = contacts.filter((c) => c.company === companyName);

  const LEAD_STATUS_STYLES: Record<string, string> = {
    "Need to Call": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    "Had Call": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    "Left VM": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    "Sent Email": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center px-4 py-2.5 border-b border-border bg-card shrink-0">
        <button
          onClick={() => navigate("/companies")}
          className="text-sm text-primary hover:underline flex items-center gap-1"
          data-testid="button-back-companies"
        >
          <ChevronLeft size={14} />Companies
        </button>
        <span className="text-muted-foreground mx-2 text-sm">/</span>
        <span className="text-sm text-foreground font-medium truncate">{companyName}</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="w-72 border-r border-border p-5 overflow-y-auto shrink-0 bg-card">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-lg ${companyLogoColor(companyName)} flex items-center justify-center text-white text-xl font-bold shrink-0`}>
              {companyName.charAt(0)}
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground leading-tight">{companyName}</h2>
              {company?.domain && (
                <a href={`https://${company.domain}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5">
                  <Globe size={10} />{company.domain}
                </a>
              )}
            </div>
          </div>

          <div className="space-y-3.5">
            <InfoRow label="Fund Type" value={company?.fundType} />
            <InfoRow label="Industry" value={company?.industry} />
            <InfoRow
              label="Typical Check Size"
              value={company?.typicalCheckSize ? `$${company.typicalCheckSize.toLocaleString()}` : undefined}
            />
            <InfoRow label="Preferred Capital Types" value={company?.preferredCapitalTypes} />
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">Total Contacts</div>
              <div className="flex items-center gap-1.5">
                <Users size={13} className="text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">{companyContacts.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel — contacts table */}
        <div className="flex-1 overflow-y-auto bg-background">
          <div className="px-6 py-4">
            <h3 className="text-base font-semibold text-foreground mb-4">
              Contacts at {companyName}
            </h3>
            {companyContacts.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                <Users size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No contacts at this company yet.</p>
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase">Name</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase hidden sm:table-cell">Email</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">Phone</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase">Lead Status</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase hidden lg:table-cell">Capital Type</th>
                  </tr>
                </thead>
                <tbody>
                  {companyContacts.map((c) => (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-primary/5 transition-colors" data-testid={`company-contact-${c.id}`}>
                      <td className="px-3 py-2.5">
                        <Link href={`/contacts/${c.id}`}>
                          <div className="flex items-center gap-2 cursor-pointer">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${avatarColor(c.name)}`}>
                              {getInitials(c.name)}
                            </div>
                            <span className="text-sm font-medium text-primary hover:underline">{c.name}</span>
                          </div>
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 hidden sm:table-cell">
                        {c.email
                          ? <a href={`mailto:${c.email}`} className="text-sm text-primary hover:underline">{c.email}</a>
                          : <span className="text-sm text-muted-foreground/50">—</span>}
                      </td>
                      <td className="px-3 py-2.5 hidden md:table-cell">
                        {c.phone
                          ? <a href={`tel:${c.phone}`} className="text-sm text-primary hover:underline">{c.phone}</a>
                          : <span className="text-sm text-muted-foreground/50">—</span>}
                      </td>
                      <td className="px-3 py-2.5">
                        {c.leadStatus
                          ? <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${LEAD_STATUS_STYLES[c.leadStatus] || "bg-muted text-muted-foreground"}`}>{c.leadStatus}</span>
                          : <span className="text-sm text-muted-foreground/50">—</span>}
                      </td>
                      <td className="px-3 py-2.5 hidden lg:table-cell">
                        <span className="text-sm text-muted-foreground truncate max-w-xs block">{c.capitalType || "—"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
      <div className="text-sm text-foreground">{value || <span className="text-muted-foreground/50">—</span>}</div>
    </div>
  );
}

export default function CompaniesPage() {
  const [, params] = useRoute("/companies/:name");
  const companyName = params?.name ? decodeURIComponent(params.name) : null;

  if (companyName) {
    return <CompanyDetailPage companyName={companyName} />;
  }
  return <CompaniesListPage />;
}
