import { useQuery } from "@tanstack/react-query";
import { type Contact, type Deal, type Company } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, Columns3, BarChart3, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
  color,
  href,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  sub?: string;
  color: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="cursor-pointer hover-elevate transition-all" data-testid={`stat-card-${label.toLowerCase().replace(/\s+/g, '-')}`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground font-medium">{label}</p>
              <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
              {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
              <Icon size={18} />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Dashboard() {
  const { data: contacts = [] } = useQuery<Contact[]>({ queryKey: ["/api/contacts"] });
  const { data: deals = [] } = useQuery<Deal[]>({ queryKey: ["/api/deals"] });
  const { data: companies = [] } = useQuery<Company[]>({ queryKey: ["/api/companies"] });

  const activeDeals = deals.filter((d) => !["Closed", "Pass", "On Hold"].includes(d.stage));
  const totalValue = deals.reduce((sum, d) => sum + (d.amount || 0), 0);
  const needToCall = contacts.filter((c) => c.leadStatus === "Need to Call").length;

  const stageColors: Record<string, string> = {
    Overviews: "bg-muted text-muted-foreground",
    "Deal Review": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    "LOI Sent": "bg-primary/10 text-primary",
    Sourcing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Closed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    "On Hold": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    Pass: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  const stageCounts = deals.reduce((acc: Record<string, number>, d) => {
    acc[d.stage] = (acc[d.stage] || 0) + 1;
    return acc;
  }, {});

  const recentContacts = [...contacts]
    .filter((c) => c.lastActivityDate)
    .sort((a, b) => b.lastActivityDate.localeCompare(a.lastActivityDate))
    .slice(0, 5);

  function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  }

  const avatarColors = [
    "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400",
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
    "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
    "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400",
  ];

  function avatarColor(name: string) {
    return avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length];
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome back, Kyle. Here's what's happening.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Contacts"
            value={contacts.length}
            icon={Users}
            sub={`${needToCall} need to call`}
            color="bg-primary/10 text-primary"
            href="/contacts"
          />
          <StatCard
            label="Active Deals"
            value={activeDeals.length}
            icon={Columns3}
            sub={`of ${deals.length} total`}
            color="bg-accent/10 text-accent"
            href="/deals"
          />
          <StatCard
            label="Companies"
            value={companies.length}
            icon={Building2}
            sub="in your pipeline"
            color="bg-blue-500/10 text-blue-600 dark:text-blue-400"
            href="/companies"
          />
          <StatCard
            label="Pipeline Value"
            value={`$${(totalValue / 1000000).toFixed(0)}M`}
            icon={TrendingUp}
            sub="total deal value"
            color="bg-green-500/10 text-green-600 dark:text-green-400"
            href="/deals"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Columns3 size={16} className="text-muted-foreground" />
                Pipeline by Stage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {["Overviews", "Deal Review", "LOI Sent", "Sourcing", "Closed", "On Hold", "Pass"].map((stage) => {
                  const count = stageCounts[stage] || 0;
                  const stageDeals = deals.filter((d) => d.stage === stage);
                  const stageValue = stageDeals.reduce((s, d) => s + (d.amount || 0), 0);
                  return (
                    <div key={stage} className="flex items-center gap-3" data-testid={`pipeline-stage-${stage.toLowerCase().replace(/\s+/g, '-')}`}>
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium w-28 justify-center ${stageColors[stage]}`}>
                        {stage}
                      </span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary/60 rounded-full transition-all"
                          style={{ width: deals.length ? `${(count / deals.length) * 100}%` : "0%" }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-5 text-right">{count}</span>
                      {stageValue > 0 && (
                        <span className="text-xs text-muted-foreground w-14 text-right">
                          ${(stageValue / 1000000).toFixed(0)}M
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock size={16} className="text-muted-foreground" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentContacts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No recent activity yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {recentContacts.map((c) => (
                    <Link href={`/contacts/${c.id}`} key={c.id}>
                      <div className="flex items-center gap-3 py-1 cursor-pointer hover-elevate rounded-md px-2 -mx-2" data-testid={`activity-contact-${c.id}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${avatarColor(c.name)}`}>
                          {getInitials(c.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{c.company}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-muted-foreground">{c.lastActivityDate}</p>
                          {c.leadStatus && (
                            <Badge variant="secondary" className="text-xs mt-0.5">{c.leadStatus}</Badge>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BarChart3 size={16} className="text-muted-foreground" />
                Active Deals
              </CardTitle>
              <Link href="/deals">
                <span className="text-xs text-primary hover:underline cursor-pointer">View pipeline</span>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {activeDeals.length === 0 ? (
              <div className="py-12 text-center">
                <BarChart3 size={36} className="mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No active deals. Go add your first deal!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Deal</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stage</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Close Date</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">DD Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeDeals.map((d) => (
                      <tr key={d.id} className="border-b border-border/50 last:border-0" data-testid={`deal-row-${d.id}`}>
                        <td className="py-2.5 px-3">
                          <Link href="/deals">
                            <span className="text-sm font-medium text-primary hover:underline cursor-pointer">{d.name}</span>
                          </Link>
                          {d.location && <p className="text-xs text-muted-foreground">{d.location}</p>}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${stageColors[d.stage]}`}>
                            {d.stage}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-sm text-foreground">
                          {d.amount ? `$${(d.amount / 1000000).toFixed(0)}M` : "—"}
                        </td>
                        <td className="py-2.5 px-3 text-sm text-muted-foreground">{d.closeDate}</td>
                        <td className="py-2.5 px-3 hidden sm:table-cell">
                          {d.dueDiligenceStatus ? (
                            <div className="flex items-center gap-1">
                              <CheckCircle2 size={12} className={d.dueDiligenceStatus === "Completed" ? "text-green-500" : "text-muted-foreground"} />
                              <span className="text-xs text-muted-foreground">{d.dueDiligenceStatus}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
