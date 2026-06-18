// import React from "react";
// import { FaPlus } from "react-icons/fa6";

// const DashHeader = ({ role = "user", pending = 0, approved = 0, activeTab = "", onTabChange, requestapproved, requestpending, pageType ,createNew, managerview, superiorView, financePending, ceoPending, superiorAll }) => {
//   // helper to choose class for each button
//   const btnClass = (tabName) =>
//     `btn me-2 ${activeTab === tabName ? "btn-active" : "btn-inactive"}`;

//   return (
//     <div className="status-tab-btn">
//       <button
//         className={btnClass("pending")}
//         onClick={() => onTabChange("pending")}
//         aria-pressed={activeTab === "pending"}
//       >
//         {pending} Pending
//       </button>

//       <button
//         className={btnClass("approved")}
//         onClick={() => onTabChange("approved")}
//         aria-pressed={activeTab === "approved"}
//       >
//         {approved} Approved
//       </button>
//       {superiorView && (
//         <>
//           <button
//             className={btnClass("pending")}
//             onClick={() => onTabChange("pending")}
//             aria-pressed={activeTab === "pending"}
//           >
//             {pending} Pending
//           </button>

//           <button
//             className={btnClass("approved")}
//             onClick={() => onTabChange("approved")}
//             aria-pressed={activeTab === "approved"}
//           >
//             {approved} Approved
//           </button>
//         </>
//       )}

//       {/* Manager-only buttons */}
//       {managerview && role === "Manager" && (
//         <>
//           <button
//             className={btnClass("pendingForApproval")}
//             onClick={() => onTabChange("pendingForApproval")}
//             aria-pressed={activeTab === "pendingForApproval"}
//           >
//             {requestpending} Pending for Approval
//           </button>

//           <button
//             className={btnClass("approvedRequest")}
//             onClick={() => onTabChange("approvedRequest")}
//             aria-pressed={activeTab === "approvedRequest"}
//           >
//             {requestapproved} Approved Request
//           </button>
//         </>
//       )}

//       {/* 
//       </div>
//        <div>   */}
//       {createNew &&
//         <button
//           className={`btn create-btn ${activeTab === "create" ? "btn-active" : "btn-active"}`}
//           onClick={() => onTabChange("create")}
//           aria-pressed={activeTab === "create"}
//         >
//           <FaPlus /> Create New
//         </button>}
//       {/*</div>*/}
//     </div>
//   );
// };

// export default DashHeader;
import React from "react";
import { FaPlus } from "react-icons/fa6";

const DashHeader = ({
  pageType = "dashboard", // dashboard | auth
  role = "user",
  department,
  pending = 0,
  approved = 0,

  requestpending = 0,
  requestapproved = 0,

  financePending = 0,
  ceoPending = 0,

  activeTab = "",
  onTabChange,

  createNew = false,
  managerview = false,
  authView
}) => {
  const btnClass = (tab) =>
    `btn me-2 ${activeTab === tab ? "btn-active" : "btn-inactive"}`;

  console.log(authView, "authview");
  // console.log(department, "department")
  /* ---------------- PAGE 2 : AUTH APPROVAL ---------------- */
  // if (pageType === "auth") {
  //   const isFinance = role === "Finance";
  //   const isCEO = role === "CEO";
  //   const isAdminFacilities = role === "Admin & Facilities";

  //   const pendingCount = isFinance
  //     ? financePending
  //     : isCEO
  //       ? ceoPending
  //       : 0;

  //   return (
  //     <div className="status-tab-btn">
  //       {(isFinance || isCEO) && (
  //         <button
  //           className={btnClass("pendingForApproval")}
  //           onClick={() => onTabChange("pendingForApproval")}
  //         >
  //           {requestpending} Pending for Approval
  //         </button>
  //       )}

  //       {(isFinance || isCEO || isAdminFacilities) && (
  //         <button
  //           className={btnClass("approvedRequest")}
  //           onClick={() => onTabChange("approvedRequest")}
  //         >
  //           {requestapproved} Approved Request
  //         </button>
  //       )}
  //     </div>
  //   );
  // }
  if (pageType === "auth") {
    const normalizedRole = role?.toLowerCase() || "";

    const isFinance = normalizedRole.includes("finance");
    const isCEO = normalizedRole.includes("ceo");
    const isAdminFacilities =
      normalizedRole.includes("admin") 

    const pendingCount = isFinance
      ? financePending
      : isCEO
        ? ceoPending
        : 0;

    return (
      <div className="status-tab-btn">
        {(isFinance || isCEO) && (
          <button
            className={btnClass("pendingForApproval")}
            onClick={() => onTabChange("pendingForApproval")}
          >
            {pendingCount} Pending
          </button>
        )}

        {(isFinance || isCEO || isAdminFacilities) && (
          <button
            className={btnClass("approvedRequest")}
            onClick={() => onTabChange("approvedRequest")}
          >
            {approved} Approved
          </button>
        )}
      </div>
    );
  }
  
  /* ---------------- PAGE 1 : DASHBOARD ---------------- */
  return (
    <div className="status-tab-btn">
      {/* All users */}
      <button
        className={btnClass("pending")}
        onClick={() => onTabChange("pending")}
      >
        {pending} Pending
      </button>

      <button
        className={btnClass("approved")}
        onClick={() => onTabChange("approved")}
      >
        {approved} Approved
      </button>

      {/* Manager only */}
      {role === "Manager" && (
        <>
          <button
            className={btnClass("pendingForApproval")}
            onClick={() => onTabChange("pendingForApproval")}
          >
            {requestpending} Pending for Approval
          </button>

          <button
            className={btnClass("approvedRequest")}
            onClick={() => onTabChange("approvedRequest")}
          >
            {requestapproved} Approved Request
          </button>
        </>
      )}

      {/* Create */}
      {createNew && (
        <button
          className="btn create-btn btn-active"
          onClick={() => onTabChange("create")}
        >
          <FaPlus /> Create New
        </button>
      )}
    </div>
  );
};

export default DashHeader;
