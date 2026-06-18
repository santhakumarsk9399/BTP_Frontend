import React, { useState, useEffect } from "react";
import { Formik, FieldArray } from "formik";
import * as Yup from "yup";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import "./TravelForms.css";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import uparrow from "../../assets/createrequest/up-arrow.png";
import downarrow from "../../assets/createrequest/down-arrow.png";
import ImageIcon from "../CommonComponents/ImageIcon";
import { useNavigate, useParams } from "react-router-dom";
import MultiSelectDropdown from "../CommonComponents/MultiSelectDropDown";
import axios from "axios";
import { toast } from "react-toastify";

const SectionHeader = ({ title, open, onToggle }) => (
  <div className="section-header" onClick={onToggle}>
    <div className="sectitle">
      <h5 className="secLabel">{title}</h5>
    </div>
    <div className="header-line"></div>
    <div className="toggle-icon">
      {open ? (
        <ImageIcon img={uparrow} Img_height={"30px"} Img_width={"30px"} />
      ) : (
        <ImageIcon img={downarrow} Img_height={"30px"} Img_width={"30px"} />
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
          const projectInfo = apiData.projectInfo?.[0] || {};
          const employeeDetails = apiData.employeeDetails?.[0] || {};
          const travelDetails = apiData.travelDetails?.[0] || {};
          const accommodationDetails = apiData.accommodationDetails?.[0] || {};
          const taxiDetails = apiData.taxiDetails?.[0] || {};

          console.log("Employee Info:", employeeInfo);
          console.log("Project Info:", projectInfo);
          console.log("Employee Details:", employeeDetails);
          console.log("Travel details:", travelDetails);
          console.log("Accommodation details:", accommodationDetails);
          console.log("Taxi details:", taxiDetails);

          // Parse departure and arrival dates from format "2025-11-01 00:00:00.000"
          const parseDate = (dateStr) => {
            if (!dateStr) return "";

            try {
              // Handle format: "2025-11-01 00:00:00.000"
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

          // Parse starttime to extract date and time from format "2025-11-04T16:04:00.000Z"
          const parseStartDateTime = (startTimeStr) => {
            if (!startTimeStr) return { date: "", time: "" };
            try {
              const date = new Date(startTimeStr);
              if (isNaN(date.getTime())) return { date: "", time: "" };

              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, "0");
              const day = String(date.getDate()).padStart(2, "0");
              const hours = String(date.getHours()).padStart(2, "0");
              const minutes = String(date.getMinutes()).padStart(2, "0");

              return {
                date: `${year}-${month}-${day}`,
                time: `${hours}:${minutes}`,
              };
            } catch (error) {
              console.error("Error parsing start time:", startTimeStr, error);
              return { date: "", time: "" };
            }
          };

          const startDateTime = parseStartDateTime(taxiDetails.startTime);

          // Parse dates for itineraries
          const departureDate = parseDate(travelDetails.departureDate);
          const arrivalDate = parseDate(travelDetails.arrivalDate);

          console.log("Parsed departure date:", departureDate);
          console.log("Parsed arrival date:", arrivalDate);

          // Get employee info - use logged-in user's ID if not provided
          const loggedEmpId = sessionStorage.getItem("empID") || "";
          const loggedEmpDept = sessionStorage.getItem("empDepartment") || "";

          // Parse isGroup: 1 = "Yes", 0 = "No"
          const isGroupBooking =
            employeeInfo.isGroup === 1 || employeeInfo.isGroup === "1";

          // Parse selectedEmpid - comma-separated IDs like "770,385,700"
          let employeeList = [];
          if (isGroupBooking && employeeInfo.selectedEmpid) {
            const selectedIds = employeeInfo.selectedEmpid
              .split(",")
              .map((id) => id.trim());
            // We'll need to fetch employee names from the employeeListOptions
            // For now, store the IDs and we'll populate names after fetching employee list
            employeeList = selectedIds;
          }

          // Parse project IDs - comma-separated like "PRJ002,PRJ004,PRJ005"
          let projectIDs = [];
          let projectType = "General";
          if (projectInfo.pid) {
            projectIDs = projectInfo.pid.split(",").map((id) => id.trim());
            projectType = "Specific";
          }

          // Parse typeOfVisit: "0" = Domestic, "1" = International
          const typeOfVisit =
            travelDetails.typeOfVisit === "0" || travelDetails.typeOfVisit === 0
              ? "Domestic"
              : "International";

          // Parse taxiReq: 1 = "Yes", 0 = "No"
          const localTaxiRequired =
            taxiDetails.taxiReq === 1 || taxiDetails.taxiReq === "1"
              ? "Yes"
              : "No";

          // Parse roomType for occupancy
          const roomType = accommodationDetails.roomType
            ? String(accommodationDetails.roomType)
            : "1";

          // Transform the API response to match the form structure
          const transformedData = {
            travelId: travelId, // Keep original format for display
            employeeName: employeeDetails.empName || "",
            employeeID: loggedEmpId, // Use logged-in employee ID as fallback
            department: loggedEmpDept, // Use logged-in employee department as fallback
            employeeType:
              travelDetails.empType === 0 ||
              travelDetails.empType === "0" ||
              travelDetails.empType === null
                ? "Self"
                : "Others",
            groupBooking: isGroupBooking ? "Yes" : "No",
            employeeList: employeeList, // Store IDs for now, will be converted to names after fetching employee list
            projectType: projectType,
            projectID: projectIDs,
            projectName: [], // Will be auto-populated from projectID
            itineraries: [
              {
                place: travelDetails.place || "",
                departure: departureDate,
                arrival: arrivalDate,
              },
            ],
            totalDays: "", // Will be auto-calculated
            purposeOfVisit: travelDetails.purpose || "",
            typeOfVisit: typeOfVisit,
            currencyType: travelDetails.currencyType || "",
            simRequired:
              travelDetails.topUpAmount && travelDetails.topUpAmount > 0
                ? "Yes"
                : "No",
            rechargeAmount: travelDetails.topUpAmount
              ? String(travelDetails.topUpAmount)
              : "",
            hotelBookingRequired:
              accommodationDetails.accDays && accommodationDetails.accDays > 0
                ? "Yes"
                : "No",
            accommodations: [
              {
                daysAccommodation: accommodationDetails.accDays
                  ? String(accommodationDetails.accDays)
                  : "",
                typeOfOccupancy: roomType,
                nearestLandmark: accommodationDetails.landmark || "",
              },
            ],
            localTaxiRequired: localTaxiRequired,
            taxiType:
              taxiDetails.taxiType === "1" || taxiDetails.taxiType === 1
                ? "Point to Point"
                : "Full Day",
            taxiDetails: [
              {
                startPlace: taxiDetails.startPlace || "",
                startDate: startDateTime.date,
                startTime: startDateTime.time,
                endPlace: taxiDetails.endPlace || "",
              },
            ],
            advanceCashRequired:
              travelDetails.advanceCash && travelDetails.advanceCash > 0
                ? "Yes"
                : "No",
            advanceAmount: travelDetails.advanceCash
              ? String(travelDetails.advanceCash)
              : "",
          };

          console.log("Transformed data:", transformedData);
          console.log("Itineraries:", transformedData.itineraries);
          setEditData(transformedData);
        } else {
          toast.error("Failed to load travel request data", {
            position: "top-right",
            autoClose: 3000,
          });
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching edit data:", error);
        toast.error(
          `Error: ${
            error.response?.data?.message || "Failed to load travel request"
          }`,
          {
            position: "top-right",
            autoClose: 5000,
          }
        );
        navigate("/dashboard");
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

        console.log("Travel Ticket ID Response:", response);
        if (response?.data?.success) {
          setTravelTicketID(response.data.ticketID);
          console.log("Ticket ID is ", response.data.ticketID);
        }
      } catch (error) {
        console.error("Error fetching travel ticket ID:", error);
        // Fallback to default if API fails
        setTravelTicketID("TID_0041");
      }
    };

    fetchTravelTicketID();
  }, [API_URL, editData]);
console.log(employeeDesg,"emp")
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

        console.log("Employee Team List Response:", response);
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

        console.log(
          "Converting employee IDs to names:",
          editData.employeeList,
          "=>",
          employeeNames
        );

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
    { id: "PRJ001", name: "DELBI" },
    { id: "PRJ002", name: "DELBI2.0" },
    { id: "PRJ003", name: "VideoAnalytics" },
    { id: "PRJ004", name: "Occupancy" },
    { id: "PRJ005", name: "Occupancy2.0" },
    { id: "PRJ006", name: "Stride+" },
  ];

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

    // Map complete edit data structure
    return {
      employeeType: editData.employeeType || "Self",
      travelID: editData.travelId || "",
      employeeName: editData.employeeName || loggedUser.name,
      employeeID: editData.employeeID || loggedUser.id,
      employeeDepartment: editData.department || loggedUser.department,
      groupBooking: editData.groupBooking || "No",
      employeeList: (() => {
        const currentUserName = editData.employeeName || loggedUser.name;
        const existingList = editData.employeeList || [];
        // If group booking is enabled and current user is not in the list, add them
        if (
          editData.groupBooking === "Yes" &&
          !existingList.includes(currentUserName)
        ) {
          return [currentUserName, ...existingList];
        }
        return existingList;
      })(),
      projectType: editData.projectType || "Specific",
      projectID: projectIDs,
      projectName: projectNames,
      itineraries: editData.itineraries || [
        { place: "", departure: "", arrival: "" },
      ],
      totalDays: editData.totalDays || "",
      purposeOfVisit: editData.purposeOfVisit || editData.purpose || "",
      typeOfVisit: editData.typeOfVisit || "Domestic",
      currencyType: editData.currencyType || "",
      simRequired: editData.simRequired || "No",
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
        groupBooking: "No",
        employeeList: [],
        projectType: "General",
        // allow multiple projects to be selected
        projectID: [],
        projectName: [],
        itineraries: [{ place: "", departure: "", arrival: "" }],
        totalDays: "",
        purposeOfVisit: "",
        typeOfVisit: "Domestic",
        currencyType: "",
        simRequired: "No",
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
          place: Yup.string().required("Place of visit is required"),
          departure: Yup.date()
            .required("Departure date is required")
            .typeError("Invalid date format"),
          arrival: Yup.date()
            .required("Arrival date is required")
            .typeError("Invalid date format")
            .min(
              Yup.ref("departure"),
              "Arrival date must be after departure date"
            ),
        })
      )
      .min(1, "At least one itinerary is required"),
    purposeOfVisit: Yup.string().required("Purpose of visit is required"),
    typeOfVisit: Yup.string().required("Type of visit is required"),
    currencyType: Yup.string().when("typeOfVisit", {
      is: "International",
      then: (schema) =>
        schema.required("Currency type is required for international travel"),
      otherwise: (schema) => schema.notRequired(),
    }),
    rechargeAmount: Yup.string().when(["typeOfVisit", "simRequired"], {
      is: (typeOfVisit, simRequired) =>
        typeOfVisit === "International" && simRequired === "Yes",
      then: (schema) =>
        schema
          .required("Recharge amount is required")
          .matches(/^\d+(\.\d{1,2})?$/, "Please enter a valid amount"),
      otherwise: (schema) => schema.notRequired(),
    }),
    hotelBookingRequired: Yup.string().required(
      "Hotel booking selection is required"
    ),
    accommodations: Yup.array().of(
      Yup.object().shape({
        daysAccommodation: Yup.string().when("$hotelBookingRequired", {
          is: "Yes",
          then: (schema) =>
            schema
              .required("Number of days is required")
              .matches(/^\d+$/, "Please enter a valid number"),
          otherwise: (schema) => schema.notRequired(),
        }),
        typeOfOccupancy: Yup.string().required("Type of occupancy is required"),
        nearestLandmark: Yup.string().when("$hotelBookingRequired", {
          is: "Yes",
          then: (schema) => schema.required("Nearest landmark is required"),
          otherwise: (schema) => schema.notRequired(),
        }),
      })
    ),
    localTaxiRequired: Yup.string().required(
      "Local taxi selection is required"
    ),
    taxiType: Yup.string().when("localTaxiRequired", {
      is: "Yes",
      then: (schema) => schema.required("Taxi type is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    taxiDetails: Yup.array().of(
      Yup.object().shape({
        startPlace: Yup.string().when("$localTaxiRequired", {
          is: "Yes",
          then: (schema) => schema.required("Start place is required"),
          otherwise: (schema) => schema.notRequired(),
        }),
        startDate: Yup.date().when("$localTaxiRequired", {
          is: "Yes",
          then: (schema) =>
            schema
              .required("Start date is required")
              .typeError("Invalid date format"),
          otherwise: (schema) => schema.notRequired(),
        }),
        startTime: Yup.string().when("$localTaxiRequired", {
          is: "Yes",
          then: (schema) => schema.required("Start time is required"),
          otherwise: (schema) => schema.notRequired(),
        }),
        endPlace: Yup.string().when(["$localTaxiRequired", "$taxiType"], {
          is: (localTaxiRequired, taxiType) =>
            localTaxiRequired === "Yes" && taxiType === "Point to Point",
          then: (schema) => schema.required("End place is required"),
          otherwise: (schema) => schema.notRequired(),
        }),
      })
    ),
    advanceCashRequired: Yup.string().required(
      "Advance cash selection is required"
    ),
    advanceAmount: Yup.string().when("advanceCashRequired", {
      is: "Yes",
      then: (schema) =>
        schema
          .required("Advance amount is required")
          .matches(/^\d+(\.\d{1,2})?$/, "Please enter a valid amount"),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  // Show loading state while fetching edit data
  if (loading) {
    return (
      <Container className="travel-form-container py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading travel request data...</p>
        </div>
      </Container>
    );
  }

  return (
    <>
      <Container className="travel-form-container py-4">
        <Row>
          <Col>
            {/* <h2 className="page-title mb-4">
            {mode === "approval"
              ? `Travel Request - ${editData?.travelId || travelId} (Approval)`
              : editData
              ? `Edit Travel Request - ${editData.travelId}`
              : "Business Travel Request"}
          </h2> */}
          </Col>
          <Col>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/dashboard")}
              style={{ float: "right" }}
            >
              ← Back
            </Button>
          </Col>
        </Row>
        <Formik
          initialValues={initialValues}
          enableReinitialize={true}
          validationSchema={validationSchema}
          validateOnBlur={false}
          validateOnChange={true}
          validateOnMount={false}
          context={{
            hotelBookingRequired: initialValues.hotelBookingRequired,
            localTaxiRequired: initialValues.localTaxiRequired,
            taxiType: initialValues.taxiType,
          }}
          onSubmit={async (
            values,
            { setSubmitting, setTouched, setErrors }
          ) => {
            console.log("Form submission started");
            console.log("Form values:", values);

            setSubmitting(true);
            // Mark all fields as touched on submit to show errors
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
              itineraries: true,
              totalDays: true,
              purposeOfVisit: true,
              typeOfVisit: true,
              hotelBookingRequired: true,
              accommodations: true,
              localTaxiRequired: true,
              taxiDetails: true,
              advanceCashRequired: true,
            });

            try {
              // Format departure dates (comma-separated if multiple)
              const departureDates = values.itineraries
                .map((it) => {
                  if (!it.departure) return "";
                  const date = new Date(it.departure);
                  // Set time to 00:00:00 for date-only fields
                  date.setHours(0, 0, 0, 0);
                  // Format as "YYYY-MM-DD HH:MM:SS.000"
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, "0");
                  const day = String(date.getDate()).padStart(2, "0");
                  return `${year}-${month}-${day} 00:00:00.000`;
                })
                .filter((d) => d !== "")
                .join(",");

              // Format arrival dates (comma-separated if multiple)
              const arrivalDates = values.itineraries
                .map((it) => {
                  if (!it.arrival) return "";
                  const date = new Date(it.arrival);
                  // Set time to 00:00:00 for date-only fields
                  date.setHours(0, 0, 0, 0);
                  // Format as "YYYY-MM-DD HH:MM:SS.000"
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, "0");
                  const day = String(date.getDate()).padStart(2, "0");
                  return `${year}-${month}-${day} 00:00:00.000`;
                })
                .filter((d) => d !== "")
                .join(",");

              // Format places (comma-separated if multiple)
              const places = values.itineraries.map((it) => it.place).join(",");

              // Format start times (comma-separated if multiple)
              let startTimes = "";
              let startPlaces = "";
              let endPlaces = "";

              if (
                values.localTaxiRequired === "Yes" &&
                values.taxiDetails.length > 0
              ) {
                const formattedTimes = [];
                const startPlacesList = [];
                const endPlacesList = [];

                values.taxiDetails.forEach((taxi) => {
                  if (taxi.startDate && taxi.startTime) {
                    const [hours, minutes] = taxi.startTime.split(":");
                    const dateTime = new Date(taxi.startDate);
                    dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

                    // Format as "YYYY-MM-DD HH:MM:SS.000"
                    const year = dateTime.getFullYear();
                    const month = String(dateTime.getMonth() + 1).padStart(
                      2,
                      "0"
                    );
                    const day = String(dateTime.getDate()).padStart(2, "0");
                    const hour = String(dateTime.getHours()).padStart(2, "0");
                    const minute = String(dateTime.getMinutes()).padStart(
                      2,
                      "0"
                    );

                    formattedTimes.push(
                      `${year}-${month}-${day} ${hour}:${minute}:00.000`
                    );
                  }

                  startPlacesList.push(taxi.startPlace || "");
                  if (values.taxiType !== "Full Day") {
                    endPlacesList.push(taxi.endPlace || "");
                  }
                });

                startTimes = formattedTimes.join(",");
                startPlaces = startPlacesList.join(",");
                endPlaces = endPlacesList.join(",");
              }

              // Get selected employee IDs (comma-separated)
              let selectedempids = "";
              if (
                values.groupBooking === "Yes" &&
                values.employeeList.length > 0
              ) {
                const employeeIds = values.employeeList
                  .map((empName) => {
                    // Check if this is the logged-in user
                    if (
                      empName === values.employeeName ||
                      empName === loggedUser.name
                    ) {
                      return values.employeeID || loggedUser.id;
                    }
                    // Find from the employee list
                    const emp = groupBookingEmployeeList.find(
                      (e) => e.name === empName
                    );
                    return emp ? emp.id : "";
                  })
                  .filter((id) => id !== "");

                // Add main user's employee ID if not already in the list
                const mainUserId = values.employeeID || loggedUser.id;
                if (!employeeIds.includes(mainUserId)) {
                  employeeIds.unshift(mainUserId); // Add at the beginning
                }

                selectedempids = employeeIds.join(",");
              }

              // Build API payload
              const payload = {
                empname: values.employeeName,
                emptype: values.employeeType === "Self" ? "0" : "1",
                typeofvisit: values.typeOfVisit === "Domestic" ? "0" : "1",
                purpose: values.purposeOfVisit,
                place: places,
                departure_date: departureDates,
                arrival_date: arrivalDates,
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
                is_group: values.groupBooking === "Yes" ? "1" : "0",
                created_date: new Date().toISOString().slice(0, 10),
                selectedprojectids:
                  values.projectType === "Specific"
                    ? values.projectID.join(",")
                    : "",
                selectedempids: selectedempids,
                acc_type: values.hotelBookingRequired === "Yes" ? "1" : "0",
                acc_days:
                  values.hotelBookingRequired === "Yes" &&
                  values.accommodations[0]?.daysAccommodation
                    ? parseInt(values.accommodations[0].daysAccommodation)
                    : 0,
                landmark:
                  values.hotelBookingRequired === "Yes" &&
                  values.accommodations[0]?.nearestLandmark
                    ? values.accommodations[0].nearestLandmark
                    : "",
                room_type: values.accommodations[0]?.typeOfOccupancy || "",
                taxi_req: values.localTaxiRequired === "Yes" ? "1" : "0",
                taxi_type: values.localTaxiRequired === "Yes" ? "1" : "0",
                start_place:
                  values.localTaxiRequired === "Yes" ? startPlaces : "",
                end_place:
                  values.localTaxiRequired === "Yes" &&
                  values.taxiType !== "Full Day"
                    ? endPlaces
                    : "",
                starttime: startTimes,
              };

              console.log("Submitting payload:", payload);

              const token = sessionStorage.getItem("empToken");

              // Determine if we're editing or creating
              const isEditMode = !!editData;
              let apiEndpoint = `${API_URL}/btp/create`;
              let finalPayload = payload;

              if (isEditMode) {
                // For edit mode, extract numeric travel_id and add it to both URL and body
                const numericTravelId = travelId.replace(/^TID_/, "");
                apiEndpoint = `${API_URL}/btp/edit?travel_id=${numericTravelId}`;
                finalPayload = {
                  ...payload,
                  travel_id: numericTravelId,
                };
              }

              const response = await axios.post(apiEndpoint, finalPayload, {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              });

              console.log("API Response:", response);

              if (response?.data?.success) {
                toast.success(
                  isEditMode
                    ? "Travel request updated successfully!"
                    : "Travel request created successfully!",
                  {
                    position: "top-right",
                    autoClose: 3000,
                  }
                );
                navigate("/dashboard");
              } else {
                toast.error(
                  `Error: ${
                    response?.data?.message ||
                    (isEditMode
                      ? "Failed to update travel request"
                      : "Failed to create travel request")
                  }`,
                  {
                    position: "top-right",
                    autoClose: 5000,
                  }
                );
              }
            } catch (error) {
              console.error("Error submitting form:", error);
              toast.error(
                `Error: ${
                  error.response?.data?.message ||
                  error.message ||
                  "Failed to submit form"
                }`,
                {
                  position: "top-right",
                  autoClose: 5000,
                }
              );
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

                  console.log("All Employees List Response:", response);
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

            return (
              <Form
                noValidate
                onSubmit={handleSubmit}
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
                            <Form.Label>Employee Type <RequiredIcon /></Form.Label>
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
                                onChange={handleChange}
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
                                  const selectedEmployee =
                                    employeeListOptions.find(
                                      (emp) => emp.name === e.target.value
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
                                    // Set department if available in employee data, otherwise keep empty
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
                              value={values.employeeID}
                              onChange={handleChange}
                              disabled={
                                isReadOnly ||
                                values.employeeType === "Self" ||
                                values.employeeName
                              }
                              readOnly={isReadOnly || values.employeeName}
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
                              value={values.employeeDepartment}
                              onChange={handleChange}
                              disabled={
                                isReadOnly ||
                                values.employeeType === "Self" ||
                                values.employeeName
                              }
                              readOnly={isReadOnly || values.employeeName}
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
                            <Form.Label>Group Booking Required? <RequiredIcon /></Form.Label>
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
                                    // Add the current user to the employee list if not already present
                                    const currentUserName =
                                      values.employeeName || loggedUser.name;
                                    if (
                                      !values.employeeList.includes(
                                        currentUserName
                                      )
                                    ) {
                                      setFieldValue("employeeList", [
                                        currentUserName,
                                        ...values.employeeList,
                                      ]);
                                    }
                                  } else {
                                    // Clear the employee list when "No" is selected
                                    setFieldValue("employeeList", []);
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

                        {values.groupBooking === "Yes" && (
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Select Employees List <RequiredIcon /></Form.Label>
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
                                  setFieldValue(
                                    "employeeList",
                                    selected.map((emp) => emp.name),
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
                            <Form.Label>Project Type <RequiredIcon /></Form.Label>
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
                              <Form.Label>Project <RequiredIcon /></Form.Label>
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
                            <Form.Label>Type of Visit <RequiredIcon /></Form.Label>
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
                      </Row>
                      <Row>
                        <Col>
                          <Form.Group className="mb-3">
                            <Form.Label>Purpose of Visit <RequiredIcon /></Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={3}
                              name="purposeOfVisit"
                              value={values.purposeOfVisit}
                              onChange={handleChange}
                              isInvalid={
                                touched.purposeOfVisit &&
                                !!errors.purposeOfVisit
                              }
                            />
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
                                <Form.Label>Currency Type <RequiredIcon /></Form.Label>
                                <Form.Select
                                  name="currencyType"
                                  value={values.currencyType}
                                  onChange={handleChange}
                                  isInvalid={
                                    touched.currencyType &&
                                    !!errors.currencyType
                                  }
                                >
                                  {/* <option value="">Select</option> */}
                                  <option value="INR">INR</option>
                                  <option value="USD">USD</option>
                                  <option value="EUR">EUR</option>
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
                                <Form.Label>SIM Card Required ? <RequiredIcon /></Form.Label>
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

                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>
                                  How much amount required for topup recharge? <RequiredIcon />
                                </Form.Label>
                                <Form.Control
                                  name="rechargeAmount"
                                  value={values.rechargeAmount}
                                  onChange={handleChange}
                                  isInvalid={
                                    touched.rechargeAmount &&
                                    !!errors.rechargeAmount
                                  }
                                />
                                {touched.rechargeAmount &&
                                  errors.rechargeAmount && (
                                    <div className="text-danger small mt-1">
                                      {errors.rechargeAmount}
                                    </div>
                                  )}
                              </Form.Group>
                            </Col>
                          </Row>
                        </>
                      )}
                      {/* Itineraries */}
                      <FieldArray name="itineraries">
                        {({ push, remove }) => (
                          <>
                            {values.itineraries.map((it, idx) => {
                              return (
                                <Card key={idx} className="mb-3 itinerary-card">
                                  <Card.Body>
                                    <Row className="align-items-end">
                                      <Col md={4}>
                                        <Form.Group className="mb-2">
                                          <Form.Label>
                                            Place of Visit <RequiredIcon />
                                          </Form.Label>
                                          <Form.Control
                                            name={`itineraries[${idx}].place`}
                                            value={it.place}
                                            onChange={handleChange}
                                            isInvalid={
                                              touched.itineraries?.[idx]
                                                ?.place &&
                                              !!errors.itineraries?.[idx]?.place
                                            }
                                          />
                                          {touched.itineraries?.[idx]?.place &&
                                            errors.itineraries?.[idx]
                                              ?.place && (
                                              <div className="text-danger small mt-1">
                                                {errors.itineraries[idx].place}
                                              </div>
                                            )}
                                        </Form.Group>
                                      </Col>

                                      <Col md={3}>
                                        <Form.Group className="mb-2">
                                          <Form.Label>
                                            Expected date of departure <RequiredIcon />
                                          </Form.Label>
                                          <Form.Control
                                            type="date"
                                            name={`itineraries[${idx}].departure`}
                                            value={it.departure}
                                            onChange={handleChange}
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

                                      <Col md={3}>
                                        <Form.Group className="mb-2">
                                          <Form.Label>
                                            Expected date of arrival <RequiredIcon />
                                          </Form.Label>
                                          <Form.Control
                                            type="date"
                                            name={`itineraries[${idx}].arrival`}
                                            value={it.arrival}
                                            onChange={handleChange}
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

                                      <Col md={2} className="text-end">
                                        {!isReadOnly && (
                                          <Button
                                            variant="primary"
                                            className="btn-sm ms-2"
                                            onClick={() =>
                                              push({
                                                place: "",
                                                departure: "",
                                                arrival: "",
                                              })
                                            }
                                            disabled={
                                              !(
                                                it.place &&
                                                it.departure &&
                                                it.arrival
                                              )
                                            }
                                            title="Add row"
                                          >
                                            +
                                          </Button>
                                        )}
                                        {/* <button type="button" class="btn-primary btn-sm" onClick={() => push({ place: "", departure: "", arrival: "" })}>+</button> */}
                                        {/* <Button as="input" type="button" value="Input" /> */}
                                        {!isReadOnly && idx > 0 && (
                                          <Button
                                            variant="outline-danger"
                                            className="btn-sm ms-2"
                                            onClick={() => remove(idx)}
                                            title="Remove row"
                                          >
                                            −
                                          </Button>
                                        )}
                                      </Col>
                                    </Row>
                                  </Card.Body>
                                </Card>
                              );
                            })}
                          </>
                        )}
                      </FieldArray>

                      <Row>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Expected duration of Days </Form.Label>
                            <Form.Control
                              name="totalDays"
                              value={values.totalDays}
                              readOnly
                            />
                            <div className="text-muted small mt-1">
                              Auto Fill
                            </div>
                          </Form.Group>
                        </Col>
                      </Row>
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
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Is Hotel booking required <RequiredIcon /> </Form.Label>
                            <div className="radio-row">
                              <Form.Check
                                inline
                                type="radio"
                                name="hotelBookingRequired"
                                label="Yes"
                                value="Yes"
                                checked={values.hotelBookingRequired === "Yes"}
                                disabled={isReadOnly}
                                onChange={handleChange}
                              />
                              <Form.Check
                                inline
                                type="radio"
                                name="hotelBookingRequired"
                                label="No"
                                value="No"
                                checked={values.hotelBookingRequired === "No"}
                                disabled={isReadOnly}
                                onChange={handleChange}
                              />
                            </div>
                            {touched.hotelBookingRequired &&
                              errors.hotelBookingRequired && (
                                <div className="text-danger small mt-1">
                                  {errors.hotelBookingRequired}
                                </div>
                              )}
                          </Form.Group>
                        </Col>
                      </Row>
                      <FieldArray name="accommodations">
                        {() => (
                          <>
                            {values.itineraries.map((it, idx) => {
                              const acc = values.accommodations[idx] || {
                                daysAccommodation: "",
                                typeOfOccupancy: "1",
                                nearestLandmark: "",
                              };

                              return (
                                <Card
                                  key={idx}
                                  className="mb-3 p-3 accommodation-card"
                                >
                                  <h6>
                                    {/* Accommodation for{" "} */}
                                    {/* {it.place || `Place ${idx + 1}`} */}
                                  </h6>

                                  {/* Only show these 3 fields if hotel booking is Yes */}
                                  {values.hotelBookingRequired === "Yes" && (
                                    <Row>
                                      <Col md={6}>
                                        <Form.Group className="mb-3">
                                          <Form.Label>
                                            No of days accommodation required <RequiredIcon />
                                          </Form.Label>
                                          <Form.Control
                                            name={`accommodations[${idx}].daysAccommodation`}
                                            value={acc.daysAccommodation}
                                            onChange={handleChange}
                                            isInvalid={
                                              touched.accommodations?.[idx]
                                                ?.daysAccommodation &&
                                              !!errors.accommodations?.[idx]
                                                ?.daysAccommodation
                                            }
                                          />
                                          {touched.accommodations?.[idx]
                                            ?.daysAccommodation &&
                                            errors.accommodations?.[idx]
                                              ?.daysAccommodation && (
                                              <div className="text-danger small mt-1">
                                                {
                                                  errors.accommodations[idx]
                                                    .daysAccommodation
                                                }
                                              </div>
                                            )}
                                        </Form.Group>
                                      </Col>

                                      <Col md={6}>
                                        <Form.Group className="mb-3">
                                          <Form.Label>
                                            Nearest LandMark/Place for Hotel
                                            Booking <RequiredIcon />
                                          </Form.Label>
                                          <Form.Control
                                            name={`accommodations[${idx}].nearestLandmark`}
                                            value={acc.nearestLandmark}
                                            onChange={handleChange}
                                            isInvalid={
                                              touched.accommodations?.[idx]
                                                ?.nearestLandmark &&
                                              !!errors.accommodations?.[idx]
                                                ?.nearestLandmark
                                            }
                                          />
                                          {touched.accommodations?.[idx]
                                            ?.nearestLandmark &&
                                            errors.accommodations?.[idx]
                                              ?.nearestLandmark && (
                                              <div className="text-danger small mt-1">
                                                {
                                                  errors.accommodations[idx]
                                                    .nearestLandmark
                                                }
                                              </div>
                                            )}
                                        </Form.Group>
                                      </Col>
                                    </Row>
                                  )}
                                  <Row>
                                    <Col md={6}>
                                      <Form.Group className="mb-3">
                                        <Form.Label>
                                          Type Of Occupancy <RequiredIcon />
                                        </Form.Label>
                                        <Form.Select
                                          name={`accommodations[${idx}].typeOfOccupancy`}
                                          value={acc.typeOfOccupancy}
                                          onChange={handleChange}
                                          isInvalid={
                                            touched.accommodations?.[idx]
                                              ?.typeOfOccupancy &&
                                            !!errors.accommodations?.[idx]
                                              ?.typeOfOccupancy
                                          }
                                        >
                                          <option value="1">1</option>
                                          <option value="2">2</option>
                                        </Form.Select>
                                        {touched.accommodations?.[idx]
                                          ?.typeOfOccupancy &&
                                          errors.accommodations?.[idx]
                                            ?.typeOfOccupancy && (
                                            <div className="text-danger small mt-1">
                                              {
                                                errors.accommodations[idx]
                                                  .typeOfOccupancy
                                              }
                                            </div>
                                          )}
                                      </Form.Group>
                                    </Col>
                                  </Row>
                                  {/* Taxi / Start-End fields remain visible regardless */}
                                  <Row>
                                    <Col md={6}>
                                      <Form.Group className="mb-3">
                                        <Form.Label>
                                          Is Local Taxi Required <RequiredIcon />
                                        </Form.Label>
                                        <div className="radio-row">
                                          <Form.Check
                                            inline
                                            type="radio"
                                            name="localTaxiRequired"
                                            label="Yes"
                                            value="Yes"
                                            checked={
                                              values.localTaxiRequired === "Yes"
                                            }
                                            disabled={isReadOnly}
                                            onChange={handleChange}
                                          />
                                          <Form.Check
                                            inline
                                            type="radio"
                                            name="localTaxiRequired"
                                            label="No"
                                            value="No"
                                            checked={
                                              values.localTaxiRequired === "No"
                                            }
                                            disabled={isReadOnly}
                                            onChange={handleChange}
                                          />
                                        </div>
                                        {touched.localTaxiRequired &&
                                          errors.localTaxiRequired && (
                                            <div className="text-danger small mt-1">
                                              {errors.localTaxiRequired}
                                            </div>
                                          )}
                                      </Form.Group>
                                    </Col>
                                    {values.localTaxiRequired === "Yes" && (
                                      <Col md={6}>
                                        <Form.Group className="mb-3">
                                          <Form.Label>
                                            Type of Taxi Travel <RequiredIcon />
                                          </Form.Label>
                                          <div className="radio-row">
                                            <Form.Check
                                              inline
                                              type="radio"
                                              name="taxiType"
                                              label="Point to Point"
                                              value="Point to Point"
                                              checked={
                                                values.taxiType ===
                                                "Point to Point"
                                              }
                                              disabled={isReadOnly}
                                              onChange={handleChange}
                                            />
                                            <Form.Check
                                              inline
                                              type="radio"
                                              name="taxiType"
                                              label="Full Day"
                                              value="Full Day"
                                              checked={
                                                values.taxiType === "Full Day"
                                              }
                                              disabled={isReadOnly}
                                              onChange={handleChange}
                                            />
                                          </div>
                                          {touched.taxiType &&
                                            errors.taxiType && (
                                              <div className="text-danger small mt-1">
                                                {errors.taxiType}
                                              </div>
                                            )}
                                        </Form.Group>
                                      </Col>
                                    )}
                                  </Row>
                                  {values.localTaxiRequired === "Yes" && (
                                    <>
                                      <Row>
                                        <Col md={6}>
                                          <Form.Group className="mb-3">
                                            <Form.Label>Start Place <RequiredIcon /></Form.Label>
                                            <Form.Control
                                              name={`taxiDetails[${idx}].startPlace`}
                                              value={
                                                values.taxiDetails[idx]
                                                  ?.startPlace || ""
                                              }
                                              onChange={handleChange}
                                              isInvalid={
                                                touched.taxiDetails?.[idx]
                                                  ?.startPlace &&
                                                !!errors.taxiDetails?.[idx]
                                                  ?.startPlace
                                              }
                                            />
                                            {touched.taxiDetails?.[idx]
                                              ?.startPlace &&
                                              errors.taxiDetails?.[idx]
                                                ?.startPlace && (
                                                <div className="text-danger small mt-1">
                                                  {
                                                    errors.taxiDetails[idx]
                                                      .startPlace
                                                  }
                                                </div>
                                              )}
                                          </Form.Group>
                                        </Col>

                                        <Col md={3}>
                                          <Form.Group className="mb-3">
                                            <Form.Label>Start Date <RequiredIcon /></Form.Label>
                                            <Form.Control
                                              type="date"
                                              name={`taxiDetails[${idx}].startDate`}
                                              value={
                                                values.taxiDetails[idx]
                                                  ?.startDate || ""
                                              }
                                              onChange={handleChange}
                                              isInvalid={
                                                touched.taxiDetails?.[idx]
                                                  ?.startDate &&
                                                !!errors.taxiDetails?.[idx]
                                                  ?.startDate
                                              }
                                            />
                                            {touched.taxiDetails?.[idx]
                                              ?.startDate &&
                                              errors.taxiDetails?.[idx]
                                                ?.startDate && (
                                                <div className="text-danger small mt-1">
                                                  {
                                                    errors.taxiDetails[idx]
                                                      .startDate
                                                  }
                                                </div>
                                              )}
                                          </Form.Group>
                                        </Col>

                                        <Col md={3}>
                                          <Form.Group className="mb-3">
                                            <Form.Label>Start Time <RequiredIcon /></Form.Label>
                                            <Form.Control
                                              type="time"
                                              name={`taxiDetails[${idx}].startTime`}
                                              value={
                                                values.taxiDetails[idx]
                                                  ?.startTime || ""
                                              }
                                              onChange={handleChange}
                                              isInvalid={
                                                touched.taxiDetails?.[idx]
                                                  ?.startTime &&
                                                !!errors.taxiDetails?.[idx]
                                                  ?.startTime
                                              }
                                            />
                                            {touched.taxiDetails?.[idx]
                                              ?.startTime &&
                                              errors.taxiDetails?.[idx]
                                                ?.startTime && (
                                                <div className="text-danger small mt-1">
                                                  {
                                                    errors.taxiDetails[idx]
                                                      .startTime
                                                  }
                                                </div>
                                              )}
                                          </Form.Group>
                                        </Col>
                                      </Row>

                                      {values.taxiType !== "Full Day" && (
                                        <Row>
                                          <Col md={6}>
                                            <Form.Group className="mb-3">
                                              <Form.Label>End Place<RequiredIcon /></Form.Label>
                                              <Form.Control
                                                name={`taxiDetails[${idx}].endPlace`}
                                                value={
                                                  values.taxiDetails[idx]
                                                    ?.endPlace || ""
                                                }
                                                onChange={handleChange}
                                                isInvalid={
                                                  touched.taxiDetails?.[idx]
                                                    ?.endPlace &&
                                                  !!errors.taxiDetails?.[idx]
                                                    ?.endPlace
                                                }
                                              />
                                              {touched.taxiDetails?.[idx]
                                                ?.endPlace &&
                                                errors.taxiDetails?.[idx]
                                                  ?.endPlace && (
                                                  <div className="text-danger small mt-1">
                                                    {
                                                      errors.taxiDetails[idx]
                                                        .endPlace
                                                    }
                                                  </div>
                                                )}
                                            </Form.Group>
                                          </Col>
                                        </Row>
                                      )}
                                    </>
                                  )}
                                </Card>
                              );
                            })}
                          </>
                        )}
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
                            <Form.Label>Advance Cash Required <RequiredIcon /></Form.Label>
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
                              <Form.Label>Amount Required <RequiredIcon /></Form.Label>
                              <Form.Control
                                name="advanceAmount"
                                value={values.advanceAmount}
                                onChange={handleChange}
                                isInvalid={
                                  touched.advanceAmount &&
                                  !!errors.advanceAmount
                                }
                              />
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
                        <div className="d-flex gap-3 justify-content-center mt-3">
                          {mode === "approval" ? (
                            <>
                              <Button
                                type="button"
                                variant="success"
                                size="lg"
                                disabled={approving}
                                onClick={async () => {
                                  const managerId =
                                    sessionStorage.getItem("empID");
                                  const token =
                                    sessionStorage.getItem("empToken");

                                  if (!managerId) {
                                    toast.error("Manager ID not found", {
                                      position: "top-right",
                                      autoClose: 3000,
                                    });
                                    return;
                                  }

                                  // Extract numeric ID from the form's travelID value (remove TID_ prefix if present)
                                  const numericTravelId =
                                    values.travelID.replace(/^TID_/, "");

                                  setApproving(true);
                                  try {
                                    const payload = {
                                      travel_id: parseInt(numericTravelId),
                                      manager_id: parseInt(managerId),
                                    };

                                    console.log("Approval payload:", payload);

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
                                    console.log("Approval response:", data);

                                    if (data.success) {
                                      toast.success(
                                        "Travel request approved successfully!",
                                        {
                                          position: "top-right",
                                          autoClose: 2000,
                                        }
                                      );
                                      setTimeout(
                                        () => navigate("/dashboard"),
                                        2000
                                      );
                                    } else {
                                      toast.error(
                                        data.message ||
                                          "Failed to approve request",
                                        {
                                          position: "top-right",
                                          autoClose: 3000,
                                        }
                                      );
                                    }
                                  } catch (error) {
                                    console.error(
                                      "Error approving request:",
                                      error
                                    );
                                    toast.error(
                                      error.message ||
                                        "Failed to approve request. Please try again.",
                                      {
                                        position: "top-right",
                                        autoClose: 3000,
                                      }
                                    );
                                  } finally {
                                    setApproving(false);
                                  }
                                }}
                              >
                                {approving ? "Approving..." : "Approve"}
                              </Button>
                              <Button
                                type="button"
                                variant="secondary"
                                size="lg"
                                onClick={() => navigate("/dashboard")}
                                disabled={approving}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                type="submit"
                                variant="primary"
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
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={() => navigate("/dashboard")}
                              >
                                Cancel
                              </Button>
                            </>
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
    </>
  );
};

export default TravelForm;
