// import React from "react";
// import { Navigate } from "react-router-dom";
// import { useAuth } from "../Context/ContextProvider";

// const ProtectedRoute = ({ children, allowedRoles = [] }) => {
//   const { user, loading } = useAuth();
//   if (loading) return null; // or return a spinner

//   if (!user) return <Navigate to="/login" replace />;

//   // If roles provided, validate; otherwise allow any authenticated user
//   if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/ContextProvider";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // or spinner
  if (!user) return <Navigate to="/login" replace />;
   console.log(user)
  // ✅ Normalize user role
  const normalizedUserRole = user.role?.toLowerCase() || "";

  // ✅ If roles provided, check using includes
  const hasAccess =
    allowedRoles.length === 0 ||
    allowedRoles.some((allowedRole) =>
      normalizedUserRole.includes(allowedRole.toLowerCase())
    );

  if (!hasAccess) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
