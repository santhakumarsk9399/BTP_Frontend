import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import "./RejectModal.css";

const RejectModal = ({ show, travelId, onConfirm, onCancel, loading }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleReasonChange = (e) => {
    const value = e.target.value;
    if (value.length <= 255) {
      setReason(value);
      setError("");
    } else {
      setError("Reason cannot exceed 255 characters");
    }
  };

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }
    onConfirm(reason);
  };

  const handleClose = () => {
    setReason("");
    setError("");
    onCancel();
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      centered 
      backdrop="static" 
      size="md" 
      className="reject-modal"
    >
      <Modal.Body>
        <div className="reject-modal-content">
          <h4 className="mb-2 mt-1">Reject Travel Request</h4>
          
          <div className="mb-3">
            <label className="form-label fw-bold">Travel ID:</label>
            <p className="travel-id-display">{travelId}</p>
          </div>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">
              Reason for Rejection <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={reason}
              onChange={handleReasonChange}
              placeholder="Enter reason for rejection (max 255 characters)"
              className={error ? "is-invalid" : ""}
              disabled={loading}
            />
            <div className="d-flex justify-content-between align-items-center mt-1">
              {error && <Form.Text className="text-danger">{error}</Form.Text>}
              <Form.Text className="text-muted ms-auto">
                {reason.length}/255 characters
              </Form.Text>
            </div>
          </Form.Group>

          <div className="d-flex justify-content-center gap-3 pt-2">
            <Button 
              className="reject-back-btn" 
              variant="secondary" 
              onClick={handleClose} 
              disabled={loading}
            >
              Back
            </Button>
            <Button
              className="reject-confirm-btn"
              variant="danger"
              onClick={handleConfirm}
              disabled={loading || !reason.trim()}
            >
              {loading ? "Processing..." : "Confirm Reject"}
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default RejectModal;
