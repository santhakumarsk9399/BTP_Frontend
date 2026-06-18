import React from "react";
import { useNavigate } from "react-router-dom";
import { LuExpand } from "react-icons/lu";
import { FiEdit } from "react-icons/fi";
import { BsTrash3 } from "react-icons/bs";

const TableRow = ({
  travelId,
  department,
  purpose,
  status,
  onEdit,
  onDelete,
  showDelete = true,
  onExpand,
  onView,
}) => {
  let purposedata = purpose.length>20 ? purpose.substring(0, 50) + ".." : purpose;
  return (
    <div className="bus-req-row">
      <div>{travelId}</div>
      <div>{department}</div>
      <div>{purposedata}</div>
      <div className="text-center act-btns">
        <button
          className={`btn btn-${status === "Pending" ? "warning" : status === "Rejected" ? "danger" : "success"}`}
        >
          {status}
        </button>
      </div>
      <div className="text-center action-icons">
        <span onClick={onView || onExpand}  title="View Request" style={{ cursor: "pointer" }}>
          <LuExpand />
        </span>
        {showDelete && (
          <>
            <span
              onClick={onEdit}
              title="Edit Request"
              style={{ cursor: "pointer" }}
            >
              <FiEdit />
            </span>
            <span onClick={onDelete} title="Delete Request">
              <BsTrash3 />
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default TableRow;
