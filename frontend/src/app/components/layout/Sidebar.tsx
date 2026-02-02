import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  PackagePlus,
  Warehouse,
  Receipt,
  FileText,
  Users,
  Settings as SettingsIcon,
  AlertTriangle,
} from "lucide-react";
import type { User } from "@/app/App";
import type { PageType } from "./MainLayout";

interface SidebarProps {
  currentUser: User;
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  storeName: string;
}

export function Sidebar({
  currentUser,
  currentPage,
  onNavigate,
  storeName,
}: SidebarProps) {
  const isOwner = currentUser.role === "OWNER";

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      allowStaff: true,
    },
    { id: "pos", label: "New Sale", icon: ShoppingCart, allowStaff: true },
    { id: "products", label: "Products", icon: Package, allowStaff: false },
    { id: "restock", label: "Restock", icon: PackagePlus, allowStaff: false },
    { id: "inventory", label: "Inventory", icon: Warehouse, allowStaff: true },
    {
      id: "sales-history",
      label: "Sales History",
      icon: FileText,
      allowStaff: false,
    },
    {
      id: "receipt-history",
      label: "My Receipts",
      icon: Receipt,
      allowStaff: true,
    },
    {
      id: "expiry-reports",
      label: "Expiry Reports",
      icon: AlertTriangle,
      allowStaff: false,
    },
    { id: "users", label: "User Management", icon: Users, allowStaff: false },
    {
      id: "settings",
      label: "Settings",
      icon: SettingsIcon,
      allowStaff: false,
    },
  ];

  const visibleItems = menuItems.filter((item) => isOwner || item.allowStaff);

  return (
    <aside className="w-64 bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-[var(--sidebar-border)]">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          {storeName || "EliMed"}
        </h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id as PageType)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                    isActive
                      ? "bg-[var(--sidebar-item-active)] text-[var(--sidebar-text-active)] font-medium"
                      : "text-[var(--sidebar-text)] hover:bg-[var(--sidebar-item-hover)]"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Role Badge */}
      <div className="p-4 border-t border-[var(--sidebar-border)]">
        <div className="px-3 py-2 bg-card border border-[var(--border)] rounded-md">
          <p className="text-xs text-[var(--text-tertiary)] mb-1">
            Logged in as
          </p>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {currentUser.name}
          </p>
          <span
            className={`inline-block text-xs px-2 py-0.5 rounded mt-1 ${
              isOwner
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--secondary)] text-[var(--text-secondary)]"
            }`}
          >
            {currentUser.role}
          </span>
        </div>
      </div>
    </aside>
  );
}
