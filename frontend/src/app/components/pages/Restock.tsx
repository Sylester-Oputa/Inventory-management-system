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
import { Package, Calendar, CheckCircle2, Eye } from "lucide-react";
import { toast } from "sonner";
import type { User } from "@/app/App";
import { getProducts, createStockIn, getStockInHistory } from "@/app/lib/api";

interface RestockProps {
  currentUser: User;
  storeInfo: { name: string; address: string; phone: string };
}

interface RestockRecord {
  id: string;
  refNo: string;
  date: string;
  createdBy: string;
  itemCount: number;
  totalQty: number;
  earliestExpiry?: string;
  items?: Array<{
    productName: string;
    quantity: number;
    expiryDate: string;
  }>;
}

interface Product {
  id: string;
  name: string;
}

export function Restock({}: RestockProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedRefNo, setGeneratedRefNo] = useState("");
  const [history, setHistory] = useState<RestockRecord[]>([]);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<RestockRecord | null>(
    null,
  );

  useEffect(() => {
    loadProducts();
    loadHistory();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data.map((p) => ({ id: p.id, name: p.name })));
    } catch (error) {
      toast.error("Failed to load products");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const data = await getStockInHistory();
      const formattedHistory: RestockRecord[] = data.map((record: any) => ({
        id: record.id,
        refNo: record.refNo,
        date: new Date(record.createdAt).toLocaleString(),
        createdBy: record.createdBy.name,
        itemCount: record.items?.length || 0,
        totalQty:
          record.items?.reduce(
            (sum: number, item: any) => sum + item.qtyAdded,
            0,
          ) || 0,
        earliestExpiry: record.items?.reduce((earliest: string, item: any) => {
          const itemDate = new Date(item.expiryDate);
          const earliestDate = earliest ? new Date(earliest) : null;
          return !earliestDate || itemDate < earliestDate
            ? item.expiryDate
            : earliest;
        }, "" as string),
        items: record.items?.map((item: any) => ({
          productName: item.product.name,
          quantity: item.qtyAdded,
          expiryDate: item.expiryDate,
        })),
      }));
      setHistory(formattedHistory);
    } catch (error) {
      toast.error("Failed to load stock-in history");
      console.error(error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!selectedProduct) newErrors.product = "Please select a product";
    if (!quantity || parseInt(quantity) <= 0)
      newErrors.quantity = "Valid quantity is required";
    if (!unitCost || parseFloat(unitCost) <= 0)
      newErrors.unitCost = "Valid unit cost is required";
    if (!expiryDate) newErrors.expiryDate = "Expiry date is required";
    if (!supplierName.trim())
      newErrors.supplierName = "Supplier name is required";

    const expiry = new Date(expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (expiry <= today) {
      newErrors.expiryDate = "Expiry date must be in the future";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      const selectedProd = products.find((p) => p.id === selectedProduct);
      if (!selectedProd) {
        toast.error("Invalid product selected");
        setIsProcessing(false);
        return;
      }

      const result = await createStockIn({
        supplierName,
        items: [
          {
            productId: selectedProduct,
            qtyAdded: parseInt(quantity),
            unitCost: parseFloat(unitCost),
            expiryDate,
          },
        ],
      });

      setGeneratedRefNo(result.refNo);
      setShowSuccess(true);
      toast.success("Stock added successfully");

      // Reset form
      setSelectedProduct("");
      setQuantity("");
      setUnitCost("");
      setExpiryDate("");
      setSupplierName("");
      setNote("");
      setErrors({});

      // Reload history
      await loadHistory();
    } catch (error) {
      toast.error("Failed to add stock");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const viewDetails = (record: RestockRecord) => {
    setSelectedRecord(record);
    setShowDetailsDialog(true);
  };

  // Get minimum date for date picker (today)
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2">Restock Stock</h1>
        <p className="text-[var(--text-secondary)]">
          Add new stock to your inventory
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Restock Form */}
        <div className="bg-card border border-[var(--border)] rounded-lg p-6">
          <h3 className="mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Add Stock
          </h3>

          <div className="space-y-4">
            <div>
              <Label htmlFor="product">Product</Label>
              <Select
                value={selectedProduct}
                onValueChange={setSelectedProduct}
                disabled={loading}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue
                    placeholder={
                      loading ? "Loading products..." : "Select a product"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.product && (
                <p className="text-[var(--error)] text-xs mt-1">
                  {errors.product}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="supplierName">Supplier Name</Label>
              <Input
                id="supplierName"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="Enter supplier name"
                className="mt-1"
              />
              {errors.supplierName && (
                <p className="text-[var(--error)] text-xs mt-1">
                  {errors.supplierName}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="quantity">Quantity to Add</Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                min="1"
                className="mt-1"
              />
              {errors.quantity && (
                <p className="text-[var(--error)] text-xs mt-1">
                  {errors.quantity}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="unitCost">Unit Cost</Label>
              <Input
                id="unitCost"
                type="number"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                placeholder="Enter unit cost"
                min="0"
                step="0.01"
                className="mt-1"
              />
              {errors.unitCost && (
                <p className="text-[var(--error)] text-xs mt-1">
                  {errors.unitCost}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <div className="relative mt-1">
                <Input
                  id="expiryDate"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  min={today}
                  className="pr-10"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
              </div>
              {errors.expiryDate && (
                <p className="text-[var(--error)] text-xs mt-1">
                  {errors.expiryDate}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="note">Note (Optional)</Label>
              <Input
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add any notes about this restock"
                className="mt-1"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isProcessing}
              className="w-full mt-6"
            >
              {isProcessing ? "Processing..." : "Add Stock"}
            </Button>
          </div>
        </div>

        {/* Restock History */}
        <div className="bg-card border border-[var(--border)] rounded-lg">
          <div className="p-4 border-b border-[var(--border)]">
            <h3>Restock History</h3>
          </div>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-[var(--table-header-bg)] border-b border-[var(--table-border)] sticky top-0">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Ref No
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Date/Time
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Created By
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Items
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((record, index) => (
                  <tr
                    key={record.id}
                    className={`border-b border-[var(--table-border)] hover:bg-[var(--table-row-hover)] transition-colors ${
                      index === history.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-medium">
                      {record.refNo}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                      {record.date}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                      {record.createdBy}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      {record.totalQty}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewDetails(record)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="max-w-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="text-center py-6"
          >
            <div className="w-16 h-16 bg-[var(--success-light)] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-[var(--success)]" />
            </div>
            <h3 className="mb-2">Stock Added Successfully!</h3>
            <p className="text-[var(--text-secondary)] mb-1">
              Stock-In Reference Number:
            </p>
            <p className="text-lg font-semibold text-[var(--primary)] mb-4">
              {generatedRefNo}
            </p>
            <Button onClick={() => setShowSuccess(false)}>Close</Button>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Restock Details</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-[var(--muted)] rounded-lg">
                <div>
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">
                    Stock-In Ref No
                  </p>
                  <p className="font-semibold">{selectedRecord.refNo}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">
                    Date/Time
                  </p>
                  <p className="font-semibold">{selectedRecord.date}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">
                    Created By
                  </p>
                  <p className="font-semibold">{selectedRecord.createdBy}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">
                    Earliest Expiry
                  </p>
                  <p className="font-semibold">
                    {selectedRecord.earliestExpiry}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="mb-3">Items Added</h4>
                <div className="border border-[var(--border)] rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[var(--table-header-bg)]">
                      <tr>
                        <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                          Product
                        </th>
                        <th className="text-center px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                          Qty Added
                        </th>
                        <th className="text-center px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                          Expiry Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRecord.items &&
                      selectedRecord.items.length > 0 ? (
                        selectedRecord.items.map((item, index) => (
                          <tr
                            key={index}
                            className="border-t border-[var(--table-border)]"
                          >
                            <td className="px-4 py-3 text-sm">
                              {item.productName}
                            </td>
                            <td className="px-4 py-3 text-sm text-center">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 text-sm text-center">
                              {new Date(item.expiryDate).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="border-t border-[var(--table-border)]">
                          <td
                            colSpan={3}
                            className="px-4 py-3 text-sm text-center text-[var(--text-secondary)]"
                          >
                            No items available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <Button
                onClick={() => setShowDetailsDialog(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
