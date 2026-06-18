// import React from "react";
// import { Modal, Button } from "react-bootstrap";

// const ConfirmDeleteModal = ({ show, title = "Confirm Delete", message, onConfirm, onCancel, loading }) => {
//   return (
//     <Modal show={show} onHide={onCancel} centered backdrop="static" size="md">
//       <Modal.Header closeButton>
//         <Modal.Title>{title}</Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         <p>{message || "Are you sure you want to delete this item?"}</p>
//       </Modal.Body>
//       <Modal.Footer>
//         <Button variant="secondary" onClick={onCancel} disabled={loading}>
//           Cancel
//         </Button>
//         <Button
//           variant="danger"
//           onClick={onConfirm}
//           disabled={loading}
//         >
//           {loading ? "Deleting..." : "Delete"}
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );
// };

// export default ConfirmDeleteModal;

import React from "react";
import { Modal, Button } from "react-bootstrap";

import deleteIcon from "../../assets/delete.png";

const ConfirmDeleteModal = ({ show, title = "Confirm Delete", message, onConfirm, onCancel, loading }) => {
  return (
    <Modal show={show} onHide={onCancel} centered backdrop="static" size="md" className="delete-modal">
     {/* 
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header> */}

      <Modal.Body>
         <div class="logout-cnt1"><img src={deleteIcon} alt="Logout" className="logout-icon mb-3" /></div>
        <h4 class="mb-4 pb-2">{message || "Are you sure you want to delete this item?"}</h4>
        <div class="d-flex justify-content-center gap-3 pb-2">
          <Button className="del-cancel-btn" variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button className="delete-btn"
            variant="danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Modal.Body>

 {/*
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Deleting..." : "Delete"}
        </Button>
      </Modal.Footer>*/}


    </Modal>
  );
};

export default ConfirmDeleteModal;