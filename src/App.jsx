import { AuthProvider } from "./Components/Context/ContextProvider";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ProtectedLayout from "./Components/Context/ProtectedLayout";
import ProtectedRoute from "./Components/Context/ProtectedRoute";
import DashboardMainPage from "./Components/Dashboard/DashboardMainPage";
import LoginPage from "./Components/LoginandLogout/LoginPage";
import "./Styles/Mainpage.css";
import RequestDetailPage from "./Components/Dashboard/RequestDetail";
import TravelForm from "./Components/TravelRequest/TravelForm";
import "react-toastify/dist/ReactToastify.css";
import DashviewFormData from "./Components/Dashboard/DashFormViewData";
import { ToastContainer, toast } from 'react-toastify';
import ApprovalViewForm from "./Components/Dashboard/ApprovalViewForm";
import ChangePassword from "./Components/LoginandLogout/ChangePassword";
import ApprovalAuth from "./Components/Dashboard/AuthApproval/ApprovalAuth";
function App() {
  return (
    <div className="MainApp">
     <ToastContainer />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedLayout />}>
              <Route
                path="/travelrequest"
                element={
                  <ProtectedRoute
                    allowedRoles={["Engineer", "Manager"]}
                  >
                    <DashboardMainPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/authaproval"
                element={
                  <ProtectedRoute
                    allowedRoles={["Manager"]}
                  >
                    <ApprovalAuth />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/travelrequest/create"
                element={
                  <ProtectedRoute
                    allowedRoles={["Engineer", "Manager"]}
                  >
                    <TravelForm />
                  </ProtectedRoute>
                }
              />
                      <Route
               path="/travelrequest/edit/:travelId"
                element={
                  <ProtectedRoute
                    allowedRoles={["Engineer", "Manager"]}
                  >
                    <TravelForm />
                  </ProtectedRoute>
                }
              />
              <Route
               path="/travelrequest/approval/:travelId"
                element={
                  <ProtectedRoute
                    allowedRoles={["Engineer", "Manager"]}
                  >
                    {/* <ApprovalViewForm /> */}
                    <DashviewFormData />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/authaproval/approval/:travelId"
                element={
                  <ProtectedRoute
                    allowedRoles={["Engineer", "Manager"]}
                  >
                    {/* <ApprovalViewForm /> */}
                    <DashviewFormData />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/view/:travelId"
                element={
                  <ProtectedRoute
                    allowedRoles={["Engineer", "Manager"]}
                  >
                    <DashviewFormData />
                  </ProtectedRoute>
                }
              />
                   <Route
                path="/travelrequest/view/:travelId"
                element={
                  <ProtectedRoute
                    allowedRoles={["Engineer", "Manager"]}
                  >
                    <DashviewFormData />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/authaproval/view/:travelId"
                element={
                  <ProtectedRoute
                    allowedRoles={["Engineer", "Manager"]}
                  >
                    <DashviewFormData />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/changePassword"
                element={
                  <ProtectedRoute
                    allowedRoles={["Engineer", "Manager"]}
                  >
                    <ChangePassword />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/travelrequest" replace />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
