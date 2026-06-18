import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import DashHeader from "./DashHeader";
import BusinessRequestPendingList from "./DashPendingList";
import BusinessRequestApprovedList from "./DashApprovedList";
import BusinessTravelForm from "../TravelRequest/TravelForm";
import "./DashMainpage.css";
import { Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import DashRequestApproved from "./DashRequestApproved";
import DashRequestPending from "./DashRequestPending";


const DashboardMainPage = () => {
  const [selectedTab, setSelectedTab] = useState("pending");
  const [pendingRequestsAll, setPendingRequests] = useState([]); //1
  const [approvedRequestsAll, setApprovedRequests] = useState([]);//2
  const [pendingForApprovalPart, setPendingForApproval] = useState([]); //3
  const [approvedRequestPart, setApprovedRequest] = useState([]);//4
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem("empToken");
  const empName = sessionStorage.getItem("empName");
  const empDesignation = sessionStorage.getItem("empDesignation");
  const empDepartment = sessionStorage.getItem("empDepartment");
  
  const navigate = useNavigate();
  // ✅ Fetch API data
  const fetchDashboardData = useCallback(async () => {
    if (!token || !empName || !empDesignation) return;

    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/btp/gridData`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { empname: empName, designation: empDesignation },
      });

      const data = response.data;
      console.log("Dashboard Data:", data);

      if (data.success) {
        setPendingRequests(data.pending || []);
        setApprovedRequests(data.approved || []);
        setPendingForApproval(data.waitingForApproval || []);
        setApprovedRequest(data.approvedRequest || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [API_URL, token, empName, empDesignation]);

  // ✅ Fetch on mount + auto-refresh every 1 minute
  useEffect(() => {
    if (selectedTab !== "create") {
      fetchDashboardData();
    }
  }, [fetchDashboardData, selectedTab]);

  // ✅ Also refresh data immediately when tab changes (except create)
const handleTabChange = (tab) => {
  setSelectedTab(tab);
  if (tab === "create") {
   navigate("/travelrequest/create", { state: { initialValues } });
  } else {
    fetchDashboardData();
  }
};

  const initialValues = {
    employeeName: "",
    travelID: "",
    employeeDepartment: "",
    projectType: "",
    typeOfVisit: "",
    placeOfVisit: "",
    expectedDeparture: "",
    expectedArrival: "",
    noOfDays: "",
    advanceCashRequired: "",
    hotelBookingRequired: "",
  };

  const handleSubmit = (values) => {
    console.log("Submitted:", values);
  };

  return (
    <div className="maincontainer">
      <div className="container">
        <div className="row">
          {selectedTab !== "create" && (
            <>
              <div className="headerLabel">
                <div className="labelUI">
                  <label>Business Request List</label>
                </div>
                <div className="lineUI"></div>
              </div>

              <DashHeader
                pageType="dashboard"
                pending={pendingRequestsAll ? pendingRequestsAll.length : 0}
                approved={approvedRequestsAll ? approvedRequestsAll.length : 0}
                requestapproved={approvedRequestPart ? approvedRequestPart.length : 0}
                requestpending={pendingForApprovalPart ? pendingForApprovalPart.length : 0}
                role={empDesignation}
                designation={empDepartment}
                activeTab={selectedTab}
                createNew={true}
                managerview={true}
                onTabChange={handleTabChange}
              />

            </>
          )}

          {loading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "60vh",
                borderRadius: "12px",
              }}
            >
              <Spinner animation="border" variant="primary" style={{ width: "2rem", height: "2rem" }} />
              <p className="mt-3 text-muted">Loading data...</p>
            </div>
          ) : (
            <>
              {selectedTab === "pending" && (
                <BusinessRequestPendingList requests={pendingRequestsAll} fetchRequests={fetchDashboardData}/>
              )}
              {selectedTab === "approved" && (
                  <BusinessRequestApprovedList requests={approvedRequestsAll} approvalBasePath="/travelrequest/view" />
              )}
              {selectedTab === "pendingForApproval" && (
                  <DashRequestPending requests={pendingForApprovalPart} fetchRequests={fetchDashboardData} approvalBasePath="/travelrequest/approval" />
              )}
              {selectedTab === "approvedRequest" && (
                  <DashRequestApproved requests={approvedRequestPart} approvalBasePath="/travelrequest/view" />
              )}
              {selectedTab === "create" && (
                <BusinessTravelForm
                  initialValues={initialValues}
                  onSubmit={handleSubmit}
                />
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardMainPage;
