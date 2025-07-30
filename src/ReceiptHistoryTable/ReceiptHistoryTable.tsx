import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { 
  MenuItem, 
  Paper, 
  TextField, 
  Card, 
  CardHeader, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  IconButton,
  Collapse,
  Button
} from "@mui/material";
import { CentreService } from "../services/centreService";
import { ICentre } from "../interfaces";
import SearchAppBar from "../Components/SearchBar/Search";
import { useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
}

interface BookRecord {
  id: number;
  mmsId: string;
  centreCode: number;
  bookName: string;
  type: string;
  amount: number;
  allotedQuantity: number;
  allocationType: string;
  previousQuantity: number;
  previousBalance: number;
  currentBalance: number;
  totalQuantity: number;
  allotedDate: string;
  allotedBy: string;
  remarks: string;
}

interface ApiResponse {
  Alloted?: {
    [date: string]: BookRecord[];
  };
  DeAllocated?: {
    [date: string]: BookRecord[];
  };
  Sales?: {
    [date: string]: BookRecord[];
  };
}

type ReceiptType = 'Alloted' | 'DeAllocated' | 'Sales';
type TabType = 'allot' | 'deallocate' | 'sales';

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography component="div">{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

const ReceiptHistoryTable: React.FC = () => {
  const theme = useTheme();
  const [value, setValue] = React.useState(0);
  const [centreList, setCentreList] = React.useState<ICentre[]>([]);
  const [selectedCentre, setSelectedCentre] = useState<any>(null);
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [records, setRecords] = React.useState<ApiResponse>({});
  const [loading, setLoading] = React.useState<boolean>(false);
  const [expandedCards, setExpandedCards] = React.useState<{[key: string]: boolean}>({});

  const typeMap: Record<TabType, ReceiptType> = {
    allot: 'Alloted',
    deallocate: 'DeAllocated',
    sales: 'Sales'
  };

  React.useEffect(() => {
    const fetchAllCentre = async () => {
      try {
        const centres = await CentreService.fetchAllCentre();
        setCentreList(centres);
        if (centres.length > 0) {
          setSelectedCentre(centres[0]);
        }
      } catch (error) {
        console.error("Error fetching centres:", error);
      }
    };
    fetchAllCentre();
  }, []);

  React.useEffect(() => {
    if (selectedCentre) {
      fetchRecords(selectedCentre.centreCode);
    }
  }, [selectedCentre]);

  const fetchRecords = async (centreCode: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/centre-book/getAllRecordsBasedUponCentre?centreCode=${centreCode}`
      );
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.error("Error fetching records:", error);
      setRecords({});
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleCentreChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedCentreCode = Number(event.target.value);
    const selectCentre = centreList.find((c) => c.centreCode === selectedCentreCode);
    if (selectCentre) {
      setSelectedCentre(selectCentre);
    }
  };

  const handleCardExpand = (date: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  // const generatePDF = (records: BookRecord[], type: ReceiptType) => {
  //   try {
  //     const doc = new jsPDF();
  //     const today = new Date();
  //     const formattedDate = today.toLocaleDateString('en-US', {
  //       year: 'numeric',
  //       month: 'long',
  //       day: 'numeric'
  //     });

  //     // Set colors based on type
  //     let primaryColor, secondaryColor;
  //     switch(type) {
  //       case 'Alloted':
  //         primaryColor = [255, 235, 59]; // Yellow
  //         secondaryColor = [255, 245, 157]; // Light Yellow
  //         break;
  //       case 'DeAllocated':
  //         primaryColor = [255, 152, 0]; // Orange
  //         secondaryColor = [255, 204, 128]; // Light Orange
  //         break;
  //       case 'Sales':
  //         primaryColor = [236, 64, 122]; // Pink
  //         secondaryColor = [248, 187, 208]; // Light Pink
  //         break;
  //     }

  //     // Add header with colored background
  //     doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  //     doc.rect(0, 0, 210, 30, 'F');
      
  //     // Add title
  //     doc.setFontSize(18);
  //     doc.setTextColor(0, 0, 0);
  //     doc.text('RSSB', 105, 15, { align: 'center' });
      
  //     // Add subtitle
  //     doc.setFontSize(12);
  //     doc.text('BAV Amb Area', 105, 22, { align: 'center' });

  //     // Add receipt type and center info
  //     doc.setFontSize(14);
  //     doc.text(`${type} Stock to Centre ${selectedCentre?.centreName || ''}`, 14, 40);
      
  //     // Add date
  //     doc.setFontSize(12);
  //     doc.text(`Date: ${formattedDate}`, 14, 48);

  //     // Prepare table data
  //     const tableData = records.map((record, index) => [
  //       index + 1,
  //       record.bookName,
  //       record.mmsId,
  //       `₹${record.amount.toFixed(2)}`,
  //       record.allotedQuantity,
  //       `₹${(record.amount * record.allotedQuantity).toFixed(2)}`
  //     ]);

  //     // Calculate totals
  //     const totalQty = records.reduce((sum, record) => sum + record.allotedQuantity, 0);
  //     const totalValue = records.reduce((sum, record) => sum + (record.amount * record.allotedQuantity), 0);
  //     const prevBalance = records.length > 0 ? records[0].previousBalance : 0;
  //     const currBalance = records.length > 0 ? records[0].currentBalance : 0;

  //     // Add table
  //     (doc as any).autoTable({
  //       startY: 55,
  //       head: [['SNo.', 'Book Name', 'MMS Code', 'Amount', 'Quantity', 'Value']],
  //       body: tableData,
  //       headStyles: {
  //         fillColor: [primaryColor[0], primaryColor[1], primaryColor[2]],
  //         textColor: [0, 0, 0],
  //         fontSize: 10
  //       },
  //       bodyStyles: {
  //         fontSize: 9
  //       },
  //       alternateRowStyles: {
  //         fillColor: [secondaryColor[0], secondaryColor[1], secondaryColor[2]]
  //       }
  //     });

  //     // Add totals
  //     const finalY = (doc as any).lastAutoTable.finalY + 10;
  //     doc.setFontSize(12);
  //     doc.text(`Total Quantity: ${totalQty}`, 14, finalY);
  //     doc.text(`Total Value: ₹${totalValue.toFixed(2)}`, 14, finalY + 8);
  //     doc.text(`Previous Balance: ₹${prevBalance.toFixed(2)}`, 14, finalY + 16);
  //     doc.text(`Current Balance: ₹${currBalance.toFixed(2)}`, 14, finalY + 24);

  //     // Add remarks and signature
  //     doc.text('Remarks If Any:', 14, finalY + 36);
  //     doc.text('Signature', 150, finalY + 36);
  //     doc.text('Super Admin', 150, finalY + 44);
  //     doc.text(`Alloted By: ${records.length > 0 ? records[0].allotedBy : ''}`, 150, finalY + 52);

  //     // Add footer note
  //     doc.setFontSize(10);
  //     doc.setTextColor(100, 100, 100);
  //     doc.text('*This is automatic Generated Receipt. Find Any Discrepancy Contact Immediately', 105, 285, { align: 'center' });

  //     // Save the PDF
  //     doc.save(`${type}_Receipt_${selectedCentre?.centreName || 'Centre'}_${formattedDate.replace(/\//g, '-')}.pdf`);
  //   } catch (error) {
  //     console.error('Error generating PDF:', error);
  //     alert('Failed to generate PDF. Please try again.');
  //   }
  // };

  const generatePDF = (records: BookRecord[], type: ReceiptType) => {
  try {
    const doc = new jsPDF();
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Set colors based on type
    let primaryColor, secondaryColor;
    switch(type) {
      case 'Alloted':
        primaryColor = [255, 235, 59]; // Yellow
        secondaryColor = [255, 245, 157]; // Light Yellow
        break;
      case 'DeAllocated':
        primaryColor = [255, 152, 0]; // Orange
        secondaryColor = [255, 204, 128]; // Light Orange
        break;
      case 'Sales':
        primaryColor = [236, 64, 122]; // Pink
        secondaryColor = [248, 187, 208]; // Light Pink
        break;
    }

    // Add header with logo/company info (left aligned)
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text('RSSB', 14, 20);
    doc.setFontSize(12);
    doc.text('BAV Amb Area', 14, 27);

    // Add document title (centered)
    doc.setFontSize(16);
    doc.text(`${type} Receipt`, 105, 20, { align: 'center' });

    // Add document details (right aligned)
    doc.setFontSize(10);
    doc.text(`Date: ${formattedDate}`, 198, 22, { align: 'right' });

    // Add divider line
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 35, 196, 35);

    // Add "From" and "To" sections side by side
    doc.setFontSize(12);
    doc.text('From:', 14, 45);
    doc.setFont('helvetica', 'bold');
    doc.text('RSSB', 14, 52);
    doc.setFont('helvetica', 'normal');
    doc.text('BAV Amb Area', 14, 59);
    
    doc.text('To:', 160, 45);
     doc.setFont('helvetica', 'bold');
    doc.text('RSSB', 160, 52);
     doc.setFont('helvetica', 'normal');
    doc.text(selectedCentre?.centreName || 'Centre', 160, 59);

    // Prepare table data
    const tableData = records.map((record, index) => [
      index + 1,
      record.bookName,
      record.mmsId,
      `${record.amount.toFixed(0)}`,
      record.allotedQuantity,
      `${(record.amount * record.allotedQuantity).toFixed(0)}`
    ]);

    // Calculate totals
    const totalQty = records.reduce((sum, record) => sum + record.allotedQuantity, 0);
    const totalValue = records.reduce((sum, record) => sum + (record.amount * record.allotedQuantity), 0);
    const prevBalance = records.length > 0 ? records[0].previousBalance : 0;
    const currBalance = records.length > 0 ? records[0].currentBalance : 0;

    // Add table with better styling
    (doc as any).autoTable({
      startY: 70,
      head: [['S No.', 'Book Name', 'MMS Code', 'Unit Price', 'Quantity', 'Total']],
      body: tableData,
      headStyles: {
        textColor: [0, 0, 0],
        fontSize: 10,
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'center' }, // SNo.
        1: { cellWidth: 'center' }, // Book Name
        2: { halign: 'center' }, // MMS Code
        3: { halign: 'center' }, // Unit Price
        4: { halign: 'center' }, // Quantity
        5: { halign: 'center' } // Total
      },
      alternateRowStyles: {
        fillColor: [secondaryColor[0], secondaryColor[1], secondaryColor[2]]
      },
      margin: { left: 14 }
    });

    // Add totals section (right aligned)
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    
    // Right-aligned totals with labels and values aligned
    const totals = [
      { label: 'Subtotal:', value: `${totalValue.toFixed(0)}` },
      { label: 'Alloted Amount:', value: `${prevBalance.toFixed(0)}` },
      { label: 'Utilized Amount:', value: `${currBalance.toFixed(0)}` }
    ];
    
    let yPos = finalY;
    totals.forEach(item => {
      doc.text(item.label, 130, yPos);
      doc.text(item.value, 190, yPos, { align: 'right' });
      yPos += 8;
    });

    // Add divider line above totals
    doc.line(150, finalY - 5, 190, finalY - 5);

    // Add remarks and signature
    doc.text('Remarks:', 14, yPos + 10);
    
        doc.text(`Alloted By: ${records.length > 0 ? records[0].allotedBy : ''}`, 150, yPos + 10);

doc.setFont('helvetica', 'bold').setTextColor(0, 51, 102).text('Digitally Signed', 160, yPos + 20).setFont('helvetica', 'normal').setTextColor(0, 0, 0);


    // Add footer note
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('*This is an automatically generated document. Please report any discrepancies immediately.', 105, 285, { align: 'center' });

    // Save the PDF
    doc.save(`${type}_Receipt_${selectedCentre?.centreName || 'Centre'}_${formattedDate.replace(/\//g, '-')}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Please try again.');
  }
};
  const renderRecordsTable = (records: BookRecord[], type: ReceiptType) => {
    return (
      <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <Button 
            variant="contained" 
            startIcon={<PictureAsPdfIcon />}
            onClick={() => generatePDF(records, type)}
            sx={{
              backgroundColor: 
                type === 'Alloted' ? '#ffeb3b' : 
                type === 'DeAllocated' ? '#ff9800' : '#ec407a',
              color: '#000',
              '&:hover': {
                backgroundColor: 
                  type === 'Alloted' ? '#fbc02d' : 
                  type === 'DeAllocated' ? '#f57c00' : '#d81b60'
              }
            }}
          >
            Download PDF
          </Button>
        </Box>
        <Table size="small" aria-label="record table">
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              <TableCell sx={{ color: 'white' }}>MMS ID</TableCell>
              <TableCell sx={{ color: 'white' }}>Book Name</TableCell>
              <TableCell sx={{ color: 'white' }}>Type</TableCell>
              <TableCell sx={{ color: 'white' }}>Amount</TableCell>
              <TableCell sx={{ color: 'white' }}>Quantity</TableCell>
              <TableCell sx={{ color: 'white' }}>Previous Qty</TableCell>
              <TableCell sx={{ color: 'white' }}>Total Qty</TableCell>
              <TableCell sx={{ color: 'white' }}>Alloted Amount</TableCell>
              <TableCell sx={{ color: 'white' }}>Utilized Amount</TableCell>
              <TableCell sx={{ color: 'white' }}>Alloted By</TableCell>
              <TableCell sx={{ color: 'white' }}>Remarks</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.mmsId}</TableCell>
                <TableCell>{record.bookName}</TableCell>
                <TableCell>{record.type}</TableCell>
                <TableCell>{record.amount}</TableCell>
                <TableCell>{record.allotedQuantity}</TableCell>
                <TableCell>{record.previousQuantity}</TableCell>
                <TableCell>{record.totalQuantity}</TableCell>
                <TableCell>{record.previousBalance}</TableCell>
                <TableCell>{record.currentBalance}</TableCell>
                <TableCell>{record.allotedBy}</TableCell>
                <TableCell>{record.remarks}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderTabContent = (tabData: { [date: string]: BookRecord[] } | undefined, tabType: TabType) => {
    if (!tabData || Object.keys(tabData).length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No Records Available
          </Typography>
        </Box>
      );
    }

    const dates = Object.keys(tabData);
    return dates.map((date, index) => {
      const cardKey = `${tabType}-${date}`;
      const isExpanded = expandedCards[cardKey] ?? (index === 0);
      
      return (
        <Card key={cardKey} sx={{ marginBottom: 2, boxShadow: 3 }}>
          <CardHeader
            title={new Date(date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })}
            sx={{ 
              backgroundColor: 
                tabType === 'allot' ? 'rgba(255, 235, 59, 0.2)' :
                tabType === 'deallocate' ? 'rgba(255, 152, 0, 0.2)' :
                'rgba(236, 64, 122, 0.2)',
              '& .MuiCardHeader-action': {
                alignSelf: 'center'
              }
            }}
            action={
              <>
                <IconButton 
                  onClick={() => handleCardExpand(cardKey)}
                  aria-label={isExpanded ? "Collapse" : "Expand"}
                >
                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </>
            }
          />
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            {renderRecordsTable(tabData[date], typeMap[tabType])}
          </Collapse>
        </Card>
      );
    });
  };

  return (
    <Paper>
      <SearchAppBar title={selectedCentre?.centreName || null} onSearchChange={handleSearchChange} />

      <Box sx={{ display: "flex", justifyContent: "flex-end", margin: "16px" }}>
        <TextField
          select
          label="Select Centre"
          value={selectedCentre?.centreCode || ""}
          onChange={handleCentreChange}
          style={{ minWidth: "200px" }}
          variant="outlined"
          size="small"
        >
          {centreList.map((center) => (
            <MenuItem key={center.centreCode} value={center.centreCode}>
              {center.centreName}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Box sx={{ bgcolor: 'background.paper', width: '100%', borderRadius: 2 }}>
        <AppBar position="static" color="transparent" elevation={0}>
          <Tabs
            value={value}
            onChange={handleChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            aria-label="full width tabs example"
            sx={{
              '& .MuiTabs-indicator': {
                height: 3,
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 'medium',
                fontSize: '0.875rem',
                minHeight: 48,
              }
            }}
          >
            <Tab 
              label="Alloted" 
              {...a11yProps(0)} 
              sx={{
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                },
              }}
            />
            <Tab 
              label="DeAllocated" 
              {...a11yProps(1)} 
              sx={{
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                },
              }}
            />
            <Tab 
              label="Sales" 
              {...a11yProps(2)} 
              sx={{
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                },
              }}
            />
          </Tabs>
        </AppBar>
        <TabPanel value={value} index={0} dir={theme.direction}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Typography>Loading...</Typography>
            </Box>
          ) : (
            renderTabContent(records.Alloted, 'allot')
          )}
        </TabPanel>
        <TabPanel value={value} index={1} dir={theme.direction}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Typography>Loading...</Typography>
            </Box>
          ) : (
            renderTabContent(records.DeAllocated, 'deallocate')
          )}
        </TabPanel>
        <TabPanel value={value} index={2} dir={theme.direction}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Typography>Loading...</Typography>
            </Box>
          ) : (
            renderTabContent(records.Sales, 'sales')
          )}
        </TabPanel>
      </Box>
    </Paper>
  );
};

export default ReceiptHistoryTable;