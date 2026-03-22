import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Paper,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AllotedBookService } from "../services/allotedBookService";
import keycloak from "../KeyCloak/KeyCloak";
interface Book {
  mmsId: string;
  bookName: string;
  quantity: number;
  amount: number;
  allocationTime: string;
}

interface Centre {
  centreCode: number;
  currentTime: string;
  books: Book[];
}
const authHeader = () => ({
  Authorization: `Bearer ${keycloak.token}`,
});
const AllocationPage: React.FC = () => {
  const [allocatedData, setAllocatedData] = useState<Centre[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCentre, setSelectedCentre] = useState<Centre | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);

  useEffect(() => {
    const fetchAllCentre = async () => {
      try {
        const allotedData = await AllotedBookService.getAllAllocationData();
        setAllocatedData(allotedData);
      } catch (error) {
        console.error("Error fetching allocation data", error);
      }
    };
    fetchAllCentre();
  }, []);

  const handleAction = (type: "approve" | "reject", centre: Centre) => {
    setActionType(type);
    setSelectedCentre(centre);
    setOpenDialog(true);
  };

  const confirmAction = async () => {
    if (!selectedCentre || !actionType) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/allocation/update?status=${actionType === "approve"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeader() },
          body: JSON.stringify(selectedCentre), // Send full object
        }
      );

      if (response.ok) {
        alert(`${actionType === "approve" ? "Approved" : "Rejected"} successfully!`);
        setAllocatedData((prevData) =>
          prevData.filter((centre) => centre.centreCode !== selectedCentre.centreCode)
        );
      } else {
        throw new Error("Failed to process request");
      }
    } catch (error) {
      console.error("Error processing request", error);
      alert("Failed to update allocation.");
    }

    setOpenDialog(false);
  };

  return (
    <Paper sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Book Allocations
      </Typography>
      {allocatedData.length > 0 ? (
        allocatedData.map((centre) => (
          <Accordion key={centre.centreCode}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Centre Code: {centre.centreCode}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {centre.books.map((book) => (
                <Paper key={book.mmsId} sx={{ padding: 1, marginBottom: 1 }}>
                  <Typography>
                    <b>Book:</b> {book.bookName}
                  </Typography>
                  <Typography>
                    <b>Quantity:</b> {book.quantity}
                  </Typography>
                  <Typography>
                    <b>Price:</b> ₹{book.amount}
                  </Typography>
                  <Typography>
                    <b>Total:</b> ₹{book.amount * book.quantity}
                  </Typography>
                  <Typography>
                    <b>Allocation Time:</b> {new Date(book.allocationTime).toLocaleString()}
                  </Typography>
                </Paper>
              ))}
              <Button
                variant="contained"
                color="success"
                onClick={() => handleAction("approve", centre)}
                sx={{ marginRight: 1 }}
              >
                Approve
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => handleAction("reject", centre)}
              >
                Reject
              </Button>
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Typography>No allocations found.</Typography>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to {actionType} this allocation?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmAction} color={actionType === "approve" ? "success" : "error"}>
            {actionType === "approve" ? "Approve" : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AllocationPage;
