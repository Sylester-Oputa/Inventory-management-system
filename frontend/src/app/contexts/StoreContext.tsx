import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  backupFolder: string;
}

interface StoreContextType {
  store: Store | null;
  loading: boolean;
  refreshStore: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const API_BASE_URL = "http://localhost:4000";

async function fetchStoreInfo(): Promise<Store> {
  const response = await fetch(`${API_BASE_URL}/setup/store`);
  if (!response.ok) {
    throw new Error("Failed to fetch store info");
  }
  return response.json();
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStore = async () => {
    try {
      const data = await fetchStoreInfo();
      setStore(data);
    } catch (error) {
      console.error("Failed to fetch store info:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStore();
  }, []);

  return (
    <StoreContext.Provider value={{ store, loading, refreshStore: fetchStore }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
