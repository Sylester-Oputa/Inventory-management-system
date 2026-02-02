import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Switch } from "@/app/components/ui/switch";
import { Search, Plus, Edit } from "lucide-react";
import { toast } from "sonner";
import type { User } from "@/app/App";
import { getProducts, createProduct, updateProduct } from "@/app/lib/api";

interface ProductsProps {
  currentUser: User;
  storeInfo: { name: string; address: string; phone: string };
}

interface Product {
  id: string;
  name: string;
  sellingPrice: number;
  totalQty: number;
  reorderLevel: number | null;
  isActive: boolean;
}

export function Products({ currentUser }: ProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    reorderLevel: "",
    status: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const isOwner = currentUser.role === "OWNER";

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      // Convert string prices to numbers
      const productsWithNumbers = data.map((p) => ({
        ...p,
        sellingPrice:
          typeof p.sellingPrice === "string"
            ? parseFloat(p.sellingPrice)
            : p.sellingPrice,
      }));
      setProducts(productsWithNumbers);
    } catch (error) {
      toast.error("Failed to load products");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && p.isActive) ||
      (statusFilter === "inactive" && !p.isActive);
    return matchesSearch && matchesStatus;
  });

  const openAddDialog = () => {
    setEditingProduct(null);
    setFormData({ name: "", price: "", reorderLevel: "", status: true });
    setFormErrors({});
    setShowDialog(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.sellingPrice.toString(),
      reorderLevel: (product.reorderLevel || 0).toString(),
      status: product.isActive,
    });
    setFormErrors({});
    setShowDialog(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Product name is required";
    if (!formData.price || parseFloat(formData.price) <= 0)
      errors.price = "Valid price is required";
    if (formData.reorderLevel === "" || parseInt(formData.reorderLevel) < 0)
      errors.reorderLevel = "Valid reorder level is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const productData = {
      name: formData.name,
      sellingPrice: parseFloat(formData.price),
      reorderLevel: parseInt(formData.reorderLevel),
    };

    setIsSaving(true);

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          ...productData,
          isActive: formData.status,
        });
        toast.success("Product updated successfully");
      } else {
        await createProduct(productData);
        toast.success("Product added successfully");
      }

      await loadProducts();
      setShowDialog(false);
    } catch (error) {
      toast.error(`Failed to ${editingProduct ? "update" : "add"} product`);
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2">Products Management</h1>
        <p className="text-[var(--text-secondary)]">
          Manage your pharmacy inventory products
        </p>
      </div>

      {/* Filters & Actions */}
      <div className="bg-card border border-[var(--border)] rounded-lg p-4 mb-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="pl-9"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              All
            </Button>
            <Button
              variant={statusFilter === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("active")}
            >
              Active
            </Button>
            <Button
              variant={statusFilter === "inactive" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("inactive")}
            >
              Inactive
            </Button>
          </div>

          <Button onClick={openAddDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {searchQuery
                ? "Try a different search term"
                : "Add your first product to get started"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--table-header-bg)] border-b border-[var(--table-border)] sticky top-0">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Product Name
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Price
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Stock
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Reorder Level
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Status
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className={`border-b border-[var(--table-border)] hover:bg-[var(--table-row-hover)] transition-colors ${
                      index === filteredProducts.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-sm">{product.name}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      ₦{product.sellingPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
                          product.totalQty <= (product.reorderLevel || 0)
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-600"
                        }`}
                      >
                        {product.totalQty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-muted-foreground">
                      {product.reorderLevel || "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
                          product.isActive
                            ? "bg-green-50 text-green-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(product)}
                        disabled={!isOwner}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Paracetamol 500mg"
                className="mt-1"
              />
              {formErrors.name && (
                <p className="text-[var(--error)] text-xs mt-1">
                  {formErrors.name}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="price">Selling Price (₦)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="0.00"
                step="0.01"
                min="0"
                className="mt-1"
              />
              {formErrors.price && (
                <p className="text-[var(--error)] text-xs mt-1">
                  {formErrors.price}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="reorderLevel">Reorder Level</Label>
              <Input
                id="reorderLevel"
                type="number"
                value={formData.reorderLevel}
                onChange={(e) =>
                  setFormData({ ...formData, reorderLevel: e.target.value })
                }
                placeholder="e.g., 50"
                min="0"
                className="mt-1"
              />
              {formErrors.reorderLevel && (
                <p className="text-[var(--error)] text-xs mt-1">
                  {formErrors.reorderLevel}
                </p>
              )}
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                Alert when stock falls below this level
              </p>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="status">Active Status</Label>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  Inactive products won't appear in POS
                </p>
              </div>
              <Switch
                id="status"
                checked={formData.status}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, status: checked })
                }
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              className="flex-1"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : editingProduct ? "Update" : "Add"}{" "}
              Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
