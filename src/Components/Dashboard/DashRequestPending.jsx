import React, { useState, useEffect } from "react";
import TableRow from "./DashTableRow";
import RequestDetail from "./RequestDetail";
import Pagination from "../CommonComponents/Pagination";
import ConfirmDeleteModal from "../CommonComponents/DeleteModal";
import NoData from "../CommonComponents/NoData";
import "../../Styles/DashpendingList.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";



const DashRequestPending = ({ requests, fetchRequests, approvalBasePath }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem("empToken");
  const navigate = useNavigate();
  // Pagination states
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const totalItems = requests.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = requests.slice(startIndex, startIndex + itemsPerPage);
 const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  // const handleExpand = (requestData) => setSelectedRequest(requestData);
   const handleView = (req) => navigate(`/view/${req.Travel_id}`);
  const handleCloseDetail = () => setSelectedRequest(null);

  //   const handleViewForApproval = (req) => {
  //     navigate(`/travelrequest/approval/${req.Travel_id}`);

  // };
  const handleViewForApproval = (req) => {
    navigate(`${approvalBasePath}/${req.Travel_id}`);
  };
  
  const handleDeleteClick = (id) => {
    const idNumber = id.split("_")[1];
    setDeleteId(idNumber);
    setShowDeleteModal(true);
  };
  
const handleConfirmDelete = async () => {
  try {
    setLoading(true);
    setDeletingId(deleteId); 

    await axios.delete(`${API_URL}/btp/delete`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { travel_id: deleteId },
    });

    // Wait for CSS animation (~400ms) before updating the list
    setTimeout(() => {
      fetchRequests();
      setDeletingId(null);
    }, 400);

    showToast("Travel request deleted successfully!", "success");
  } catch (err) {
    console.error("Delete failed:", err);
    showToast("Failed to delete travel request. Try again!", "error");
  } finally {
    setShowDeleteModal(false);
    setLoading(false);
  }
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

          {currentItems.map((request, index) => {
            const travelIdStr = String(request.Travel_id || "");
            const travelIdNum = travelIdStr.includes("_") ? travelIdStr.split("_")[1] : travelIdStr;
            
            return (
            <div
              key={index}
              className={`fade-row ${
                deletingId == travelIdNum ? "fade-out" : ""
              }`}
            >
              <TableRow
                travelId={request.Travel_id}
                department={request.Department}
                purpose={request.Purpose}
                status={request.Status}
                // onEdit={()=>handleExpandClick(request)}
                onExpand={() => handleViewForApproval(request)}
                onDelete={() => handleDeleteClick(request.Travel_id)}
                showDelete={false}
              />
            </div>
            );
          })}
        </div>
      ) : (
        <NoData name="no-data-container" />
      )}
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

      {/* ✅ Delete confirmation modal */}
      <ConfirmDeleteModal
        show={showDeleteModal}
        title="Delete Request"
        message="Do you want to delete the Travel Request Form ?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
        loading={loading}
      />

      {/* ✅ Expandable request detail modal/view */}
      {selectedRequest && (
        <RequestDetail data={selectedRequest} onClose={handleCloseDetail} />
      )}
    </div>
  );
};

export default DashRequestPending;
