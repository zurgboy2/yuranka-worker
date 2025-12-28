import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
} from "@mui/material";
import { styled } from "@mui/system";
import apiCall from "../api";
import { useUserData } from "../UserContext";

const StyledTableContainer = styled(TableContainer)({
  backgroundColor: "#333",
  "& .MuiTable-root": {
    color: "#fff",
  },
  "& .MuiTableCell-root": {
    color: "#fff",
    borderBottom: "1px solid #555",
  },
  "& .MuiTableHead-root .MuiTableCell-root": {
    backgroundColor: "#444",
    fontWeight: "bold",
    fontSize: "0.9rem",
  },
});

const StyledButton = styled(Button)({
  backgroundColor: "#b22222",
  color: "#fff",
  margin: "0 4px",
  "&:hover": {
    backgroundColor: "#ff6347",
  },
});

const RecentChangesTab = () => {
  const { userData } = useUserData();
  const [changeLogs, setChangeLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRecentChanges = useCallback(async () => {
    setIsLoading(true);
    try {
      const scriptId = "loyalty_script";
      const action = "getRecentChangeLogs";
      const response = await apiCall(scriptId, action, {
        username: userData.username,
        googleToken: userData.googleToken,
      });

      // Sort by timestamp descending (most recent first)
      const sortedChanges = response.sort((a, b) => {
        const dateA = new Date(a.Timestamp);
        const dateB = new Date(b.Timestamp);
        return dateB - dateA;
      });

      setChangeLogs(sortedChanges);
    } catch (error) {
      console.error("Error fetching recent changes:", error);
      alert("Error loading recent changes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [userData.username, userData.googleToken]);

  useEffect(() => {
    fetchRecentChanges();
  }, [fetchRecentChanges]);

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (error) {
      return timestamp; // Return original if formatting fails
    }
  };

  const getAmountChip = (amount) => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      return <Chip label={`+${amount}`} color="success" size="small" />;
    } else if (numAmount < 0) {
      return <Chip label={amount} color="error" size="small" />;
    } else {
      return <Chip label={amount} color="default" size="small" />;
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "#000",
        color: "#fff",
        padding: "20px",
        position: "relative",
      }}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <Box
            sx={{
              backgroundColor: "#333",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: "#fff", marginBottom: "10px" }}
            >
              Loading...
            </Typography>
            <Box
              sx={{
                display: "inline-block",
                width: "40px",
                height: "40px",
                border: "4px solid #b22222",
                borderTop: "4px solid transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                "@keyframes spin": {
                  "0%": {
                    transform: "rotate(0deg)",
                  },
                  "100%": {
                    transform: "rotate(360deg)",
                  },
                },
              }}
            />
          </Box>
        </Box>
      )}

      <Box
        sx={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" sx={{ color: "#b22222" }}>
          Recent Changes (Last 3 Months)
        </Typography>
        <StyledButton onClick={fetchRecentChanges} disabled={isLoading}>
          {isLoading ? "Loading..." : "Refresh"}
        </StyledButton>
      </Box>

      <StyledTableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Customer Name</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Worker Name</TableCell>
              <TableCell>Reason</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {changeLogs.map((log, index) => (
              <TableRow key={index}>
                <TableCell sx={{ minWidth: "180px" }}>
                  {formatTimestamp(log.Timestamp)}
                </TableCell>
                <TableCell>{log.Name}</TableCell>
                <TableCell>{getAmountChip(log.Amount)}</TableCell>
                <TableCell>{log.WorkerName || "-"}</TableCell>
                <TableCell sx={{ maxWidth: "300px", wordWrap: "break-word" }}>
                  {log.Reason}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>

      {changeLogs.length === 0 && !isLoading && (
        <Box sx={{ textAlign: "center", marginTop: "40px" }}>
          <Typography variant="body1" sx={{ color: "#ccc" }}>
            No recent changes found for the last 3 months.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default RecentChangesTab;
