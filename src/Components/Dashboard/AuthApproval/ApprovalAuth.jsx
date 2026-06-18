import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import DashHeader from "../DashHeader";
import BusinessRequestPendingList from "../DashPendingList";
import BusinessRequestApprovedList from "../DashApprovedList";
import BusinessTravelForm from "../../TravelRequest/TravelForm";
import "../DashMainpage.css";
import { Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import DashRequestApproved from "../DashRequestApproved";
import DashRequestPending from "../DashRequestPending";


const ApprovalAuth = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const token = sessionStorage.getItem("empToken");
    const empName = sessionStorage.getItem("empName");
    const empDesignation = sessionStorage.getItem("empDesignation");
    const empDepartment = sessionStorage.getItem("empDepartment");
    const normalizedRole = empDepartment?.toLowerCase() || "";
    // NORMAL AND MANAGER 
    const isAdmin = normalizedRole === "admin";

    const [selectedTab, setSelectedTab] = useState(
        isAdmin ? "approvedRequest" : "pendingForApproval"
    );

    // const [selectedTab, setSelectedTab] = useState("pendingForApproval");
    const [pendingRequestsAll, setPendingRequests] = useState([]); //1  normal user request
    const [approvedRequestsAll, setApprovedRequests] = useState([]);//2 normal user appproved
    const [pendingForApprovalPart, setPendingForApproval] = useState([]); //3 manager approval part
    const [approvedRequestPart, setApprovedRequest] = useState([]);//4 manager request
    // for finance and ceo view 
    const [financeRequestPart, setfinanceRequestPart] = useState([]);//5  finance 
    const [ceoRequestPart, setceoRequestPart] = useState([]);//6 ceo 
    const [superiorapprovedRequestPart, setsuperiorapprovedRequestPart] = useState([]);//7 admin list
    const [InernaionalapprovedRequestPart, setsInernaionalapprovedRequestPart] = useState([]);//8 Inernational approved list
    const [loading, setLoading] = useState(true);
    // Utils

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
                setfinanceRequestPart(data.financeWaitingForApproval || []);
                setceoRequestPart(data.ceoWaitingForApproval || []);
                setsuperiorapprovedRequestPart(data.superiorApprovedRequest || []);
                setsInernaionalapprovedRequestPart(data.internationalApproved || []);

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
    const pendingRequestsByRole = {
        ceo: ceoRequestPart,
        finance: financeRequestPart,
    };
    const approvedRequestByRole = {
        ceo: InernaionalapprovedRequestPart,
        finance: InernaionalapprovedRequestPart,
        admin: superiorapprovedRequestPart
    };
    const pendingRequests =
        pendingRequestsByRole[normalizedRole] || [];
    const approvedLists = approvedRequestByRole[normalizedRole] || [];
    console.log(normalizedRole, "role");
    console.log(approvedLists,"approvedlist")

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
                                pageType="auth"
                                role={empDepartment}
                                financePending={financeRequestPart?.length}
                                ceoPending={ceoRequestPart?.length}
                                approved={approvedLists?.length}
                                activeTab={selectedTab}
                                authView={true}
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
                            {selectedTab === "pendingForApproval" && (
                                <DashRequestPending
                                    requests={pendingRequests}
                                    fetchRequests={fetchDashboardData}
                                    approvalBasePath="/authaproval/approval"
                                />
                            )}

                            {selectedTab === "approvedRequest" && (
                                    <BusinessRequestApprovedList requests={approvedLists} approvalBasePath="/authaproval/view" />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApprovalAuth;
