import React, { useState, useEffect } from "react";
import { Formik, FieldArray } from "formik";
import * as Yup from "yup";
import { Container, Row, Col, Form, Button, Card, Modal } from "react-bootstrap";
import "../../Components/TravelRequest/TravelForms.css";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import uparrow from "../../assets/createrequest/up-arrow.png";
import downarrow from "../../assets/createrequest/down-arrow.png";
import checkIcon from "../../assets/check.png";
import ImageIcon from "../CommonComponents/ImageIcon";
import RejectModal from "../CommonComponents/RejectModal";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaCheckCircle } from "react-icons/fa";
import { FaArrowLeftLong } from "react-icons/fa6";

const SectionHeader = ({ title, open, onToggle }) => (
  <div className="section-header" onClick={onToggle}>
    <div className="sectitle">
      <h5 className="secLabel">{title}</h5>
    </div>
    <div className="header-line"></div>
    {/* <div className="toggle-icon">{open ? "▾" : "▸"}</div> */}
    <div className="toggle-icon">
      {open ? (
        <ImageIcon img={uparrow} Img_height={"29px"} Img_width={"29px"} />
      ) : (
        <ImageIcon img={downarrow} Img_height={"29px"} Img_width={"29px"} />
      )}
    </div>
  </div>
);

const DashviewFormData = () => {
  const { travelId } = useParams(); // Get travelId from URL params
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [travelData, setTravelData] = useState(null);
  const [approving, setApproving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState(""); // "approved" or "rejected"
  const [openSections, setOpenSections] = useState({
    employee: true,
    project: true,
    travel: true,
    accommodation: true,
    other: true,
  });

  const toggle = (key) => setOpenSections((s) => ({ ...s, [key]: !s[key] }));
  const API_URL = import.meta.env.VITE_API_URL;
  const department = sessionStorage.getItem("empDepartment");
  const emp_name = sessionStorage.getItem("empName");
  // sessionStorage.setItem("empDepartment", emp_department);
  // Determine if this is approval mode based on URL
  const isApprovalMode = window.location.pathname.includes('/approval/');

  // Fetch travel data from API
  useEffect(() => {
    const fetchTravelData = async () => {
      if (!travelId) {
        console.error("No travel_id provided");
        setLoading(false);
        return;
      }

      // Extract numeric value from travelId
      let numericTravelId = travelId;
      
      // Handle comma-separated values (take the first numeric value)
      if (numericTravelId.includes(',')) {
        const parts = numericTravelId.split(',');
        // Find the first part that is numeric or contains TID_
        numericTravelId = parts.find(part => /^\d+$/.test(part.trim()) || part.trim().startsWith('TID_')) || parts[0];
        numericTravelId = numericTravelId.trim();
      }
      
      // Remove TID_ prefix if present
      if (numericTravelId.startsWith("TID_")) {
        numericTravelId = numericTravelId.replace("TID_", "");
      }

      // Validate travel_id is numeric
      if (!/^\d+$/.test(numericTravelId)) {
        console.error("Invalid travel_id. Must be numeric. Received:", travelId);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const token = sessionStorage.getItem("empToken");
        
        const response = await axios.get(
          `${API_URL}/btp/view/?travel_id=${numericTravelId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response?.data?.success && response?.data?.data) {
          setTravelData(response.data.data);
          console.log("Travel data fetched:", response.data.data);
        }
      } catch (error) {
        console.error("Error fetching travel data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTravelData();
  }, [travelId, API_URL]);
  console.log(travelData)

  // Helper functions to parse API data
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB"); // DD/MM/YYYY format
  };

  const formatDateTime1 = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return `${date.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })} - ${date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
  };

  const formatDateTime = (dateStr) => {
  if (!dateStr) return "";

  // Create a Date object
  const date = new Date(dateStr);

  // Extract date and time from UTC (not local)
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();

  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");

  return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
};

  // Helper function to get currency symbol
  const getCurrencySymbol = (currencyCode) => {
    const currencyMap = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'AUD': 'A$',
      'CAD': 'C$',
      'CHF': 'CHF',
      'CNY': '¥',
      'INR': '₹',
    };
    return currencyMap[currencyCode] || currencyCode;
  };


  // Show loading state
  if (loading) {
    return (
      <Container className="travel-form-container tview-form py-4">
        <div className="text-center">Loading travel data...</div>
      </Container>
    );
  }

  // Show error if no data
  if (!travelData) {
    return (
      <Container className="travel-form-container tview-form py-4">
        <div className="text-center">No travel data found.</div>
      </Container>
    );
  }

  // Extract data from API response
  const employeeInfo = travelData.employeeInfo?.[0] || {};
  const selectedEmployeeInfo = travelData.selectedEmployeeInfo || [];
  const projectInfo = travelData.projectInfo || [];
  const employeeDetails = travelData.employeeDetails?.[0] || {};
  const travelDetails = travelData.travelDetails?.[0] || {};
  const accommodationDetails = travelData.accommodationDetails || [];
  const rejectReasons = travelData.reject || [];

  // Get unique itineraries (place, departure, arrival)
  const uniqueItineraries = [];
  const seenPlaces = new Set();
  accommodationDetails.forEach((acc) => {
    const key = `${acc.placeoforigin}-${acc.placeofarrival}`;
    if (!seenPlaces.has(key)) {
      seenPlaces.add(key);
      uniqueItineraries.push({
        origin: acc.placeoforigin,
        destination: acc.placeofarrival,
        departure: acc.departure_date,
        arrival: acc.aeparture_date,
      });
    }
  });

  // Calculate total days
  const calculateTotalDays = () => {
    if (uniqueItineraries.length === 0) return 0;
    const departureDates = uniqueItineraries.map((it) => new Date(it.departure));
    const arrivalDates = uniqueItineraries.map((it) => new Date(it.arrival));
    const start = new Date(Math.min(...departureDates));
    const end = new Date(Math.max(...arrivalDates));
    return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  // Extract numeric value from travelId for display
  let numericTravelId = travelId || "";
  
  // Handle comma-separated values (take the first numeric value)
  if (numericTravelId.includes(',')) {
    const parts = numericTravelId.split(',');
    numericTravelId = parts.find(part => /^\d+$/.test(part.trim()) || part.trim().startsWith('TID_')) || parts[0];
    numericTravelId = numericTravelId.trim();
  }
  
  // Remove TID_ prefix if present
  if (numericTravelId.startsWith("TID_")) {
    numericTravelId = numericTravelId.replace("TID_", "");
  }

  // Get logged-in user details
  const loggedUserId = sessionStorage.getItem("empID");
  const loggedUserName = sessionStorage.getItem("empName");

  // Determine employee type: Check if employee name matches logged-in user
  let employeeType = "Self";
  if (travelDetails.Emp_Type === 1) {
    // For Emp_Type = 1, check if the employee name matches logged-in user
    const empName = employeeDetails.empName || "";
    
    // Check if employee name matches logged-in user
    const isSelf = empName === loggedUserName;
    
    employeeType = isSelf ? "Self" : "Others";
  }

  const initialValues = {
    employeeType: employeeType,
    travelID: numericTravelId ? `TID_${numericTravelId}` : "",
    employeeName: employeeDetails.empName || "",
    // employeeID: travelDetails.Emp_Type === 0 ? (employeeDetails.empId || "") : (employeeInfo.selectedEmpid || ""),
    employeeID:  (employeeDetails.empId || "") ,
    employeeDepartment: "",
    groupBooking: employeeInfo.isGroup === 1 ? "Yes" : "No",
    employeeList: selectedEmployeeInfo.map((emp) => emp.EmpName).join(", "),
    projectType: projectInfo.length > 0 ? "Specific" : "General",
    projectID: projectInfo.map((p) => p.pid).join(", "),
    projectName: "",
    itineraries: uniqueItineraries,
    totalDays: calculateTotalDays(),
    typeOfVisit: travelDetails.Typeofvisit === "0" ? "Domestic" : "International",
    ModeofTravel: travelDetails.ModeOfTravel || "",
    currencyType: travelDetails.Currency_Type || "",
    simRequired: travelDetails.Top_Up_Amount > 0 ? "Yes" : "No",
    rechargeAmount: travelDetails.Top_Up_Amount || "",
    hotelBookingRequired: accommodationDetails.some((acc) => acc.accDays > 0) ? "Yes" : "No",
    accommodations: accommodationDetails,
    localTaxiRequired: accommodationDetails.some((acc) => acc.taxiReq === "1") ? "Yes" : "No",
    taxiType: "",
    startPlace: "",
    startDate: "",
    startTime: "",
    endPlace: "",
    advanceCashRequired: travelDetails.Advance_Cash > 0 ? "Yes" : "No",
    advanceAmount: travelDetails.Advance_Cash || "",
    purpose: travelDetails.Purpose || "",
  };

  console.log("values",initialValues)
const validationSchema = Yup.object().shape({
  employeeType: Yup.string().required("Required"),
  travelID: Yup.string().required("Required"),
  employeeName: Yup.string().required("Required"),
  employeeID: Yup.string().required("Required"),
  employeeDepartment: Yup.string().required("Required"),
  projectType: Yup.string().required("Required"),

  projectID: Yup.string().when("projectType", {
    is: "Specific",
    then: (schema) => schema.required("Required"),
    otherwise: (schema) => schema.nullable(),
  }),

  projectName: Yup.string().when("projectType", {
    is: "Specific",
    then: (schema) => schema.required("Required"),
    otherwise: (schema) => schema.nullable(),
  }),

  itineraries: Yup.array()
    .of(
      Yup.object().shape({
        place: Yup.string().required("Place is required"),
        departure: Yup.string()
          .required("Departure date required")
          .test("valid-date", "Invalid departure date", (value) => {
            if (!value) return false;
            return !isNaN(new Date(value).getTime());
          }),
        arrival: Yup.string()
          .required("Arrival date required")
          .test("valid-date", "Invalid arrival date", (value) => {
            if (!value) return false;
            return !isNaN(new Date(value).getTime());
          })
          .test(
            "after-departure",
            "Arrival must be same or after departure",
            function (value) {
              const { departure } = this.parent;
              if (!departure || !value) return true;
              return new Date(value) >= new Date(departure);
            }
          ),
      })
    )
    .min(1, "Add at least one itinerary"),

  totalDays: Yup.number()
    .typeError("Invalid number")
    .required("Auto-calculated"),

  typeOfVisit: Yup.string().required("Required"),

  currencyType: Yup.string().when("typeOfVisit", {
    is: "International",
    then: (schema) => schema.required("Required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  simRequired: Yup.string().when("typeOfVisit", {
    is: "International",
    then: (schema) => schema.required("Required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  rechargeAmount: Yup.string().when("typeOfVisit", {
    is: "International",
    then: (schema) => schema.required("Required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  hotelBookingRequired: Yup.string().required("Required"),

  accommodations: Yup.array().of(
    Yup.object().shape({
      daysAccommodation: Yup.number().when("hotelBookingRequired", {
        is: "Yes",
        then: (schema) =>
          schema.required("Required").typeError("Invalid number"),
        otherwise: (schema) => schema.nullable(),
      }),
      typeOfOccupancy: Yup.string(),
      nearestLandmark: Yup.string(),
    })
  ),

  localTaxiRequired: Yup.string().required("Required"),

  startDate: Yup.string().when("localTaxiRequired", {
    is: "Yes",
    then: (schema) =>
      schema
        .required("Start date required")
        .test("valid-date", "Invalid date", (value) => {
          if (!value) return false;
          return !isNaN(new Date(value).getTime());
        }),
    otherwise: (schema) => schema.notRequired(),
  }),

  advanceCashRequired: Yup.string().required("Required"),

  advanceAmount: Yup.number().when("advanceCashRequired", {
    is: "Yes",
    then: (schema) =>
      schema.required("Required").typeError("Invalid number"),
    otherwise: (schema) => schema.nullable(),
  }),
});
  // console.log(travelDetails.Typeofvisit)
  // Handle approval action
  const handleApproval = async (status) => {
    if (!travelId) {
      console.error("No travel_id provided for approval");
      return;
    }

    // Extract numeric value from travelId
    let numericTravelId = travelId;

    // Handle comma-separated values (take the first numeric value)
    if (numericTravelId.includes(',')) {
      const parts = numericTravelId.split(',');
      numericTravelId = parts.find(part => /^\d+$/.test(part.trim()) || part.trim().startsWith('TID_')) || parts[0];
      numericTravelId = numericTravelId.trim();
    }

    // Remove TID_ prefix if present
    if (numericTravelId.startsWith("TID_")) {
      numericTravelId = numericTravelId.replace("TID_", "");
    }

    if (!/^\d+$/.test(numericTravelId)) {
      console.error("Invalid travel_id for approval. Received:", travelId);
      return;
    }

    setApproving(true);
    try {
      const token = sessionStorage.getItem("empToken");
      const managerId = sessionStorage.getItem("empID");

      console.log("Session data - empID:", managerId, "token:", token ? "exists" : "missing");

      // Validate manager ID
      if (!managerId || managerId === "null" || managerId === "undefined") {
        toast.error("Manager ID not found. Please login again.", {
          position: "top-right",
          autoClose: 3000
        });
        setApproving(false);
        return;
      }

      // Parse IDs as integers
      const travelIdInt = parseInt(numericTravelId, 10);
      const managerIdInt = parseInt(managerId, 10);

      // Validate parsed values
      if (isNaN(travelIdInt) || isNaN(managerIdInt)) {
        toast.error("Invalid ID format", {
          position: "top-right",
          autoClose: 3000
        });
        console.error("Invalid IDs:", { travelIdInt, managerIdInt });
        setApproving(false);
        return;
      }

      // Payload structure as per API requirement
      const payload = {
        travel_id: travelIdInt,
        manager_id: managerIdInt,
        department: department,
        empname: employeeDetails.empName,
        typeofvisit: travelDetails?.Typeofvisit,
        reason:"approve"
      };

      const endpoint = `${API_URL}/btp/approve`;

      console.log(`${status === 'approved' ? 'Approval' : 'Rejection'} action`);
      console.log("Endpoint:", endpoint);
      console.log("Payload:", payload);
      console.log("Payload JSON:", JSON.stringify(payload));

      const response = await axios.post(
        endpoint,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API Response:", response.data);

      if (response?.data?.success) {
        setApprovalAction(status);
        setShowSuccessModal(true);
      } else {
        toast.error(`Failed to ${status} travel request. ${response?.data?.message || ''}`, {
          position: "top-right",
          autoClose: 5000
        });
      }
    } catch (error) {
      console.error(`Error ${status} travel request:`, error);
      console.error("Error response:", error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || "Unknown error";
      toast.error(`Error occurred while ${status} the request: ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000
      });
    } finally {
      setApproving(false);
    }
  };

  // Handle rejection action
  const handleReject = async (reason) => {
    if (!travelId) {
      console.error("No travel_id provided for rejection");
      return;
    }

    // Extract numeric value from travelId
    let numericTravelId = travelId;

    // Handle comma-separated values (take the first numeric value)
    if (numericTravelId.includes(',')) {
      const parts = numericTravelId.split(',');
      numericTravelId = parts.find(part => /^\d+$/.test(part.trim()) || part.trim().startsWith('TID_')) || parts[0];
      numericTravelId = numericTravelId.trim();
    }

    // Remove TID_ prefix if present
    if (numericTravelId.startsWith("TID_")) {
      numericTravelId = numericTravelId.replace("TID_", "");
    }

    if (!/^\d+$/.test(numericTravelId)) {
      console.error("Invalid travel_id for rejection. Received:", travelId);
      return;
    }

    setApproving(true);
    try {
      const token = sessionStorage.getItem("empToken");
      const managerId = sessionStorage.getItem("empID");
      console.log("Reject - Session data token:", token ? "exists" : "missing");

      // Validate token
      if (!token) {
        toast.error("Authentication token not found. Please login again.", {
          position: "top-right",
          autoClose: 3000
        });
        setApproving(false);
        setShowRejectModal(false);
        return;
      }

      // Parse travel ID as integer
      const travelIdInt = parseInt(numericTravelId, 10);
      const managerIdInt = parseInt(managerId, 10);

      // Validate parsed value
      if (isNaN(travelIdInt)) {
        toast.error("Invalid Travel ID format", {
          position: "top-right",
          autoClose: 3000
        });
        console.error("Invalid travel ID:", travelIdInt);
        setApproving(false);
        setShowRejectModal(false);
        return;
      }

      // Payload structure as per API requirement
      const payload = {
        travel_id: travelIdInt.toString(),
        manager_id: managerIdInt,
        department: department,
        empname: employeeDetails.empName,
        typeofvisit: travelDetails?.Typeofvisit,
        reason: reason.trim(),
      };

      const endpoint = `${API_URL}/btp/reject`;

      console.log("Rejection action");
      console.log("Endpoint:", endpoint);
      console.log("Payload:", payload);
      console.log("Payload JSON:", JSON.stringify(payload));

      const response = await axios.post(
        endpoint,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API Response:", response.data);

      if (response?.data?.success) {
        setShowRejectModal(false);
        setApprovalAction("rejected");
        setShowSuccessModal(true);
      } else {
        toast.error(`Failed to reject travel request. ${response?.data?.message || ''}`, {
          position: "top-right",
          autoClose: 5000
        });
      }
    } catch (error) {
      console.error("Error rejecting travel request:", error);
      console.error("Error response:", error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || "Unknown error";
      toast.error(`Error occurred while rejecting the request: ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000
      });
    } finally {
      setApproving(false);
    }
  };
  
  
  return (
    <>
      {/* Reject Modal */}
      <RejectModal
        show={showRejectModal}
        travelId={numericTravelId ? `TID_${numericTravelId}` : ""}
        onConfirm={handleReject}
        onCancel={() => setShowRejectModal(false)}
        loading={approving}
        className="check-modal"
      />

      {/* Success Modal */}
      <Modal
        show={showSuccessModal}
         className="check-modal"
        onHide={() => {
          setShowSuccessModal(false);
          // navigate("/travelrequest");
        navigate(-1)
        }}
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Body className="text-center m-0">
         
          <div class="mb-0">
            
             <div class="check-cnt"><img src={checkIcon} alt="check" width="105" className="check-icon mb-0" /></div>           
           
            {/*
            <FaCheckCircle
              style={{
                fontSize: "80px",
                color: "#28a745",
              }} />  */}

          </div>


          <h3 className="check-modal-hd">
            Travel Request {approvalAction === "approved" ? "Approved" : "Rejected"}
            <br />
            Successfully !
          </h3>

          <Button
            variant="secondary back-btn"
            onClick={() => {
              setShowSuccessModal(false);
              // navigate("/travelrequest");
            navigate(-1)
            }}
          >
            Close
          </Button>

        </Modal.Body>

        {/*
        <Modal.Footer className="justify-content-center border-0 pb-4">
          
        </Modal.Footer> */}

      </Modal>

      <div className="travel-form-container tview-form py-4">   
        <Container>
        {/* <h2 className="page-title mb-4">Business Travel Request</h2> */}


          <Row>
          {/* <Col>
            <h2 className="page-title mb-4">
            {mode === "approval"
              ? `Travel Request - ${editData?.travelId || travelId} (Approval)`
              : editData
              ? `Edit Travel Request - ${editData.travelId}`
              : "Business Travel Request"}
          </h2>
          </Col> */}
          <Col className="travel-form-back-btn">
            <Button
              type="button"
              variant="secondary mb-2 back-btn"
                onClick={() => navigate(-1)}
              style={{ float: "right" }}
            >
             <FaArrowLeftLong/> Back
            </Button>
          </Col>
        </Row>


        <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          // Form is read-only, submission handled by approval buttons
          setSubmitting(false);
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue,
        }) => {
          
          useEffect(() => {
            if (!values.itineraries.length) return;

            const departures = values.itineraries
              .map((i) => new Date(i.departure))
              .filter((d) => !isNaN(d));
            const arrivals = values.itineraries
              .map((i) => new Date(i.arrival))
              .filter((d) => !isNaN(d));

            if (!departures.length || !arrivals.length) return;

            const start = new Date(Math.min(...departures));
            const end = new Date(Math.max(...arrivals));
            const diffDays =
              Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;

            if (diffDays && values.totalDays !== String(diffDays)) {
              setFieldValue("totalDays", diffDays);
            }
          }, [values.itineraries, setFieldValue]);

          // ✅ FIXED: useEffect for accommodations sync
          useEffect(() => {
            if (
              values.accommodations.length !== values.itineraries.length &&
              values.itineraries.length > 0
            ) {
              const diff =
                values.itineraries.length - values.accommodations.length;
              const newAcc = [...values.accommodations];

              if (diff > 0) {
                for (let i = 0; i < diff; i++) {
                  newAcc.push({
                    daysAccommodation: "",
                    typeOfOccupancy: "1",
                    nearestLandmark: "",
                  });
                }
              } else {
                newAcc.splice(diff);
              }
              setFieldValue("accommodations", newAcc);
            }
          }, [
            values.itineraries.length,
            values.accommodations.length,
            setFieldValue,
          ]);

          return (
            <Form noValidate onSubmit={handleSubmit}>
              {/* Employee Details */}
              <div className="section">
                <SectionHeader
                  className="SectionHeader"
                  title="Employee Details"
                  open={openSections.employee}
                  onToggle={() => toggle("employee")}
                />
                {openSections.employee && (
                  <div className="section-body">
                    
                    <table className="table table-bordered">                     
                      <tbody>                       
                        <tr>
                          <th width="33.33%">Employee Type</th>
                          <td>{values.employeeType}</td> 
                        </tr>
                        <tr>
                          <th>Travel ID</th>
                          <td>{values.travelID}</td> 
                        </tr>
                        <tr>
                          <th>Employee Name</th>
                          <td colSpan="2">{values.employeeName}</td>                          
                        </tr>
                        <tr>
                          <th>Employee ID</th>
                          <td>{values.employeeID}</td> 
                        </tr>
                        {values.employeeDepartment && (
                          <tr>
                            <th>Employee Department</th>
                            <td>{values.employeeDepartment}</td> 
                          </tr>
                        )}
                        <tr>
                          <th>Group booking Required?</th>
                          <td>{values.groupBooking}</td>                          
                        </tr>
                        {values.groupBooking === "Yes" && values.employeeList && (
                          <tr>
                            <th>Employees List</th>
                            <td>{values.employeeList}</td>                          
                          </tr>
                        )}
                      </tbody>
                    </table>

                  </div>
                )}
              </div>

              {/* Project Details */}
              <div className="section">
                <SectionHeader
                  title="Project Details"
                  open={openSections.project}
                  onToggle={() => toggle("project")}
                />
                {openSections.project && (
                  <div className="section-body">
                 
                    <table className="table table-bordered">                     
                      <tbody>
                       
                        <tr>
                          <th width="33.33%">Project Type</th>
                          <td>{values.projectType}</td> 
                        </tr>
                        {values.projectType === "Specific" && (
                          <tr>
                            <th>Project ID / Name</th>
                            <td>{values.projectID}</td> 
                          </tr>
                        )}                   
                      </tbody>
                    </table>
                   
                  </div>
                )}
              </div>

              {/* Travel Details */}
              <div className="section">
                <SectionHeader
                  title="Travel Details"
                  open={openSections.travel}
                  onToggle={() => toggle("travel")}
                />
                {openSections.travel && (
                  <div className="section-body">

                    <table className="table table-bordered">                     
                      <tbody>
                       
                        <tr>
                          <th width="33.33%">Type of Visit</th>
                          <td>{values.typeOfVisit}</td> 
                        </tr>
                        <tr>
                          <th width="33.33%">Mode of Travel</th>
                          <td>{values.ModeofTravel}</td>
                        </tr>
                        <tr>
                          <th>Purpose of Visit</th>
                          <td>{values.purpose}</td> 
                        </tr>
                        {values.typeOfVisit === "International" && (
                          <>
                            <tr>
                              <th>Currency Type</th>
                              <td>{values.currencyType}</td>                          
                            </tr>
                            <tr>
                              <th>SIM Required</th>
                              <td>{values.simRequired}</td>                          
                            </tr>
                            {values.simRequired === "Yes" && (
                              <tr>
                                <th>Recharge Amount</th>
                                <td>{values.rechargeAmount}</td>                          
                              </tr>
                            )}
                          </>
                        )}                                          
                      </tbody>
                    </table> 


                    <table className="table table-bordered">                     
                      <tbody> 
                       
                        <tr>
                          <th width="33.33%">Place of Visit (Origin → Destination)</th>
                          <th>Expected date of departure</th>  
                          <th>Expected date of arrival</th>                        
                        </tr> 
                        
                        {values.itineraries.map((itinerary, index) => (
                          <tr key={index}>
                            <td>{itinerary.origin} → {itinerary.destination}</td>
                            <td>{formatDate(itinerary.departure)}</td>  
                            <td>{formatDate(itinerary.arrival)}</td>                        
                          </tr>
                        ))}
                      
                        <tr>
                          <th>Expected duration of Days</th>
                          <td colSpan="2">
                            {(() => {
                              if (!values.itineraries || values.itineraries.length === 0) return 'N/A';
                              
                              // Calculate days for each individual travel and sum them up
                              let totalDays = 0;
                              
                              values.itineraries.forEach(it => {
                                const departure = new Date(it.departure);
                                const arrival = new Date(it.arrival);
                                
                                if (!isNaN(departure.getTime()) && !isNaN(arrival.getTime())) {
                                  const days = Math.round((arrival - departure) / (1000 * 60 * 60 * 24)) + 1;
                                  totalDays += days;
                                }
                              });
                              
                              if (totalDays === 0) return 'N/A';
                              
                              return `${totalDays} Day${totalDays !== 1 ? 's' : ''}`;
                            })()}
                          </td>                        
                        </tr>                      
                      </tbody>
                    </table>  
               
                  </div>
                )}
              </div>

              {/* Accommodation Details */}
              <div className="section">
                <SectionHeader
                  title="Accommodation Details"
                  open={openSections.accommodation}
                  onToggle={() => toggle("accommodation")}
                />
                {openSections.accommodation && (
                  <div className="section-body">

                    {values.accommodations.map((acc, index) => (
                      <table key={index} className="table table-bordered" style={{ marginTop: index > 0 ? '20px' : '0' }}>                     
                        <tbody>
                          <tr>
                            <th colSpan="2" style={{ backgroundColor: '#f0f0f0' }}>
                              Location {index + 1}: {acc.placeoforigin} → {acc.placeofarrival}
                            </th>
                          </tr>
                          <tr>
                            <th width="33.33%">Travel Dates</th>
                            <td>{formatDate(acc.departure_date)} to {formatDate(acc.aeparture_date)}</td>                                                  
                          </tr>
                          <tr>
                            <th width="33.33%">Expected duration of Days</th>
                            <td>
                              {(() => {
                                if (!acc.departure_date || !acc.aeparture_date) return 'N/A';
                                const start = new Date(acc.departure_date);
                                const end = new Date(acc.aeparture_date);
                                const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
                                return `${diffDays} Day${diffDays !== 1 ? 's' : ''}`;
                              })()}
                            </td>
                          </tr>
                          <tr>
                            <th width="33.33%">Is Hotel booking required</th>
                            <td>{acc.accDays > 0 ? "Yes" : "No"}</td>
                          </tr>
                          {acc.accDays > 0 && (
                            <>
                              <tr>
                                <th>No of days accommodation required</th>
                                <td>{acc.accDays} Days</td>                                                  
                              </tr>
                              {acc.landmark && (
                                <tr>
                                  <th>Nearest LandMark/Place for Hotel Booking</th>
                                  <td>{acc.landmark}</td> 
                                </tr>
                              )}
                              <tr>
                                <th>Type Of Occupancy</th>
                                <td>{acc.roomType === "1" ? "Single" : acc.roomType === "2" ? "Double" : "Multiple"}</td>                                                    
                              </tr>
                            </>
                          )}
                          <tr>
                            <th width="33.33%">Is Local Taxi required</th>
                            <td>{acc.taxiReq === "1" ? "Yes" : "No"}</td>
                          </tr>
                          {acc.taxiReq === "1" && (
                            <>
                              <tr>
                                <th>Type of Taxi Travel</th>
                                <td>{acc.taxiType === "1" ? "Point to Point" : "Full Day"}</td>                   
                              </tr>
                              {acc.startPlace && (
                                <tr>
                                  <th>Start Place</th>
                                  <td>{acc.startPlace}</td>                        
                                </tr>
                              )}
                              {acc.startTime && (
                                <tr>
                                  <th>Start Time</th>
                                  <td>{formatDateTime1(acc.startTime)}</td>                        
                                </tr>
                              )}
                              {acc.endPlace && (
                                <tr>
                                  <th>End Place</th>
                                  <td>{acc.endPlace}</td>                        
                                </tr>
                              )}
                            </>
                          )}                  
                        </tbody>
                      </table>
                    ))}
                    
                  </div>
                )}
              </div>

              {/* Other Details */}
              <div className="section">
                <SectionHeader
                  title="Other Details"
                  open={openSections.other}
                  onToggle={() => toggle("other")}
                />
                {openSections.other && (
                  <div className="section-body">

                    <table className="table table-bordered">                     
                      <tbody> 
                        <tr>
                          <th width="33.33%">Advance Cash Required</th>
                          <td>{values.advanceCashRequired}</td>                                                  
                        </tr>
                        {values.advanceCashRequired === "Yes" && values.advanceAmount && (
                          <tr>
                            <th width="33.33%">Amount Required</th>
                            <td>
                              {values.typeOfVisit === "Domestic" 
                                ? `₹ ${values.advanceAmount}` 
                                : `${getCurrencySymbol(values.currencyType)} ${values.advanceAmount}`}
                            </td>                                                  
                          </tr>
                        )}                                            
                      </tbody>
                    </table>

                    {rejectReasons && rejectReasons.length > 0 && (
                      <table className="table table-bordered" style={{ marginTop: '20px' }}>                     
                        <tbody>
                          <tr>
                            <th colSpan="2" style={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
                              Rejection History
                            </th>
                          </tr>
                          {rejectReasons.map((reject, index) => (
                            <React.Fragment key={index}>
                              <tr>
                                <th width="33.33%">Rejection Reason {rejectReasons.length > 1 ? `${index + 1}` : ''}</th>
                                <td>{reject.Reason}</td>                                                  
                              </tr>
                              <tr>
                                <th width="33.33%">Rejected Date & Time </th>
                                <td>{formatDateTime(reject.CtDateTime)}</td>                                                  
                              </tr>
                            </React.Fragment>
                          ))}                                        
                        </tbody>
                      </table>
                    )}

                   

                    <div className="d-flex gap-3 justify-content-center mt-3 tview-form-ftr">
                     
                      {isApprovalMode ? (
                        <>
                          <Button
                            type="button"
                            variant="secondary"
                            className="back-btn"
                          // onClick={() => navigate("/travelrequest")}
                            onClick={() => navigate(-1)}
                            disabled={approving}
                          >
                            Back
                          </Button>
                          
                          <Button
                            type="button"
                            variant="danger"
                            className="reject-btn"
                            onClick={() => setShowRejectModal(true)}
                            disabled={approving}
                          >
                            Reject
                          </Button>
                          
                          <Button
                            type="button"
                            variant="success"
                            className="approve-btn"
                            onClick={() => handleApproval('approved')}
                            disabled={approving}
                          >
                            {approving ? 'Processing...' : 'Approve'}
                          </Button>
                        </>
                      ) : (
                        <Button
                          type="button"
                          variant="secondary"
                          className="close-btn"
                          onClick={() => window.history.back()}
                        >
                          Close
                        </Button>
                      )}

                    </div>
                  </div>
                )}
              </div>
            </Form>
          );
        }}
      </Formik>
    </Container>
  </div>

    </>
  );
};

export default DashviewFormData;
