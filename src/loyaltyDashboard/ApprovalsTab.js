import React, { useState, useEffect, useCallback } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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

const ApproveButton = styled(Button)({
  backgroundColor: "#4caf50",
  color: "#fff",
  margin: "0 4px",
  "&:hover": {
    backgroundColor: "#66bb6a",
  },
});

const DenyButton = styled(Button)({
  backgroundColor: "#f44336",
  color: "#fff",
  margin: "0 4px",
  "&:hover": {
    backgroundColor: "#ef5350",
  },
});

const ApprovalsTab = () => {
  const { userData } = useUserData();
  const [approvals, setApprovals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [actionType, setActionType] = useState(""); // 'approve' or 'deny'

  const fetchApprovals = useCallback(async () => {
    setIsLoading(true);
    try {
      const scriptId = "loyalty_script";
      const action = "getAllApprovals";
      const response = await apiCall(scriptId, action, {
        username: userData.username,
        googleToken: userData.googleToken,
      });

      // Sort by ID descending (highest first)
      const sortedApprovals = response.sort(
        (a, b) => parseFloat(b.ID) - parseFloat(a.ID)
      );
      setApprovals(sortedApprovals);
    } catch (error) {
      console.error("Error fetching approvals:", error);
      alert("Error loading approvals. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [userData.username, userData.googleToken]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const handleApprovalAction = (approval, isApproved) => {
    setSelectedApproval(approval);
    setActionType(isApproved ? "approve" : "deny");
    setConfirmDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedApproval) return;

    setIsLoading(true);
    try {
      const scriptId = "loyalty_script";
      const action = "handleApprovalAction";
      await apiCall(scriptId, action, {
        id: selectedApproval.ID,
        workerName: selectedApproval.WorkerName,
        customerName: selectedApproval["Customer Name"],
        username: selectedApproval.Username,
        existingAmount: selectedApproval.Existing,
        changeAmount: selectedApproval["Change Amount"],
        amountAfter: selectedApproval["After Change"],
        isApproved: actionType === "approve",
        approvedByUsername: userData.username,
        reason: selectedApproval.Reason,
        googleToken: userData.googleToken,
      });

      alert(
        `Request has been ${
          actionType === "approve" ? "approved" : "denied"
        } successfully.`
      );
      setConfirmDialogOpen(false);
      setSelectedApproval(null);
      setActionType("");
      await fetchApprovals();
    } catch (error) {
      console.error("Error processing approval:", error);
      alert("Error processing request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseDialog = () => {
    if (isLoading) return;
    setConfirmDialogOpen(false);
    setSelectedApproval(null);
    setActionType("");
  };

  const getStatusChip = (status) => {
    let color = "default";
    if (status === "Approved") color = "success";
    else if (status === "Denied") color = "error";
    else if (status === "Pending approval") color = "warning";

    return <Chip label={status} color={color} size="small" />;
  };

  const canApprove =
    userData.role === "Admin" || userData.role === "Store Manager";

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
              Processing...
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
          Approval Requests
        </Typography>
        <StyledButton onClick={fetchApprovals} disabled={isLoading}>
          {isLoading ? "Loading..." : "Refresh"}
        </StyledButton>
      </Box>

      <StyledTableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Worker Name</TableCell>
              <TableCell>Customer Name</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Change Amount</TableCell>
              <TableCell>Existing</TableCell>
              <TableCell>After Change</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Approved By</TableCell>
              <TableCell>Reason</TableCell>
              {canApprove && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {approvals.map((approval) => (
              <TableRow key={approval.ID}>
                <TableCell>{approval.ID}</TableCell>
                <TableCell>{approval.WorkerName}</TableCell>
                <TableCell>{approval["Customer Name"]}</TableCell>
                <TableCell>{approval.Username}</TableCell>
                <TableCell
                  sx={{
                    color:
                      parseFloat(approval["Change Amount"]) >= 0
                        ? "#4caf50"
                        : "#f44336",
                  }}
                >
                  {approval["Change Amount"]}
                </TableCell>
                <TableCell>{approval.Existing}</TableCell>
                <TableCell>{approval["After Change"]}</TableCell>
                <TableCell>{getStatusChip(approval.Status)}</TableCell>
                <TableCell>{approval["Approved By"] || "-"}</TableCell>
                <TableCell>{approval.Reason || "-"}</TableCell>
                {canApprove && (
                  <TableCell>
                    {approval.Status === "Pending approval" ? (
                      <Box>
                        <ApproveButton
                          size="small"
                          onClick={() => handleApprovalAction(approval, true)}
                          disabled={isLoading}
                        >
                          Approve
                        </ApproveButton>
                        <DenyButton
                          size="small"
                          onClick={() => handleApprovalAction(approval, false)}
                          disabled={isLoading}
                        >
                          Deny
                        </DenyButton>
                      </Box>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>

      {approvals.length === 0 && !isLoading && (
        <Box sx={{ textAlign: "center", marginTop: "40px" }}>
          <Typography variant="body1" sx={{ color: "#ccc" }}>
            No approval requests found.
          </Typography>
        </Box>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseDialog}
        disableEscapeKeyDown={isLoading}
      >
        <DialogTitle>
          Confirm {actionType === "approve" ? "Approval" : "Denial"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ marginBottom: "16px" }}>
            Are you sure you want to {actionType} this request?
          </Typography>
          {selectedApproval && (
            <Box>
              <Typography variant="body2">
                <strong>Customer:</strong> {selectedApproval["Customer Name"]}
              </Typography>
              <Typography variant="body2">
                <strong>Username:</strong> {selectedApproval.Username}
              </Typography>
              <Typography variant="body2">
                <strong>Change Amount:</strong>{" "}
                {selectedApproval["Change Amount"]}
              </Typography>
              <Typography variant="body2">
                <strong>Worker:</strong> {selectedApproval.WorkerName}
              </Typography>
              {selectedApproval.Reason && (
                <Typography variant="body2">
                  <strong>Reason:</strong> {selectedApproval.Reason}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <StyledButton
            onClick={confirmAction}
            disabled={isLoading}
            sx={{
              backgroundColor: actionType === "approve" ? "#4caf50" : "#f44336",
              "&:hover": {
                backgroundColor:
                  actionType === "approve" ? "#66bb6a" : "#ef5350",
              },
            }}
          >
            {isLoading
              ? "Processing..."
              : `Confirm ${actionType === "approve" ? "Approval" : "Denial"}`}
          </StyledButton>
          <StyledButton onClick={handleCloseDialog} disabled={isLoading}>
            Cancel
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApprovalsTab;
