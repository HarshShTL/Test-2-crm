import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Users, Shield, Database, Bell } from "lucide-react";

const USERS = [
  { name: "Kyle Henrickson", email: "kyle@timberline.com", role: "Super Admin", initials: "KH", color: "bg-accent text-accent-foreground" },
  { name: "Harsh Sharma", email: "harsh@timberline.com", role: "Manager", initials: "HS", color: "bg-primary text-primary-foreground" },
  { name: "Emily Park", email: "emily@timberline.com", role: "Associate", initials: "EP", color: "bg-violet-500 text-white" },
];

const ROLE_STYLES: Record<string, string> = {
  "Super Admin": "bg-accent/10 text-accent",
  Manager: "bg-primary/10 text-primary",
  Associate: "bg-muted text-muted-foreground",
};

export default function SettingsPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-background p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your workspace configuration and team.</p>
        </div>

        <div className="space-y-5">
          {/* Team */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Users size={16} className="text-muted-foreground" />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {USERS.map((u) => (
                  <div key={u.name} className="flex items-center gap-3" data-testid={`user-row-${u.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${u.color}`}>
                      {u.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${ROLE_STYLES[u.role]}`}>
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
              <button className="mt-4 text-sm text-primary hover:underline flex items-center gap-1" data-testid="button-invite-user">
                + Invite team member
              </button>
            </CardContent>
          </Card>

          {/* CRM Integration */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Database size={16} className="text-muted-foreground" />
                Data Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "HubSpot CRM", status: "Connected", note: "Primary data source for contacts and companies" },
                  { name: "TREP Database", status: "Connected", note: "External deal pipeline data" },
                  { name: "KH Database", status: "Connected", note: "Kyle Henrickson's contact list" },
                ].map((src) => (
                  <div key={src.name} className="flex items-start gap-3 p-3 bg-muted rounded-lg" data-testid={`datasource-${src.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{src.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{src.note}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">{src.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Shield size={16} className="text-muted-foreground" />
                Permissions & Roles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { role: "Super Admin", perms: "Full access to all data, settings, and user management" },
                  { role: "Manager", perms: "Can view and edit contacts, companies, and deals. Cannot manage users." },
                  { role: "Associate", perms: "Read-only access to contacts and companies. Can log activities." },
                ].map((r) => (
                  <div key={r.role} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium mt-0.5 shrink-0 ${ROLE_STYLES[r.role]}`}>
                      {r.role}
                    </span>
                    <p className="text-xs text-muted-foreground">{r.perms}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Bell size={16} className="text-muted-foreground" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Notification settings will be available in a future update.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
