import React, { useState, useEffect } from "react";
import TableRow from "./DashTableRow";
import Pagination from "../CommonComponents/Pagination";
import "../../Styles/DashpendingList.css"; 
import NoData from "../CommonComponents/NoData";
import { useNavigate } from "react-router-dom";

const DashRequestApproved = ({ requests }) => {
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
    navigate(`/travelrequest/view/${req.Travel_id}`);
  };

  return (
    <div className="pending-list-wrapper">
      {currentItems.length > 0 ? (
        <div className="pending-list-scroll">
      
          <div className="bus-req-row bus-req-row-hd">
            <div>Travel ID</div>
            <div>Department</div>
            <div>Purpose</div>
            <div className="text-center">Status</div>
            <div className="text-center">Action</div>
          </div>

 
          {currentItems.map((request, index) => (
            <TableRow
              key={index}
              travelId={request.Travel_id}
              department={request.Department}
              purpose={request.Purpose}
              status={request.Status}
              showDelete={false}
              onView={() => handleView(request)}
            />
          ))}
        </div>) : (
        <NoData name="no-data-container" />
      )}

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

export default DashRequestApproved;
