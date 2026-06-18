// // import React, { useState } from "react";
// // import axios from "axios";
// // import "./ChangePassword.css";
// // import { Container, Row, Col, Form, Button, Card, Modal } from "react-bootstrap";
// // import checkIcon from "../../assets/check.png";
// // const ChangePassword = () => {
// //     const API_URL = import.meta.env.VITE_API_URL;
// //     const empName = sessionStorage.getItem("empName");
// //     const token = sessionStorage.getItem("empToken");
// //     const [values, setValues] = useState({
// //         oldPassword: "",
// //         newPassword: "",
// //         confirmPassword: "",
// //     });

// //     const [errors, setErrors] = useState({});
// //     const [success, setSuccess] = useState("");
// //     const [showSuccessModal, setShowSuccessModal] = useState(false);
// //     const handleSubmit = async (e) => {
// //         e.preventDefault();
// //         let errs = {};

// //         if (!values.oldPassword) errs.oldPassword = "Old password required";
// //         if (!values.newPassword) errs.newPassword = "New password required";
// //         if (!values.confirmPassword)
// //             errs.confirmPassword = "Confirm password required";

// //         if (values.newPassword !== values.confirmPassword) {
// //             errs.confirmPassword = "Passwords do not match";
// //         }

// //         if (Object.keys(errs).length) {
// //             setErrors(errs);
// //             return;
// //         }
// //         let payload = { ...values, emp_name:empName }
// //         console.log(payload)
// //         try {
// //            let res =  await axios.post(`${API_URL}/btp/changePassword`, payload,
// //                 {
// //                     headers: { Authorization: `Bearer ${token}` },
// //                });
// //             console.log(res)
// //             setShowSuccessModal(true);
// //             setValues({ oldPassword: "", newPassword: "", confirmPassword: "" });
// //             setErrors({});
// //         } catch (err) {
// //             console.log(err)
// //             setErrors({
// //                 api: err.response?.data?.message || "Password update failed",
// //             });
// //         }
// //     };

// //     return (
// //         <>
// //               <Modal
// //         show={showSuccessModal}
// //         className="check-modal"
// //         onHide={() => {
// //           setShowSuccessModal(false);
// //           navigate("/changePassword");
// //         }}
// //         centered
// //         backdrop="static"
// //         keyboard={false}
// //       >
// //         <Modal.Body className="text-center m-0">
// //           <div className="mb-0">
// //             <div className="check-cnt">
// //               <img src={checkIcon} alt="check" width="105" className="check-icon mb-0" />
// //             </div> 
// //           </div>
// //           <h4 className="check-modal-hd">
// //            Password Changed Successfully ..
// //           </h4>

// //           <Button
// //             variant="secondary back-btn"
// //             onClick={() => {
// //               setShowSuccessModal(false);
// //               navigate("/changePassword");
// //             }}       
// //           >
// //             Close
// //           </Button>
// //         </Modal.Body>
// //       </Modal>
// //             <div className="cp-page">
// //                 <div className="cp-card">
// //                     <h2 className="cp-title">Change Password</h2>

// //                     <form onSubmit={handleSubmit}>
// //                         <div className="cp-field">
// //                             <label>Old Password</label>
// //                             <input
// //                                 type="password"
// //                                 value={values.oldPassword}
// //                                 onChange={(e) =>
// //                                     setValues({ ...values, oldPassword: e.target.value })
// //                                 }
// //                             />
// //                             {errors.oldPassword && <small>{errors.oldPassword}</small>}
// //                         </div>

// //                         <div className="cp-field">
// //                             <label>New Password</label>
// //                             <input
// //                                 type="password"
// //                                 value={values.newPassword}
// //                                 onChange={(e) =>
// //                                     setValues({ ...values, newPassword: e.target.value })
// //                                 }
// //                             />
// //                             {errors.newPassword && <small>{errors.newPassword}</small>}
// //                         </div>

// //                         <div className="cp-field">
// //                             <label>Confirm Password</label>
// //                             <input
// //                                 type="password"
// //                                 value={values.confirmPassword}
// //                                 onChange={(e) =>
// //                                     setValues({ ...values, confirmPassword: e.target.value })
// //                                 }
// //                             />
// //                             {errors.confirmPassword && <small>{errors.confirmPassword}</small>}
// //                         </div>

// //                         {errors.api && <small className="error">{errors.api}</small>}
// //                         {success && <small className="success">{success}</small>}

// //                         <button className="cp-btn">Update Password</button>
// //                     </form>
// //                 </div>
// //             </div>
// //         </>
     
// //     );
// // };

// // export default ChangePassword;
// import React, { useState } from "react";
// import axios from "axios";
// import "./ChangePassword.css";
// import { Container, Row, Col, Form, Button, Card, Modal } from "react-bootstrap";
// import checkIcon from "../../assets/check.png";
// import { FaEye, FaEyeSlash } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";

// const ChangePassword = () => {
//     const API_URL = import.meta.env.VITE_API_URL;
//     const empName = sessionStorage.getItem("empName");
//     const token = sessionStorage.getItem("empToken");
//     const navigate = useNavigate();

//     const [values, setValues] = useState({
//         oldPassword: "",
//         newPassword: "",
//         confirmPassword: "",
//     });

//     // 👁 visibility states (same pattern as LoginPage)
//     const [showOldPassword, setShowOldPassword] = useState(false);
//     const [showNewPassword, setShowNewPassword] = useState(false);
//     const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//     const [errors, setErrors] = useState({});
//     const [showSuccessModal, setShowSuccessModal] = useState(false);
//     const RequiredIcon = () => <span style={{ color: "red" }}> *</span>;
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         // setShowSuccessModal(true)
//         let errs = {};

//         if (!values.oldPassword) errs.oldPassword = "Old password required";
//         if (!values.newPassword) errs.newPassword = "New password required";
//         if (!values.confirmPassword)
//             errs.confirmPassword = "Confirm password required";

//         if (values.newPassword !== values.confirmPassword) {
//             errs.confirmPassword = "Passwords do not match";
//         }

//         if (Object.keys(errs).length) {
//             setErrors(errs);
//             return;
//         }

//         let payload = { ...values, emp_name: empName };

//         try {
//             await axios.post(`${API_URL}/btp/changePassword`, payload, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });

//             setShowSuccessModal(true);
//             setValues({ oldPassword: "", newPassword: "", confirmPassword: "" });
//             setErrors({});
//         } catch (err) {
//             setErrors({
//                 api: err.response?.data?.message || "Password update failed",
//             });
//         }
//     };

//     return (
//         <>
//             {/* ✅ Success Modal */}
//             <Modal
//                 show={showSuccessModal}
//                 className="check-modal"
//                 centered
//                 backdrop="static"
//                 keyboard={false}
//             >
//                 <Modal.Body className="text-center m-0">
//                     <div className="check-cnt">
//                         <img
//                             src={checkIcon}
//                             alt="check"
//                             width="105"
//                             className="check-icon mb-0"
//                         />
//                     </div>

//                     <h6 className="check-modal-hd_change">
//                         Password Changed Successfully ..
//                     </h6>

//                     <Button
//                         variant="secondary back-btn"
//                         onClick={() => {
//                             setShowSuccessModal(false);
//                             navigate("/changePassword");
//                         }}
//                     >
//                         Close
//                     </Button>
//                 </Modal.Body>
//             </Modal>

//             <div className="cp-page">
//                 <div className="cp-card">
//                     <h2 className="cp-title">Change Password</h2>

//                     <form onSubmit={handleSubmit}>
//                         {/* OLD PASSWORD */}
//                         <div className="cp-field">
//                             <label>Old Password<RequiredIcon/></label>
//                             <div className="password-wrapper">
//                                 <input
//                                     type={showOldPassword ? "text" : "password"}
//                                     value={values.oldPassword}
//                                     onChange={(e) =>
//                                         setValues({ ...values, oldPassword: e.target.value })
//                                     }
//                                 />
//                                 <span
//                                     className="password-toggle-icon"
//                                     onClick={() => setShowOldPassword(!showOldPassword)}
//                                     style={{ cursor: "pointer", userSelect: "none" }}
//                                 >
//                                     {showOldPassword ? <FaEyeSlash /> : <FaEye />}
//                                 </span>
//                             </div>
//                             {errors.oldPassword && <small>{errors.oldPassword}</small>}
//                         </div>

//                         {/* NEW PASSWORD */}
//                         <div className="cp-field">
//                             <label>New Password<RequiredIcon /></label>
//                             <div className="password-wrapper">
//                                 <input
//                                     type={showNewPassword ? "text" : "password"}
//                                     value={values.newPassword}
//                                     onChange={(e) =>
//                                         setValues({ ...values, newPassword: e.target.value })
//                                     }
//                                 />
//                                 <span
//                                     className="password-toggle-icon"
//                                     onClick={() => setShowNewPassword(!showNewPassword)}
//                                     style={{ cursor: "pointer", userSelect: "none" }}
//                                 >
//                                     {showNewPassword ? <FaEyeSlash /> : <FaEye />}
//                                 </span>
//                             </div>
//                             {errors.newPassword && <small>{errors.newPassword}</small>}
//                         </div>

//                         {/* CONFIRM PASSWORD */}
//                         <div className="cp-field">
//                             <label>Confirm Password<RequiredIcon /></label>
//                             <div className="password-wrapper">
//                                 <input
//                                     type={showConfirmPassword ? "text" : "password"}
//                                     value={values.confirmPassword}
//                                     onChange={(e) =>
//                                         setValues({
//                                             ...values,
//                                             confirmPassword: e.target.value,
//                                         })
//                                     }
//                                 />
//                                 <span
//                                     className="password-toggle-icon"
//                                     onClick={() =>
//                                         setShowConfirmPassword(!showConfirmPassword)
//                                     }
//                                     style={{ cursor: "pointer", userSelect: "none" }}
//                                 >
//                                     {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
//                                 </span>
//                             </div>
//                             {errors.confirmPassword && (
//                                 <small>{errors.confirmPassword}</small>
//                             )}
//                         </div>

//                         {errors.api && <small className="error">{errors.api}</small>}

//                         <button className="cp-btn" >Update Password</button>
//                     </form>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default ChangePassword;
import React, { useState } from "react";
import axios from "axios";
import "./ChangePassword.css";
import { Modal, Button } from "react-bootstrap";
import checkIcon from "../../assets/check.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ChangePassword = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const empName = sessionStorage.getItem("empName");
    const token = sessionStorage.getItem("empToken");
    const navigate = useNavigate();

    const [values, setValues] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // 👁 visibility states
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const RequiredIcon = () => <span style={{ color: "red" }}> *</span>;

    /* ---------------- VALIDATION ---------------- */
    const validate = () => {
        let errs = {};

        if (!values.oldPassword) {
            errs.oldPassword = "Old password required";
        }

        if (!values.newPassword) {
            errs.newPassword = "New password required";
        }

        if (!values.confirmPassword) {
            errs.confirmPassword = "Confirm password required";
        }

        if (
            values.oldPassword &&
            values.newPassword &&
            values.oldPassword === values.newPassword
        ) {
            errs.newPassword = "New password should not be same as old password";
        }

        if (
            values.newPassword &&
            values.confirmPassword &&
            values.newPassword !== values.confirmPassword
        ) {
            errs.confirmPassword = "New Password and Confirm Password do not match";
        }

        return errs;
    };

    /* ---------------- SUBMIT ---------------- */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitted(true);

        const validationErrors = validate();
        if (Object.keys(validationErrors).length) {
            setErrors(validationErrors);
            return;
        }

        try {
            const payload = { ...values, emp_name: empName };

            await axios.post(`${API_URL}/btp/changePassword`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setShowSuccessModal(true);
            setValues({ oldPassword: "", newPassword: "", confirmPassword: "" });
            setErrors({});
            setSubmitted(false);
        } catch (err) {
            setErrors({
                api: err.response?.data?.message || "Password update failed",
            });
        }
    };

    /* ---------------- INPUT CHANGE ---------------- */
    const handleChange = (field, value) => {
        setValues((prev) => ({ ...prev, [field]: value }));

        // 🔥 Auto-hide error when user corrects input
        if (submitted) {
            setErrors((prev) => ({ ...prev, [field]: "", api: "" }));
        }
    };

    return (
        <>
            {/* SUCCESS MODAL */}
            <Modal show={showSuccessModal} centered backdrop="static">
                <Modal.Body className="text-center">
                    <img src={checkIcon} width="105" alt="success" />
                    <h4 className="check-modal-hd_change">
                        Password Changed Successfully ..
                    </h4>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setShowSuccessModal(false);
                            navigate("/changePassword");
                        }}
                    >
                        Close
                    </Button>
                </Modal.Body>
            </Modal>

            <div className="cp-page">
                <div className="cp-card">
                    <h2 className="cp-title">Change Password</h2>

                    <form onSubmit={handleSubmit}>
                        {/* OLD PASSWORD */}
                        <div className="cp-field">
                            <label>
                                Old Password<RequiredIcon />
                            </label>
                            <div className="password-wrapper">
                                <input
                                    type={showOldPassword ? "text" : "password"}
                                    value={values.oldPassword}
                                    onChange={(e) =>
                                        handleChange("oldPassword", e.target.value)
                                    }
                                />
                                <span
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                    className="password-toggle-icon"
                                >
                                    {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                            {errors.oldPassword && <small>{errors.oldPassword}</small>}
                        </div>

                        {/* NEW PASSWORD */}
                        <div className="cp-field">
                            <label>
                                New Password<RequiredIcon />
                            </label>
                            <div className="password-wrapper">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    value={values.newPassword}
                                    onChange={(e) =>
                                        handleChange("newPassword", e.target.value)
                                    }
                                />
                                <span
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="password-toggle-icon"
                                >
                                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                            {errors.newPassword && <small>{errors.newPassword}</small>}
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div className="cp-field">
                            <label>
                                Confirm Password<RequiredIcon />
                            </label>
                            <div className="password-wrapper">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={values.confirmPassword}
                                    onChange={(e) =>
                                        handleChange("confirmPassword", e.target.value)
                                    }
                                />
                                <span
                                    onClick={() =>
                                        setShowConfirmPassword(!showConfirmPassword)
                                    }
                                    className="password-toggle-icon"
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                            {errors.confirmPassword && (
                                <small>{errors.confirmPassword}</small>
                            )}
                        </div>

                        {errors.api && <small className="error">{errors.api}</small>}

                        <button className="cp-btn">Update Password</button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default ChangePassword;
