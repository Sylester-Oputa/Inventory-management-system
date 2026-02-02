import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { AlertTriangle, AlertCircle, Calendar } from "lucide-react";
import type { User } from "@/app/App";
import { getExpiringLots, getExpiredLots } from "@/app/lib/api";

interface ExpiryReportsProps {
  currentUser: User;
}

interface ExpiringItem {
  id: string;
  product: string;
  lotRefNo: string;
  expiryDate: string;
  qtyRemaining: number;
  status: "expiring" | "expired";
  daysUntilExpiry: number;
}

export function ExpiryReports({
  currentUser: _currentUser,
}: ExpiryReportsProps) {
  const [daysFilter, setDaysFilter] = useState("30");
  const [expiringItems, setExpiringItems] = useState<ExpiringItem[]>([]);
  const [expiredItems, setExpiredItems] = useState<ExpiringItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [daysFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [expiring, expired] = await Promise.all([
        getExpiringLots({ daysAhead: parseInt(daysFilter) }),
        getExpiredLots(),
      ]);

      setExpiringItems(
        expiring.map((item) => ({
          id: item.id,
          product: item.product.name,
          lotRefNo: item.lotRefNo,
          expiryDate: item.expiryDate,
          qtyRemaining: item.qtyRemaining,
          status: "expiring" as const,
          daysUntilExpiry: item.daysUntilExpiry,
        })),
      );

      setExpiredItems(
        expired.map((item) => ({
          id: item.id,
          product: item.product.name,
          lotRefNo: item.lotRefNo,
          expiryDate: item.expiryDate,
          qtyRemaining: item.qtyRemaining,
          status: "expired" as const,
          daysUntilExpiry: -item.daysExpired,
        })),
      );
    } catch (error) {
      console.error("Failed to load expiry data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="mb-2">Expiry Reports</h1>
        <p className="text-[var(--text-secondary)]">
          Monitor expiring and expired stock lots
        </p>
      </div>

      {/* Alert Banner */}
      <div className="bg-[var(--warning-light)] border border-[var(--warning)] rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[var(--warning)] flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="mb-1">Stock Expiry Alert</h4>
            <p className="text-sm text-[var(--text-secondary)]">
              You have {expiringItems.length} lots expiring within {daysFilter}{" "}
              days and {expiredItems.length} expired lots with remaining stock.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="expiring" className="space-y-4">
        <TabsList>
          <TabsTrigger value="expiring">
            Expiring Soon ({expiringItems.length})
          </TabsTrigger>
          <TabsTrigger value="expired">
            Expired ({expiredItems.length})
          </TabsTrigger>
        </TabsList>

        {/* Expiring Soon Tab */}
        <TabsContent value="expiring">
          <div className="bg-card border border-[var(--border)] rounded-lg">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <h3>Expiring Stock</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--text-secondary)]">
                  Show items expiring within:
                </span>
                <Select value={daysFilter} onValueChange={setDaysFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
                <p className="text-[var(--text-secondary)]">Loading...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--table-header-bg)] border-b border-[var(--table-border)]">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                        Product
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                        Lot Ref No
                      </th>
                      <th className="text-center px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                        Expiry Date
                      </th>
                      <th className="text-center px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                        Qty Remaining
                      </th>
                      <th className="text-center px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                        Days Until Expiry
                      </th>
                      <th className="text-center px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {expiringItems.map((item, index) => (
                      <tr
                        key={item.lotRefNo}
                        className={`border-b border-[var(--table-border)] hover:bg-[var(--table-row-hover)] transition-colors ${
                          index === expiringItems.length - 1 ? "border-b-0" : ""
                        }`}
                      >
                        <td className="px-4 py-3 text-sm">{item.product}</td>
                        <td className="px-4 py-3 text-sm font-medium">
                          {item.lotRefNo}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          {item.expiryDate}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          {item.qtyRemaining}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
                              item.daysUntilExpiry <= 14
                                ? "bg-[var(--error-light)] text-[var(--error)]"
                                : "bg-[var(--warning-light)] text-[var(--warning)]"
                            }`}
                          >
                            {item.daysUntilExpiry} days
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-[var(--warning-light)] text-[var(--warning)] rounded">
                            Expiring Soon
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && expiringItems.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-2" />
                <p className="text-[var(--text-secondary)]">
                  No expiring lots found
                </p>
                <p className="text-sm text-[var(--text-tertiary)] mt-1">
                  No lots expiring within {daysFilter} days
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Expired Tab */}
        <TabsContent value="expired">
          <div className="bg-card border border-[var(--border)] rounded-lg">
            <div className="p-4 border-b border-[var(--border)]">
              <h3>Expired Stock</h3>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
                <p className="text-[var(--text-secondary)]">Loading...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--table-header-bg)] border-b border-[var(--table-border)]">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                        Product
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                        Lot Ref No
                      </th>
                      <th className="text-center px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                        Expiry Date
                      </th>
                      <th className="text-center px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                        Qty Remaining
                      </th>
                      <th className="text-center px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                        Days Expired
                      </th>
                      <th className="text-center px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {expiredItems.map((item, index) => (
                      <tr
                        key={item.id}
                        className={`border-b border-[var(--table-border)] hover:bg-[var(--table-row-hover)] transition-colors ${
                          index === expiredItems.length - 1 ? "border-b-0" : ""
                        }`}
                      >
                        <td className="px-4 py-3 text-sm">{item.product}</td>
                        <td className="px-4 py-3 text-sm font-medium">
                          {item.lotRefNo}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          {item.expiryDate}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          {item.qtyRemaining}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-[var(--error-light)] text-[var(--error)] rounded">
                            {Math.abs(item.daysUntilExpiry)} days ago
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-[var(--error-light)] text-[var(--error)] rounded">
                            Expired
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && expiredItems.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-2" />
                <p className="text-[var(--text-secondary)]">
                  No expired stock found
                </p>
                <p className="text-sm text-[var(--text-tertiary)] mt-1">
                  All lots are within expiry dates
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Info Box */}
      <div className="mt-6 bg-[var(--info-light)] border border-[var(--info)] rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[var(--info)] flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium mb-1">
              About FEFO (First Expiry First Out)
            </p>
            <p className="text-[var(--text-secondary)]">
              During sales, the system automatically allocates stock from lots
              with the earliest expiry dates first. No manual selection is
              required at the POS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
