import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "@/app/components/ui/input";
import {
  Search,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import type { User } from "@/app/App";
import { getInventory } from "@/app/lib/api";

interface InventoryProps {
  currentUser: User;
  storeInfo: { name: string; address: string; phone: string };
}

interface Lot {
  id: string;
  lotRefNo: string;
  expiryDate: string;
  qtyRemaining: number;
  status?: "ok" | "expiring" | "expired";
}

interface InventoryItem {
  id: string;
  name: string;
  totalQty: number;
  reorderLevel: number | null;
  lots?: Lot[];
}

export function Inventory({ currentUser: _currentUser }: InventoryProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Load inventory on mount
  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await getInventory();
      setInventory(data);
    } catch (error) {
      console.error("Failed to load inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getExpiryStatus = (
    expiryDate: string,
  ): "ok" | "expiring" | "expired" => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.floor(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysUntilExpiry < 0) return "expired";
    if (daysUntilExpiry <= 30) return "expiring";
    return "ok";
  };

  const getNearestExpiry = (lots: Lot[] | undefined) => {
    if (!lots || lots.length === 0) return null;
    return lots.reduce((nearest, lot) => {
      return new Date(lot.expiryDate) < new Date(nearest.expiryDate)
        ? lot
        : nearest;
    }).expiryDate;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "expired":
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-[var(--error-light)] text-[var(--error)] rounded">
            Expired
          </span>
        );
      case "expiring":
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-[var(--warning-light)] text-[var(--warning)] rounded">
            Expiring Soon
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2">Inventory</h1>
        <p className="text-muted-foreground">
          View current stock levels and lot details
        </p>
      </div>

      {/* Search */}
      <div className="bg-card border border-border rounded-lg p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading inventory...</p>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No inventory records found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {searchQuery
                ? "Try a different search term"
                : "Stock in products to see inventory"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--table-header-bg)] border-b border-[var(--table-border)] sticky top-0">
                <tr>
                  <th className="w-10 px-4 py-3"></th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Product
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Total Qty
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Nearest Expiry
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Reorder Level
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className={`border-b border-[var(--table-border)] hover:bg-[var(--table-row-hover)] transition-colors cursor-pointer ${
                        expandedRows.has(item.id)
                          ? "bg-[var(--table-row-hover)]"
                          : ""
                      }`}
                      onClick={() => toggleRow(item.id)}
                    >
                      <td className="px-4 py-3">
                        <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                          {expandedRows.has(item.id) ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm">{item.name}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
                            item.reorderLevel != null &&
                            item.totalQty <= item.reorderLevel
                              ? "bg-[var(--error-light)] text-[var(--error)]"
                              : "bg-[var(--success-light)] text-[var(--success)]"
                          }`}
                        >
                          {item.totalQty}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        {getNearestExpiry(item.lots) || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-[var(--text-secondary)]">
                        {item.reorderLevel ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {item.reorderLevel != null &&
                            item.totalQty <= item.reorderLevel && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-[var(--warning-light)] text-[var(--warning)] rounded">
                                Low Stock
                              </span>
                            )}
                          {item.lots?.some(
                            (lot) =>
                              getExpiryStatus(lot.expiryDate) === "expired",
                          ) && (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-[var(--error-light)] text-[var(--error)] rounded">
                              Has Expired
                            </span>
                          )}
                          {item.lots?.some(
                            (lot) =>
                              getExpiryStatus(lot.expiryDate) === "expiring",
                          ) &&
                            !item.lots?.some(
                              (lot) =>
                                getExpiryStatus(lot.expiryDate) === "expired",
                            ) && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-[var(--warning-light)] text-[var(--warning)] rounded">
                                Expiring Soon
                              </span>
                            )}
                          {!item.lots?.some(
                            (lot) =>
                              getExpiryStatus(lot.expiryDate) === "expired" ||
                              getExpiryStatus(lot.expiryDate) === "expiring",
                          ) &&
                            !(
                              item.reorderLevel != null &&
                              item.totalQty <= item.reorderLevel
                            ) && (
                              <span className="text-xs text-[var(--text-secondary)]">
                                -
                              </span>
                            )}
                        </div>
                      </td>
                    </motion.tr>

                    {/* Expanded Row - Lots Details */}
                    <AnimatePresence>
                      {expandedRows.has(item.id) && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.15 }}
                          className="bg-[var(--muted)]"
                        >
                          <td colSpan={6} className="px-4 py-4">
                            <div className="ml-8">
                              <h4 className="text-sm mb-3 flex items-center gap-2">
                                <span>Stock Lots / Batches</span>
                                <span className="text-xs text-[var(--text-tertiary)]">
                                  ({item.lots?.length ?? 0} lot
                                  {(item.lots?.length ?? 0) !== 1 ? "s" : ""})
                                </span>
                              </h4>
                              <div className="bg-card border border-[var(--border)] rounded-lg overflow-hidden">
                                <table className="w-full">
                                  <thead className="bg-[var(--table-header-bg)]">
                                    <tr>
                                      <th className="text-left px-4 py-2 text-xs font-medium text-[var(--text-secondary)]">
                                        Lot Ref No
                                      </th>
                                      <th className="text-center px-4 py-2 text-xs font-medium text-[var(--text-secondary)]">
                                        Expiry Date
                                      </th>
                                      <th className="text-center px-4 py-2 text-xs font-medium text-[var(--text-secondary)]">
                                        Qty Remaining
                                      </th>
                                      <th className="text-center px-4 py-2 text-xs font-medium text-[var(--text-secondary)]">
                                        Status
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {item.lots && item.lots.length > 0 ? (
                                      item.lots.map((lot, lotIndex) => {
                                        const status = getExpiryStatus(
                                          lot.expiryDate,
                                        );
                                        return (
                                          <tr
                                            key={lot.id}
                                            className={`border-t border-border ${
                                              lotIndex === item.lots!.length - 1
                                                ? ""
                                                : ""
                                            }`}
                                          >
                                            <td className="px-4 py-2 text-xs font-medium">
                                              {lot.lotRefNo}
                                            </td>
                                            <td className="px-4 py-2 text-xs text-center">
                                              {lot.expiryDate}
                                            </td>
                                            <td className="px-4 py-2 text-xs text-center">
                                              {lot.qtyRemaining}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                              {getStatusBadge(status)}
                                            </td>
                                          </tr>
                                        );
                                      })
                                    ) : (
                                      <tr>
                                        <td
                                          colSpan={4}
                                          className="px-4 py-8 text-center text-sm text-[var(--text-secondary)]"
                                        >
                                          No stock lots available for this
                                          product
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-start gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-blue-500" />
          <span>Click on rows to expand and view lot details</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-600" />
          <span>"Expiring Soon" = within 30 days</span>
        </div>
      </div>
    </div>
  );
}
