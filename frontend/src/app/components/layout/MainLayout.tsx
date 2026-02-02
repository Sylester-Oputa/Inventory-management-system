import { useState } from "react";
import { motion } from "motion/react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { Dashboard } from "@/app/components/pages/Dashboard";
import { POS } from "@/app/components/pages/POS";
import { Products } from "@/app/components/pages/Products";
import { Restock } from "@/app/components/pages/Restock";
import { Inventory } from "@/app/components/pages/Inventory";
import { SalesHistory } from "@/app/components/pages/SalesHistory";
import { ReceiptHistory } from "@/app/components/pages/ReceiptHistory";
import { UserManagement } from "@/app/components/pages/UserManagement";
import { Settings } from "@/app/components/pages/Settings";
import { ExpiryReports } from "@/app/components/pages/ExpiryReports";
import type { User } from "@/app/App";

export type PageType =
  | "dashboard"
  | "pos"
  | "products"
  | "restock"
  | "inventory"
  | "sales-history"
  | "receipt-history"
  | "users"
  | "expiry-reports"
  | "settings";

interface MainLayoutProps {
  currentUser: User;
  storeInfo: {
    name: string;
    address: string;
    phone: string;
  };
  onRefreshStoreInfo: () => Promise<void>;
  onLogout: () => void;
}

export function MainLayout({
  currentUser,
  storeInfo,
  onRefreshStoreInfo,
  onLogout,
}: MainLayoutProps) {
  const [currentPage, setCurrentPage] = useState<PageType>("dashboard");

  const renderPage = () => {
    const pageProps = {
      currentUser,
      storeInfo,
    };

    switch (currentPage) {
      case "dashboard":
        return <Dashboard {...pageProps} />;
      case "pos":
        return <POS {...pageProps} />;
      case "products":
        return <Products {...pageProps} />;
      case "restock":
        return <Restock {...pageProps} />;
      case "inventory":
        return <Inventory {...pageProps} />;
      case "sales-history":
        return <SalesHistory {...pageProps} />;
      case "receipt-history":
        return <ReceiptHistory {...pageProps} />;
      case "users":
        return <UserManagement {...pageProps} />;
      case "expiry-reports":
        return <ExpiryReports {...pageProps} />;
      case "settings":
        return (
          <Settings {...pageProps} onRefreshStoreInfo={onRefreshStoreInfo} />
        );
      default:
        return <Dashboard {...pageProps} />;
    }
  };

  return (
    <div className="h-screen flex bg-[var(--background)]">
      {/* Sidebar */}
      <Sidebar
        currentUser={currentUser}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        storeName={storeInfo.name}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar currentUser={currentUser} onLogout={onLogout} />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="h-full"
          >
            {renderPage()}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
