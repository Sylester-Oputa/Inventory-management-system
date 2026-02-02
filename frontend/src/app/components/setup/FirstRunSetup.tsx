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
  CheckCircle2,
  Store,
  Printer,
  Database,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  Sun,
  Moon,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/app/contexts/ThemeContext";
import {
  exportBackup,
  login,
  runBackup,
  setAuthToken,
  setBackupDir,
  setupOwner,
  updateStoreInfo,
} from "@/app/lib/api";
import { getPrinters, savePrinter } from "@/app/lib/print";

interface SetupData {
  ownerName: string;
  ownerUsername: string;
  ownerPassword: string;
  ownerPasswordConfirm: string;
  storeName: string;
  storeAddress: string;
  storePhone: string;
  printer: string;
  backupFolder: string;
}

interface FirstRunSetupProps {
  onComplete: (storeInfo: {
    storeName: string;
    storeAddress: string;
    storePhone: string;
  }) => void;
}

export function FirstRunSetup({ onComplete }: FirstRunSetupProps) {
  const { theme, toggleTheme } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<SetupData>({
    ownerName: "",
    ownerUsername: "",
    ownerPassword: "",
    ownerPasswordConfirm: "",
    storeName: "",
    storeAddress: "",
    storePhone: "",
    printer: "",
    backupFolder: "",
  });

  const [errors, setErrors] = useState<Partial<SetupData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBrowsing, setIsBrowsing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [loadingPrinters, setLoadingPrinters] = useState(false);

  // Load printers when reaching printer setup step
  useEffect(() => {
    if (currentStep === 3 && printers.length === 0) {
      loadPrinters();
    }
  }, [currentStep]);

  const loadPrinters = async () => {
    setLoadingPrinters(true);
    try {
      const availablePrinters = await getPrinters();
      setPrinters(availablePrinters);

      // Auto-select default printer if available
      const defaultPrinter = availablePrinters.find((p) => p.isDefault);
      if (defaultPrinter && !data.printer) {
        setData({ ...data, printer: defaultPrinter.name });
      }
    } catch (error) {
      console.error("Failed to load printers:", error);
      toast.error("Could not load printers. Make sure a printer is installed.");
    } finally {
      setLoadingPrinters(false);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<SetupData> = {};

    if (step === 1) {
      if (!data.ownerName.trim()) newErrors.ownerName = "Name is required";
      if (!data.ownerUsername.trim())
        newErrors.ownerUsername = "Username is required";
      if (data.ownerUsername.length < 3)
        newErrors.ownerUsername = "Username must be at least 3 characters";
      if (!data.ownerPassword) newErrors.ownerPassword = "Password is required";
      if (data.ownerPassword.length < 8)
        newErrors.ownerPassword = "Password must be at least 8 characters";
      if (data.ownerPassword !== data.ownerPasswordConfirm) {
        newErrors.ownerPasswordConfirm = "Passwords do not match";
      }
    }

    if (step === 2) {
      if (!data.storeName.trim())
        newErrors.storeName = "Store name is required";
      if (!data.storeAddress.trim())
        newErrors.storeAddress = "Store address is required";
      if (!data.storePhone.trim())
        newErrors.storePhone = "Store phone is required";
    }

    // Step 3: Printer is optional
    if (step === 3) {
      // Printer is optional, no validation needed
    }

    if (step === 4) {
      if (!data.backupFolder.trim())
        newErrors.backupFolder = "Backup folder is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    if (!validateStep(4)) {
      return;
    }

    setIsSubmitting(true);

    // DEBUG: Log the exact values being sent
    console.log("=== SIGNUP DEBUG ===");
    console.log("Name:", data.ownerName);
    console.log("Username:", data.ownerUsername);
    console.log("Password:", data.ownerPassword);
    console.log("Password length:", data.ownerPassword.length);
    console.log("Trimmed name:", data.ownerName.trim());
    console.log("Trimmed username:", data.ownerUsername.trim());
    console.log("===================");

    try {
      const ownerResult = await setupOwner({
        name: data.ownerName.trim(),
        username: data.ownerUsername.trim(),
        password: data.ownerPassword,
      });

      // Store recovery code to display to user
      if ((ownerResult as any).recoveryCode) {
        setRecoveryCode((ownerResult as any).recoveryCode);
        // Move to final step to show recovery code
        setCurrentStep(5);
        return;
      }

      const auth = await login({
        username: data.ownerUsername.trim(),
        password: data.ownerPassword,
      });

      setAuthToken(auth.token);

      // Save store information to database
      await updateStoreInfo({
        name: data.storeName.trim(),
        address: data.storeAddress.trim(),
        phone: data.storePhone.trim(),
        backupFolder: data.backupFolder.trim() || "C:\\EliMed\\Backups",
      });

      if (data.backupFolder.trim()) {
        setBackupDir(data.backupFolder.trim());
        try {
          const backup = await runBackup();
          await exportBackup({
            targetPath: data.backupFolder.trim(),
            sourcePath: backup.path,
          });
        } catch (backupError) {
          const message =
            backupError instanceof Error
              ? backupError.message
              : "Backup failed. Please verify Postgres tools and folder permissions.";
          toast.error(message);
        }
      }

      // Save printer preference
      if (data.printer) {
        savePrinter(data.printer);
        console.log("Saved default printer:", data.printer);
      }

      toast.success("Setup completed successfully");
      setTimeout(() => {
        onComplete({
          storeName: data.storeName,
          storeAddress: data.storeAddress,
          storePhone: data.storePhone,
        });
      }, 600);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Setup failed. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBrowse = async () => {
    if (!window.electron?.dialog) {
      toast.error(
        "Folder picker is unavailable. Please type the path manually.",
      );
      return;
    }
    setIsBrowsing(true);
    try {
      const result = await window.electron.dialog.showOpenDialog({
        properties: ["openDirectory"],
        title: "Select Backup Folder",
      });
      if (!result.canceled && result.filePaths.length > 0) {
        setData({ ...data, backupFolder: result.filePaths[0] });
        setErrors((prev) => ({ ...prev, backupFolder: undefined }));
      }
    } catch (error) {
      console.error("Folder picker error:", error);
      toast.error("Unable to open folder picker.");
    } finally {
      setIsBrowsing(false);
    }
  };

  const handleTestPrint = () => {
    toast.success("Test receipt printed successfully");
  };

  const steps = [
    { number: 1, title: "Owner Account", icon: Store },
    { number: 2, title: "Store Information", icon: Store },
    { number: 3, title: "Printer Setup", icon: Printer },
    { number: 4, title: "Backup Settings", icon: Database },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-8">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 p-3 rounded-lg bg-card border border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? (
          <Sun className="w-5 h-5 text-[var(--text-primary)]" />
        ) : (
          <Moon className="w-5 h-5 text-[var(--text-primary)]" />
        )}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-card border border-[var(--border)] rounded-lg p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl mb-2">Setup Your Pharmacy System</h1>
            <p className="text-[var(--text-secondary)] text-sm">
              Complete the setup wizard to get started with your pharmacy
              management system
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2 transition-colors ${
                      currentStep === step.number
                        ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                        : currentStep > step.number
                          ? "border-[var(--success)] bg-[var(--success)] text-white"
                          : "border-[var(--border)] bg-card text-[var(--text-tertiary)]"
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={`text-xs text-center ${
                      currentStep >= step.number
                        ? "text-[var(--text-primary)]"
                        : "text-[var(--text-tertiary)]"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-[2px] flex-1 mx-2 mt-[-20px] ${
                      currentStep > step.number
                        ? "bg-[var(--success)]"
                        : "bg-[var(--border)]"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
            className="mb-8"
          >
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="mb-4">Create Owner Account</h3>
                <div>
                  <Label htmlFor="ownerName">Full Name</Label>
                  <Input
                    id="ownerName"
                    value={data.ownerName}
                    onChange={(e) =>
                      setData({ ...data, ownerName: e.target.value })
                    }
                    className="mt-1"
                    placeholder="Enter your full name"
                  />
                  {errors.ownerName && (
                    <p className="text-[var(--error)] text-xs mt-1">
                      {errors.ownerName}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="ownerUsername">Username</Label>
                  <Input
                    id="ownerUsername"
                    value={data.ownerUsername}
                    onChange={(e) =>
                      setData({ ...data, ownerUsername: e.target.value })
                    }
                    className="mt-1"
                    placeholder="Choose a username"
                  />
                  {errors.ownerUsername && (
                    <p className="text-[var(--error)] text-xs mt-1">
                      {errors.ownerUsername}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="ownerPassword">Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="ownerPassword"
                      type={showPassword ? "text" : "password"}
                      value={data.ownerPassword}
                      onChange={(e) =>
                        setData({ ...data, ownerPassword: e.target.value })
                      }
                      placeholder="Enter password (min. 8 characters)"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.ownerPassword && (
                    <p className="text-[var(--error)] text-xs mt-1">
                      {errors.ownerPassword}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="ownerPasswordConfirm">Confirm Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="ownerPasswordConfirm"
                      type={showConfirmPassword ? "text" : "password"}
                      value={data.ownerPasswordConfirm}
                      onChange={(e) =>
                        setData({
                          ...data,
                          ownerPasswordConfirm: e.target.value,
                        })
                      }
                      placeholder="Re-enter password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.ownerPasswordConfirm && (
                    <p className="text-[var(--error)] text-xs mt-1">
                      {errors.ownerPasswordConfirm}
                    </p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="mb-4">Store Information</h3>
                <p className="text-[var(--text-secondary)] text-sm mb-4">
                  This information will appear on printed receipts
                </p>
                <div>
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    value={data.storeName}
                    onChange={(e) =>
                      setData({ ...data, storeName: e.target.value })
                    }
                    className="mt-1"
                    placeholder="e.g., EliMed Pharmacy"
                  />
                  {errors.storeName && (
                    <p className="text-[var(--error)] text-xs mt-1">
                      {errors.storeName}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="storeAddress">Store Address</Label>
                  <Input
                    id="storeAddress"
                    value={data.storeAddress}
                    onChange={(e) =>
                      setData({ ...data, storeAddress: e.target.value })
                    }
                    className="mt-1"
                    placeholder="Enter full address"
                  />
                  {errors.storeAddress && (
                    <p className="text-[var(--error)] text-xs mt-1">
                      {errors.storeAddress}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="storePhone">Store Phone</Label>
                  <Input
                    id="storePhone"
                    value={data.storePhone}
                    onChange={(e) =>
                      setData({ ...data, storePhone: e.target.value })
                    }
                    className="mt-1"
                    placeholder="Enter phone number"
                  />
                  {errors.storePhone && (
                    <p className="text-[var(--error)] text-xs mt-1">
                      {errors.storePhone}
                    </p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="mb-4">Printer Setup</h3>
                <p className="text-[var(--text-secondary)] text-sm mb-4">
                  Select the thermal printer for receipts (80mm)
                </p>
                <div>
                  <Label htmlFor="printer">Select Printer</Label>
                  <Select
                    value={data.printer}
                    onValueChange={(value) =>
                      setData({ ...data, printer: value })
                    }
                    disabled={loadingPrinters}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue
                        placeholder={
                          loadingPrinters
                            ? "Loading printers..."
                            : "Choose a printer"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {printers.length === 0 && !loadingPrinters && (
                        <SelectItem value="none" disabled>
                          No printers found
                        </SelectItem>
                      )}
                      {printers.map((printer) => (
                        <SelectItem key={printer.name} value={printer.name}>
                          {printer.displayName || printer.name}
                          {printer.isDefault && " (Default)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.printer && (
                    <p className="text-[var(--error)] text-xs mt-1">
                      {errors.printer}
                    </p>
                  )}
                  {printers.length === 0 && !loadingPrinters && (
                    <p className="text-[var(--text-secondary)] text-xs mt-2">
                      💡 No printers detected. You can skip this and configure
                      it later in Settings.
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {data.printer && (
                    <Button
                      variant="outline"
                      onClick={handleTestPrint}
                      className="flex-1"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Test Print
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={loadPrinters}
                    disabled={loadingPrinters}
                    className="flex-1"
                  >
                    {loadingPrinters ? "Loading..." : "Refresh Printers"}
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="mb-4">Backup Settings</h3>
                <p className="text-[var(--text-secondary)] text-sm mb-4">
                  Choose where to store automatic database backups
                </p>
                <div>
                  <Label htmlFor="backupFolder">Backup Folder Path</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="backupFolder"
                      value={data.backupFolder}
                      onChange={(e) =>
                        setData({ ...data, backupFolder: e.target.value })
                      }
                      placeholder="C:\EliMed\Backups"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={handleBrowse}
                      disabled={isBrowsing}
                    >
                      {isBrowsing ? "Opening..." : "Browse"}
                    </Button>
                  </div>
                  {errors.backupFolder && (
                    <p className="text-[var(--error)] text-xs mt-1">
                      {errors.backupFolder}
                    </p>
                  )}
                </div>
                <div className="bg-[var(--info-light)] border border-[var(--info)] rounded-md p-3 mt-4">
                  <p className="text-sm text-[var(--text-primary)]">
                    💡 Backups will be created automatically every day at
                    midnight
                  </p>
                </div>
              </div>
            )}

            {currentStep === 5 && recoveryCode && (
              <div className="space-y-6">
                <h3 className="mb-4">⚠️ Important: Recovery Code</h3>

                <div className="bg-[var(--warning-light)] border-2 border-[var(--warning)] rounded-lg p-6">
                  <p className="text-sm text-[var(--text-primary)] mb-4 font-semibold">
                    Write down this recovery code and keep it safe. You'll need
                    it to reset your password if you forget it.
                  </p>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
                    <p className="text-xs text-[var(--text-secondary)] mb-2">
                      Your Recovery Code:
                    </p>
                    <p className="text-4xl font-mono font-bold text-center text-[var(--primary)] tracking-wider">
                      {recoveryCode}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm text-[var(--text-primary)]">
                    <p>✓ Save this code in a secure location</p>
                    <p>✓ Take a photo or write it down on paper</p>
                    <p>✓ Do not share this code with anyone</p>
                    <p className="text-[var(--error)] font-semibold mt-3">
                      ⚠️ This is the ONLY time you'll see this code!
                    </p>
                  </div>
                </div>

                <div className="bg-[var(--info-light)] border border-[var(--info)] rounded-md p-3">
                  <p className="text-sm text-[var(--text-primary)]">
                    💡 Since this system is completely offline, this recovery
                    code is your only way to reset the owner password if
                    forgotten.
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Actions */}
          <div className="flex justify-between pt-6 border-t border-[var(--border)]">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || currentStep === 5}
              className="min-w-[100px]"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            {currentStep === 5 ? (
              <Button
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    const auth = await login({
                      username: data.ownerUsername.trim(),
                      password: data.ownerPassword,
                    });

                    setAuthToken(auth.token);

                    // Save store information to database
                    await updateStoreInfo({
                      name: data.storeName.trim(),
                      address: data.storeAddress.trim(),
                      phone: data.storePhone.trim(),
                      backupFolder:
                        data.backupFolder.trim() || "C:\\EliMed\\Backups",
                    });

                    if (data.backupFolder.trim()) {
                      setBackupDir(data.backupFolder.trim());
                      try {
                        const backup = await runBackup();
                        await exportBackup({
                          targetPath: data.backupFolder.trim(),
                          sourcePath: backup.path,
                        });
                      } catch (backupError) {
                        const message =
                          backupError instanceof Error
                            ? backupError.message
                            : "Backup failed. Please verify folder permissions.";
                        toast.error(message);
                      }
                    }

                    // Save printer preference
                    if (data.printer) {
                      savePrinter(data.printer);
                      console.log("Saved default printer:", data.printer);
                    }

                    toast.success("Setup completed successfully");
                    setTimeout(() => {
                      onComplete({
                        storeName: data.storeName,
                        storeAddress: data.storeAddress,
                        storePhone: data.storePhone,
                      });
                    }, 600);
                  } catch (error) {
                    const message =
                      error instanceof Error
                        ? error.message
                        : "Setup failed. Please try again.";
                    toast.error(message);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className="min-w-[150px]"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Finishing..." : "I've Saved My Recovery Code"}
              </Button>
            ) : currentStep < 4 ? (
              <Button onClick={handleNext} className="min-w-[100px]">
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                className="min-w-[100px]"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Finishing..." : "Finish Setup"}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
