import React, { useState, useEffect } from "react";
import TableRow from "./DashTableRow";
import Pagination from "../CommonComponents/Pagination";
import "../../Styles/DashpendingList.css"; // ✅ Reuse same CSS for scroll + footer
import NoData from "../CommonComponents/NoData";
import { useNavigate } from "react-router-dom";

const BusinessRequestApprovedList = ({ requests, approvalBasePath }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const navigate = useNavigate();

  const totalItems = requests.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = requests.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  // Navigate to view form
  const handleView = (req) => {
    console.log("Navigating to view form for:", req);
    console.log("Travel ID:", req.Travel_id);
    // navigate(`/travelrequest/view/${req.Travel_id}`);
    navigate(`${approvalBasePath}/${req.Travel_id}`);
  };

  return (
    <div className="pending-list-wrapper">
      {/* Scrollable content */}
      {currentItems.length > 0 ? (
        <div className="pending-list-scroll">
          <div className="bus-req-row bus-req-row-hd">
            <div>Travel ID</div>
            <div>Department</div>
            <div>Purpose</div>
            <div className="text-center">Status</div>
            <div className="text-center">Action</div>
          </div>

          {/* {currentItems.length > 0 ? ( */}
          {currentItems.map((req, i) => (
            <TableRow
              key={i}
              travelId={req.Travel_id}
              department={req.Department}
              purpose={req.Purpose}
              status={req.Status}
              showDelete={false}
              onView={() => handleView(req)}
            />
          ))}
        </div>
      ) : (
        <NoData name="no-data-container" />
      )}

      {/* ✅ Fixed bottom pagination bar */}
      {totalItems > 0 && (
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
      )}
    </div>
  );
};

export default BusinessRequestApprovedList;
