import { createContext, useContext, useState, useEffect } from "react";
import { DashbaordOverview } from "../auth/dashboard";
import { SubResellerDashboard } from "../auth/subReseller/dashboard";
import { useAuth } from "./AuthContext";

const DashboardContext = createContext(null);

export const DashboardProvider = ({ children }) => {
  const { userRole } = useAuth();

  const [dashboard, setDashboard] = useState({
    stats: {},
    devices: [],
  });

  const [loading, setLoading] = useState(false);

  const fetchDashboard = async () => {
    if (!userRole) return;

    setLoading(true);

    try {
      let res;

      if (userRole === "SUB_RESELLER") {
        res = await SubResellerDashboard();
      } else {
        res = await DashbaordOverview();
      }

      if (res?.success) {
        setDashboard((prev) => ({
          ...prev,
          stats: {
            activeSub: res.data.activeSubscriptions,
            credits: res.data.credits,
            pending: res.data.pendingRequests,
            totalUsers: res.data.totalUsers,
            creditCoin: res.data.credits,
          },
          devices: [...(res.data.recentUsers || [])],
        }));
      } else {
        console.error(res?.message);
      }
    } catch (err) {
      console.error("Dashboard error:", err);
    }

    setLoading(false);
  };
  useEffect(() => {
    fetchDashboard();
  }, [userRole]);


  return (
    <DashboardContext.Provider
      value={{ dashboard, loading, refetchDashboard: fetchDashboard }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used inside DashboardProvider");
  }
  return context;
};