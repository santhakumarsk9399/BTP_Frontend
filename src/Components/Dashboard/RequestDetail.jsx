// src/RequestDetailPage.js
import React from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';

const RequestDetailPage = () => {
  const { travelId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const request = location.state;

  if (!request) {
    // fallback if no state was passed (optional)
    return <p>No request data found for ID: {travelId}</p>;
  }

  return (
    <div className="container mt-4">
      <h2>Request Details</h2>
      <p><strong>Travel ID:</strong> {request.travelId}</p>
      <p><strong>Department:</strong> {request.department}</p>
      <p><strong>Purpose:</strong> {request.purpose}</p>
      <p><strong>Status:</strong> {request.status}</p>

      <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
        ← Back
      </button>
    </div>
  );
};

export default RequestDetailPage;
