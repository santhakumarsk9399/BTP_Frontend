import React, { useState, useEffect } from "react";
import TableRow from "./DashTableRow";
import Pagination from "../CommonComponents/Pagination";
import { useNavigate } from "react-router-dom";
import "../../Styles/DashpendingList.css";

const DashApprovalPendingList = ({ requests }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const totalItems = requests.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = requests.slice(startIndex, startIndex + itemsPerPage);

  const navigate = useNavigate();

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  // Navigate to approval form
  const handleViewForApproval = (req) => {
    console.log("Navigating to approval form for:", req);
    console.log("Travel ID:", req.Travel_id);
    navigate(`/travelrequest/approval/${req.Travel_id}`);
  };

  return (
    <div className="pending-list-wrapper">
      {/* Scrollable content */}
      <div className="pending-list-scroll">
        <div className="bus-req-row bus-req-row-hd">
          <div>Travel ID</div>
          <div>Department</div>
          <div>Purpose</div>
          <div className="text-center">Status</div>
          <div className="text-center">Action</div>
        </div>

        {currentItems.length > 0 ? (
          currentItems.map((req, i) => (
            <TableRow
              key={i}
              travelId={req.Travel_id}
              department={req.Department}
              purpose={req.Purpose}
              status={req.Status}
              onView={() => handleViewForApproval(req)}
              showApprovalButton={true}
            />
          ))
        ) : (
          <div className="text-center text-muted py-3">No records found.</div>
        )}
      </div>

      {/* ✅ Fixed bottom pagination bar */}
      <div className="pagination-fixed">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(newLimit) => {
            setItemsPerPage(newLimit);
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  );
};

export default DashApprovalPendingList;
