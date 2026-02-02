import { useState, useEffect } from "react";
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
import { Checkbox } from "@/app/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Separator } from "@/app/components/ui/separator";
import {
  Store,
  Printer,
  Database,
  AlertTriangle,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import type { User } from "@/app/App";
import {
  getStoreInfo,
  updateStoreInfo,
  runBackup,
  restoreBackup,
  generateExcelExport,
} from "@/app/lib/api";

interface SettingsProps {
  currentUser: User;
  onRefreshStoreInfo: () => Promise<void>;
}

export function Settings({
  currentUser: _currentUser,
  onRefreshStoreInfo,
}: SettingsProps) {
  const [storeData, setStoreData] = useState({
    name: "",
    address: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [printer, setPrinter] = useState("printer1");
  const [backupFolder, setBackupFolder] = useState("C:\\EliMed\\Backups");
  const [backupFilePath, setBackupFilePath] = useState("");
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [restoreInProgress, setRestoreInProgress] = useState(false);
  const [exportInProgress, setExportInProgress] = useState(false);

  useEffect(() => {
    loadStoreInfo();
  }, []);

  const loadStoreInfo = async () => {
    try {
      setLoading(true);
      const data = await getStoreInfo();
      setStoreData({
        name: data.name,
        address: data.address,
        phone: data.phone,
      });
      setBackupFolder(data.backupFolder || "C:\\EliMed\\Backups");
    } catch (error) {
      toast.error("Failed to load store information");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStore = async () => {
    try {
      setSaving(true);
      await updateStoreInfo({ ...storeData, backupFolder });
      await onRefreshStoreInfo();
      toast.success("Store information updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update store information");
    } finally {
      setSaving(false);
    }
  };

  const handleTestPrint = () => {
    toast.success("Test receipt printed successfully");
  };

  const handleBackupNow = async () => {
    try {
      setBackupInProgress(true);
      const result = await runBackup();
      toast.success(`Backup created successfully at: ${result.path}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create backup");
    } finally {
      setBackupInProgress(false);
    }
  };

  const handleRestoreBackup = async () => {
    if (!confirmRestore) {
      toast.error("Please confirm that you understand the restore process");
      return;
    }
    if (!backupFilePath.trim()) {
      toast.error("Please enter the backup file path");
      return;
    }
    try {
      setRestoreInProgress(true);
      await restoreBackup({ backupPath: backupFilePath, confirmation: true });
      toast.success(
        "Backup restored successfully. Please restart the application.",
      );
      setShowRestoreDialog(false);
      setConfirmRestore(false);
      setBackupFilePath("");
    } catch (error: any) {
      toast.error(error.message || "Failed to restore backup");
    } finally {
      setRestoreInProgress(false);
    }
  };

  const handleBrowseFolder = async () => {
    try {
      if (window.electron?.dialog) {
        const result = await window.electron.dialog.showOpenDialog({
          properties: ["openDirectory"],
          title: "Select Backup Folder",
        });
        if (!result.canceled && result.filePaths.length > 0) {
          setBackupFolder(result.filePaths[0]);
        }
      } else {
        toast.info("Folder browsing is only available in the desktop app");
      }
    } catch (error) {
      console.error("Failed to open folder dialog:", error);
      toast.error("Failed to open folder selector");
    }
  };

  const handleBrowseBackupFile = async () => {
    try {
      if (window.electron?.dialog) {
        const result = await window.electron.dialog.showOpenDialog({
          properties: ["openFile"],
          title: "Select Backup File",
          filters: [
            { name: "SQL Files", extensions: ["sql"] },
            { name: "All Files", extensions: ["*"] },
          ],
        });
        if (!result.canceled && result.filePaths.length > 0) {
          setBackupFilePath(result.filePaths[0]);
        }
      } else {
        toast.info("File browsing is only available in the desktop app");
      }
    } catch (error) {
      console.error("Failed to open file dialog:", error);
      toast.error("Failed to open file selector");
    }
  };

  // Excel Export Handlers
  const handleGenerateExcelExport = async () => {
    try {
      setExportInProgress(true);
      await generateExcelExport(backupFolder);
      toast.success(`Excel export created! File saved to ${backupFolder}`);
    } catch (error: any) {
      if (error.message === "authorization-required") {
        toast.error("Please log in again - your session may have expired");
      } else {
        toast.error(error.message || "Failed to generate Excel export");
      }
    } finally {
      setExportInProgress(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="mb-2">Settings</h1>
        <p className="text-[var(--text-secondary)]">
          Manage system settings and configurations
        </p>
      </div>

      <div className="space-y-6">
        {/* Store Information */}
        <div className="bg-card border border-[var(--border)] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Store className="w-5 h-5" />
            <h3>Store Information</h3>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            This information appears on printed receipts
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--primary)]"></div>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Loading...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="storeName">Store Name</Label>
                <Input
                  id="storeName"
                  value={storeData.name}
                  onChange={(e) =>
                    setStoreData({ ...storeData, name: e.target.value })
                  }
                  className="mt-1"
                  disabled={saving}
                />
              </div>
              <div>
                <Label htmlFor="storeAddress">Store Address</Label>
                <Input
                  id="storeAddress"
                  value={storeData.address}
                  onChange={(e) =>
                    setStoreData({ ...storeData, address: e.target.value })
                  }
                  className="mt-1"
                  disabled={saving}
                />
              </div>
              <div>
                <Label htmlFor="storePhone">Store Phone</Label>
                <Input
                  id="storePhone"
                  value={storeData.phone}
                  onChange={(e) =>
                    setStoreData({ ...storeData, phone: e.target.value })
                  }
                  className="mt-1"
                  disabled={saving}
                />
              </div>
              <Button onClick={handleSaveStore} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>

        <Separator />

        {/* Printer Settings */}
        <div className="bg-card border border-[var(--border)] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Printer className="w-5 h-5" />
            <h3>Printer Settings</h3>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Configure thermal receipt printer (80mm)
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="printer">Select Printer</Label>
              <Select value={printer} onValueChange={setPrinter}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="printer1">
                    Thermal Printer 80mm (USB001)
                  </SelectItem>
                  <SelectItem value="printer2">
                    EPSON TM-T20 (USB002)
                  </SelectItem>
                  <SelectItem value="printer3">
                    Star TSP100 (Network)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={handleTestPrint}>
              <Printer className="w-4 h-4 mr-2" />
              Test Print
            </Button>
          </div>
        </div>

        <Separator />

        {/* Backup Settings */}
        <div className="bg-card border border-[var(--border)] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5" />
            <h3>Backup & Export</h3>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Create SQL backups and generate Excel exports of your data
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="backupFolder">Backup & Export Folder Path</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="backupFolder"
                  value={backupFolder}
                  onChange={(e) => setBackupFolder(e.target.value)}
                  className="flex-1"
                  disabled={saving}
                />
                <Button
                  variant="outline"
                  onClick={handleBrowseFolder}
                  disabled={saving}
                >
                  Browse
                </Button>
                <Button onClick={handleSaveStore} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                SQL backups and Excel exports will be saved here. Auto-export
                runs daily at 11:00 PM.
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleBackupNow} disabled={backupInProgress}>
                <Database className="w-4 h-4 mr-2" />
                {backupInProgress ? "Creating Backup..." : "Backup Now"}
              </Button>
              <Button
                variant="outline"
                onClick={handleGenerateExcelExport}
                disabled={exportInProgress}
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                {exportInProgress ? "Generating..." : "Generate Excel Export"}
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* Danger Zone */}
        <div className="bg-[var(--error-light)] border border-[var(--error)] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-[var(--error)]" />
            <h3 className="text-[var(--error)]">Danger Zone</h3>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Destructive actions that cannot be undone
          </p>

          <div>
            <Button
              variant="destructive"
              onClick={() => setShowRestoreDialog(true)}
            >
              Restore from Backup
            </Button>
            <p className="text-xs text-[var(--text-tertiary)] mt-2">
              ⚠️ This will replace all current data with backup data
            </p>
          </div>
        </div>
      </div>

      {/* Restore Confirmation Dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Restore from Backup</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-[var(--warning-light)] border border-[var(--warning)] rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[var(--warning)] flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">
                    Warning: Data will be overwritten
                  </p>
                  <p className="text-[var(--text-secondary)]">
                    Restoring from a backup will replace ALL current data with
                    the backup data. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="backupFile">Backup File Path</Label>
              <div className="mt-1">
                <div className="flex gap-2">
                  <Input
                    id="backupFile"
                    placeholder="Enter full path to backup file (e.g., C:\\EliMed\\Backups\\backup.sql)"
                    value={backupFilePath}
                    onChange={(e) => setBackupFilePath(e.target.value)}
                    className="flex-1"
                    disabled={restoreInProgress}
                  />
                  <Button
                    variant="outline"
                    onClick={handleBrowseBackupFile}
                    disabled={restoreInProgress}
                  >
                    Browse
                  </Button>
                </div>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  Enter the complete path to the backup SQL file
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-[var(--muted)] rounded-lg">
              <Checkbox
                id="confirmRestore"
                checked={confirmRestore}
                onCheckedChange={(checked) =>
                  setConfirmRestore(checked as boolean)
                }
                disabled={restoreInProgress}
              />
              <label
                htmlFor="confirmRestore"
                className="text-sm cursor-pointer"
              >
                I understand that restoring from backup will replace all current
                data and this action cannot be undone.
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowRestoreDialog(false);
                setBackupFilePath("");
                setConfirmRestore(false);
              }}
              className="flex-1"
              disabled={restoreInProgress}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRestoreBackup}
              disabled={!confirmRestore || restoreInProgress}
              className="flex-1"
            >
              {restoreInProgress ? "Restoring..." : "Restore Backup"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
