import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  TextField,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import axios from "axios";

interface Centre {
  centreCode: number;
  centreName: string;
  sanctionedAmount: number;
  amountUtilized: number;
  email: string;
  phoneNumber: number;
}

const CentreManagement: React.FC = () => {
  const theme = useTheme();
  const [centres, setCentres] = useState<Centre[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Centre | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newCentre, setNewCentre] = useState<Omit<Centre, "centreCode"> & { centreCode?: number }>({
    centreName: "",
    sanctionedAmount: 0,
    amountUtilized: 0,
    email: "",
    phoneNumber: 0,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [centreToDelete, setCentreToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchCentres();
  }, []);

  const fetchCentres = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/centres/getAllCentres");
      setCentres(response.data);
    } catch (error) {
      console.error("Error fetching centres:", error);
    }
  };

  const handleEditClick = (centre: Centre) => {
    setEditingId(centre.centreCode);
    setEditData({ ...centre });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editData) return;
    setEditData({
      ...editData,
      [e.target.name]: e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value,
    });
  };

  const handleSaveClick = async () => {
    if (!editData) return;
    
    try {
      await axios.put("http://localhost:8080/api/centres/updateCentre", editData);
      setCentres(centres.map(centre => 
        centre.centreCode === editData.centreCode ? editData : centre
      ));
      setEditingId(null);
      setEditData(null);
          fetchCentres();

    } catch (error) {
      console.error("Error updating centre:", error);
    }
  };

  const handleCancelClick = () => {
    setEditingId(null);
    setEditData(null);
  };

  const handleAddClick = () => {
    setIsAdding(true);
    setNewCentre({
      centreName: "",
      sanctionedAmount: 0,
      amountUtilized: 0,
      email: "",
      phoneNumber: 0,
    });
  };

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCentre({
      ...newCentre,
      [e.target.name]: e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value,
    });
  };

  const handleAddSave = async () => {
    try {
      const response = await axios.post("http://localhost:8080/api/centres/addCentre", newCentre);
      setCentres([...centres, response.data]);
      setIsAdding(false);
          fetchCentres();

    } catch (error) {
      console.error("Error adding centre:", error);
    }
  };

  const handleAddCancel = () => {
    setIsAdding(false);
  };

  const handleDeleteClick = (centreCode: number) => {
    setCentreToDelete(centreCode);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (centreToDelete === null) return;
    
    try {
      await axios.delete(`http://localhost:8080/api/centres/deleteCentre/${centreToDelete}`);
      setCentres(centres.filter(centre => centre.centreCode !== centreToDelete));
      setDeleteDialogOpen(false);
      setCentreToDelete(null);
    } catch (error) {
      console.error("Error deleting centre:", error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCentreToDelete(null);
  };

  return (
    <Box sx={{ padding: theme.spacing(3) }}>
      <Typography variant="h4" gutterBottom sx={{ marginBottom: theme.spacing(4) }}>
        Centre Management
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: theme.spacing(2) }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Add Centre
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              <TableCell sx={{ color: 'white' }}>Centre Code</TableCell>
              <TableCell sx={{ color: 'white' }}>Centre Name</TableCell>
              <TableCell sx={{ color: 'white' }}>Sanctioned Amount</TableCell>
              <TableCell sx={{ color: 'white' }}>Amount Utilized</TableCell>
              <TableCell sx={{ color: 'white' }}>Email</TableCell>
              <TableCell sx={{ color: 'white' }}>Phone Number</TableCell>
              <TableCell sx={{ color: 'white' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isAdding && (
              <TableRow>
                <TableCell>
                   <TextField
                    name="centreCode"
                    value={newCentre.centreCode}
                    onChange={handleAddChange}
                    size="small"
                    fullWidth
                  />
                  </TableCell>
                <TableCell>
                  <TextField
                    name="centreName"
                    value={newCentre.centreName}
                    onChange={handleAddChange}
                    size="small"
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    name="sanctionedAmount"
                    type="number"
                    value={newCentre.sanctionedAmount}
                    onChange={handleAddChange}
                    size="small"
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    name="amountUtilized"
                    type="number"
                    value={newCentre.amountUtilized}
                    onChange={handleAddChange}
                    size="small"
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    name="email"
                    type="email"
                    value={newCentre.email}
                    onChange={handleAddChange}
                    size="small"
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    name="phoneNumber"
                    type="number"
                    value={newCentre.phoneNumber}
                    onChange={handleAddChange}
                    size="small"
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={handleAddSave} color="primary">
                    <SaveIcon />
                  </IconButton>
                  <IconButton onClick={handleAddCancel} color="secondary">
                    <CancelIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            )}
            
            {centres.map((centre) => (
              <TableRow key={centre.centreCode}>
                <TableCell>{centre.centreCode}</TableCell>
                <TableCell>
                  {editingId === centre.centreCode ? (
                    <TextField
                      name="centreName"
                      value={editData?.centreName || ""}
                      onChange={handleEditChange}
                      size="small"
                      fullWidth
                    />
                  ) : (
                    centre.centreName
                  )}
                </TableCell>
                <TableCell>
                  {editingId === centre.centreCode ? (
                    <TextField
                      name="sanctionedAmount"
                      type="number"
                      value={editData?.sanctionedAmount || 0}
                      onChange={handleEditChange}
                      size="small"
                      fullWidth
                    />
                  ) : (
                    centre.sanctionedAmount
                  )}
                </TableCell>
                <TableCell>
                  {editingId === centre.centreCode ? (
                    <TextField
                      name="amountUtilized"
                      type="number"
                      value={editData?.amountUtilized || 0}
                      onChange={handleEditChange}
                      size="small"
                      fullWidth
                    />
                  ) : (
                    centre.amountUtilized
                  )}
                </TableCell>
                <TableCell>
                  {editingId === centre.centreCode ? (
                    <TextField
                      name="email"
                      type="email"
                      value={editData?.email || ""}
                      onChange={handleEditChange}
                      size="small"
                      fullWidth
                    />
                  ) : (
                    centre.email
                  )}
                </TableCell>
                <TableCell>
                  {editingId === centre.centreCode ? (
                    <TextField
                      name="phoneNumber"
                      type="number"
                      value={editData?.phoneNumber || 0}
                      onChange={handleEditChange}
                      size="small"
                      fullWidth
                    />
                  ) : (
                    centre.phoneNumber
                  )}
                </TableCell>
                <TableCell>
                  {editingId === centre.centreCode ? (
                    <>
                      <IconButton onClick={handleSaveClick} color="primary">
                        <SaveIcon />
                      </IconButton>
                      <IconButton onClick={handleCancelClick} color="secondary">
                        <CancelIcon />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <IconButton 
                        onClick={() => handleEditClick(centre)} 
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDeleteClick(centre.centreCode)} 
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this centre?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CentreManagement;