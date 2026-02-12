import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, FolderOpen, PenLine, LogOut, Plus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const navItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Posts", url: "/admin/posts", icon: FileText },
  { title: "New Post", url: "/admin/posts/new", icon: Plus },
  { title: "Categories", url: "/admin/categories", icon: FolderOpen },
];

export function AdminSidebar() {
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <PenLine className="h-5 w-5 text-sidebar-primary" />
        <span className="font-display text-lg font-bold text-sidebar-foreground">Inkwell</span>
        <span className="ml-1 rounded bg-sidebar-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-sidebar-primary">
          ADMIN
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const active = location.pathname === item.url;
          return (
            <Link
              key={item.url}
              to={item.url}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
