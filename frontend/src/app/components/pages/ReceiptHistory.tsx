import { useState, useEffect, useRef } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Search, Eye, Printer } from "lucide-react";
import { toast } from "sonner";
import type { User } from "@/app/App";
import { getSales } from "@/app/lib/api";
import { useStore } from "@/app/contexts/StoreContext";
import { ThermalReceipt } from "@/app/components/receipt/ThermalReceipt";
import { printReceipt } from "@/app/lib/print";

interface ReceiptHistoryProps {
  currentUser: User;
}

interface Receipt {
  id: string;
  receiptNo: string;
  dateTime: string;
  soldBy: string;
  total: number;
  paymentMethod: string;
  items: Array<{ product: string; qty: number; price: number; total: number }>;
}

export function ReceiptHistory({
  currentUser: _currentUser,
}: ReceiptHistoryProps) {
  const { store } = useStore();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    try {
      setLoading(true);
      // Get only current user's sales
      const data = await getSales({});
      const formattedReceipts: Receipt[] = data.map((sale) => ({
        id: sale.id,
        receiptNo: sale.receiptNo,
        dateTime: new Date(sale.createdAt).toLocaleString(),
        soldBy: sale.soldBy.name,
        total:
          typeof sale.netTotal === "string"
            ? parseFloat(sale.netTotal)
            : sale.netTotal,
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
      setReceipts(formattedReceipts);
    } catch (error) {
      toast.error("Failed to load receipts");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReceipts = receipts.filter((receipt) =>
    receipt.receiptNo.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const viewDetails = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setShowDetails(true);
  };

  const reprintReceipt = async () => {
    if (!selectedReceipt || !receiptRef.current) return;
    try {
      printReceipt(receiptRef.current);
      toast.success("Receipt sent to printer!");
    } catch (error) {
      toast.error("Failed to reprint receipt");
      console.error(error);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="mb-2">My Receipts</h1>
        <p className="text-[var(--text-secondary)]">View your sales receipts</p>
      </div>

      <div className="bg-card border border-[var(--border)] rounded-lg p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by receipt number..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="bg-card border border-[var(--border)] rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Loading receipts...
              </p>
            </div>
          </div>
        ) : filteredReceipts.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-[var(--text-secondary)]">
              {searchQuery
                ? "No receipts found matching your search"
                : "No receipts found"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--table-header-bg)] border-b border-[var(--table-border)]">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Receipt No
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Date/Time
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
                {filteredReceipts.map((receipt, index) => (
                  <tr
                    key={receipt.id}
                    className={`border-b border-[var(--table-border)] hover:bg-[var(--table-row-hover)] transition-colors ${
                      index === filteredReceipts.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-medium">
                      {receipt.receiptNo}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                      {receipt.dateTime}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      ₦{receipt.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-[var(--muted)] text-[var(--text-secondary)] rounded">
                        {receipt.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewDetails(receipt)}
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

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Receipt Details</DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <div className="space-y-4">
              <div className="flex items-center justify-center bg-gray-50 p-4 rounded">
                <ThermalReceipt
                  ref={receiptRef}
                  receiptNo={selectedReceipt.receiptNo}
                  dateTime={selectedReceipt.dateTime}
                  storeName={store?.name || "Pharmacy"}
                  storeAddress={store?.address || "Store Address"}
                  storePhone={store?.phone || "Contact Number"}
                  soldBy={selectedReceipt.soldBy}
                  paymentMethod={selectedReceipt.paymentMethod}
                  items={selectedReceipt.items.map((item) => ({
                    name: item.product,
                    quantity: item.qty,
                    unitPrice: item.price,
                    total: item.total,
                  }))}
                  subtotal={selectedReceipt.items.reduce(
                    (sum, item) => sum + item.total,
                    0,
                  )}
                  discount={0}
                  total={selectedReceipt.total}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={reprintReceipt}
                  className="flex-1"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
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
