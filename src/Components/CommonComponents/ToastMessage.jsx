import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ✅ Common options
const toastOptions = {
  position: "top-right",
  autoClose: 2000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "colored",
};

// ✅ Generic reusable function
export const showToast = (message, type = "success") => {
  switch (type) {
    case "success":
      toast.success(message, toastOptions);
      break;
    case "error":
      toast.error(message, toastOptions);
      break;
    case "info":
      toast.info(message, toastOptions);
      break;
    case "warning":
      toast.warning(message, toastOptions);
      break;
    default:
      toast(message, toastOptions);
      break;
  }
};

// ✅ Optional short-hand helpers (for convenience)
export const showSuccessToast = (msg) => showToast(msg, "success");
export const showErrorToast = (msg) => showToast(msg, "error");
export const showInfoToast = (msg) => showToast(msg, "info");
export const showWarningToast = (msg) => showToast(msg, "warning");

// ✅ Global container (keep only one in App.jsx)
export const AppToastContainer = () => <ToastContainer />;

