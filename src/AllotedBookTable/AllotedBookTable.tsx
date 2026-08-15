import { Cancel, Delete, Edit, ExpandLess, ExpandMore, Save } from "@mui/icons-material";
import { Button, Card, CardContent, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, MenuItem, Paper, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { boolean } from "yup";
import { AllotedBookService } from "../services/allotedBookService";
import { CentreService } from "../services/centreService";
import CustomSnackbar from "../CustomSnackBar/CustomSnackBar";



interface CentreBook {
    quantity: any,
    centre: ICentre;

}
interface ICentre{
    centreName: string;
    centreCode: number;

}
interface AllotedBookTableProps {
    mmsId: any;
    onApiComplete?: () => void;

}

const AllotedBookTable: React.FC<AllotedBookTableProps> = ({mmsId,onApiComplete }) => {

    const [centrebook,setCentreBook]=useState<CentreBook[]>([]);
      const [snackbar, setSnackbar] = useState<{ 
        open: boolean; 
        message: string; 
        type: "success" | "error"; 
    }>({
        open: false,
        message: "",
        type: "success"
    });

    const [expandedCards, setExpandedCards]=useState<{[key: number]: boolean}>({});
    const [editingId, setEditingId]=useState<number | null>(null);
    const [editedBook, setEditedBook]=useState<CentreBook | null>(null);
    const [isAdding,setIsAdding]=useState(false);
    const [deleteConfirmation,setDeleteConfirmation]=useState(false);
    const [bookToDelete,setBookToDelete]=useState<number | null>(null);
    const [centreList ,setCentreList]=useState<ICentre []>([]);
    const [newCentre,setNewCentre]=useState<ICentre | null>(null);
    const [newQuantity,setNewQuantity]=useState<number>(0);

    const fetchData = async () => {
        try {
            const response = await AllotedBookService.getBookBasedUponCentre(mmsId);
            if (response) {
                setCentreBook(response);
            } else {
                setCentreBook([]);
            }
        } catch (error) {
            console.error("Failed to fetch", error);
        }
    };
    useEffect(() => {
        fetchData();
    }, [mmsId]);
    
    
    useEffect(()=>{
        const centreList=async()=>{
            try{
                const listResponse= await CentreService.fetchAllCentre();
                if(Array.isArray(listResponse)){
                    setCentreList(listResponse);


                }else{
                    setCentreList([]);

                }

            }catch(error){
                throw new Error ('Notable to fetch');
            }
        }
        centreList();
    },[]);

    //For Toggle Card Expansion

    const handleExpandClick=(id: number)=>{
        setExpandedCards((prev)=>({
            ...prev,[id]:!prev[id],
        }));
    };

    const handleEdit = (centre : CentreBook)=>{
        setEditingId(centre.centre.centreCode);
        setEditedBook({...centre});
    }

    const handleEditAndExpand=(centre: CentreBook)=> {
        handleEdit(centre);
        handleExpandClick(centre.centre.centreCode);
    }
    //Save Edit Book
    const handleSave= async() =>{
        if(editedBook){
            try{
                const newCentre={
                    centreCode: editedBook.centre.centreCode,
                    quantity: editedBook.quantity,
                    mmsId: mmsId,
                }
           
            const response= await AllotedBookService.addBookBasedUponCentre(newCentre);
            // setCentreBook(centrebook.map((centre)=> (centre.centre.centreCode === editedBook.centre.centreCode ? editedBook : centre)));
            setEditingId(null);
            setExpandedCards((prev) => ({ ...prev, [editedBook.centre.centreCode]: false })); // Collapse the card

            setEditedBook(null);
            fetchData();

        
        setExpandedCards((prev) => ({ ...prev, [editedBook!.centre.centreCode]: false })); // Collapse the card
        if (onApiComplete) {
            onApiComplete();
          }
        setSnackbar({
            open: true,
            message: response.message, // Use the API's success message
            type: "success"
        });
    } catch (error: any){
        setSnackbar({
            open: true,
            message: error.message, // Use the API's success message
            type: "error"
        });
    }
        }
    };

    //Save New Book 
        const handleAddNewAllocation= async()=>{
        if(newCentre && newQuantity!=0){
                try{
                const data1={
                    centreCode: newCentre.centreCode,

                    quantity: newQuantity,
                    mmsId: mmsId,
                }
           
            const response= await AllotedBookService.addBookBasedUponCentre(data1);
            setIsAdding(false);
            setNewCentre(null);
            setNewQuantity(0);
            fetchData();
               if (onApiComplete) {
                onApiComplete();
            }
              setSnackbar({
            open: true,
            message: response.message, // Use the API's success message
            type: "success"
        });
        } catch(error: any){
           setSnackbar({
            open: true,
            message: error.message, // Use the API's success message
            type: "error"
        });
        }
    }else{
        alert("Please select a centre and enter a valid quantity.");

    }
}

    const handleAdd= ()=>{
        setIsAdding(true);
        
    }
    const handleCancel= ()=> {
        setEditingId(null);
        setExpandedCards((prev) => ({ ...prev, [editedBook!.centre.centreCode]: false })); // Collapse the card

        setEditedBook(null);

    }
    //Handle Delete Confirmation
    const handleDeleteClick= (id: number)=> {
        setBookToDelete(id);
        setDeleteConfirmation(true);
        
    }

    const handleDeleteConfirm= () =>{
        if(bookToDelete){
            setCentreBook(centrebook.filter((book)=>book.centre.centreCode !== bookToDelete));
            setDeleteConfirmation(false);
            setBookToDelete(null);
        }
    }

    const handleDeleteCancel = () =>{
        setDeleteConfirmation(false);
        setBookToDelete(null);
    }

    const handleCancelNew = () =>{
        setIsAdding(false);
        
    }

  

  return (
    <Paper style={{padding: "16px"}}>
        {/* //Card Layout */}
        <CustomSnackbar 
                open={snackbar.open} 
                handleClose={() => setSnackbar({ ...snackbar, open: false })} 
                message={snackbar.message} 
                type={snackbar.type} 
              />
        <Grid container spacing={3}>
            {centrebook.map((i)=>(
                <Grid item xs={12} sm={6} md={3} key={i.centre.centreCode}>
                 <Card>
                    <CardContent>
                        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>

                            <div style={{display: "flex",flexDirection: "column"}}> 
                         <Typography variant="h6" style={{fontWeight: "bold"}}> {i.centre.centreName} </Typography>
                         <Typography variant="h6" > Alloted Quantity - {i.quantity} </Typography>
                         </div>
                         <div> 
                         <IconButton onClick={()=> handleEditAndExpand(i)}>
                                <Edit />

                            </IconButton>
                            <IconButton     disabled={true} // Add this prop
 onClick={()=> handleDeleteClick(i.centre.centreCode)}>
                                <Delete />

                            </IconButton>
                            </div>
                        </div>

                        {/* Collapsed Content */}

                        <Typography color="text-secondary"></Typography>

                        <Collapse in={expandedCards[i.centre.centreCode]}>
                        {editingId=== i.centre.centreCode ? (
                            <>
                            {/* <TextField
                            fullWidth
                            label="Quantity"
                            value={editedBook?.quantity ?? ""}
                            onChange={(e)=> setEditedBook({...editedBook!,quantity: Number(e.target.value)})}
                            style={{marginBottom: "8px"}}
                            inputProps={{ inputMode: 'numeric', pattern: '^-?[0-9]*$' }}

                            /> */}
    <TextField
  fullWidth
  label="Quantity"
//   value={editedBook?.quantity ?? ""}
  onChange={(e) => {
    const input = e.target.value;
    if (/^-?\d*$/.test(input) || input === "") {
      setEditedBook({ ...editedBook!, quantity: input });
    }
  }}
  style={{ marginBottom: "8px" }}
  inputProps={{ inputMode: "numeric", pattern: "^-?[0-9]*$" }}
/>


                            <IconButton onClick={handleSave}>
                                <Save />
                            </IconButton>
                            <IconButton onClick={handleCancel}>
                               <Cancel />
                            </IconButton>
                            </>

                        ): (
                            <>
                            {/* <Typography color="textSecondary"></Typography>
                            <IconButton onClick={()=> handleEdit(i)}>
                                <Edit />

                            </IconButton>
                            <IconButton onClick={()=> handleDeleteClick(i.centreCode)}>
                                <Delete />

                            </IconButton> */}
                            </>
                        )}
                        </Collapse>
                    </CardContent>
                 </Card>
            </Grid>
            ))}
            <Grid item xs={12} sm={6} md={3}>
                <Card>
                    <CardContent style={{display: "flex",justifyContent:"center",alignItems:"center",height:"100%"}}>
             <IconButton onClick={()=> setIsAdding(true)} style={{fontSize: "3rem"}}>
                +
             </IconButton>
                    </CardContent>
                </Card>

            </Grid>

            
        </Grid>

        {/* Add new Data on Card  */}
        <Dialog open={isAdding} onClose={()=> setIsAdding(false)}>
            <DialogTitle>Add New Centre from List</DialogTitle>
            <DialogContent>
                <TextField
                select label="Select Centre" fullWidth value={newCentre?.centreCode || ""}
                onChange={(e)=>{
                    const selectedCentre=centreList.find((c)=> c.centreCode=== Number(e.target.value));
                    setNewCentre(selectedCentre || null);
                }}
                style={{marginBottom: "16px"}}
                >
                    {centreList?.map((centre)=>(
                        <MenuItem key={centre.centreCode} value={centre.centreCode}>
                            {centre.centreName}
                        </MenuItem>
                    ))}

                </TextField>
                <TextField
                label="Quantity"
                fullWidth
                value={newQuantity}
                onChange={(e)=> setNewQuantity(Number(e.target.value))}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={()=> setIsAdding(false)}>Cancel</Button>
                <Button onClick={handleAddNewAllocation}>Add</Button>

            </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialogue  */}
        <Dialog open={deleteConfirmation} onClose={handleCancelNew}>
            <DialogTitle>Delete Centre</DialogTitle>
            <DialogContent>
               <Typography>  Are you sure want to delete this centre ?</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDeleteCancel}>Cancel</Button>
              <Button onClick={handleDeleteConfirm}>Delete</Button>
            </DialogActions>
        </Dialog>

    </Paper>
  
  );
};

export default AllotedBookTable;