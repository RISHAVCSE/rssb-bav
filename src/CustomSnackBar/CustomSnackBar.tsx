import React from "react";
import { Snackbar, Alert } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

interface CustomSnackbarProps {
  open: boolean;
  handleClose: () => void;
  message: string;
  type: "success" | "error";
}

const CustomSnackbar: React.FC<CustomSnackbarProps> = ({ open, handleClose, message, type }) => {
  return (
    <Snackbar 
      open={open} 
      autoHideDuration={3000} 
      onClose={handleClose} 
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Alert 
        onClose={handleClose} 
        severity={type} 
        sx={{ 
          backgroundColor: type === "success" ? "#4caf50" : "#f44336", 
          color: "#fff", 
          display: "flex", 
          alignItems: "center"
        }}
        iconMapping={{
          success: <CheckCircleIcon fontSize="inherit" style={{ color: "white" }} />, 
          error: <ErrorIcon fontSize="inherit" style={{ color: "white" }} />
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default CustomSnackbar;
