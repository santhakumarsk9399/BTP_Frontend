
import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./ContextProvider";
import DashboardLayout from "../Dashboard/DashLayout"; 
import Header from "../Header/Header";

const ProtectedLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  // redirect if not authenticated
  if (!user) return <Navigate to="/login" replace />;

  // optional lists to hide header/footer later
  const hideHeaderOn = ["/users/view", "/liveOccupancy", "/historicalAnalytics"];
  const hideFooterOn = ["/analytics/raw", "/sms"];
  const matchAny = (paths) =>
    paths.some((path) => location.pathname.startsWith(path));
  const shouldHideHeader = matchAny(hideHeaderOn);
  const shouldHideFooter = matchAny(hideFooterOn);

  return (
   
    <DashboardLayout>
      <Header location={location}/>

      <Outlet />
    </DashboardLayout>
  );
};

export default ProtectedLayout;
