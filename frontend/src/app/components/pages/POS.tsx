import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
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
import {
  Search,
  Plus,
  Minus,
  X,
  ShoppingCart,
  Printer,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import type { User } from "@/app/App";
import { getProducts, createSale } from "@/app/lib/api";
import { ThermalReceipt } from "@/app/components/receipt/ThermalReceipt";
import { printToDefaultPrinter } from "@/app/lib/print";

interface POSProps {
  currentUser: User;
  storeInfo: { name: string; address: string; phone: string };
}

interface Product {
  id: string;
  name: string;
  sellingPrice: number;
  totalQty: number;
}

interface CartItem extends Product {
  quantity: number;
}

export function POS({ currentUser, storeInfo }: POSProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState("");
  const [receiptDateTime, setReceiptDateTime] = useState("");
  const [completedCart, setCompletedCart] = useState<CartItem[]>([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const isOwner = currentUser.role === "OWNER";

  // Fetch products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(
        data
          .filter((p) => p.isActive && p.totalQty > 0)
          .map((p) => ({
            id: p.id,
            name: p.name,
            sellingPrice:
              typeof p.sellingPrice === "string"
                ? parseFloat(p.sellingPrice)
                : p.sellingPrice,
            totalQty: p.totalQty,
          })),
      );
    } catch (error) {
      toast.error("Failed to load products");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      if (existingItem.quantity >= product.totalQty) {
        toast.error("Insufficient stock available");
        return;
      }
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      if (product.totalQty < 1) {
        toast.error("Product out of stock");
        return;
      }
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (newQuantity > product.totalQty) {
      toast.error("Insufficient stock available");
      return;
    }

    if (newQuantity <= 0) {
      setCart(cart.filter((item) => item.id !== productId));
    } else {
      setCart(
        cart.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item,
        ),
      );
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.sellingPrice * item.quantity,
    0,
  );
  const total = subtotal - discount;

  const completeSale = async (shouldPrint: boolean) => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setIsProcessing(true);

    try {
      const saleData = {
        items: cart.map((item) => ({
          productId: item.id,
          qty: item.quantity,
        })),
        paymentMethod,
      };

      const result = await createSale(saleData);
      const receiptDT = new Date().toLocaleString();

      setReceiptNumber(result.receiptNo);
      setReceiptDateTime(receiptDT);
      setCompletedCart([...cart]);
      setShowSuccess(true);

      // Print receipt if requested
      if (shouldPrint) {
        // Small delay to ensure state is updated
        setTimeout(async () => {
          if (receiptRef.current) {
            await printToDefaultPrinter(receiptRef.current);
            toast.success("Sale completed and receipt sent to printer!");
          }
        }, 100);
      } else {
        toast.success("Sale completed successfully!");
      }

      // Reload products to update stock
      await loadProducts();

      // Reset after showing success
      setTimeout(() => {
        setShowSuccess(false);
        setCart([]);
        setCompletedCart([]);
        setDiscount(0);
        setSearchQuery("");
      }, 2000);
    } catch (error) {
      toast.error("Failed to complete sale");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const viewReceipt = () => {
    setShowReceipt(true);
  };

  const handlePrintReceipt = async () => {
    if (receiptRef.current) {
      await printToDefaultPrinter(receiptRef.current);
      toast.success("Receipt sent to printer!");
    }
  };

  return (
    <div className="h-full flex bg-[var(--background)]">
      {/* Products Section */}
      <div className="flex-1 flex flex-col border-r border-[var(--border)]">
        <div className="p-6 border-b border-[var(--border)]">
          <h2 className="mb-4">Products</h2>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Products List */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products available</p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchQuery
                  ? "Try a different search term"
                  : "Add products to start selling"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((product) => (
                <motion.button
                  key={product.id}
                  whileHover={{ scale: 0.98 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => addToCart(product)}
                  className="bg-card border border-border rounded-lg p-4 text-left hover:border-primary transition-colors"
                >
                  <h4 className="mb-2 text-sm">{product.name}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-primary">
                      ₦{product.sellingPrice.toFixed(2)}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        product.totalQty > 50
                          ? "bg-green-50 text-green-600"
                          : product.totalQty > 0
                            ? "bg-yellow-50 text-yellow-600"
                            : "bg-red-50 text-red-600"
                      }`}
                    >
                      Stock: {product.totalQty}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96 flex flex-col bg-card border-l border-border">
        {/* Cart Items - Fixed height to show at least 3 items */}
        <div className="overflow-auto p-4 space-y-2 min-h-[300px]">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="bg-card border border-[var(--border)] rounded-lg p-3"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm flex-1 pr-2">{item.name}</h4>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-[var(--text-tertiary)] hover:text-[var(--error)] flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center border border-[var(--border)] rounded hover:bg-[var(--muted)] transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center border border-[var(--border)] rounded hover:bg-[var(--muted)] transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-sm font-semibold">
                    ₦{(item.sellingPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {cart.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-2" />
              <p className="text-[var(--text-secondary)]">Cart is empty</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                Add products to start a sale
              </p>
            </div>
          )}
        </div>

        {/* Summary & Checkout */}
        <div className="bg-card border-t border-[var(--border)] p-4 space-y-3">
          {/* Payment Method */}
          <div>
            <Label className="mb-1.5 block text-xs">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Transfer">Bank Transfer</SelectItem>
                <SelectItem value="POS">POS/Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Discount (Owner only) */}
          {isOwner && (
            <div>
              <Label htmlFor="discount" className="mb-1.5 block text-xs">
                Discount (₦)
              </Label>
              <Input
                id="discount"
                type="number"
                value={discount}
                onChange={(e) =>
                  setDiscount(Math.max(0, parseFloat(e.target.value) || 0))
                }
                placeholder="0.00"
                min="0"
                max={subtotal}
              />
            </div>
          )}

          {/* Totals */}
          <div className="space-y-1.5 pt-2 border-t border-[var(--border)]">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Subtotal:</span>
              <span className="font-medium">₦{subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Discount:</span>
                <span className="font-medium text-[var(--error)]">
                  -₦{discount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-1.5 border-t border-[var(--border)]">
              <span className="font-semibold">Total:</span>
              <span className="text-xl font-semibold text-[var(--primary)]">
                ₦{total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={() => completeSale(true)}
              disabled={cart.length === 0 || isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                "Processing..."
              ) : (
                <>
                  <Printer className="w-4 h-4 mr-2" />
                  Complete Sale & Print
                </>
              )}
            </Button>
            <Button
              onClick={() => completeSale(false)}
              disabled={cart.length === 0 || isProcessing}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Complete Sale (No Print)
            </Button>
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
            <h3 className="mb-2">Sale Completed!</h3>
            <p className="text-[var(--text-secondary)] mb-4">
              Receipt Number: {receiptNumber}
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={viewReceipt}>
                View Receipt
              </Button>
              <Button onClick={() => setShowSuccess(false)}>Close</Button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Receipt Preview Modal */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Receipt Preview</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center bg-gray-50 p-4 rounded">
            <ThermalReceipt
              ref={receiptRef}
              receiptNo={receiptNumber}
              dateTime={receiptDateTime}
              storeName={storeInfo.name}
              storeAddress={storeInfo.address}
              storePhone={storeInfo.phone}
              soldBy={currentUser.name}
              paymentMethod={paymentMethod}
              items={completedCart.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.sellingPrice,
                total: item.sellingPrice * item.quantity,
              }))}
              subtotal={completedCart.reduce(
                (sum, item) => sum + item.sellingPrice * item.quantity,
                0,
              )}
              discount={discount}
              total={
                completedCart.reduce(
                  (sum, item) => sum + item.sellingPrice * item.quantity,
                  0,
                ) - discount
              }
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrintReceipt}
              className="flex-1"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button onClick={() => setShowReceipt(false)} className="flex-1">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden receipt for direct printing */}
      <div style={{ position: "absolute", left: "-9999px" }}>
        <ThermalReceipt
          ref={receiptRef}
          receiptNo={receiptNumber}
          dateTime={receiptDateTime}
          storeName={storeInfo.name}
          storeAddress={storeInfo.address}
          storePhone={storeInfo.phone}
          soldBy={currentUser.name}
          paymentMethod={paymentMethod}
          items={completedCart.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.sellingPrice,
            total: item.sellingPrice * item.quantity,
          }))}
          subtotal={completedCart.reduce(
            (sum, item) => sum + item.sellingPrice * item.quantity,
            0,
          )}
          discount={discount}
          total={
            completedCart.reduce(
              (sum, item) => sum + item.sellingPrice * item.quantity,
              0,
            ) - discount
          }
        />
      </div>
    </div>
  );
}
