import React, { useState, useEffect } from "react";
import TableRow from "./DashTableRow";
import ConfirmDeleteModal from "../CommonComponents/DeleteModal";
import Pagination from "../CommonComponents/Pagination";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../Styles/DashpendingList.css";
import NoData from "../CommonComponents/NoData";
import { showSuccessToast, showErrorToast } from "../CommonComponents/ToastMessage";
import { toast } from "react-toastify";
const BusinessRequestPendingList = ({ requests, fetchRequests }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const totalItems = requests.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = requests.slice(startIndex, startIndex + itemsPerPage);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem("empToken");
  const navigate = useNavigate();

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  // const handleView = (req) => navigate(`/view/${req.Travel_id}`);

    const handleEdit = (requestData) => {
    console.log('Edit requested for:', requestData);
    navigate(`/travelrequest/edit/${requestData.Travel_id}`);
  };


  // Delete
  const handleDeleteClick = (id) => {
    const idNumber = id.split("_")[1];
    setDeleteId(idNumber);
    setShowDeleteModal(true);
  };

const handleConfirmDelete = async () => {
  try {
    setLoading(true);
    await axios.delete(`${API_URL}/btp/delete`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { travel_id: deleteId },
    });

    setShowDeleteModal(false);
    setLoading(false);
    toast.success("Request deleted successfully");
    // showSuccessToast("Request deleted successfully");
    setTimeout(() => fetchRequests(), 800);
  } catch (err) {
    console.error("Delete failed:", err);
    setLoading(false);
    toast.error("Failed to delete request");
    // showErrorToast("Failed to delete request");
  }
};
  //view
    const handleViewForApproval = (req) => {
    console.log("Navigating to approval form for:", req);
    console.log("Travel ID:", req.Travel_id);
    navigate(`/travelrequest/view/${req.Travel_id}`);
  };

  return (
    <div className="pending-list-wrapper">
      {/* ✅ Scrollable content only if data exists */}
      {currentItems.length > 0 ? (
        <div className="pending-list-scroll">
          <div className="bus-req-row bus-req-row-hd">
            <div>Travel ID</div>
            <div>Department</div>
            <div>Purpose</div>
            <div className="text-center">Status</div>
            <div className="text-center">Action</div>
          </div>

          {currentItems.map((req, i) => (
            <TableRow
              key={i}
              travelId={req.Travel_id}
              department={req.Department}
              purpose={req.Purpose}
              status={req.Status}
              onEdit={()=>handleEdit(req)}
              onExpand={() => handleViewForApproval(req)}
              onDelete={() => handleDeleteClick(req.Travel_id)}
              showDelete={true}
            />
          ))}
        </div>
      ) : (
        <NoData name="no-data-container" />
      )}

      {/* ✅ Show pagination only if there’s at least one item */}
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

      <ConfirmDeleteModal
        show={showDeleteModal}
        title="Delete Request"
        message="Do you want to delete the Travel Request Form ?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
        loading={loading}
      />
    </div>
  );
};

export default BusinessRequestPendingList;
