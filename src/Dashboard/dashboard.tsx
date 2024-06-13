import React from "react";
import {
  Typography,
  Card,
  CardActions,
  Button,
  CardContent,
  Box,
  CardHeader,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const history = useNavigate();

  const navigateTo = () => history('/books'); // Change this to history('/books') if you want to navigate to '/books'

  return (
    <Box
      sx={{
        backgroundColor: "#fbf9cd",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 2,
      }}
    >
      <Card onClick={navigateTo} sx={{ minWidth: 275 }}>
        <CardHeader
          title={
            <Typography sx={{ fontSize: 14 }} color="text.secondary">
              Books
            </Typography>
          }
        />
        <CardContent>
          <Typography sx={{ mb: 1.5 }} color="#8b0000" gutterBottom>
            Total Books-
          </Typography>
          <Typography sx={{ mb: 1.5 }} color="#8b0000">
            Availibile-
          </Typography>
        </CardContent>
      </Card>
      <Card sx={{ minWidth: 275 }}>
        <CardHeader
          title={
            <Typography sx={{ fontSize: 14 }} color="text.secondary">
              Photos/Video/Pen Drive
            </Typography>
          }
        />
        <CardContent>
          <Typography sx={{ mb: 1.5 }} color="#8b0000" gutterBottom>
            Photos -
          </Typography>
          <Typography sx={{ mb: 1.5 }} color="#8b0000" gutterBottom>
            Video -
          </Typography>
          <Typography sx={{ mb: 1.5 }} color="#8b0000">
            Pen Drive -
          </Typography>
        </CardContent>
      </Card>
      <Card sx={{ minWidth: 275 }}>
        <CardHeader
          title={
            <Typography sx={{ fontSize: 14 }} color="text.secondary">
              Photos
            </Typography>
          }
        />
        <CardContent>
          <Typography sx={{ mb: 1.5 }} color="#8b0000" gutterBottom>
            Photos -
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
