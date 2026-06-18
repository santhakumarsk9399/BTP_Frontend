import React from "react";
import Sidebar from "../Sidebar/Sidebar";
import "./DashboardLayout.css"; // ensure relative path is correct

const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        <div className="dashboard-body">
          {children ? children : <p>Welcome!</p>}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
