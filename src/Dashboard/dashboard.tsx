import React from "react";
import {
  Typography,
  Card,
  CardContent,
  Box,
  Grid,
  Avatar,
  useTheme,
  styled,
} from "@mui/material";
import {
  MenuBook as BooksIcon,
  Place as CenterIcon,
  HowToReg as ApprovalIcon,
  History as HistoryIcon,
  People as UsersIcon,
  ListAlt as CenterListIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const DashboardCard = styled(Card)(({ theme }) => ({
  minWidth: 275,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
    cursor: 'pointer',
  },
}));

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const cards = [
    {
      title: "Books",
      icon: <BooksIcon fontSize="large" />,
      color: theme.palette.primary.main,
      action: () => navigate('/books'),
      stats: [
        { label: "Total Books", value: "1,245" },
        { label: "Available", value: "873" }
      ]
    },
    {
      title: "Center Data",
      icon: <CenterIcon fontSize="large" />,
      color: theme.palette.secondary.main,
      action: () => navigate('/centre'),
    },
    {
      title: "Allocation",
      icon: <ApprovalIcon fontSize="large" />,
      color: theme.palette.success.main,
      action: () => navigate('/approval'),
    },
    {
      title: "History",
      icon: <HistoryIcon fontSize="large" />,
      color: theme.palette.warning.main,
      action: () => navigate('/historyReceipt'),
      stats: [
        { label: "Today's Activity", value: "42" }
      ]
    },
    {
      title: "User Management",
      icon: <UsersIcon fontSize="large" />,
      color: theme.palette.error.main,
      action: () => navigate('/users'),
      stats: [
        { label: "Active Users", value: "38" }
      ]
    },
    {
      title: "Center List",
      icon: <CenterListIcon fontSize="large" />,
      color: theme.palette.info.main,
      action: () => navigate('/centre-list'),
      stats: [
        { label: "Total Centers", value: "12" }
      ]
    }
  ];

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.grey[100],
        minHeight: "90vh",
        padding: 4,
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ 
        mb: 4,
        color: theme.palette.primary.dark,
        fontWeight: 'bold',
        textAlign: 'center'
      }}>
        BAV Management Dashboard
      </Typography>
      
      <Grid container spacing={4}>
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <DashboardCard onClick={card.action}>
              <CardContent sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                flexGrow: 1
              }}>
                <Avatar sx={{ 
                  bgcolor: card.color,
                  width: 60,
                  height: 60,
                  mb: 2
                }}>
                  {card.icon}
                </Avatar>
                <Typography variant="h6" component="div" sx={{ mb: 2 }}>
                  {card.title}
                </Typography>
                {card.stats && (
                  <Box sx={{ width: '100%', mt: 'auto' }}>
                    {card.stats.map((stat, i) => (
                      <Box key={i} sx={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 1
                      }}>
                        {/* <Typography variant="body2" color="text.secondary">
                          {stat.label}:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {stat.value}
                        </Typography> */}
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </DashboardCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;