import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

interface SidebarProviderProps {
  children: ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({
  children,
}) => {
  // Initialize state with default value first, then update from localStorage
  const [isCollapsed, setIsCollapsedState] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage after component mounts
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sidebar-collapsed");
      if (saved !== null) {
        setIsCollapsedState(JSON.parse(saved));
      }
    } catch (error) {
      console.warn("Failed to load sidebar state from localStorage:", error);
    }
    setIsInitialized(true);
  }, []);

  // Persist state changes to localStorage
  const setIsCollapsed = (collapsed: boolean) => {
    setIsCollapsedState(collapsed);
    try {
      localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed));
    } catch (error) {
      console.warn("Failed to save sidebar state to localStorage:", error);
    }
  };

  const value: SidebarContextType = {
    isCollapsed,
    setIsCollapsed,
  };

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
};

export const useSidebar = (): SidebarContextType => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};
