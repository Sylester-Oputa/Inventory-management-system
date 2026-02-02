import { useState, useEffect } from "react";
import { FirstRunSetup } from "@/app/components/setup/FirstRunSetup";
import { Login } from "@/app/components/auth/Login";
import { MainLayout } from "@/app/components/layout/MainLayout";
import { Toaster } from "@/app/components/ui/sonner";
import { ThemeProvider } from "@/app/contexts/ThemeContext";
import { StoreProvider } from "@/app/contexts/StoreContext";
import {
  getSetupStatus,
  getAuthToken,
  getAuthUser,
  getStoreInfo,
  clearAuth,
} from "@/app/lib/api";

export type UserRole = "OWNER" | "STAFF";

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  status: "active" | "disabled";
}

export interface AppState {
  isSetupComplete: boolean;
  currentUser: User | null;
  storeName: string;
  storeAddress: string;
  storePhone: string;
}

export default function App() {
  const [appState, setAppState] = useState<AppState>({
    isSetupComplete: false,
    currentUser: null,
    storeName: "",
    storeAddress: "",
    storePhone: "",
  });
  const [isCheckingSetup, setIsCheckingSetup] = useState(true);

  // Check if setup is complete on app load
  useEffect(() => {
    const checkSetup = async () => {
      try {
        const status = await getSetupStatus();

        // Restore user from localStorage if token exists
        const token = getAuthToken();
        const savedUser = getAuthUser();

        let storeData = { name: "", address: "", phone: "" };
        if (token && savedUser) {
          try {
            const store = await getStoreInfo();
            storeData = {
              name: store.name,
              address: store.address,
              phone: store.phone,
            };
          } catch (error) {
            console.error("Failed to load store info:", error);
          }
        }

        setAppState((prev) => ({
          ...prev,
          isSetupComplete: status.isSetupComplete,
          storeName: storeData.name,
          storeAddress: storeData.address,
          storePhone: storeData.phone,
          currentUser:
            token && savedUser
              ? {
                  id: savedUser.id,
                  name: savedUser.name,
                  username: savedUser.username,
                  role: savedUser.role,
                  status: savedUser.isActive ? "active" : "disabled",
                }
              : null,
        }));
      } catch (error) {
        console.error("Failed to check setup status:", error);
        // If the check fails, assume setup is not complete
        setAppState((prev) => ({
          ...prev,
          isSetupComplete: false,
        }));
      } finally {
        setIsCheckingSetup(false);
      }
    };
    checkSetup();
  }, []);

  // Show loading state while checking setup
  if (isCheckingSetup) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
            <p className="text-[var(--text-secondary)]">Loading...</p>
          </div>
        </div>
        <Toaster />
      </ThemeProvider>
    );
  }

  // First run setup
  if (!appState.isSetupComplete) {
    return (
      <ThemeProvider>
        <FirstRunSetup
          onComplete={(storeInfo) => {
            setAppState({
              ...appState,
              isSetupComplete: true,
              ...storeInfo,
            });
          }}
        />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Login screen
  if (!appState.currentUser) {
    return (
      <ThemeProvider>
        <Login
          onLogin={async (user) => {
            try {
              const store = await getStoreInfo();
              setAppState({
                ...appState,
                currentUser: user,
                storeName: store.name,
                storeAddress: store.address,
                storePhone: store.phone,
              });
            } catch (error) {
              console.error("Failed to load store info:", error);
              setAppState({
                ...appState,
                currentUser: user,
              });
            }
          }}
        />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Main application
  const refreshStoreInfo = async () => {
    try {
      const store = await getStoreInfo();
      setAppState((prev) => ({
        ...prev,
        storeName: store.name,
        storeAddress: store.address,
        storePhone: store.phone,
      }));
    } catch (error) {
      console.error("Failed to refresh store info:", error);
    }
  };

  return (
    <ThemeProvider>
      <StoreProvider>
        <MainLayout
          currentUser={appState.currentUser}
          storeInfo={{
            name: appState.storeName,
            address: appState.storeAddress,
            phone: appState.storePhone,
          }}
          onRefreshStoreInfo={refreshStoreInfo}
          onLogout={() => {
            clearAuth();
            setAppState({
              ...appState,
              currentUser: null,
            });
          }}
        />
        <Toaster />
      </StoreProvider>
    </ThemeProvider>
  );
}
