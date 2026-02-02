import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Search, Filter, Eye, Printer } from "lucide-react";
import { toast } from "sonner";
import type { User } from "@/app/App";
import { getSales, reprintReceipt as reprintReceiptApi } from "@/app/lib/api";

interface SalesHistoryProps {
  currentUser: User;
}

interface Sale {
  id: string;
  receiptNo: string;
  dateTime: string;
  soldBy: string;
  total: number;
  profit: number;
  paymentMethod: string;
  items: Array<{ product: string; qty: number; price: number; total: number }>;
}

export function SalesHistory({ currentUser: _currentUser }: SalesHistoryProps) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("all");
  const [showDetails, setShowDetails] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch sales data on component mount
  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      const params: { startDate?: string; endDate?: string; staffId?: string } =
        {};
      if (dateFrom) params.startDate = dateFrom;
      if (dateTo) params.endDate = dateTo;
      if (selectedStaff !== "all") params.staffId = selectedStaff;

      const data = await getSales(params);
      const formattedSales: Sale[] = data.map((sale) => ({
        id: sale.id,
        receiptNo: sale.receiptNo,
        dateTime: new Date(sale.createdAt).toLocaleString(),
        soldBy: sale.soldBy.name,
        total:
          typeof sale.netTotal === "string"
            ? parseFloat(sale.netTotal)
            : sale.netTotal,
        profit:
          typeof sale.profit === "string"
            ? parseFloat(sale.profit)
            : sale.profit ?? 0,
        paymentMethod: sale.paymentMethod,
        items: sale.items.map((item) => ({
          product: item.productName,
          qty: item.quantity,
          price:
            typeof item.unitPrice === "string"
              ? parseFloat(item.unitPrice)
              : item.unitPrice,
          total:
            typeof item.subtotal === "string"
              ? parseFloat(item.subtotal)
              : item.subtotal,
        })),
      }));
      setSales(formattedSales);
    } catch (error) {
      toast.error("Failed to load sales history");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = sales.filter((sale) => {
    const matchesSearch = sale.receiptNo
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStaff =
      selectedStaff === "all" || sale.soldBy.includes(selectedStaff);
    return matchesSearch && matchesStaff;
  });

  const viewDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setShowDetails(true);
  };

  const reprintReceipt = async () => {
    if (!selectedSale) return;
    try {
      await reprintReceiptApi(selectedSale.id);
      toast.success("Receipt reprinted successfully");
    } catch (error) {
      toast.error("Failed to reprint receipt");
      console.error(error);
    }
  };

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalProfit = filteredSales.reduce(
    (sum, sale) => sum + (sale.profit ?? 0),
    0,
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2">Sales History</h1>
        <p className="text-[var(--text-secondary)]">
          View and filter all sales transactions
        </p>
      </div>

      {/* Filters Panel */}
      <div className="bg-card border border-[var(--border)] rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-4 gap-4 pt-4 border-t border-[var(--border)]"
          >
            <div>
              <Label htmlFor="dateFrom" className="text-xs">
                Date From
              </Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="dateTo" className="text-xs">
                Date To
              </Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="staff" className="text-xs">
                Sold By
              </Label>
              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="receipt" className="text-xs">
                Receipt No
              </Label>
              <Input
                id="receipt"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search receipt..."
                className="mt-1"
              />
            </div>
            <div className="col-span-4 flex justify-end gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                  setSelectedStaff("all");
                  setSearchQuery("");
                }}
              >
                Clear Filters
              </Button>
              <Button size="sm" onClick={loadSales}>
                Apply Filters
              </Button>
            </div>
          </motion.div>
        )}

        {/* Quick Search */}
        {!showFilters && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by receipt number..."
              className="pl-9"
            />
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-card border border-[var(--border)] rounded-lg p-4">
          <p className="text-xs text-[var(--text-tertiary)] mb-1">
            Total Transactions
          </p>
          <p className="text-2xl font-semibold">{filteredSales.length}</p>
        </div>
        <div className="bg-card border border-[var(--border)] rounded-lg p-4">
          <p className="text-xs text-[var(--text-tertiary)] mb-1">
            Total Sales Value
          </p>
          <p className="text-2xl font-semibold text-green-600">
            ₦{totalSales.toLocaleString()}
          </p>
        </div>
        <div className="bg-card border border-[var(--border)] rounded-lg p-4">
          <p className="text-xs text-[var(--text-tertiary)] mb-1">
            Total Profit
          </p>
          <p className="text-2xl font-semibold text-[var(--success)]">
            ₦{totalProfit.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-card border border-[var(--border)] rounded-lg overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
            <p className="text-[var(--text-secondary)]">Loading sales...</p>
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[var(--text-secondary)]">
              No sales records found
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Complete your first sale to see it here
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--table-header-bg)] border-b border-[var(--table-border)] sticky top-0">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Receipt No
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Date/Time
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Sold By
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Total
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Payment
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale, index) => (
                  <tr
                    key={sale.id}
                    className={`border-b border-[var(--table-border)] hover:bg-[var(--table-row-hover)] transition-colors ${
                      index === filteredSales.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-medium">
                      {sale.receiptNo}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                      {sale.dateTime}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                      {sale.soldBy}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      ₦{(sale.total ?? 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-[var(--muted)] text-[var(--text-secondary)] rounded">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewDetails(sale)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sale Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sale Details</DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 p-4 bg-[var(--muted)] rounded-lg">
                <div>
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">
                    Receipt No
                  </p>
                  <p className="font-semibold">{selectedSale.receiptNo}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">
                    Sold By
                  </p>
                  <p className="font-semibold">{selectedSale.soldBy}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">
                    Date/Time
                  </p>
                  <p className="font-semibold">{selectedSale.dateTime}</p>
                </div>
              </div>

              <div>
                <h4 className="mb-3">Items Sold</h4>
                <div className="border border-[var(--border)] rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[var(--table-header-bg)]">
                      <tr>
                        <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                          Product
                        </th>
                        <th className="text-center px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                          Qty
                        </th>
                        <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                          Unit Price
                        </th>
                        <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSale.items.map((item, index) => (
                        <tr
                          key={index}
                          className={`border-t border-[var(--table-border)] ${
                            index === selectedSale.items.length - 1 ? "" : ""
                          }`}
                        >
                          <td className="px-4 py-3 text-sm">{item.product}</td>
                          <td className="px-4 py-3 text-sm text-center">
                            {item.qty}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            ₦{item.price.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium">
                            ₦{item.total.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-[var(--muted)] border-t border-[var(--table-border)]">
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-3 text-sm font-semibold text-right"
                        >
                          TOTAL
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-[var(--primary)]">
                          ₦{selectedSale.total.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={reprintReceipt}
                  className="flex-1"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Reprint Receipt
                </Button>
                <Button
                  onClick={() => setShowDetails(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
