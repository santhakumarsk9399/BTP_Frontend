import React, { useState, useEffect } from "react";
import { Formik, FieldArray } from "formik";
import * as Yup from "yup";
import { Container, Row, Col, Form, Button, Card, Modal } from "react-bootstrap";
import "./TravelForms.css";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import uparrow from "../../assets/createrequest/up-arrow.png";
import downarrow from "../../assets/createrequest/down-arrow.png";
import checkIcon from "../../assets/check.png";
import ImageIcon from "../CommonComponents/ImageIcon";
import { useNavigate, useParams } from "react-router-dom";
import MultiSelectDropdown from "../CommonComponents/MultiSelectDropDown";
import axios from "axios";
import { toast } from "react-toastify";
import { FaArrowLeftLong } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa6";
import { TiMinus } from "react-icons/ti";
import { FaCheckCircle } from "react-icons/fa";

const SectionHeader = ({ title, open, onToggle }) => (
  <div className="section-header" onClick={onToggle}>
    <div className="sectitle">
      <h5 className="secLabel">{title}</h5>
    </div>
    <div className="header-line"></div>
    <div className="toggle-icon">
      {open ? (
        <ImageIcon img={uparrow} Img_height={"28px"} Img_width={"28px"} />
      ) : (
        <ImageIcon img={downarrow} Img_height={"28px"} Img_width={"28px"} />
      )}
    </div>
  </div>
);
//Check DashboardMainPage.jsx line no 118 to 124
const TravelForm = ({
  onBackClick = () => {},
  editData: propEditData = null,
  mode = "create",
}) => {
  const navigate = useNavigate();
  const { travelId } = useParams(); // Get travelId from URL params
  const [editData, setEditData] = useState(propEditData);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [openSections, setOpenSections] = useState({
    employee: true,
    project: true,
    travel: true,
    accommodation: true,
    other: true,
  });
  const [travelTicketID, setTravelTicketID] = useState("");
  const [employeeListOptions, setEmployeeListOptions] = useState([]);
  const [groupBookingEmployeeList, setGroupBookingEmployeeList] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;
  const employeeDesg = sessionStorage.getItem("empDesignation");
  const toggle = (key) => setOpenSections((s) => ({ ...s, [key]: !s[key] }));
  const RequiredIcon = () => <span style={{ color: "red" }}> *</span>;
  // Fetch edit data when travelId is present in URL
  useEffect(() => {
    const fetchEditData = async () => {
      if (!travelId) return; // Only fetch if we have a travelId in the URL

      setLoading(true);
      try {
        const token = sessionStorage.getItem("empToken");

        // Extract only numeric part from travelId (remove TID_ prefix if present)
        const numericTravelId = travelId.replace(/^TID_/, "");

        // Fetch specific travel request data using the view API (GET request)
        const response = await axios.get(
          `${API_URL}/btp/view?travel_id=${numericTravelId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Travel view data fetched:", response.data);

        if (response?.data?.success && response?.data?.data) {
          const apiData = response.data.data;
          const employeeInfo = apiData.employeeInfo?.[0] || {};
          const selectedEmployeeInfo = apiData.selectedEmployeeInfo || [];
          const projectInfo = apiData.projectInfo || [];
          const employeeDetails = apiData.employeeDetails?.[0] || {};
          const travelDetails = apiData.travelDetails?.[0] || {};
          const accommodationDetails = apiData.accommodationDetails || [];

          const employeeID = apiData.employeeInfo?.[0].empID || {};
         console.log(apiData,"api response")
          // console.log("Employee Info:", employeeInfo);
          // console.log("Selected Employee Info:", selectedEmployeeInfo);
          // console.log("Project Info:", projectInfo);
          // console.log("Employee Details:", employeeDetails);
          // console.log("Travel details:", travelDetails);
          // console.log("Accommodation details:", accommodationDetails);

          

          // Parse departure and arrival dates from format "2025-11-01 00:00:00.000" or "2025-11-01"
          const parseDate = (dateStr) => {
            if (!dateStr) return "";

            try {
              // Handle format: "2025-11-01 00:00:00.000" or "2025-11-01"
              const date = new Date(dateStr);

              if (isNaN(date.getTime())) {
                console.warn("Could not parse date:", dateStr);
                return "";
              }

              // Return YYYY-MM-DD format
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, "0");
              const day = String(date.getDate()).padStart(2, "0");

              return `${year}-${month}-${day}`;
            } catch (error) {
              console.error("Error parsing date:", dateStr, error);
              return "";
            }
          };

          // Parse starttime to extract time from format "2025-11-04T16:04:00.000Z"
          const parseStartTime = (startTimeStr) => {
            if (!startTimeStr) return "";
            try {
              const date = new Date(startTimeStr);
              if (isNaN(date.getTime())) return "";

              const hours = String(date.getHours()).padStart(2, "0");
              const minutes = String(date.getMinutes()).padStart(2, "0");

              return `${hours}:${minutes}`;
            } catch (error) {
              console.error("Error parsing start time:", startTimeStr, error);
              return "";
            }
          };

          // Get employee info - use logged-in user's ID if not provided
          const loggedEmpId = sessionStorage.getItem("empID") || "";
          const loggedEmpName = sessionStorage.getItem("empName") || "";
          const loggedEmpDept = sessionStorage.getItem("empDepartment") || "";

          // Parse isGroup: 1 = "Yes", 0 = "No"
          const isGroupBooking =
            employeeInfo.isGroup === 1 || employeeInfo.isGroup === "1";

          // Get employee names from selectedEmployeeInfo (these are group booking members)
          let employeeList = [];
          if (isGroupBooking && selectedEmployeeInfo.length > 0) {
            employeeList = selectedEmployeeInfo.map(emp => emp.EmpName);
          }

          // Get main requesting employee from employeeInfo (the main travel requester)
          // employeeInfo contains the main employee who created the request
          // selectedEmployeeInfo contains the group booking members
          const mainEmployeeName = employeeInfo.empName || employeeDetails.empName || loggedEmpName;
          const mainEmployeeId = employeeInfo.empID || employeeDetails.empId || loggedEmpId;

          // Determine employee type: Check if Emp_Type is 1 and if it's the logged-in user
          let employeeType = "Self";
          if (travelDetails.Emp_Type === 1 || travelDetails.Emp_Type === "1") {
            // Check if the main employee is the logged-in user
            const isSelf = 
              String(mainEmployeeId) === loggedEmpId || 
              mainEmployeeName === loggedEmpName;
            
            employeeType = isSelf ? "Self" : "Others";
          }

          // Parse project IDs from projectInfo array
          let projectIDs = [];
          let projectType = "General";
          if (projectInfo && projectInfo.length > 0) {
            projectIDs = projectInfo.map(p => p.pid);
            projectType = "Specific";
          }

          // Parse typeOfVisit: "0" = Domestic, "1" = International
          const typeOfVisit =
            travelDetails.Typeofvisit === "0" || travelDetails.Typeofvisit === 0
              ? "Domestic"
              : "International";

          // Group accommodation details by unique itinerary
          // Each unique combination of origin-arrival-departure-arrival represents one itinerary
          const uniqueItineraries = new Map();
          
          accommodationDetails.forEach((acc) => {
            const key = `${acc.placeoforigin}-${acc.placeofarrival}-${acc.departure_date}-${acc.aeparture_date}`;
            
            if (!uniqueItineraries.has(key)) {
              // This is a new itinerary - initialize it
              const departureDate = parseDate(acc.departure_date);
              const arrivalDate = parseDate(acc.aeparture_date);
              const startTime = parseStartTime(acc.startTime);
              
              uniqueItineraries.set(key, {
                place: acc.placeoforigin || "",
                arrivalPlace: acc.placeofarrival || "",
                departure: departureDate,
                arrival: arrivalDate,
                hotelBookingRequired: "No",
                daysAccommodation: "",
                nearestLandmark: "",
                typeOfOccupancy: acc.roomType ? String(acc.roomType) : "1",
                localTaxiRequired: "No",
                taxiType: "Point to Point",
                startPlace: "",
                startDate: departureDate,
                startTime: startTime,
                endPlace: ""
              });
            }
            
            // Update itinerary based on what this accommodation record has
            const itinerary = uniqueItineraries.get(key);
            
            // If accDays is not "0", then hotel booking is required
            if (acc.accDays !== "0" && acc.accDays) {
              itinerary.hotelBookingRequired = "Yes";
              itinerary.daysAccommodation = acc.accDays;
              itinerary.nearestLandmark = acc.landmark || "";
            }
            
            // If taxiReq is "1", then local taxi is required
            if (acc.taxiReq === "1") {
              itinerary.localTaxiRequired = "Yes";
              itinerary.taxiType = acc.taxiType === "1" ? "Point to Point" : "Full Day";
              itinerary.startPlace = acc.startPlace || "";
              itinerary.endPlace = acc.endPlace || "";
            }
          });

          const itinerariesData = Array.from(uniqueItineraries.values());
          // console.log(travelDetails.ModeOfTravel);
          // Transform the API response to match the form structure
          const transformedData = {
            travelId: travelId, // Keep original format for display
            employeeName: mainEmployeeName,
            employeeID: String(mainEmployeeId),
            department: loggedEmpDept, // Use logged-in employee department
            ModeOfTravel: travelDetails.ModeOfTravel,
            employeeType: employeeType,
            groupBooking: isGroupBooking ? "Yes" : "No",
            employeeList: employeeList,
            projectType: projectType,
            projectID: projectIDs,
            projectName: [], // Will be auto-populated from projectID
            itineraries: itinerariesData.length > 0 ? itinerariesData : [
              {
                place: "",
                arrivalPlace: "",
                departure: "",
                arrival: "",
                hotelBookingRequired: "Yes",
                daysAccommodation: "",
                nearestLandmark: "",
                typeOfOccupancy: "1",
                localTaxiRequired: "Yes",
                startPlace: "",
                startDate: "",
                startTime: "",
                endPlace: ""
              }
            ],
            totalDays: "", // Will be auto-calculated
            purposeOfVisit: travelDetails.Purpose || "",
            typeOfVisit: typeOfVisit,
            currencyType: travelDetails.Currency_Type || "",
            simRequired:
              travelDetails.Top_Up_Amount && travelDetails.Top_Up_Amount > 0
                ? "Yes"
                : "No",
            rechargeAmount: travelDetails.Top_Up_Amount
              ? String(travelDetails.Top_Up_Amount)
              : "",
            advanceCashRequired:
              travelDetails.Advance_Cash && travelDetails.Advance_Cash > 0
                ? "Yes"
                : "No",
            advanceAmount: travelDetails.Advance_Cash
              ? String(travelDetails.Advance_Cash)
              : "",
          };

          // console.log("Transformed data:", transformedData);
          // console.log("Itineraries:", transformedData.itineraries);
          setEditData(transformedData)
        } else {
          navigate("/travelrequest");
        }
      } catch (error) {
        console.error("Error fetching edit data:", error);
        navigate("/travelrequest");
      } finally {
        setLoading(false);
      }
    };

    fetchEditData();
  }, [travelId, API_URL, navigate]);

  // Fetch Travel Ticket ID when form opens (only for new requests)
  useEffect(() => {
    const fetchTravelTicketID = async () => {
      // Only fetch if not in edit mode
      if (editData) return;

      try {
        const token = sessionStorage.getItem("empToken");
        const response = await axios.get(`${API_URL}/btp/ticketID`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Expires: "0",
          },
        });

        // console.log("Travel Ticket ID Response:", response);
        if (response?.data?.success) {
          setTravelTicketID(response.data.ticketID);
          // console.log("Ticket ID is ", response.data.ticketID);
        }
      } catch (error) {
        console.error("Error fetching travel ticket ID:", error);
        // Fallback to default if API fails
        setTravelTicketID("TID_0041");
      }
    };

    fetchTravelTicketID();
  }, [API_URL, editData]);
// console.log(employeeDesg,"emp")
  // Fetch Employee Team List for "Others" dropdown
  useEffect(() => {
    const fetchEmployeeTeamList = async () => {
      try {
        const token = sessionStorage.getItem("empToken");
        const username = sessionStorage.getItem("empName");

        if (!username) {
          console.error("No username found in sessionStorage");
          setEmployeeListOptions([]);
          return;
        }

        const response = await axios.get(
          `${API_URL}/btp/employeeteam?empname=${encodeURIComponent(username)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // console.log("Employee Team List Response:", response);
        if (response?.data?.success && response?.data?.employees) {
          // Transform API response to match the expected format
          const formattedEmployees = response.data.employees.map((emp) => ({
            id: emp.Emp_id.toString(),
            name: emp.Emp_name,
            department: emp.Department,
          }));
          setEmployeeListOptions(formattedEmployees);
        }
      } catch (error) {
        console.error("Error fetching employee team list:", error);
        // Set empty array as fallback
        setEmployeeListOptions([]);
      }
    };

    fetchEmployeeTeamList();
  }, [API_URL]);

  // Convert employee IDs to names when both editData and employeeListOptions are available
  useEffect(() => {
    if (
      editData &&
      editData.groupBooking === "Yes" &&
      editData.employeeList &&
      editData.employeeList.length > 0 &&
      employeeListOptions.length > 0
    ) {
      // Check if employeeList contains IDs (numbers) instead of names
      const firstItem = editData.employeeList[0];
      const isIdFormat = !isNaN(firstItem); // Check if it's a number

      if (isIdFormat) {
        // Convert IDs to names
        const employeeNames = editData.employeeList
          .map((id) => {
            const employee = employeeListOptions.find(
              (emp) => emp.id === id || emp.id === String(id)
            );
            return employee ? employee.name : null;
          })
          .filter((name) => name !== null);

        // console.log(
        //   "Converting employee IDs to names:",
        //   editData.employeeList,
        //   "=>",
        //   employeeNames
        // );

        // Update editData with names
        setEditData((prev) => ({
          ...prev,
          employeeList: employeeNames,
        }));
      }
    }
  }, [editData?.employeeList, employeeListOptions]);

  // Get logged-in user data from sessionStorage
  const loggedUser = {
    id: sessionStorage.getItem("empID"),
    name: sessionStorage.getItem("empName"),
    department: sessionStorage.getItem("empDepartment"),
  };

  // Project options for Project ID / Project Name multi-selects
  const projectOptions = [
    /*{ id: "PRJ001 - DELBI", name: "DELBI" },
    { id: "PRJ002 - DELBI2.0", name: "DELBI2.0" },
    { id: "PRJ003 - VideoAnalytics", name: "VideoAnalytics" },
    { id: "PRJ004 - Occupancy", name: "Occupancy" },
    { id: "PRJ005 - Occupancy2.0", name: "Occupancy2.0" },
    { id: "PRJ006 - Stride+", name: "Stride+" },*/
{id: 'JK-1 - MF-UFCP Test Rig_AMC', name: 'MF-UFCP Test Rig_AMC'},
{id: 'JK-3 - MF-UFCP Test Rig', name: 'MF-UFCP Test Rig'},
{id: 'JK-5 - Homing System Manager Card_10 Nos', name: 'Homing System Manager Card_10 Nos'},
{id: 'JK-7 - Actuating Amplifier_10 Nos', name: 'Actuating Amplifier_10 Nos'},
{id: 'JK-9 - IDAS', name: 'IDAS'},
{id: 'JK-11 - VME DIO-2 Card', name: 'VME DIO-2 Card'},
{id: 'JK-15 - CCTV Camera', name: 'CCTV Camera'},
{id: 'JK-16 - Homing System Manager Card_55 Nos', name: 'Homing System Manager Card_55 Nos'},
{id: 'JK-22 - RDM-2C [178Qty]', name: 'RDM-2C [178Qty]'},
{id: 'JK-23 - TI Core-VGA Detector (PNC)', name: 'TI Core-VGA Detector (PNC)'},
{id: 'JK-26 - Actuating Amplifier_55 Nos', name: 'Actuating Amplifier_55 Nos'},
{id: 'JK-28 - PATS Type I', name: 'PATS Type I'},
{id: 'JKGE-29 - Org Overhead', name: 'Org Overhead'},
{id: 'JK-32 - MF-UFCP 360', name: 'MF-UFCP 360'},
{id: 'JKRE-33 - Ultra+', name: 'Ultra+'},
{id: 'JK-34 - Actuator Test Set Up', name: 'Actuator Test Set Up'},
{id: 'JK-35 - PPCIS MOD3', name: 'PPCIS MOD3'},
{id: 'JK-36 - Portable Underwater Vehicle Simulator', name: 'Portable Underwater Vehicle Simulator'},
{id: 'JK-39 - IDAS Warranty Service', name: 'IDAS Warranty Service'},
{id: 'JK-40 - Accord-Rugged and Standard 7" & 5" Displays', name: 'Accord-Rugged and Standard 7" & 5" Displays'},
{id: 'JK-41 - MF-UFCP LCD Modifications', name: 'MF-UFCP LCD Modifications'},
{id: 'JK-43 - MF-UFCP Obsolescence Management', name: 'MF-UFCP Obsolescence Management'},
{id: 'JK-45 - 10.1 inch Display for EO', name: '10.1 inch Display for EO'},
{id: 'JK-46 - Static Test Jig (STJ) for DCU', name: 'Static Test Jig (STJ) for DCU'},
{id: 'JK-47 - Electro Optical System', name: 'Electro Optical System'},
{id: 'JK-48 - Automatic Test Equipment (ATE) FOR BHEEM-EUMK-2 LCA', name: 'Automatic Test Equipment (ATE) FOR BHEEM-EUMK-2 LCA'},
{id: 'JK-49 - ECFM-C I Level Tester', name: 'ECFM-C I Level Tester'},
{id: 'JK-50 - CIU I Level Tester', name: 'CIU I Level Tester'},
{id: 'JK-51 - ATS_AMC', name: 'ATS_AMC'},
{id: 'JK-54 - PWM & Elevon Rudder Card', name: 'PWM & Elevon Rudder Card'},
{id: 'JKRE-56 - Retail General Activities - Customer Escalations, & POC Activities', name: 'Retail General Activities - Customer Escalations, & POC Activities'},
{id: 'JK-62 - RDM-2C(A) [28Qty]', name: 'RDM-2C(A) [28Qty]'},
{id: 'JK-67 - Actuator Test Set Up _FC', name: 'Actuator Test Set Up _FC'},
{id: 'JK-68 - VME DIO-2 FC', name: 'VME DIO-2 FC'},
{id: 'JK-69 - Night Vision Sight for Hunting Market', name: 'Night Vision Sight for Hunting Market'},
{id: 'JK-71 - TI Camera for UAV(Next Gen)', name: 'TI Camera for UAV(Next Gen)'},
{id: 'JK-72 - Stabilized EO payload for UAV', name: 'Stabilized EO payload for UAV'},
{id: 'JK-73 - Situational Awareness Tech development', name: 'Situational Awareness Tech development'},
{id: 'JK-74 - IDAS', name: 'IDAS'},
{id: 'JK-75 - CIU & ECFM - NRE', name: 'CIU & ECFM - NRE'},
{id: 'JK-76 - ATS-Type-III', name: 'ATS-Type-III'},
{id: 'JK-77 - TI Core-VGA Detector', name: 'TI Core-VGA Detector'},
{id: 'JK-78 - QVGA TI Camera', name: 'QVGA TI Camera'},
{id: 'JK-79 - ATS with Levcon (CMTI Type)', name: 'ATS with Levcon (CMTI Type)'},
{id: 'JK-83 - MDAC Type 2_ 10Nos', name: 'MDAC Type 2_ 10Nos'},
{id: 'JK-84 - RDM-2C [32Qty]', name: 'RDM-2C [32Qty]'},
{id: 'JK-86 - E9.6 Modem [30nos]', name: 'E9.6 Modem [30nos]'},
{id: 'JKRE-87 - Occupancy 2.0', name: 'Occupancy 2.0'},
{id: 'JK-88 - TIWS SAMPLES NC NC BASIS', name: 'TIWS SAMPLES NC NC BASIS'},
{id: 'JK-89 - Optics Development', name: 'Optics Development'},
{id: 'JK-90 - BID Support', name: 'BID Support'},
{id: 'JKRE-91 - STRIDE+  Enhancements', name: 'STRIDE+  Enhancements'},
{id: 'JK-92 - Repair & Services', name: 'Repair & Services'},
{id: 'JK-93 - EO & LAND BID PROPOSAL', name: 'EO & LAND BID PROPOSAL'},
{id: 'JK-94 - ATE Bid Proposal', name: 'ATE Bid Proposal'},
{id: 'JKRE-95 - DELBI 2.0', name: 'DELBI 2.0'},
{id: 'JK-96 - Driver Night Vision System', name: 'Driver Night Vision System'},
{id: 'JK-98 - Counter Balancing Equalization & Pursuit Module (CBEPM)', name: 'Counter Balancing Equalization & Pursuit Module (CBEPM)'},
{id: 'JKRE-100 - Ultra+ Customer order', name: 'Ultra+ Customer order'},
{id: 'JKRE-101 - Stride Master & Slave Production', name: 'Stride Master & Slave Production'},
{id: 'JKRE-102 - Video Analytics', name: 'Video Analytics'},
{id: 'JKRE-103 - Stride Customer order', name: 'Stride Customer order'},
{id: 'JK-104 - MF-UFCP Software Loader Cum Tester', name: 'MF-UFCP Software Loader Cum Tester'},
{id: 'JKRE-108 - Repair Activity', name: 'Repair Activity'},
{id: 'JK-110 - MF-UFCP 360 AMC', name: 'MF-UFCP 360 AMC'},
{id: 'JKRE-111 - PCS stock updation', name: 'PCS stock updation'},
{id: 'JKRE-112 - Retail_Customer Service', name: 'Retail_Customer Service'},
{id: 'JK-113 - MFSTAR-RC_PSP Unit', name: 'MFSTAR-RC_PSP Unit'},
{id: 'JKRE-114 - Ultra + _500 no', name: 'Ultra + _500 nos'},
{id: 'JK-115 - TIWS -Medium Range TI', name: 'TIWS -Medium Range TI'},
{id: 'JK-116 - Small Engine Test', name: 'Small Engine Test'},
{id: 'JKRE-117 - Retail Internal Validation', name: 'Retail Internal Validation'},
{id: 'JK-118 - Main Electronics Unit (MEU)', name: 'Main Electronics Unit (MEU)'},
{id: 'JKRE-119 - Stride_125 no', name: 'Stride_125 no'},
{id: 'JK-121 - HAL Repair Unit-MF-UFCP 360', name: 'HAL Repair Unit-MF-UFCP 360'},
{id: 'JK-122 - BID Support', name: 'BID Support'}
  ];
  // ✅ API → UI ModeOfTravel mapper (GLOBAL to component)
  // API → UI (EDIT)
  const mapMotFromApi = (mot) => {
    switch (Number(mot)) {
      case 1:
        return "Air";
      case 2:
        return "Train";
      case 3:
        return "Bus";
      case 4:
        return "Taxi/Cab";
      default:
        return "Air"; // safe fallback
    }
  };
  
  
  // Map editData to form structure if provided
  const getInitialValuesFromEdit = () => {
    if (!editData) return null;

    // Map project IDs to project names
    const projectIDs = editData.projectID || [];
    const projectNames = projectIDs
      .map((id) => {
        const project = projectOptions.find((p) => p.id === id);
        return project ? project.name : null;
      })
      .filter((name) => name !== null);

    // Determine employee type based on Emp_Type and employeeDetails
    let employeeType = "Self";
    if (editData.Emp_Type === 1) {
      // Check if the employee in employeeDetails is the logged-in user
      const employeeDetails = editData.employeeDetails || [];
      const isSelf = employeeDetails.length === 1 && 
                     (employeeDetails[0].empName === loggedUser.name || 
                      employeeDetails[0].empId === loggedUser.id);
      employeeType = isSelf ? "Self" : "Others";
    }
    // console.log(editData,"mo")
    // Map complete edit data structure
    return {
      employeeType: employeeType,
      travelID: editData.travelId || "",
      employeeName: editData.employeeName || loggedUser.name,
      employeeID: editData.employeeID || loggedUser.id,
      employeeDepartment: editData.department || loggedUser.department,
      ModeOfTravel: editData.ModeOfTravel || "Air",
      groupBooking: editData.groupBooking || "No",
      employeeList: editData.employeeList || [],
      projectType: editData.projectType || "Specific",
      projectID: projectIDs,
      projectName: projectNames,
      itineraries: editData.itineraries || [
        { 
          place: "", 
          arrivalPlace: "", 
          departure: "", 
          arrival: "",
          hotelBookingRequired: "Yes",
          daysAccommodation: "",
          nearestLandmark: "",
          typeOfOccupancy: "1",
          localTaxiRequired: "Yes",
          taxiType: "Point to Point",
          startPlace: "",
          startDate: "",
          startTime: "12:00",
          endPlace: ""
        },
      ],
      totalDays: editData.totalDays || "",
      purposeOfVisit: editData.purposeOfVisit || editData.purpose || "",
      typeOfVisit: editData.typeOfVisit || "Domestic",
      currencyType: editData.currencyType || "",
      simRequired: editData.simRequired || "Yes",
      rechargeAmount: editData.rechargeAmount || "",
      hotelBookingRequired: editData.hotelBookingRequired || "Yes",
      accommodations: editData.accommodations || [
        { daysAccommodation: "", typeOfOccupancy: "1", nearestLandmark: "" },
      ],
      localTaxiRequired: editData.localTaxiRequired || "Yes",
      taxiType: editData.taxiType || "Point to Point",
      taxiDetails: editData.taxiDetails || [
        { startPlace: "", startDate: "", startTime: "", endPlace: "" },
      ],
      advanceCashRequired: editData.advanceCashRequired || "Yes",
      advanceAmount: editData.advanceAmount || "",
    };
  };

  const initialValues = editData
    ? getInitialValuesFromEdit()
    : {
        employeeType: "Self",
        travelID: travelTicketID,
        employeeName: loggedUser.name,
        employeeID: loggedUser.id,
        employeeDepartment: loggedUser.department,
        ModeOfTravel: "Air",
        groupBooking: "No",
        employeeList: [],
        projectType: "General",
        // allow multiple projects to be selected
        projectID: [],
        projectName: [],
        itineraries: [{ 
          place: "", 
          arrivalPlace: "", 
          departure: "", 
          arrival: "",
          hotelBookingRequired: "Yes",
          daysAccommodation: "",
          nearestLandmark: "",
          typeOfOccupancy: "1",
          localTaxiRequired: "Yes",
          taxiType: "Point to Point",
          startPlace: "",
          startDate: "",
          startTime: "12:00",
          endPlace: ""
        }],
        totalDays: "",
        purposeOfVisit: "",
        typeOfVisit: "Domestic",
        currencyType: "",
        simRequired: "Yes",
        rechargeAmount: "",
        hotelBookingRequired: "Yes",
        accommodations: [
          { daysAccommodation: "", typeOfOccupancy: "1", nearestLandmark: "" },
        ],
        localTaxiRequired: "Yes",
        taxiType: "Point to Point",
        taxiDetails: [
          { startPlace: "", startDate: "", startTime: "", endPlace: "" },
        ],
        advanceCashRequired: "Yes",
        advanceAmount: "",
      };

  const validationSchema = Yup.object().shape({
    employeeType: Yup.string().required("Employee type is required"),
    employeeName: Yup.string().required("Employee name is required"),
    employeeID: Yup.string().required("Employee ID is required"),
    employeeDepartment: Yup.string().required("Department is required"),
    groupBooking: Yup.string().required("Group booking selection is required"),
    employeeList: Yup.array().when("groupBooking", {
      is: "Yes",
      then: (schema) =>
        schema
          .min(1, "Please select at least one employee")
          .required("Employee list is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    projectType: Yup.string().required("Project type is required"),
    projectID: Yup.array().when("projectType", {
      is: "Specific",
      then: (schema) =>
        schema
          .min(1, "Please select at least one project")
          .required("Project selection is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    itineraries: Yup.array()
      .of(
        Yup.object().shape({
          place: Yup.string()
            .required("Place of origin is required")
            .max(255, "Place of origin must be at most 255 characters"),
          arrivalPlace: Yup.string()
            .required("Place of arrival is required")
            .max(255, "Place of arrival must be at most 255 characters"),
          departure: Yup.date()
            .required("Departure date is required")
            .typeError("Invalid date format")
            .max(
              Yup.ref("arrival"),
              "Departure date cannot be after arrival date"
            )
            .test(
              "no-date-overlap",
              function(value) {
                if (!value) return true;
                
                const currentIndex = this.options.index;
                const allItineraries = this.options.from[1].value.itineraries;
                const currentArrival = this.parent.arrival;
                
                if (!currentArrival) return true;
                
                const currentStart = new Date(value);
                const currentEnd = new Date(currentArrival);
                
                // Check for overlaps with other itineraries
                for (let i = 0; i < allItineraries.length; i++) {
                  if (i === currentIndex) continue;
                  
                  const other = allItineraries[i];
                  if (!other.departure || !other.arrival) continue;
                  
                  const otherStart = new Date(other.departure);
                  const otherEnd = new Date(other.arrival);
                  
                  // Check if dates overlap
                  if (currentStart <= otherEnd && currentEnd >= otherStart) {
                    return this.createError({
                      message: `Date range overlaps with Travel Plan ${i + 1}. Please ensure travel dates don't overlap.`
                    });
                  }
                }
                
                return true;
              }
            ),
          arrival: Yup.date()
            .required("Arrival date is required")
            .typeError("Invalid date format")
            .min(
              Yup.ref("departure"),
              "Arrival date must be after or equal to departure date"
            )
            .test(
              "no-date-overlap",
              function(value) {
                if (!value) return true;
                
                const currentIndex = this.options.index;
                const allItineraries = this.options.from[1].value.itineraries;
                const currentDeparture = this.parent.departure;
                
                if (!currentDeparture) return true;
                
                const currentStart = new Date(currentDeparture);
                const currentEnd = new Date(value);
                
                // Check for overlaps with other itineraries
                for (let i = 0; i < allItineraries.length; i++) {
                  if (i === currentIndex) continue;
                  
                  const other = allItineraries[i];
                  if (!other.departure || !other.arrival) continue;
                  
                  const otherStart = new Date(other.departure);
                  const otherEnd = new Date(other.arrival);
                  
                  // Check if dates overlap
                  if (currentStart <= otherEnd && currentEnd >= otherStart) {
                    return this.createError({
                      message: `Date range overlaps with itinerary ${i + 1}. Please ensure travel dates don't overlap.`
                    });
                  }
                }
                
                return true;
              }
            ),
          hotelBookingRequired: Yup.string().required("Hotel booking selection is required"),
          daysAccommodation: Yup.string().when("hotelBookingRequired", {
            is: "Yes",
            then: (schema) => schema
              .required("Number of days is required")
              .matches(/^\d+$/, "Please enter a valid number")
              .test(
                "max-days",
                "Accommodation days cannot exceed the duration between departure and arrival",
                function(value) {
                  const { departure, arrival } = this.parent;
                  if (!value || !departure || !arrival) return true;
                  
                  const start = new Date(departure);
                  const end = new Date(arrival);
                  const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
                  
                  return parseInt(value, 10) <= diffDays;
                }
              ),
            otherwise: (schema) => schema.notRequired(),
          }),
          nearestLandmark: Yup.string().when("hotelBookingRequired", {
            is: "Yes",
            then: (schema) => schema.required("Nearest landmark is required"),
            otherwise: (schema) => schema.notRequired(),
          }),
          typeOfOccupancy: Yup.string().required("Type of occupancy is required"),
          localTaxiRequired: Yup.string().required("Local taxi selection is required"),
          taxiType: Yup.string().when("localTaxiRequired", {
            is: "Yes",
            then: (schema) => schema.required("Taxi type is required"),
            otherwise: (schema) => schema.notRequired(),
          }),
          startPlace: Yup.string().when("localTaxiRequired", {
            is: "Yes",
            then: (schema) => schema.required("Start place is required"),
            otherwise: (schema) => schema.notRequired(),
          }),
          startDate: Yup.date().when("localTaxiRequired", {
            is: "Yes",
            then: (schema) => schema
              .required("Start date is required")
              .typeError("Invalid date format")
              .test(
                "date-range",
                "Taxi start date must be between departure and arrival dates",
                function(value) {
                  const { departure, arrival } = this.parent;
                  if (!value || !departure || !arrival) return true;
                  
                  const taxiDate = new Date(value);
                  const startDate = new Date(departure);
                  const endDate = new Date(arrival);
                  
                  return taxiDate >= startDate && taxiDate <= endDate;
                }
              ),
            otherwise: (schema) => schema.notRequired(),
          }),
          startTime: Yup.string().when("localTaxiRequired", {
            is: "Yes",
            then: (schema) => schema.required("Start time is required"),
            otherwise: (schema) => schema.notRequired(),
          }),
          endPlace: Yup.string().when(["localTaxiRequired", "taxiType"], {
            is: (localTaxiRequired, taxiType) => localTaxiRequired === "Yes" && taxiType === "Point to Point",
            then: (schema) => schema.required("End place is required"),
            otherwise: (schema) => schema.notRequired(),
          }),
        })
      )
      .min(1, "At least one itinerary is required"),
    purposeOfVisit: Yup.string()
      .required("Purpose of visit is required")
      .max(255, "Purpose of visit must be at most 255 characters"),
    typeOfVisit: Yup.string().required("Type of visit is required"),
    currencyType: Yup.string().when("typeOfVisit", {
      is: "International",
      then: (schema) =>
        schema.required("Currency type is required for international travel"),
      otherwise: (schema) => schema.notRequired(),
    }),
    simRequired: Yup.string().required("SIM card selection is required"),
    rechargeAmount: Yup.string().when(["typeOfVisit", "simRequired"], {
      is: (typeOfVisit, simRequired) =>
        typeOfVisit === "International" && simRequired === "Yes",
      then: (schema) =>
        schema
          .required("Recharge amount is required")
          .matches(/^\d+(\.\d{1,2})?$/, "Please enter a valid amount"),
      otherwise: (schema) => schema.notRequired(),
    }),
    advanceCashRequired: Yup.string().required(
      "Advance cash selection is required"
    ),
    advanceAmount: Yup.string().when("advanceCashRequired", {
      is: "Yes",
      then: (schema) =>
        schema
          .required("Advance amount is required")
          .matches(/^\d+(\.\d{1,2})?$/, "Please enter a valid amount")
          .test(
            "max-amount",
            "Advance amount cannot exceed 10000",
            function(value) {
              if (!value) return true;
              return parseFloat(value) <= 10000;
            }
          ),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  // Show loading state while fetching edit data
  if (loading) {
    return (
      <Container className="travel-form-container tcreate-form py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading travel request data...</p>
        </div>
      </Container>
    );
  }
  // ✅ Mode of Travel mapping (UI → API)
  const modeOfTravelMap = {
    Air: 1,
    Train: 2,
    Bus: 3,
    "Taxi/Cab": 4,
  };
  
  return (
    <>
      {/* Success Modal */}
      <Modal
        show={showSuccessModal}
        className="check-modal"
        onHide={() => {
          setShowSuccessModal(false);
          navigate("/travelrequest");
        }}
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Body className="text-center m-0">
          <div className="mb-0">
            <div className="check-cnt">
              <img src={checkIcon} alt="check" width="105" className="check-icon mb-0" />
            </div> 
          </div>
          <h4 className="check-modal-hd">
            {editData ? "Your Travel Request Is Updated" : "Your Travel Request Is Sent"}
            <br />
            For Approval
          </h4>

          <Button
            variant="secondary back-btn"
            onClick={() => {
              setShowSuccessModal(false);
              navigate("/travelrequest");
            }}       
          >
            Close
          </Button>
        </Modal.Body>
      </Modal>

    <div className="travel-form-container tcreate-form py-4">     
      <Container>
        <Row>
          {/* <Col>
            <h2 className="page-title mb-4">
            {mode === "approval"
              ? `Travel Request - ${editData?.travelId || travelId} (Approval)`
              : editData
              ? `Edit Travel Request - ${editData.travelId}`
              : "Business Travel Request"}
          </h2> 
          </Col>*/}
          <Col>
            <Button
              type="button"
              variant="secondary mb-2 back-btn"
              onClick={() => navigate("/travelrequest")}
              style={{ float: "right" }}
            >
             <FaArrowLeftLong /> Back
            </Button>
          </Col>
        </Row>
        <Formik
          initialValues={initialValues}
          enableReinitialize={true}
          validationSchema={validationSchema}
          validateOnBlur={true}
          validateOnChange={true}
          validateOnMount={false}
          context={{
            hotelBookingRequired: initialValues.hotelBookingRequired,
            localTaxiRequired: initialValues.localTaxiRequired,
            taxiType: initialValues.taxiType,
          }}
          onSubmit={async (
            values,
            { setSubmitting, setTouched, setErrors, validateForm }
          ) => {
            // console.log("Form submission started");
            // console.log("Form values:", values);

            setSubmitting(true);

            try {
              // Get selected employees array - only the selected ones from the group booking list
              let selectedempids = [];
              if (
                values.groupBooking === "Yes" &&
                values.employeeList.length > 0
              ) {
                selectedempids = values.employeeList.map((empName) => ({
                  empname: empName
                }));
              }

              // Build selected project IDs array
              let selectedprojectids = [];
              if (values.projectType === "Specific" && values.projectID.length > 0) {
                selectedprojectids = values.projectID.map((projectId) => ({
                  projectname: projectId
                }));
              }

              // Build accommodations array
              const accomdations = values.itineraries.map((itinerary, index) => {
                // Format departure date
                let departureDate = "";
                if (itinerary.departure) {
                  const date = new Date(itinerary.departure);
                  date.setHours(0, 0, 0, 0);
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, "0");
                  const day = String(date.getDate()).padStart(2, "0");
                  departureDate = `${year}-${month}-${day}`;
                }

                // Format arrival date
                let arrivalDate = "";
                if (itinerary.arrival) {
                  const date = new Date(itinerary.arrival);
                  date.setHours(0, 0, 0, 0);
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, "0");
                  const day = String(date.getDate()).padStart(2, "0");
                  arrivalDate = `${year}-${month}-${day}`;
                }

                // Format start time
                let startTime = "";
                if (itinerary.localTaxiRequired === "Yes" && itinerary.startDate && itinerary.startTime) {
                  const date = new Date(itinerary.startDate);
                  const [hours, minutes] = itinerary.startTime.split(":");
                  date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, "0");
                  const day = String(date.getDate()).padStart(2, "0");
                  const hour = String(date.getHours()).padStart(2, "0");
                  const minute = String(date.getMinutes()).padStart(2, "0");
                  startTime = `${year}-${month}-${day} ${hour}:${minute}:00.000`;
                }

                return {
                  placeoforigin: itinerary.place || "",
                  placeofarrival: itinerary.arrivalPlace || "",
                  departure_date: departureDate,
                  arrival_date: arrivalDate,
                  acc_type: itinerary.hotelBookingRequired === "Yes" ? "1" : "0",
                  acc_days: itinerary.hotelBookingRequired === "Yes" && itinerary.daysAccommodation 
                    ? itinerary.daysAccommodation 
                    : "0",
                  landmark: itinerary.hotelBookingRequired === "Yes" && itinerary.nearestLandmark 
                    ? itinerary.nearestLandmark 
                    : "",
                  room_type: itinerary.typeOfOccupancy || "",
                  taxi_req: itinerary.localTaxiRequired === "Yes" ? "1" : "0",
                  taxi_type: itinerary.localTaxiRequired === "Yes" && itinerary.taxiType === "Point to Point" ? "1" : "0",
                  start_place: itinerary.localTaxiRequired === "Yes" && itinerary.startPlace 
                    ? itinerary.startPlace 
                    : "",
                  end_place: itinerary.localTaxiRequired === "Yes" && itinerary.taxiType === "Point to Point" && itinerary.endPlace 
                    ? itinerary.endPlace 
                    : "",
                  starttime: startTime,
                  index: index + 1
                };
              });

              
              // Determine if we're editing or creating
              const isEditMode = !!editData;
              const Mot = modeOfTravelMap[values.ModeOfTravel] ?? 0;
                const payload = {
                empid: values.employeeID,
                empname: values.employeeName,
                emptype: values.employeeType === "Self" ? 0 : 1,
                typeofvisit: values.typeOfVisit === "Domestic" ? "0" : "1",
                ModeOfTravel: Mot, 
                purpose: values.purposeOfVisit,
                currency_type:
                  values.typeOfVisit === "International"
                    ? values.currencyType
                    : "",
                top_up_amount:
                  values.typeOfVisit === "International" &&
                  values.rechargeAmount
                    ? parseFloat(values.rechargeAmount)
                    : 0,
                advance_cash:
                  values.advanceCashRequired === "Yes" && values.advanceAmount
                    ? parseFloat(values.advanceAmount)
                    : 0,
                is_group: values.groupBooking === "Yes" ? 1 : 0,
                selectedprojectids: selectedprojectids,
                selectedempids: selectedempids,
                accomdations: accomdations
              };

              const token = sessionStorage.getItem("empToken");
              let apiEndpoint = `${API_URL}/btp/create`;
              let finalPayload = payload;

              if (isEditMode) {
                // For edit mode, add travel_id to the payload body
                const numericTravelId = travelId.replace(/^TID_/, "");
                apiEndpoint = `${API_URL}/btp/edit`;
                finalPayload = {
                  ...payload,
                  travel_id: numericTravelId,
                };
              } else {
                // For create mode, add created_date
                finalPayload = {
                  ...payload,
                  created_date: new Date().toISOString().slice(0, 10),
                };
              }

              const response = await axios.post(apiEndpoint, finalPayload, {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              });

              // console.log("API Response:", response);

              // console.log("Selected Employee:", values.employeeName);

              if (response?.data?.success) {
                // Show success modal instead of toast
                setShowSuccessModal(true);

              //   let emailEndpoint = `${API_URL}/email/send-email`;
              //   let empemailid = sessionStorage.getItem("EmpEMailID");
              //   let HtmlBody = `<div>
              //   Hello,<br><br>
              //   We are pleased to inform you that your travel request has been successfully submitted.<br>
              //   This email notification has been generated by the Delopt BTP Application.<br><br>
              //   Thank you,<br>
              //   www.delopt.co.in
              //   </div>`;
              //   const response = await axios.post(emailEndpoint, {to: empemailid, subject: 'BTP Notification', htmlContent: HtmlBody,vid: 1}, {
              //   headers: {
              //     Authorization: `Bearer ${token}`,
              //     "Content-Type": "application/json",
              //   },
              // });

              } else {
              }
            } catch (error) {
              console.error("Error submitting form:", error);
              
              // Check if error is related to validation or missing fields
              const errorMessage = error.response?.data?.message || error.message || "";
              const isMissingFieldsError = 
                errorMessage.toLowerCase().includes("required") ||
                errorMessage.toLowerCase().includes("mandatory") ||
                errorMessage.toLowerCase().includes("missing") ||
                error.response?.status === 400;
              
              if (isMissingFieldsError) {
              } else {
              }
            } finally {
              setSubmitting(false);
            }
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
            setTouched,
            isSubmitting,
          }) => {
            // Helper variable for read-only mode
            const isReadOnly = mode === "approval";

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

            // ✅ FIXED: useEffect for taxi details sync
            useEffect(() => {
              if (
                values.taxiDetails.length !== values.itineraries.length &&
                values.itineraries.length > 0
              ) {
                const diff =
                  values.itineraries.length - values.taxiDetails.length;
                const newTaxiDetails = [...values.taxiDetails];

                if (diff > 0) {
                  for (let i = 0; i < diff; i++) {
                    newTaxiDetails.push({
                      startPlace: "",
                      startDate: "",
                      startTime: "",
                      endPlace: "",
                    });
                  }
                } else {
                  newTaxiDetails.splice(diff);
                }
                setFieldValue("taxiDetails", newTaxiDetails);
              }
            }, [
              values.itineraries.length,
              values.taxiDetails.length,
              setFieldValue,
            ]);

            // Fetch employees list when Group Booking is set to "Yes"
            useEffect(() => {
              const fetchAllEmployeesList = async () => {
                if (values.groupBooking !== "Yes") {
                  // Clear the list if groupBooking is not "Yes"
                  setGroupBookingEmployeeList([]);
                  return;
                }

                try {
                  const token = sessionStorage.getItem("empToken");
                  const username = sessionStorage.getItem("empName");

                  if (!username) {
                    console.error("No username found in sessionStorage");
                    setGroupBookingEmployeeList([]);
                    return;
                  }

                  const response = await axios.get(
                    `${API_URL}/btp/employees?empname=${encodeURIComponent(
                      username
                    )}`,
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );

                  // console.log("All Employees List Response:", response);
                  if (response?.data?.success && response?.data?.employees) {
                    // Transform API response to match the expected format
                    const formattedEmployees = response.data.employees.map(
                      (emp) => ({
                        id: emp.Emp_id.toString(),
                        name: emp.Emp_name,
                        department: emp.Department,
                      })
                    );
                    setGroupBookingEmployeeList(formattedEmployees);
                  }
                } catch (error) {
                  console.error("Error fetching all employees list:", error);
                  // Set empty array as fallback
                  setGroupBookingEmployeeList([]);
                }
              };

              fetchAllEmployeesList();
            }, [values.groupBooking]);

            // Keep employee fields empty when "Others" is selected until user makes a selection
            useEffect(() => {
              if (
                values.employeeType === "Others" && 
                employeeListOptions.length > 0 && 
                !values.employeeName
              ) {
                // Keep fields empty - user must select an employee
                setFieldValue("employeeName", "");
                setFieldValue("employeeID", "");
                setFieldValue("employeeDepartment", "");
              }
            }, [values.employeeType, employeeListOptions, values.employeeName, setFieldValue]);

            return (
              <Form
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();

                  // Additional validation for group booking
                  if (
                    values.groupBooking === "Yes" &&
                    (!values.employeeList || values.employeeList.length === 0)
                  ) {
                    setTouched({ ...touched, employeeList: true });
                    return;
                  }

                  // Check for validation errors before calling Formik's handleSubmit
                  const hasErrors = Object.keys(errors).length > 0;

                  if (hasErrors) {
                    // Mark all fields as touched to display errors
                    setTouched({
                      employeeType: true,
                      travelID: true,
                      employeeName: true,
                      employeeID: true,
                      employeeDepartment: true,
                      groupBooking: true,
                      employeeList: true,
                      projectType: true,
                      projectID: true,
                      projectName: true,
                      itineraries: values.itineraries.map(() => ({
                        place: true,
                        arrivalPlace: true,
                        departure: true,
                        arrival: true,
                        hotelBookingRequired: true,
                        daysAccommodation: true,
                        nearestLandmark: true,
                        typeOfOccupancy: true,
                        localTaxiRequired: true,
                        taxiType: true,
                        startPlace: true,
                        startDate: true,
                        startTime: true,
                        endPlace: true,
                      })),
                      totalDays: true,
                      purposeOfVisit: true,
                      typeOfVisit: true,
                      currencyType: true,
                      simRequired: true,
                      rechargeAmount: true,
                      advanceCashRequired: true,
                      advanceAmount: true,
                    });
                    return;
                  }

                  // Call Formik's handleSubmit
                  handleSubmit(e);
                }}
                className={isReadOnly ? "readonly-form" : ""}
              >
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
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Employee Type <RequiredIcon />
                            </Form.Label>
                            <div className="radio-row">
                              <Form.Check
                                inline
                                type="radio"
                                name="employeeType"
                                label="Self"
                                value="Self"
                                checked={values.employeeType === "Self"}
                                disabled={isReadOnly}
                                onChange={(e) => {
                                  handleChange(e);
                                  if (e.target.value === "Self") {
                                    setFieldValue(
                                      "employeeName",
                                      loggedUser.name
                                    );
                                    setFieldValue("employeeID", loggedUser.id);
                                    setFieldValue(
                                      "employeeDepartment",
                                      loggedUser.department
                                    );
                                  } else {
                                    // Set first employee as default when switching to Others
                                    const firstEmployee =
                                      employeeListOptions[0];
                                    if (firstEmployee) {
                                      setFieldValue(
                                        "employeeName",
                                        firstEmployee.name
                                      );
                                      setFieldValue(
                                        "employeeID",
                                        firstEmployee.id
                                      );
                                      setFieldValue(
                                        "employeeDepartment",
                                        firstEmployee.department || ""
                                      );
                                    }
                                  }
                                }}
                              />
                              <Form.Check
                                inline
                                type="radio"
                                name="employeeType"
                                label="Others"
                                value="Others"
                                checked={values.employeeType === "Others"}
                                disabled={isReadOnly}
                                onChange={(e) => {
                                  handleChange(e);
                                  if (e.target.value === "Others") {
                                    // Clear fields - user must select from dropdown
                                    setFieldValue("employeeName", "");
                                    setFieldValue("employeeID", "");
                                    setFieldValue("employeeDepartment", "");
                                  }
                                }}
                              />
                            </div>
                            {touched.employeeType && errors.employeeType && (
                              <div className="text-danger small mt-1">
                                {errors.employeeType}
                              </div>
                            )}
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Travel ID</Form.Label>
                            <Form.Control
                              name="travelID"
                              value={values.travelID}
                              readOnly
                              disabled
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Employee Name</Form.Label>
                            {values.employeeType === "Self" ? (
                              <Form.Control value={loggedUser.name} disabled />
                            ) : (
                              <Form.Select
                                name="employeeName"
                                value={values.employeeName}
                                disabled={isReadOnly}
                                onChange={(e) => {
                                  const selectedName = e.target.value;

                                  if (!selectedName) {
                                    // Reset fields if no selection
                                    setFieldValue("employeeName", "");
                                    setFieldValue("employeeID", "");
                                    setFieldValue("employeeDepartment", "");
                                    return;
                                  }

                                  const selectedEmployee =
                                    employeeListOptions.find(
                                      (emp) => emp.name === selectedName
                                    );
                                  if (selectedEmployee) {
                                    setFieldValue(
                                      "employeeName",
                                      selectedEmployee.name
                                    );
                                    setFieldValue(
                                      "employeeID",
                                      selectedEmployee.id
                                    );
                                    setFieldValue(
                                      "employeeDepartment",
                                      selectedEmployee.department || ""
                                    );
                                  }
                                }}
                                isInvalid={
                                  touched.employeeName && !!errors.employeeName
                                }
                              >
                                <option value="">Select Employee</option>
                                {employeeListOptions.map((emp) => (
                                  <option key={emp.id} value={emp.name}>
                                    {emp.name}
                                  </option>
                                ))}
                              </Form.Select>
                            )}
                            {touched.employeeName && errors.employeeName && (
                              <div className="text-danger small mt-1">
                                {errors.employeeName}
                              </div>
                            )}
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Employee ID</Form.Label>
                            <Form.Control
                              name="employeeID"
                              value={values.employeeID || ""}
                              onChange={handleChange}
                              placeholder="Employee ID"
                              readOnly={
                                isReadOnly ||
                                values.employeeType === "Self" ||
                                values.employeeType === "Others"
                              }
                              disabled={
                                isReadOnly ||
                                values.employeeType === "Self" ||
                                values.employeeType === "Others"
                              }
                              isInvalid={
                                touched.employeeID && !!errors.employeeID
                              }
                            />
                            {touched.employeeID && errors.employeeID && (
                              <div className="text-danger small mt-1">
                                {errors.employeeID}
                              </div>
                            )}
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Employee Department</Form.Label>
                            <Form.Control
                              name="employeeDepartment"
                              value={values.employeeDepartment || ""}
                              onChange={handleChange}
                              placeholder="Employee Department"
                              readOnly={
                                isReadOnly ||
                                values.employeeType === "Self" ||
                                values.employeeType === "Others"
                              }
                              disabled={
                                isReadOnly ||
                                values.employeeType === "Self" ||
                                values.employeeType === "Others"
                              }
                              isInvalid={
                                touched.employeeDepartment &&
                                !!errors.employeeDepartment
                              }
                            />
                            {touched.employeeDepartment &&
                              errors.employeeDepartment && (
                                <div className="text-danger small mt-1">
                                  {errors.employeeDepartment}
                                </div>
                              )}
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Group Booking Required? <RequiredIcon />
                            </Form.Label>
                            <div className="radio-row">
                              <Form.Check
                                inline
                                type="radio"
                                name="groupBooking"
                                label="Yes"
                                value="Yes"
                                checked={values.groupBooking === "Yes"}
                                disabled={isReadOnly}
                                onChange={(e) => {
                                  handleChange(e);
                                  if (e.target.value === "Yes") {
                                    setTouched((prev) => ({
                                      ...prev,
                                      employeeList: true,
                                    }));
                                  } else {
                                    setFieldValue("employeeList", []);
                                    setTouched((prev) => ({
                                      ...prev,
                                      employeeList: false,
                                    }));
                                  }
                                }}
                              />
                              <Form.Check
                                inline
                                type="radio"
                                name="groupBooking"
                                label="No"
                                value="No"
                                checked={values.groupBooking === "No"}
                                disabled={isReadOnly}
                                onChange={(e) => {
                                  handleChange(e);
                                  if (e.target.value === "No") {
                                    // Clear the employee list when "No" is selected
                                    setFieldValue("employeeList", []);
                                  }
                                }}
                              />
                            </div>
                            {touched.groupBooking && errors.groupBooking && (
                              <div className="text-danger small mt-1">
                                {errors.groupBooking}
                              </div>
                            )}
                          </Form.Group>
                        </Col>

                        {(() => {
                          // console.log("Group Booking:", values.groupBooking);
                          // console.log("Employee List:", values.employeeList);
                          // console.log("Errors:", errors.employeeList);
                          // console.log("Touched:", touched.employeeList);
                          return values.groupBooking === "Yes";
                        })() && (
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>
                                Select Employees List <RequiredIcon />
                              </Form.Label>
                              <MultiSelectDropdown
                                options={groupBookingEmployeeList}
                                value={
                                  values.employeeList
                                    ? groupBookingEmployeeList.filter((emp) =>
                                        values.employeeList.includes(emp.name)
                                      )
                                    : []
                                }
                                onChange={(selected) => {
                                  const selectedNames = selected.map(
                                    (emp) => emp.name
                                  );
                                  setFieldValue(
                                    "employeeList",
                                    selectedNames,
                                    true
                                  );
                                }}
                                labelKey="name"
                                valueKey="id"
                                placeholder="Select employees"
                              />
                              {touched.employeeList && errors.employeeList && (
                                <div className="text-danger small mt-1">
                                  {errors.employeeList}
                                </div>
                              )}
                            </Form.Group>
                          </Col>
                        )}
                      </Row>
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
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Project Type <RequiredIcon />
                            </Form.Label>
                            <Form.Select
                              name="projectType"
                              value={values.projectType}
                              onChange={handleChange}
                              isInvalid={
                                touched.projectType && !!errors.projectType
                              }
                            >
                              {/* <option value="">Select</option> */}
                              <option value="General">General</option>
                              <option value="Specific">Specific</option>
                            </Form.Select>
                            {touched.projectType && errors.projectType && (
                              <div className="text-danger small mt-1">
                                {errors.projectType}
                              </div>
                            )}
                          </Form.Group>
                        </Col>

                        {values.projectType === "Specific" && (
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>
                                Project <RequiredIcon />
                              </Form.Label>
                              <MultiSelectDropdown
                                options={projectOptions}
                                value={
                                  values.projectID && values.projectID.length
                                    ? projectOptions.filter((p) =>
                                        values.projectID.includes(p.id)
                                      )
                                    : []
                                }
                                onChange={(selected) => {
                                  const ids = selected.map((s) => s.id);
                                  const names = selected.map((s) => s.name);
                                  setFieldValue("projectID", ids);
                                  setFieldValue("projectName", names);
                                  setFieldValue("projectID", ids, true);
                                }}
                                labelKey="id"
                                valueKey="id"
                                placeholder="Select project Name &ID"
                              />
                              {touched.projectID && errors.projectID && (
                                <div className="text-danger small mt-1">
                                  {errors.projectID}
                                </div>
                              )}
                            </Form.Group>
                          </Col>
                        )}
                      </Row>

                      {/* {values.projectType === "Specific" && (
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Project ID</Form.Label>
                            <MultiSelectDropdown
                              options={projectOptions}
                              value={
                                values.projectID && values.projectID.length
                                  ? projectOptions.filter((p) =>
                                      values.projectID.includes(p.id)
                                    )
                                  : []
                              }
                              onChange={(selected) => {
                                const ids = selected.map((s) => s.id);
                                const names = selected.map((s) => s.name);
                                setFieldValue("projectID", ids);
                                setFieldValue("projectName", names);
                                setFieldValue("projectID", ids, true);
                              }}
                              labelKey="id"
                              valueKey="id"
                              placeholder="Select project IDs"
                            />
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Project Name</Form.Label>
                            <MultiSelectDropdown
                              options={projectOptions}
                              value={
                                values.projectName && values.projectName.length
                                  ? projectOptions.filter((p) =>
                                      values.projectName.includes(p.name)
                                    )
                                  : []
                              }
                              onChange={(selected) => {
                                const names = selected.map((s) => s.name);
                                const ids = selected.map((s) => s.id);
                                setFieldValue("projectName", names);
                                setFieldValue("projectID", ids);
                                setFieldValue("projectName", names, true);
                              }}
                              labelKey="name"
                              valueKey="id"
                              placeholder="Select project names"
                            />
                            
                          </Form.Group>
                        </Col>
                      </Row>
                    )} */}
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
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Type of Visit <RequiredIcon />
                            </Form.Label>
                            <Form.Select
                              name="typeOfVisit"
                              value={values.typeOfVisit}
                              onChange={handleChange}
                              isInvalid={
                                touched.typeOfVisit && !!errors.typeOfVisit
                              }
                            >
                              {/* <option value="">Select</option> */}
                              <option value="Domestic">Domestic</option>
                              <option value="International">
                                International
                              </option>
                            </Form.Select>
                            {touched.typeOfVisit && errors.typeOfVisit && (
                              <div className="text-danger small mt-1">
                                {errors.typeOfVisit}
                              </div>
                            )}
                          </Form.Group>
                        </Col>
                       {values.typeOfVisit === "Domestic" && (
                           <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Mode of Travel <RequiredIcon />
                            </Form.Label>
                              <Form.Select
                              name="ModeOfTravel"
                              value={values.ModeOfTravel}
                              onChange={handleChange}
                              isInvalid={
                                touched.ModeOfTravel && !!errors.ModeOfTravel
                              }
                            >
                              {/* <option value="">Select</option> */}
                              <option value="Air">Air</option>
                              <option value="Train">Train</option>
                              <option value="Bus">Bus</option>
                              <option value="Taxi/Cab">Taxi/Cab</option>
                            </Form.Select>
                               {touched.ModeOfTravel && errors.ModeOfTravel && (
                              <div className="text-danger small mt-1">
                                {errors.ModeOfTravel}
                              </div>
                            )}
                            </Form.Group>
                        </Col>
                       )}
                      </Row>
                      <Row>
                        <Col>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Purpose of Visit <RequiredIcon />
                            </Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={2}
                              name="purposeOfVisit"
                              value={values.purposeOfVisit}
                              onChange={handleChange}
                              maxLength={255}
                              isInvalid={
                                touched.purposeOfVisit &&
                                !!errors.purposeOfVisit
                              }
                            />
                            <div className="text-muted small mt-1">
                              {values.purposeOfVisit.length}/255 characters
                            </div>
                            {touched.purposeOfVisit &&
                              errors.purposeOfVisit && (
                                <div className="text-danger small mt-1">
                                  {errors.purposeOfVisit}
                                </div>
                              )}
                          </Form.Group>
                        </Col>
                      </Row>
                      {values.typeOfVisit === "International" && (
                        <>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>
                                  Currency Type <RequiredIcon />
                                </Form.Label>
                                <Form.Select
                                  name="currencyType"
                                  value={values.currencyType}
                                  onChange={handleChange}
                                  isInvalid={
                                    touched.currencyType &&
                                    !!errors.currencyType
                                  }
                                >
                                  <option value="">Select</option>
                                  <option value="INR">INR</option>
                                  <option value="USD">USD</option>
                                  <option value="EUR">EUR</option>
                                  <option value="GBP">GBP</option>
                                  <option value="JPY">JPY</option>
                                  <option value="AUD">AUD</option>
                                  <option value="CAD">CAD</option>
                                  <option value="CHF">CNY</option>
                                </Form.Select>
                                {touched.currencyType &&
                                  errors.currencyType && (
                                    <div className="text-danger small mt-1">
                                      {errors.currencyType}
                                    </div>
                                  )}
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>
                                  SIM Card Required ? <RequiredIcon />
                                </Form.Label>
                                <div className="radio-row">
                                  <Form.Check
                                    inline
                                    type="radio"
                                    name="simRequired"
                                    label="Yes"
                                    value="Yes"
                                    checked={values.simRequired === "Yes"}
                                    disabled={isReadOnly}
                                    onChange={handleChange}
                                  />
                                  <Form.Check
                                    inline
                                    type="radio"
                                    name="simRequired"
                                    label="No"
                                    value="No"
                                    checked={values.simRequired === "No"}
                                    disabled={isReadOnly}
                                    onChange={handleChange}
                                  />
                                </div>
                              </Form.Group>
                            </Col>

                            {values.simRequired === "Yes" && (
                              <Col md={6}>
                                <Form.Group className="mb-3">
                                  <Form.Label>
                                    How much amount required for topup recharge?{" "}
                                    <RequiredIcon />
                                  </Form.Label>
                                  <Form.Control
                                    name="rechargeAmount"
                                    value={values.rechargeAmount}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      // Allow only numbers and decimal point, and restrict to max 10000
                                      if (
                                        value === "" ||
                                        (/^\d*\.?\d*$/.test(value) && parseFloat(value) <= 10000)
                                      ) {
                                        handleChange(e);
                                      }
                                    }}
                                    onKeyPress={(e) => {
                                      // Prevent non-numeric characters except decimal point
                                      if (!/[\d.]/.test(e.key)) {
                                        e.preventDefault();
                                      }
                                    }}
                                    isInvalid={
                                      touched.rechargeAmount &&
                                      !!errors.rechargeAmount
                                    }
                                    max="10000"
                                  />
                                  {touched.rechargeAmount &&
                                    errors.rechargeAmount && (
                                      <div className="text-danger small mt-1">
                                        {errors.rechargeAmount}
                                      </div>
                                    )}
                                </Form.Group>
                              </Col>
                            )}
                          </Row>
                        </>
                      )}
                      {/* Itineraries */}
                      <FieldArray name="itineraries">
                        {({ push, remove }) => {
                          // Function to check if all required fields are filled for enabling Add button
                          const isCurrentItineraryComplete = (itinerary) => {
                            // Check basic required fields
                            const basicFields =
                              itinerary.place &&
                              itinerary.arrivalPlace &&
                              itinerary.departure &&
                              itinerary.arrival;

                            // Check hotel booking fields if required
                            let hotelFields = true;
                            if (itinerary.hotelBookingRequired === "Yes") {
                              hotelFields =
                                itinerary.daysAccommodation &&
                                itinerary.nearestLandmark &&
                                itinerary.typeOfOccupancy;
                            }

                            // Check taxi fields if required
                            let taxiFields = true;
                            if (itinerary.localTaxiRequired === "Yes") {
                              taxiFields =
                                itinerary.startPlace &&
                                itinerary.startDate &&
                                itinerary.startTime &&
                                itinerary.taxiType;

                              // Check end place if Point to Point
                              if (itinerary.taxiType === "Point to Point") {
                                taxiFields = taxiFields && itinerary.endPlace;
                              }
                            }

                            return basicFields && hotelFields && taxiFields;
                          };

                          // Check if all current itineraries are complete
                          const allItinerariesComplete =
                            values.itineraries.every(
                              isCurrentItineraryComplete
                            );

                          // Check if maximum limit of 2 itineraries is reached
                          const maxItinerariesReached =
                            values.itineraries.length >= 4;

                          return (
                            <>
                              {/* Add Button - Only enabled when all current itineraries are complete */}
                              <Row className="mb-3">
                                <Col md={12} className="text-end">
                                  <Button
                                    variant="primary"
                                    className="btn-sm ms-2 add-btn"
                                    onClick={() =>
                                      push({
                                        place: "",
                                        arrivalPlace: "",
                                        departure: "",
                                        arrival: "",
                                        hotelBookingRequired: "Yes",
                                        daysAccommodation: "",
                                        nearestLandmark: "",
                                        typeOfOccupancy: "1",
                                        localTaxiRequired: "Yes",
                                        taxiType: "Point to Point",
                                        startPlace: "",
                                        startDate: "",
                                        startTime: "12:00",
                                        endPlace: "",
                                      })
                                    }
                                    disabled={
                                      !allItinerariesComplete ||
                                      maxItinerariesReached
                                    }
                                    title={
                                      maxItinerariesReached
                                        ? "Maximum of 4 itineraries allowed"
                                        : allItinerariesComplete
                                        ? "Add new itinerary"
                                        : "Please fill all required fields before adding new itinerary"
                                    }
                                  >
                                    <FaPlus /> Add
                                  </Button>
                                </Col>
                              </Row>

                              {values.itineraries.map((it, idx) => {
                                return (
                                  <Card key={idx} className="itinerary-card">
                                    <Card.Body>
                                      <Row className="align-items-start">
                                        <Col md={6}>
                                          <Form.Group className="mb-2">
                                            <Form.Label>
                                              Place of Origin <RequiredIcon />
                                            </Form.Label>
                                            <Form.Control
                                              name={`itineraries[${idx}].place`}
                                              value={it.place}
                                              onChange={handleChange}
                                              maxLength={100}
                                              isInvalid={
                                                touched.itineraries?.[idx]
                                                  ?.place &&
                                                !!errors.itineraries?.[idx]
                                                  ?.place
                                              }
                                            />
                                            <div className="text-muted small mt-1">
                                              {/* {it.place.length}/100 */}
                                            </div>
                                            {touched.itineraries?.[idx]
                                              ?.place &&
                                              errors.itineraries?.[idx]
                                                ?.place && (
                                                <div className="text-danger small mt-1">
                                                  {
                                                    errors.itineraries[idx]
                                                      .place
                                                  }
                                                </div>
                                              )}
                                          </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                          <Form.Group className="mb-2">
                                            <Form.Label>
                                              Place of Arrival <RequiredIcon />
                                            </Form.Label>
                                            <Form.Control
                                              name={`itineraries[${idx}].arrivalPlace`}
                                              value={it.arrivalPlace || ""}
                                              onChange={handleChange}
                                              maxLength={100}
                                              isInvalid={
                                                touched.itineraries?.[idx]
                                                  ?.arrivalPlace &&
                                                !!errors.itineraries?.[idx]
                                                  ?.arrivalPlace
                                              }
                                            />
                                            <div className="text-muted small mt-1">
                                              {/* {(it.arrivalPlace || "").length}/100 */}
                                            </div>
                                            {touched.itineraries?.[idx]
                                              ?.arrivalPlace &&
                                              errors.itineraries?.[idx]
                                                ?.arrivalPlace && (
                                                <div className="text-danger small mt-1">
                                                  {
                                                    errors.itineraries[idx]
                                                      .arrivalPlace
                                                  }
                                                </div>
                                              )}
                                          </Form.Group>
                                        </Col>

                                        <Col md={6} lg={4}>
                                          <Form.Group className="mb-2">
                                            <Form.Label>
                                              Expected date of departure{" "}
                                              <RequiredIcon />
                                            </Form.Label>
                                            <Form.Control
                                              type="date"
                                              name={`itineraries[${idx}].departure`}
                                              value={it.departure}
                                              onChange={handleChange}
                                              placeholder="dd/mm/yyyy"
                                              min={
                                                new Date()
                                                  .toISOString()
                                                  .split("T")[0]
                                              }
                                              isInvalid={
                                                touched.itineraries?.[idx]
                                                  ?.departure &&
                                                !!errors.itineraries?.[idx]
                                                  ?.departure
                                              }
                                            />
                                            {touched.itineraries?.[idx]
                                              ?.departure &&
                                              errors.itineraries?.[idx]
                                                ?.departure && (
                                                <div className="text-danger small mt-1">
                                                  {
                                                    errors.itineraries[idx]
                                                      .departure
                                                  }
                                                </div>
                                              )}
                                          </Form.Group>
                                        </Col>

                                        <Col md={6} lg={4}>
                                          <Form.Group className="mb-2">
                                            <Form.Label>
                                              Expected date of arrival{" "}
                                              <RequiredIcon />
                                            </Form.Label>
                                            <Form.Control
                                              type="date"
                                              name={`itineraries[${idx}].arrival`}
                                              value={it.arrival}
                                              onChange={handleChange}
                                              placeholder="dd/mm/yyyy"
                                              min={
                                                it.departure ||
                                                new Date()
                                                  .toISOString()
                                                  .split("T")[0]
                                              }
                                              isInvalid={
                                                touched.itineraries?.[idx]
                                                  ?.arrival &&
                                                !!errors.itineraries?.[idx]
                                                  ?.arrival
                                              }
                                            />
                                            {touched.itineraries?.[idx]
                                              ?.arrival &&
                                              errors.itineraries?.[idx]
                                                ?.arrival && (
                                                <div className="text-danger small mt-1">
                                                  {
                                                    errors.itineraries[idx]
                                                      .arrival
                                                  }
                                                </div>
                                              )}
                                          </Form.Group>
                                        </Col>

                                        <Col md={12} lg={4}>
                                          <Form.Group className="mb-2">
                                            <Form.Label>
                                              Expected duration of Days
                                            </Form.Label>
                                            
                                            <Form.Control
                                              name={`itineraries[${idx}].totalDays`}
                                              value={(() => {
                                                if (
                                                  it.departure &&
                                                  it.arrival
                                                ) {
                                                  const start = new Date(
                                                    it.departure
                                                  );
                                                  const end = new Date(
                                                    it.arrival
                                                  );
                                                  if (
                                                    !isNaN(start) &&
                                                    !isNaN(end)
                                                  ) {
                                                    const diffDays =
                                                      Math.round(
                                                        (end - start) /
                                                          (1000 * 60 * 60 * 24)
                                                      ) + 1;
                                                    return diffDays > 0
                                                      ? diffDays
                                                      : "";
                                                  }
                                                }
                                                return "";
                                              })()}
                                              readOnly
                                            />
                                            {/* <div className="text-danger small mt-1">&nbsp;</div> */}
                                          </Form.Group>
                                        </Col>
                                      </Row>

                                      {/* Accommodation Section */}
                                      <Row className="mt-3">
                                        <Col md={12}>
                                          <h5 className="mb-2 mt-2">
                                            Accommodation Details
                                          </h5>
                                        </Col>
                                      </Row>
                                      <Row>
                                        <Col md={12}>
                                          <Form.Group className="mb-3">
                                            <Form.Label>
                                              Is Hotel booking required{" "}
                                              <RequiredIcon />
                                            </Form.Label>
                                            <div className="radio-row">
                                              <Form.Check
                                                inline
                                                type="radio"
                                                name={`itineraries[${idx}].hotelBookingRequired`}
                                                label="Yes"
                                                value="Yes"
                                                checked={
                                                  it.hotelBookingRequired ===
                                                  "Yes"
                                                }
                                                disabled={isReadOnly}
                                                onChange={handleChange}
                                              />
                                              <Form.Check
                                                inline
                                                type="radio"
                                                name={`itineraries[${idx}].hotelBookingRequired`}
                                                label="No"
                                                value="No"
                                                checked={
                                                  it.hotelBookingRequired ===
                                                  "No"
                                                }
                                                disabled={isReadOnly}
                                                onChange={handleChange}
                                              />
                                            </div>
                                            {touched.itineraries?.[idx]
                                              ?.hotelBookingRequired &&
                                              errors.itineraries?.[idx]
                                                ?.hotelBookingRequired && (
                                                <div className="text-danger small mt-1">
                                                  {
                                                    errors.itineraries[idx]
                                                      .hotelBookingRequired
                                                  }
                                                </div>
                                              )}
                                          </Form.Group>
                                        </Col>
                                      </Row>

                                      {it.hotelBookingRequired === "Yes" && (
                                        <Row>
                                          <Col md={4}>
                                            <Form.Group className="mb-3">
                                              <Form.Label>
                                                No of days accommodation
                                                required <RequiredIcon />
                                              </Form.Label>
                                              <Form.Control
                                                name={`itineraries[${idx}].daysAccommodation`}
                                                value={
                                                  it.daysAccommodation || ""
                                                }
                                                onChange={(e) => {
                                                  const value = e.target.value;
                                                  // Allow only integers (no decimals)
                                                  if (
                                                    value === "" ||
                                                    /^\d+$/.test(value)
                                                  ) {
                                                    handleChange(e);
                                                  }
                                                }}
                                                onKeyPress={(e) => {
                                                  // Prevent non-numeric characters
                                                  if (!/\d/.test(e.key)) {
                                                    e.preventDefault();
                                                  }
                                                }}
                                                isInvalid={
                                                  touched.itineraries?.[idx]
                                                    ?.daysAccommodation &&
                                                  !!errors.itineraries?.[idx]
                                                    ?.daysAccommodation
                                                }
                                              />
                                              {touched.itineraries?.[idx]
                                                ?.daysAccommodation &&
                                                errors.itineraries?.[idx]
                                                  ?.daysAccommodation && (
                                                  <div className="text-danger small mt-1">
                                                    {
                                                      errors.itineraries[idx]
                                                        .daysAccommodation
                                                    }
                                                  </div>
                                                )}
                                            </Form.Group>
                                          </Col>
                                          <Col md={5}>
                                            <Form.Group className="mb-3">
                                              <Form.Label>
                                                Nearest LandMark/Place for Hotel
                                                Booking <RequiredIcon />
                                              </Form.Label>
                                              <Form.Control
                                                name={`itineraries[${idx}].nearestLandmark`}
                                                value={it.nearestLandmark || ""}
                                                maxLength={100}
                                                onChange={handleChange}
                                                isInvalid={
                                                  touched.itineraries?.[idx]
                                                    ?.nearestLandmark &&
                                                  !!errors.itineraries?.[idx]
                                                    ?.nearestLandmark
                                                }
                                              />
                                              {touched.itineraries?.[idx]
                                                ?.nearestLandmark &&
                                                errors.itineraries?.[idx]
                                                  ?.nearestLandmark && (
                                                  <div className="text-danger small mt-1">
                                                    {
                                                      errors.itineraries[idx]
                                                        .nearestLandmark
                                                    }
                                                  </div>
                                                )}
                                            </Form.Group>
                                          </Col>

                                          <Col md={3}>
                                            <Form.Group className="mb-3">
                                              <Form.Label>
                                                Type Of Occupancy{" "}
                                                <RequiredIcon />
                                              </Form.Label>
                                              <Form.Select
                                                name={`itineraries[${idx}].typeOfOccupancy`}
                                                value={
                                                  it.typeOfOccupancy || "1"
                                                }
                                                onChange={handleChange}
                                                isInvalid={
                                                  touched.itineraries?.[idx]
                                                    ?.typeOfOccupancy &&
                                                  !!errors.itineraries?.[idx]
                                                    ?.typeOfOccupancy
                                                }
                                              >
                                                <option value="1">1</option>
                                                <option value="2">2</option>
                                              </Form.Select>
                                              {touched.itineraries?.[idx]
                                                ?.typeOfOccupancy &&
                                                errors.itineraries?.[idx]
                                                  ?.typeOfOccupancy && (
                                                  <div className="text-danger small mt-1">
                                                    {
                                                      errors.itineraries[idx]
                                                        .typeOfOccupancy
                                                    }
                                                  </div>
                                                )}
                                            </Form.Group>
                                          </Col>
                                        </Row>
                                      )}

                                      {/* Taxi Section */}
                                      <Row className="mt-3">
                                        <Col md={12}>
                                          <h5 className="mb-2">
                                            Local Taxi Details
                                          </h5>
                                        </Col>
                                      </Row>
                                      <Row>
                                        <Col md={4}>
                                          <Form.Group className="mb-3">
                                            <Form.Label>
                                              Is Local Taxi Required{" "}
                                              <RequiredIcon />
                                            </Form.Label>
                                            <div className="radio-row">
                                              <Form.Check
                                                inline
                                                type="radio"
                                                name={`itineraries[${idx}].localTaxiRequired`}
                                                label="Yes"
                                                value="Yes"
                                                checked={
                                                  it.localTaxiRequired === "Yes"
                                                }
                                                disabled={isReadOnly}
                                                onChange={handleChange}
                                              />
                                              <Form.Check
                                                inline
                                                type="radio"
                                                name={`itineraries[${idx}].localTaxiRequired`}
                                                label="No"
                                                value="No"
                                                checked={
                                                  it.localTaxiRequired === "No"
                                                }
                                                disabled={isReadOnly}
                                                onChange={handleChange}
                                              />
                                            </div>
                                            {touched.itineraries?.[idx]
                                              ?.localTaxiRequired &&
                                              errors.itineraries?.[idx]
                                                ?.localTaxiRequired && (
                                                <div className="text-danger small mt-1">
                                                  {
                                                    errors.itineraries[idx]
                                                      .localTaxiRequired
                                                  }
                                                </div>
                                              )}
                                          </Form.Group>
                                        </Col>
                                        {it.localTaxiRequired === "Yes" && (
                                          <Col md={8}>
                                            <Form.Group className="mb-3">
                                              <Form.Label>
                                                Type of Taxi Travel{" "}
                                                <RequiredIcon />
                                              </Form.Label>
                                              <div className="radio-row">
                                                <Form.Check
                                                  inline
                                                  type="radio"
                                                  name={`itineraries[${idx}].taxiType`}
                                                  label="Point to Point"
                                                  value="Point to Point"
                                                  checked={
                                                    it.taxiType ===
                                                    "Point to Point"
                                                  }
                                                  disabled={isReadOnly}
                                                  onChange={handleChange}
                                                />
                                                <Form.Check
                                                  inline
                                                  type="radio"
                                                  name={`itineraries[${idx}].taxiType`}
                                                  label="Full Day"
                                                  value="Full Day"
                                                  checked={
                                                    it.taxiType === "Full Day"
                                                  }
                                                  disabled={isReadOnly}
                                                  onChange={handleChange}
                                                />
                                              </div>
                                              {touched.itineraries?.[idx]
                                                ?.taxiType &&
                                                errors.itineraries?.[idx]
                                                  ?.taxiType && (
                                                  <div className="text-danger small mt-1">
                                                    {
                                                      errors.itineraries[idx]
                                                        .taxiType
                                                    }
                                                  </div>
                                                )}
                                            </Form.Group>
                                          </Col>
                                        )}
                                      </Row>

                                      {it.localTaxiRequired === "Yes" && (
                                        <>
                                          <Row>
                                            <Col md={12} lg={6}>
                                              <Form.Group className="mb-3">
                                                <Form.Label>
                                                  Start Place <RequiredIcon />
                                                </Form.Label>
                                                <Form.Control
                                                  name={`itineraries[${idx}].startPlace`}
                                                  value={it.startPlace || ""}
                                                  onChange={handleChange}
                                                  isInvalid={
                                                    touched.itineraries?.[idx]
                                                      ?.startPlace &&
                                                    !!errors.itineraries?.[idx]
                                                      ?.startPlace
                                                  }
                                                />
                                                {touched.itineraries?.[idx]
                                                  ?.startPlace &&
                                                  errors.itineraries?.[idx]
                                                    ?.startPlace && (
                                                    <div className="text-danger small mt-1">
                                                      {
                                                        errors.itineraries[idx]
                                                          .startPlace
                                                      }
                                                    </div>
                                                  )}
                                              </Form.Group>
                                            </Col>
                                            <Col md={6} lg={3}>
                                              <Form.Group className="mb-3">
                                                <Form.Label>
                                                  Start Date <RequiredIcon />
                                                </Form.Label>
                                                <Form.Control
                                                  type="date"
                                                  name={`itineraries[${idx}].startDate`}
                                                  value={it.startDate || ""}
                                                  onChange={handleChange}
                                                  placeholder="dd/mm/yyyy"
                                                  min={
                                                    it.departure ||
                                                    new Date()
                                                      .toISOString()
                                                      .split("T")[0]
                                                  }
                                                  max={it.arrival || undefined}
                                                  isInvalid={
                                                    touched.itineraries?.[idx]
                                                      ?.startDate &&
                                                    !!errors.itineraries?.[idx]
                                                      ?.startDate
                                                  }
                                                />
                                                {touched.itineraries?.[idx]
                                                  ?.startDate &&
                                                  errors.itineraries?.[idx]
                                                    ?.startDate && (
                                                    <div className="text-danger small mt-1">
                                                      {
                                                        errors.itineraries[idx]
                                                          .startDate
                                                      }
                                                    </div>
                                                  )}
                                              </Form.Group>
                                            </Col>
                                            <Col md={6} lg={3}>
                                              <Form.Group className="mb-3">
                                                <Form.Label>
                                                  Start Time <RequiredIcon />
                                                </Form.Label>
                                                <Form.Control
                                                  type="time"
                                                  name={`itineraries[${idx}].startTime`}
                                                  value={
                                                    it.startTime || "12:00"
                                                  }
                                                  onChange={handleChange}
                                                  placeholder="HH:MM"
                                                  isInvalid={
                                                    touched.itineraries?.[idx]
                                                      ?.startTime &&
                                                    !!errors.itineraries?.[idx]
                                                      ?.startTime
                                                  }
                                                />
                                                {touched.itineraries?.[idx]
                                                  ?.startTime &&
                                                  errors.itineraries?.[idx]
                                                    ?.startTime && (
                                                    <div className="text-danger small mt-1">
                                                      {
                                                        errors.itineraries[idx]
                                                          .startTime
                                                      }
                                                    </div>
                                                  )}
                                              </Form.Group>
                                            </Col>
                                          </Row>

                                          {it.taxiType !== "Full Day" && (
                                            <Row>
                                              <Col md={12} lg={6}>
                                                <Form.Group className="mb-3">
                                                  <Form.Label>
                                                    End Place <RequiredIcon />
                                                  </Form.Label>
                                                  <Form.Control
                                                    name={`itineraries[${idx}].endPlace`}
                                                    value={it.endPlace || ""}
                                                    onChange={handleChange}
                                                    isInvalid={
                                                      touched.itineraries?.[idx]
                                                        ?.endPlace &&
                                                      !!errors.itineraries?.[
                                                        idx
                                                      ]?.endPlace
                                                    }
                                                  />
                                                  {touched.itineraries?.[idx]
                                                    ?.endPlace &&
                                                    errors.itineraries?.[idx]
                                                      ?.endPlace && (
                                                      <div className="text-danger small mt-1">
                                                        {
                                                          errors.itineraries[
                                                            idx
                                                          ].endPlace
                                                        }
                                                      </div>
                                                    )}
                                                </Form.Group>
                                              </Col>
                                              {values.itineraries.length >
                                                1 && (
                                                <Col
                                                  md={6}
                                                  className="mb-3 d-flex align-items-end justify-content-end"
                                                >
                                                  <Button
                                                    variant="outline-danger"
                                                    className="remove-btn"
                                                    onClick={() => remove(idx)}
                                                    title="Remove row"
                                                  >
                                                    <TiMinus /> Remove
                                                  </Button>
                                                </Col>
                                              )}
                                            </Row>
                                          )}
                                        </>
                                      )}

                                      {/* Show remove button for no taxi or full day taxi cases */}
                                      {(it.localTaxiRequired === "No" ||
                                        (it.localTaxiRequired === "Yes" &&
                                          it.taxiType === "Full Day")) &&
                                        values.itineraries.length > 1 && (
                                          <Row>
                                            <Col
                                              md={12}
                                              className="mb-3 d-flex justify-content-end"
                                            >
                                              <Button
                                                variant="outline-danger"
                                                className="remove-btn"
                                                onClick={() => remove(idx)}
                                                title="Remove row"
                                              >
                                                <TiMinus /> Remove
                                              </Button>
                                            </Col>
                                          </Row>
                                        )}
                                    </Card.Body>
                                  </Card>
                                );
                              })}
                            </>
                          );
                        }}
                      </FieldArray>
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
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Advance Cash Required <RequiredIcon />
                            </Form.Label>
                            <div className="radio-row">
                              <Form.Check
                                inline
                                type="radio"
                                name="advanceCashRequired"
                                label="Yes"
                                value="Yes"
                                checked={values.advanceCashRequired === "Yes"}
                                disabled={isReadOnly}
                                onChange={handleChange}
                              />
                              <Form.Check
                                inline
                                type="radio"
                                name="advanceCashRequired"
                                label="No"
                                value="No"
                                checked={values.advanceCashRequired === "No"}
                                disabled={isReadOnly}
                                onChange={handleChange}
                              />
                            </div>
                            {touched.advanceCashRequired &&
                              errors.advanceCashRequired && (
                                <div className="text-danger small mt-1">
                                  {errors.advanceCashRequired}
                                </div>
                              )}
                          </Form.Group>
                        </Col>

                        {values.advanceCashRequired === "Yes" && (
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>
                                Amount Required <RequiredIcon />
                              </Form.Label>
                              <Form.Control
                                name="advanceAmount"
                                value={values.advanceAmount}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  // Allow only numbers and decimal point
                                  if (
                                    value === "" ||
                                    /^\d*\.?\d*$/.test(value)
                                  ) {
                                    // Only update if value is within limit
                                    if (value === "" || parseFloat(value) <= 10000) {
                                      handleChange(e);
                                    }
                                  }
                                }}
                                onKeyPress={(e) => {
                                  // Prevent non-numeric characters except decimal point
                                  if (!/[\d.]/.test(e.key)) {
                                    e.preventDefault();
                                  }
                                }}
                                isInvalid={
                                  touched.advanceAmount &&
                                  !!errors.advanceAmount
                                }
                                max="10000"
                              />
                              {/* <div className="text-muted small mt-1">
                                Maximum amount: 10,000
                              </div> */}
                              {touched.advanceAmount &&
                                errors.advanceAmount && (
                                  <div className="text-danger small mt-1">
                                    {errors.advanceAmount}
                                  </div>
                                )}
                            </Form.Group>
                          </Col>
                        )}
                      </Row>
                      {/* {employeeDesg === "Manager" ? ( */}
                    </div>
                  )}
                </div>

                <div className="section">
                  <div className="section-body">
                    {/* {employeeDesg === "Manager" ? ( */}
                    <div className="d-flex gap-3 justify-content-center mt-3">
                      {mode === "approval" ? (
                        <>
                          <Button
                            type="button"
                            variant="secondary back-btn"
                            size="lg"
                            onClick={() => navigate("/travelrequest")}
                            disabled={approving}
                          >
                            <FaArrowLeftLong /> Back
                          </Button>
                          <Button
                            type="button"
                            variant="danger"
                            size="lg"
                            disabled={approving}
                            onClick={async () => {
                              const managerId = sessionStorage.getItem("empID");
                              const token = sessionStorage.getItem("empToken");

                              // console.log(
                              //   "Session Storage - empID:",
                              //   managerId
                              // );
                              // console.log(
                              //   "Session Storage - empToken:",
                              //   token ? "exists" : "missing"
                              // );

                              if (
                                !managerId ||
                                managerId === "null" ||
                                managerId === "undefined"
                              ) {
                                return;
                              }

                              // Extract numeric ID from the form's travelID value (remove TID_ prefix if present)
                              const numericTravelId = values.travelID.replace(
                                /^TID_/,
                                ""
                              );

                              // Parse IDs as integers
                              const travelIdInt = parseInt(numericTravelId, 10);
                              const managerIdInt = parseInt(managerId, 10);

                              // Validate parsed values
                              if (isNaN(travelIdInt) || isNaN(managerIdInt)) {
                                console.error("Invalid IDs:", {
                                  travelIdInt,
                                  managerIdInt,
                                });
                                return;
                              }

                              setApproving(true);
                              try {
                                const payload = {
                                  travel_id: travelIdInt,
                                  manager_id: managerIdInt,
                                  status: "rejected",
                                };
                                // console.log(
                                //   "Payload stringified:",
                                //   JSON.stringify(payload)
                                // );

                                const response = await fetch(
                                  `${API_URL}/btp/approve`,
                                  {
                                    method: "POST",
                                    headers: {
                                      Authorization: `Bearer ${token}`,
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify(payload),
                                  }
                                );

                                const data = await response.json();
                                // console.log("Rejection response:", data);

                                if (data.success) {
                                  toast.success(
                                    "Travel request rejected successfully!",
                                    {
                                      position: "top-right",
                                      autoClose: 2000,
                                    }
                                  );
                                  setTimeout(
                                    () => navigate("/travelrequest"),
                                    2000
                                  );
                                } else {
                                }
                              } catch (error) {
                                console.error(
                                  "Error rejecting request:",
                                  error
                                );
                              } finally {
                                setApproving(false);
                              }
                            }}
                          >
                            {approving ? "Rejecting..." : "Reject"}
                          </Button>
                          <Button
                            type="button"
                            variant="success"
                            size="lg"
                            disabled={approving}
                            onClick={async () => {
                              const managerId = sessionStorage.getItem("empID");
                              const token = sessionStorage.getItem("empToken");

                              // console.log(
                              //   "Session Storage - empID:",
                              //   managerId
                              // );
                              // console.log(
                              //   "Session Storage - empToken:",
                              //   token ? "exists" : "missing"
                              // );

                              if (
                                !managerId ||
                                managerId === "null" ||
                                managerId === "undefined"
                              ) {
                                return;
                              }

                              // Extract numeric ID from the form's travelID value (remove TID_ prefix if present)
                              const numericTravelId = values.travelID.replace(
                                /^TID_/,
                                ""
                              );

                              // Parse IDs as integers
                              const travelIdInt = parseInt(numericTravelId, 10);
                              const managerIdInt = parseInt(managerId, 10);

                              // Validate parsed values
                              if (isNaN(travelIdInt) || isNaN(managerIdInt)) {
                                console.error("Invalid IDs:", {
                                  travelIdInt,
                                  managerIdInt,
                                });
                                return;
                              }

                              setApproving(true);
                              try {
                                const payload = {
                                  travel_id: travelIdInt,
                                  manager_id: managerIdInt,
                                };

                                // console.log("Approval payload:", payload);
                                // console.log(
                                //   "Payload stringified:",
                                //   JSON.stringify(payload)
                                // );

                                const response = await fetch(
                                  `${API_URL}/btp/approve`,
                                  {
                                    method: "POST",
                                    headers: {
                                      Authorization: `Bearer ${token}`,
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify(payload),
                                  }
                                );

                                const data = await response.json();
                                // console.log("Approval response:", data);

                                if (data.success) {
                                  toast.success(
                                    "Travel request approved successfully!",
                                    {
                                      position: "top-right",
                                      autoClose: 2000,
                                    }
                                  );
                                  setTimeout(
                                    () => navigate("/travelrequest"),
                                    2000
                                  );
                                } else {
                                }
                              } catch (error) {
                                console.error(
                                  "Error approving request:",
                                  error
                                );
                              } finally {
                                setApproving(false);
                              }
                            }}
                          >
                            {approving ? "Approving..." : "Approve"}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            type="button"
                            variant="secondary cancel-btn"
                            onClick={() => navigate("/travelrequest")}
                          >
                            Cancel
                          </Button>

                          <Button
                            type="submit"
                            variant="primary submit-btn"
                            disabled={isSubmitting}
                          >
                            {isSubmitting
                              ? editData
                                ? "Updating..."
                                : "Submitting..."
                              : editData
                              ? "Update"
                              : "Submit"}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
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

export default TravelForm;
