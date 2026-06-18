// import React from "react";
// import { useState, useEffect } from "react";
// import logoicon from "../../assets/Occ_icon.png";
// import Clogo from "../../assets/cl2.png";
// import "../../Components/LoginandLogout/LoginPage.css"
// import firefoxlogo from "../../assets/Firefoxlogo.svg";
// import chromelogo from "../../assets/chromelogo.svg";
// import melogo from "../../assets/me-logo.svg";
// import axios from "axios";
// import { useAuth } from "../Context/ContextProvider";
// import { useLocation, useNavigate } from "react-router-dom";
// import {
//   FaEye,
//   FaEyeSlash,

// } from "react-icons/fa";
// const LoginPage = () => {
//   const [values, setValues] = useState({ username: "", password: "" });
//   const [showPassword, setShowPassword] = useState(false);
//   const [errors, setError] = useState({
//     NameError: "",
//     PassError: "",
//     CatchError: "",
//   });
//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const API_URL = import.meta.env.VITE_API_URL;

//   const VerifyUser = async (e) => {
//     e.preventDefault();

//     // reset API error before each attempt
//     setError((prev) => ({ ...prev, CatchError: "" }));

//     // validate fields
//     let validationErrors = {};
//     if (!values.username) {
//       validationErrors.NameError = "Username is required";
//     }
//     if (!values.password) {
//       validationErrors.PassError = "Password is required";
//     }

//     // if validation fails → stop
//     if (Object.keys(validationErrors).length > 0) {
//       setError((prev) => ({ ...prev, ...validationErrors }));
//       return;
//     }

//     try {
//       const Result = await axios.post(`${API_URL}/auth/login`, values);
//       console.log(Result?.data);
//       if (Result?.data?.success == true) {
//         let emp_name = Result?.data?.user?.employeename || "";
//         let emp_id = Result?.data?.user?.employeeid || "";
//         let token = Result?.data?.token?.token || "";
//         let emp_department = Result?.data?.user?.department || "";
//         let emp_designation = Result?.data?.user?.designation || "";
//         let emp_manager_id = Result?.data?.user?.manager_id || "";
//         sessionStorage.setItem("empDepartment", emp_department);
//         sessionStorage.setItem("empDesignation", emp_designation);
//         sessionStorage.setItem("empName", emp_name);
//         sessionStorage.setItem("empID", emp_id);
//         sessionStorage.setItem("empToken", token);
//         sessionStorage.setItem("empManagerID", emp_manager_id);

//         login({ id: emp_id, name: emp_name, role: emp_designation, department: emp_department, token });
//         navigate("/travelrequest", { replace: true });

//         // reset form + errors
//         setValues({ username: "", password: "" });
//         setError({ NameError: "", PassError: "", CatchError: "" });
//       } else {
//         setError((prev) => ({
//           ...prev,
//           CatchError: Result.data?.message || "Invalid credentials",
//         }));
//       }
//     } catch (error) {
//       setError((prev) => ({
//         ...prev,
//         CatchError: error.response?.data?.message || "Something went wrong",
//       }));
//     }
//   };
//   const onChangeHandler = (e) => {
//     const { name, value } = e.target;

//     setValues((prev) => ({ ...prev, [name]: value }));
//     setError((prev) => ({
//       ...prev,
//       [`${name === "username" ? "NameError" : "PassError"}`]: "",
//       CatchError: "",
//     }));
//   };
//   const togglePasswordVisibility = () => {
//     setShowPassword((prev) => !prev);
//   };
//   return (
//     <div>
//       <div className="Login_BgPage">
//         <div className="login_Container">
//           {/* Your login form components go here */}
//           <div className="OccupancyHeader">
//             <h2 className="panel-title clickable-title">
//               Delopt-HUB
//             </h2>
//             {/* <img src={logoicon} width="225px" /> */}
//           </div>
//           <form
//             onSubmit={(e) => {
//               VerifyUser(e);
//             }}
//           >
//             {/* <h4 className="loginHeader">Login</h4> */}
//             <div className="formfield">
//               <div className="FormSection">
//                 <label className="addExpenseLabel">Username (Emp ID)</label>
//                 <input
//                   type="text"
//                   id="Name"
//                   name="username"
//                   value={values.username || ""}
//                   onChange={(e) => onChangeHandler(e)}
//                   className="form-control textfield"
//                   placeholder="Enter the Employee ID"
//                 />
//                 {errors.NameError && (
//                   <small className="email-error" style={{ color: "red" }}>
//                     {errors.NameError}
//                   </small>
//                 )}
//               </div>

//               {/* <div className="FormSection">
//                 <label className="addExpenseLabel">Password</label>
//                 <input
//                   type="password"
//                   id="UserPassword"
//                   name="password"
//                   value={values.password || ""}
//                   onChange={(e) => onChangeHandler(e)}
//                   className="form-control textfield"
//                   // placeholder="Password"
//                 />
//                 {errors.PassError && (
//                   <small className="email-error" style={{ color: "red" }}>
//                     {errors.PassError}
//                   </small>
//                 )}
//                 {errors.CatchError && (
//                   <small className="email-error" style={{ color: "red" }}>
//                     {errors.CatchError}
//                   </small>
//                 )}
//               </div> */}
//               <div className="FormSection">
//                 <label className="addExpenseLabel">Password</label>
//                 <div className="password-wrapper">
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     id="UserPassword"
//                     name="password"
//                     value={values.password || ""}
//                     onChange={(e) => onChangeHandler(e)}
//                     className="form-control textfield"
//                     placeholder="Enter the Password"
//                   />
//                   <span
//                     className="password-toggle-icon"
//                     onClick={togglePasswordVisibility}
//                     style={{ cursor: "pointer", marginLeft: "-30px", userSelect: "none" }}
//                   >
//                     {showPassword ? <FaEyeSlash /> : <FaEye />}
//                   </span>
//                 </div>
//                 {errors.PassError && (
//                   <small className="email-error" style={{ color: "red" }}>
//                     {errors.PassError}
//                   </small>
//                 )}
//                 {errors.CatchError && (
//                   <small className="email-error" style={{ color: "red" }}>
//                     {errors.CatchError}
//                   </small>
//                 )}
//               </div>

//               <div> </div>
//             </div>
//             <div className="actBtn">
//               <button
//                 type="submit"
//                 className="btn btn-primary lgnsbbtn"
//               // onClick={VerifyUser}
//               >
//                 Login
//               </button>
//             </div>

//             {/* <div>{Login()}</div> */}
//           </form>
//           <div className="LC_Section">
//             <div className="LogcopyrightSec">
//               <p className="cplabel">Copyright © 2025 All Rights Reserved by</p>
//               <img src={Clogo} width="90px" height="27px" className="c_logo" />
//             </div>
//             <div className="LogoSec">
//               <p className="splabel">Supported Browsers</p>
//               <div className="SBrowserSec">
//                 <img
//                   src={firefoxlogo}
//                   width="12px"
//                   height="12px"
//                   className="c_logo"
//                 />
//                 <img
//                   src={chromelogo}
//                   width="12px"
//                   height="12px"
//                   className="c_logo"
//                 />
//                 <img
//                   src={melogo}
//                   width="12px"
//                   height="12px"
//                   className="c_logo"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;
import React, { useState } from "react";
import logoicon from "../../assets/Occ_icon.png";
import Clogo from "../../assets/cl2.png";
import "../../Components/LoginandLogout/LoginPage.css";
import firefoxlogo from "../../assets/Firefoxlogo.svg";
import chromelogo from "../../assets/chromelogo.svg";
import melogo from "../../assets/me-logo.svg";
import axios from "axios";
import { useAuth } from "../Context/ContextProvider";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Formik } from "formik";
import * as Yup from "yup";

/* ------------------ Yup Validation Schema ------------------ */
const LoginSchema = Yup.object().shape({
  employeeId: Yup.string()
    .required("Employee ID is required")
    .matches(/^\d+$/, "Employee ID must contain only numbers")
    .min(3, "Employee ID must be at least 3 digits")
    .max(4, "Employee ID must be at most 4 digits"),

  password: Yup.string().required("Password is required"),
});

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const VerifyUser = async (values, { setSubmitting, setErrors }) => {
    try {
      // 🔥 Map employeeId → username for API
      const payload = {
        username: values.employeeId,
        password: values.password,
      };

      const Result = await axios.post(`${API_URL}/auth/login`, payload);

      if (Result?.data?.success === true) {
        const emp_name = Result?.data?.user?.employeename || "";
        const emp_id = Result?.data?.user?.employeeid || "";
        const emp_designation = Result?.data?.user?.designation || "";
        const token = Result?.data?.token?.token || "";
        const emp_department = Result?.data?.user?.department || "";
        const emp_manager_id = Result?.data?.user?.manager_id || "";

        sessionStorage.setItem("empDepartment", emp_department);
        sessionStorage.setItem("empName", emp_name);
        sessionStorage.setItem("empID", emp_id);
        sessionStorage.setItem("empDesignation", emp_designation);
        sessionStorage.setItem("empToken", token);
        sessionStorage.setItem("empManagerID", emp_manager_id);

        login({ id: emp_id, name: emp_name, role: emp_designation, token });
        navigate("/travelrequest", { replace: true });
      } else {
        setErrors({
          password: Result?.data?.message || "Invalid credentials",
        });
      }
    } catch (error) {
      setErrors({
        password: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="Login_BgPage">
        <div className="login_Container">
          <div className="OccupancyHeader">
            <h2 className="panel-title clickable-title">Delopt-HUB</h2>
          </div>

          <Formik
            initialValues={{ employeeId: "", password: "" }}
            validationSchema={LoginSchema}
            onSubmit={VerifyUser}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleSubmit,
            }) => (
              <form onSubmit={handleSubmit}>
                <div className="formfield">
                  {/* -------- Employee ID -------- */}
                  <div className="FormSection">
                    <label className="addExpenseLabel">Employee ID</label>
                    <input
                      type="text"
                      id="Name"
                      name="employeeId"
                      value={values.employeeId}
                      onChange={(e) => {
                        e.target.value = e.target.value.replace(/[^0-9]/g, "");
                        handleChange(e);
                      }}
                      className="form-control textfield"
                    />
                    {touched.employeeId && errors.employeeId && (
                      <small className="email-error" style={{ color: "red" }}>
                        {errors.employeeId}
                      </small>
                    )}
                  </div>

                  {/* -------- Password -------- */}
                  <div className="FormSection">
                    <label className="addExpenseLabel">Password</label>
                    <div className="password-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="UserPassword"
                        name="password"
                        value={values.password}
                        onChange={handleChange}
                        className="form-control textfield"
                      />
                      <span
                        className="password-toggle-icon"
                        onClick={togglePasswordVisibility}
                        style={{
                          cursor: "pointer",
                          marginLeft: "-30px",
                          userSelect: "none",
                        }}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                    {touched.password && errors.password && (
                      <small className="email-error" style={{ color: "red" }}>
                        {errors.password}
                      </small>
                    )}
                  </div>
                </div>

                <div className="actBtn">
                  <button type="submit" className="btn btn-primary lgnsbbtn">
                    Login
                  </button>
                </div>
              </form>
            )}
          </Formik>

          {/* -------- Footer -------- */}
          <div className="LC_Section">
            <div className="LogcopyrightSec">
              <p className="cplabel">
                Copyright © 2025 All Rights Reserved by
              </p>
              <img src={Clogo} width="90px" height="27px" className="c_logo" />
            </div>

            <div className="LogoSec">
              <p className="splabel">Supported Browsers</p>
              <div className="SBrowserSec">
                <img src={firefoxlogo} width="12px" height="12px" />
                <img src={chromelogo} width="12px" height="12px" />
                <img src={melogo} width="12px" height="12px" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

