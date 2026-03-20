import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Building2, LayoutDashboard, Users, Columns3, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/deals", label: "Deals", icon: Columns3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center shrink-0">
            <Building2 size={14} className="text-accent-foreground" />
          </div>
          <span className="text-sm font-semibold text-sidebar-foreground/90 tracking-wide">
            Timberline
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      data-testid={`nav-${item.label.toLowerCase()}`}
                    >
                      <Link href={item.href}>
                        <Icon size={16} strokeWidth={1.75} />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2.5 px-1">
          <Avatar className="w-7 h-7 shrink-0">
            <AvatarFallback className="bg-accent text-accent-foreground text-xs font-bold">
              KH
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="text-xs font-medium text-sidebar-foreground/90 truncate">
              Kyle Henrickson
            </div>
            <div className="text-xs text-sidebar-foreground/50 truncate">
              Super Admin
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
