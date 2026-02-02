import { useState, useEffect } from "react";
import {
  ShoppingCart,
  DollarSign,
  Package,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import type { User } from "@/app/App";
import { getDashboardSummary, getLowStock } from "@/app/lib/api";
import { toast } from "sonner";

interface DashboardProps {
  currentUser: User;
  storeInfo: { name: string; address: string; phone: string };
}

type DashboardData = {
  todaysSales: {
    total: number;
    transactionCount: number;
    profit?: number;
    cost?: number;
  };
  recentTransactions: Array<{
    id: string;
    receiptNo: string;
    time: string;
    soldBy: string;
    total: number;
  }>;
  alerts: {
    lowStockCount: number;
    expiringCount: number;
    expiredCount: number;
  };
};

type LowStockItem = {
  id: string;
  name: string;
  totalQty: number;
  reorderLevel: number | null;
};

export function Dashboard({ currentUser }: DashboardProps) {
  const isOwner = currentUser.role === "OWNER";
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const summary = await getDashboardSummary();
        setDashboardData(summary);

        if (isOwner) {
          const lowStock = await getLowStock();
          setLowStockItems(lowStock);
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load dashboard data";
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isOwner]);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    // STAFF Dashboard
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="mb-2">Welcome back, {currentUser.name}</h1>
          <p className="text-[var(--text-secondary)]">
            Ready to serve customers
          </p>
        </div>

        {/* Quick Action */}
        <div className="bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] rounded-lg p-8 mb-6">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h2 className="text-2xl mb-2">Start a New Sale</h2>
              <p className="opacity-90">
                Process customer transactions quickly and efficiently
              </p>
            </div>
            <Button
              size="lg"
              className="bg-card text-[var(--primary)] hover:bg-gray-50"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              New Sale
            </Button>
          </div>
        </div>

        {/* Today's Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card border border-[var(--border)] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[var(--success-light)] rounded-md flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-[var(--success)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">
                  My Transactions Today
                </p>
                <p className="text-2xl font-semibold">
                  {dashboardData?.todaysSales.transactionCount ?? 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-[var(--border)] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[var(--info-light)] rounded-md flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[var(--info)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">
                  My Sales Today
                </p>
                <p className="text-2xl font-semibold">
                  ₦{dashboardData?.todaysSales.total.toLocaleString() ?? "0.00"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Receipts */}
        <div className="bg-card border border-[var(--border)] rounded-lg">
          <div className="p-4 border-b border-[var(--border)]">
            <h3>My Recent Receipts</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--table-header-bg)] border-b border-[var(--table-border)]">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Receipt No
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Time
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {dashboardData?.recentTransactions
                  .filter((t) => t.soldBy === currentUser.name)
                  .map((transaction, index) => (
                    <tr
                      key={transaction.id}
                      className={`border-b border-[var(--table-border)] hover:bg-[var(--table-row-hover)] cursor-pointer transition-colors ${
                        index ===
                        (dashboardData?.recentTransactions.filter(
                          (t) => t.soldBy === currentUser.name,
                        ).length ?? 0) -
                          1
                          ? "border-b-0"
                          : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-sm font-medium">
                        {transaction.receiptNo}
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                        {transaction.time}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        ₦{transaction.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // OWNER Dashboard
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="mb-2">Dashboard</h1>
        <p className="text-[var(--text-secondary)]">
          Overview of today's pharmacy operations
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-[var(--border)] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[var(--success-light)] rounded-md flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">
                Today's Sales
              </p>
              <p className="text-2xl font-semibold">
                ₦{dashboardData?.todaysSales.total.toLocaleString() ?? "0.00"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-[var(--border)] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[var(--info-light)] rounded-md flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-[var(--info)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">
                Transactions
              </p>
              <p className="text-2xl font-semibold">
                {dashboardData?.todaysSales.transactionCount ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-[var(--border)] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[var(--success-light)] rounded-md flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">
                Today's Profit
              </p>
              <p className="text-2xl font-semibold text-[var(--success)]">
                ₦{(dashboardData?.todaysSales.profit ?? 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-[var(--border)] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[var(--error-light)] rounded-md flex items-center justify-center">
              <Package className="w-5 h-5 text-[var(--error)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">
                Low Stock Items
              </p>
              <p className="text-2xl font-semibold">
                {dashboardData?.alerts.lowStockCount ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="mb-6 bg-[var(--warning-light)] border border-[var(--warning)] rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[var(--warning)] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="mb-2">Stock Alerts</h4>
            <div className="flex gap-4 text-sm">
              <span className="text-[var(--primary)]">
                Expiring stock ({dashboardData?.alerts.expiringCount ?? 0}{" "}
                items)
              </span>
              <span className="text-[var(--primary)]">
                Expired stock ({dashboardData?.alerts.expiredCount ?? 0} items)
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-card border border-[var(--border)] rounded-lg">
          <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
            <h3>Recent Transactions</h3>
            <Button variant="link" size="sm">
              View All
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--table-header-bg)] border-b border-[var(--table-border)]">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Receipt No
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Sold By
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {dashboardData?.recentTransactions.map((transaction, index) => (
                  <tr
                    key={transaction.id}
                    className={`border-b border-[var(--table-border)] hover:bg-[var(--table-row-hover)] cursor-pointer transition-colors ${
                      index ===
                      (dashboardData?.recentTransactions.length ?? 0) - 1
                        ? "border-b-0"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-medium">
                      {transaction.receiptNo}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                      {transaction.soldBy}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      ₦{transaction.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-card border border-[var(--border)] rounded-lg">
          <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
            <h3>Low Stock Items</h3>
            <Button variant="link" size="sm">
              View All
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--table-header-bg)] border-b border-[var(--table-border)]">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Product
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Stock
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Reorder Level
                  </th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((item, index) => (
                  <tr
                    key={item.name}
                    className={`border-b border-[var(--table-border)] hover:bg-[var(--table-row-hover)] transition-colors ${
                      index === lowStockItems.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-sm">{item.name}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-[var(--error-light)] text-[var(--error)] rounded">
                        {item.totalQty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-[var(--text-secondary)]">
                      {item.reorderLevel}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
