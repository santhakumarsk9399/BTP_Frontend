import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FaCar,
  FaTicketAlt,
  FaCogs,
  FaThLarge,
  FaSignOutAlt,
  FaEllipsisH,
  FaEye,
  FaUnlockAlt,
  FaCheckCircle
} from "react-icons/fa";
import "../Sidebar/Sidebar.css";
// import profileImg from "../../Styles/username_Icon.svg"; 
import profileImg from "../../assets/username_Icon.svg"
import { useAuth } from "../Context/ContextProvider";
import Logout from "../LoginandLogout/Logout";
import axios from "axios";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  let empName = sessionStorage.getItem("empName");
  let empDesignation = sessionStorage.getItem("empDesignation");
  let empDepartment = sessionStorage.getItem("empDepartment");
   let empID= sessionStorage.getItem("empID")
  const API_URL = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem("empToken");

  // console.log(empDesignation, empDepartment);
  const normalizedRole = empDepartment?.toLowerCase() || "";
  const canSeeAuthApproval =
    normalizedRole.includes("finance") ||
    normalizedRole.includes("ceo") ||
    normalizedRole.includes("admin");
  
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const menuItems = [
    { name: "Travel Request", icon: <FaTicketAlt />, path: "/travelrequest" },
    ...(canSeeAuthApproval
      ? [{ name: "Approve Request", icon: <FaCheckCircle />, path: "/authaproval" }]
      : []),
  ]

  const handleLogout = async () => {
    try {
      let values = {
        employeename: empName
      }
      const Result = await axios.post(`${API_URL}/auth/logout`, values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Result?.data.success == true) {
        logout();
        navigate("/login");
      }
    }
    catch (e) {
      console.log(e)
    }
  };
  return (
    <div className="sidebar-container">
      {/* User Info */}
      <div className="sidebar-header">
        <img src={profileImg} alt="User" className="sidebar-avatar" />
        <div>
          <h4 className="sidebar-username">{empName ?empName :"-"}</h4>
          <p className="sidebar-role"><span className="emp-id">{empID ? empID : ""}</span> - {empDesignation? empDesignation:"-"}</p>
        </div>
      </div>

      {/* Menu */}
      <nav className="sidebar-menu">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="sidebar-footer">
        <button className="logout-btn"
          onClick={() => navigate("/changePassword")}
        >
          <FaUnlockAlt className="logout-icon" />
          <span>Change Password</span>
        </button>
        <button className="logout-btn"
          onClick={() => setShowLogoutModal(true)}
        >
          <FaSignOutAlt className="logout-icon" />
          <span>Logout</span>
        </button>
        <Logout
          show={showLogoutModal}
          handleClose={() => setShowLogoutModal(false)}
          handleLogout={handleLogout}
        />
        <p className="sidebar-footer-text">© {new Date().getFullYear()} DELOPT. All rights reserved</p>
      </div>
    </div>
  );
};

export default Sidebar;
