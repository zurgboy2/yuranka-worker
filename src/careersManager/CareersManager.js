import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import apiCall from "../api";
import { useUserData } from "../UserContext";

const CAREERS_SCRIPT_ID = "jobs_and_cvs_script";
const CAREERS_ACTIONS = {
  getJobsAndCVs: "getJobsAndCVs",
  addJobPosting: "addJobPosting",
  updateJobPosting: "updateJobPosting",
  deleteJobPosting: "deleteJobPosting",
};

const EMPTY_JOB_FORM = {
  id: "",
  name: "",
  description: "",
};

const normalizeText = (value) => {
  if (value == null) {
    return "";
  }

  return String(value).trim();
};

const normalizeBoolean = (value) => {
  if (typeof value === "boolean") {
    return value;
  }

  const normalizedValue = normalizeText(value).toLowerCase();

  return (
    normalizedValue === "true" ||
    normalizedValue === "1" ||
    normalizedValue === "yes"
  );
};

const normalizeCount = (value, fallback = 0) => {
  const normalizedValue = Number(value);

  return Number.isFinite(normalizedValue) ? normalizedValue : fallback;
};

const formatDateOnly = (value) => {
  const normalizedValue = normalizeText(value);

  if (!normalizedValue) {
    return "-";
  }

  const parsedDate = new Date(normalizedValue);

  if (!Number.isNaN(parsedDate.getTime())) {
    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const matchedDate = normalizedValue.match(
    /^[A-Za-z]{3}\s([A-Za-z]{3}\s\d{1,2}\s\d{4})/,
  );

  return matchedDate ? matchedDate[1] : normalizedValue;
};

const normalizeCandidate = (candidate) => ({
  id: normalizeText(
    candidate?.id ?? candidate?.ID ?? candidate?.["Candidate ID"],
  ),
  name: normalizeText(candidate?.name ?? candidate?.Name),
  contactNumber: normalizeText(
    candidate?.contactNumber ??
      candidate?.phoneNo ??
      candidate?.phoneNumber ??
      candidate?.["Contact Number"],
  ),
  email: normalizeText(candidate?.email ?? candidate?.Email),
  cvUrl: normalizeText(
    candidate?.cvUrl ??
      candidate?.cvURL ??
      candidate?.["CV URL"] ??
      candidate?.["Url of uploaded cv"],
  ),
  coverLetterUrl: normalizeText(
    candidate?.coverLetterUrl ??
      candidate?.coverLetterURL ??
      candidate?.["Cover Letter URL"],
  ),
  dateApplied: normalizeText(
    candidate?.dateApplied ?? candidate?.["Date Applied"],
  ),
});

const normalizeJobPosting = (jobPosting) => {
  const candidates = Array.isArray(jobPosting?.candidates)
    ? jobPosting.candidates.map(normalizeCandidate)
    : [];

  return {
    id: normalizeText(
      jobPosting?.id ?? jobPosting?.ID ?? jobPosting?.["Job ID"],
    ),
    name: normalizeText(
      jobPosting?.name ??
        jobPosting?.Name ??
        jobPosting?.position ??
        jobPosting?.Position,
    ),
    description: normalizeText(
      jobPosting?.description ?? jobPosting?.Description,
    ),
    active: normalizeBoolean(jobPosting?.active ?? jobPosting?.Active),
    numberOfCandidates: normalizeCount(
      jobPosting?.numberOfCandidates ??
        jobPosting?.noOfCandidates ??
        jobPosting?.["No of Candidates"] ??
        jobPosting?.candidateCount,
      candidates.length,
    ),
    candidates,
  };
};

const isFailureResponse = (response) => {
  if (!response || Array.isArray(response)) {
    return false;
  }

  return (
    response.success === false ||
    response.status === "error" ||
    Boolean(response.error)
  );
};

const CareersManager = ({ onClose, onMaxWidthChange }) => {
  const { userData } = useUserData();
  const [jobPostings, setJobPostings] = useState([]);
  const [expandedJobRows, setExpandedJobRows] = useState({});
  const [loading, setLoading] = useState(true);
  const [jobActionLoading, setJobActionLoading] = useState(false);
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [jobForm, setJobForm] = useState(EMPTY_JOB_FORM);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchCareersData = useCallback(async () => {
    const response = await apiCall(
      CAREERS_SCRIPT_ID,
      CAREERS_ACTIONS.getJobsAndCVs,
      {
        googleToken: userData.googleToken,
        username: userData.username,
      },
    );

    console.log("Raw careers data response:", response);
    if (isFailureResponse(response)) {
      throw new Error(response.message || "Failed to load careers data.");
    }

    const rawJobPostings = Array.isArray(response)
      ? response
      : (response?.jobs ?? response?.jobPostings ?? response?.data);

    if (!Array.isArray(rawJobPostings)) {
      throw new Error("Unexpected response format while loading careers data.");
    }

    setJobPostings(
      rawJobPostings
        .map(normalizeJobPosting)
        .filter((jobPosting) => jobPosting.active),
    );
  }, [userData.googleToken, userData.username]);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await fetchCareersData();
    } catch (fetchError) {
      console.error("Failed to load careers manager data:", fetchError);
      setError(fetchError.message || "Failed to load careers manager data.");
    } finally {
      setLoading(false);
    }
  }, [fetchCareersData]);

  useEffect(() => {
    onMaxWidthChange?.("lg");
    loadInitialData();

    return () => {
      onMaxWidthChange?.("md");
    };
  }, [loadInitialData, onMaxWidthChange]);

  const handleOpenAddJobDialog = () => {
    setJobForm(EMPTY_JOB_FORM);
    setJobDialogOpen(true);
    setError(null);
  };

  const handleOpenEditJobDialog = (jobPosting) => {
    setJobForm({
      id: jobPosting.id,
      name: jobPosting.name,
      description: jobPosting.description,
    });
    setJobDialogOpen(true);
    setError(null);
  };

  const handleCloseJobDialog = () => {
    setJobDialogOpen(false);
    setJobForm(EMPTY_JOB_FORM);
    setError(null);
  };

  const handleJobFormChange = (event) => {
    const { name, value } = event.target;
    setJobForm((previousJobForm) => ({
      ...previousJobForm,
      [name]: value,
    }));
  };

  const handleRefreshCareersData = async () => {
    setLoading(true);
    setError(null);

    try {
      await fetchCareersData();
    } catch (refreshError) {
      console.error("Failed to refresh careers data:", refreshError);
      setError(refreshError.message || "Failed to refresh careers data.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCandidates = (jobKey) => {
    setExpandedJobRows((previousExpandedJobRows) => ({
      ...previousExpandedJobRows,
      [jobKey]: !previousExpandedJobRows[jobKey],
    }));
  };

  const handleSaveJobPosting = async () => {
    const trimmedName = jobForm.name.trim();
    const trimmedDescription = jobForm.description.trim();

    if (!trimmedName || !trimmedDescription) {
      setError("Job name and description are required.");
      return;
    }

    setJobActionLoading(true);
    setError(null);

    try {
      const action = jobForm.id
        ? CAREERS_ACTIONS.updateJobPosting
        : CAREERS_ACTIONS.addJobPosting;
      const payload = jobForm.id
        ? {
            googleToken: userData.googleToken,
            username: userData.username,
            jobId: jobForm.id,
            jobData: {
              name: trimmedName,
              position: trimmedName,
              description: trimmedDescription,
            },
          }
        : {
            googleToken: userData.googleToken,
            username: userData.username,
            jobData: {
              name: trimmedName,
              position: trimmedName,
              description: trimmedDescription,
            },
          };

      const response = await apiCall(CAREERS_SCRIPT_ID, action, payload);

      if (isFailureResponse(response)) {
        throw new Error(response.message || "Failed to save job posting.");
      }

      await fetchCareersData();
      setSuccessMessage(
        jobForm.id ? "Job updated successfully." : "Job added successfully.",
      );
      handleCloseJobDialog();
    } catch (saveError) {
      console.error("Failed to save job posting:", saveError);
      setError(saveError.message || "Failed to save job posting.");
    } finally {
      setJobActionLoading(false);
    }
  };

  const handleDeleteJobPosting = async (jobPosting) => {
    if (
      !window.confirm(`Are you sure you want to delete "${jobPosting.name}"?`)
    ) {
      return;
    }

    setJobActionLoading(true);
    setError(null);

    try {
      const response = await apiCall(
        CAREERS_SCRIPT_ID,
        CAREERS_ACTIONS.deleteJobPosting,
        {
          googleToken: userData.googleToken,
          username: userData.username,
          jobId: jobPosting.id,
        },
      );

      if (isFailureResponse(response)) {
        throw new Error(response.message || "Failed to delete job posting.");
      }

      await fetchCareersData();
      setSuccessMessage("Job deleted successfully.");
    } catch (deleteError) {
      console.error("Failed to delete job posting:", deleteError);
      setError(deleteError.message || "Failed to delete job posting.");
    } finally {
      setJobActionLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "80vh",
        width: "100%",
        overflow: "hidden",
        bgcolor: "#1a1a1a",
        color: "#ffffff",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
          Careers Manager
        </Typography>
        <Button onClick={onClose} size="small" sx={{ color: "#8b0000" }}>
          Close
        </Button>
      </Box>

      <Box sx={{ flexGrow: 1, overflow: "auto", p: 3 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: "#8b0000" }} />
          </Box>
        ) : (
          <>
            {error && (
              <Alert
                severity="error"
                sx={{ mb: 2 }}
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Box>
                <Typography variant="h5">Active Job Postings</Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255, 255, 255, 0.72)", mt: 0.5 }}
                >
                  Expand a job to view its candidates.
                </Typography>
              </Box>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  onClick={handleRefreshCareersData}
                  disabled={jobActionLoading}
                  sx={{ borderColor: "#8b0000", color: "#ffffff" }}
                >
                  Refresh
                </Button>
                <Button
                  variant="contained"
                  onClick={handleOpenAddJobDialog}
                  disabled={jobActionLoading}
                  sx={{ bgcolor: "#8b0000", color: "#ffffff" }}
                >
                  Add Job
                </Button>
              </Stack>
            </Box>

            {jobPostings.length === 0 ? (
              <Paper sx={{ p: 4, bgcolor: "#2a2a2a", color: "#ffffff" }}>
                <Typography align="center">
                  No active job postings found.
                </Typography>
              </Paper>
            ) : (
              <Stack spacing={3}>
                {jobPostings.map((jobPosting) => {
                  const jobKey = jobPosting.id || jobPosting.name;
                  const candidateCount =
                    jobPosting.numberOfCandidates ??
                    jobPosting.candidates.length;
                  const candidatesExpanded = Boolean(expandedJobRows[jobKey]);

                  return (
                    <Paper
                      key={jobKey}
                      sx={{
                        p: 3,
                        bgcolor: "#2a2a2a",
                        color: "#ffffff",
                      }}
                    >
                      <Stack
                        direction={{ xs: "column", md: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", md: "flex-start" }}
                        gap={2}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="h6">
                            {jobPosting.name || "Untitled Job"}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "rgba(255, 255, 255, 0.72)", mt: 0.5 }}
                          >
                            {jobPosting.id || "-"} · {candidateCount} candidate
                            {candidateCount === 1 ? "" : "s"}
                          </Typography>
                        </Box>

                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleOpenEditJobDialog(jobPosting)}
                            disabled={jobActionLoading}
                            sx={{ borderColor: "#8b0000", color: "#ffffff" }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleDeleteJobPosting(jobPosting)}
                            disabled={jobActionLoading}
                            sx={{ bgcolor: "#8b0000", color: "#ffffff" }}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </Stack>

                      <Typography
                        variant="body1"
                        sx={{
                          mt: 2,
                          mb: 2.5,
                          whiteSpace: "pre-wrap",
                          color: "rgba(255, 255, 255, 0.9)",
                        }}
                      >
                        {jobPosting.description || "No description provided."}
                      </Typography>

                      <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                        Candidates
                      </Typography>

                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleToggleCandidates(jobKey)}
                          disabled={candidateCount === 0}
                          sx={{ borderColor: "#8b0000", color: "#ffffff" }}
                        >
                          {candidatesExpanded
                            ? "Hide Candidates"
                            : "Show Candidates"}
                        </Button>
                        {candidateCount === 0 ? (
                          <Typography
                            variant="body2"
                            sx={{ color: "rgba(255, 255, 255, 0.72)" }}
                          >
                            No candidates have applied yet.
                          </Typography>
                        ) : null}
                      </Stack>

                      {candidateCount > 0 && candidatesExpanded ? (
                        <TableContainer
                          sx={{
                            mt: 2,
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            borderRadius: 1,
                          }}
                        >
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ color: "#ffffff" }}>
                                  ID
                                </TableCell>
                                <TableCell sx={{ color: "#ffffff" }}>
                                  Name
                                </TableCell>
                                <TableCell sx={{ color: "#ffffff" }}>
                                  Email
                                </TableCell>
                                <TableCell sx={{ color: "#ffffff" }}>
                                  Contact Number
                                </TableCell>
                                <TableCell sx={{ color: "#ffffff" }}>
                                  Date Applied
                                </TableCell>
                                <TableCell sx={{ color: "#ffffff" }}>
                                  Documents
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {jobPosting.candidates.map((candidate) => (
                                <TableRow
                                  key={
                                    candidate.id ||
                                    `${candidate.email}-${candidate.name}-${candidate.dateApplied}`
                                  }
                                >
                                  <TableCell sx={{ color: "#ffffff" }}>
                                    {candidate.id || "-"}
                                  </TableCell>
                                  <TableCell sx={{ color: "#ffffff" }}>
                                    {candidate.name || "-"}
                                  </TableCell>
                                  <TableCell sx={{ color: "#ffffff" }}>
                                    {candidate.email || "-"}
                                  </TableCell>
                                  <TableCell sx={{ color: "#ffffff" }}>
                                    {candidate.contactNumber || "-"}
                                  </TableCell>
                                  <TableCell sx={{ color: "#ffffff" }}>
                                    {formatDateOnly(candidate.dateApplied)}
                                  </TableCell>
                                  <TableCell sx={{ color: "#ffffff" }}>
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      sx={{ flexWrap: "wrap" }}
                                    >
                                      {candidate.cvUrl ? (
                                        <Button
                                          href={candidate.cvUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          size="small"
                                          sx={{ color: "#ffffff" }}
                                        >
                                          Open CV
                                        </Button>
                                      ) : null}
                                      {candidate.coverLetterUrl ? (
                                        <Button
                                          href={candidate.coverLetterUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          size="small"
                                          sx={{ color: "#ffffff" }}
                                        >
                                          Cover Letter
                                        </Button>
                                      ) : null}
                                      {!candidate.cvUrl &&
                                      !candidate.coverLetterUrl
                                        ? "-"
                                        : null}
                                    </Stack>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : null}
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </>
        )}
      </Box>

      <Dialog
        open={jobDialogOpen}
        onClose={handleCloseJobDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {jobForm.id ? "Edit Job Posting" : "Add Job Posting"}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Job Name"
              name="name"
              value={jobForm.name}
              onChange={handleJobFormChange}
              required
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={jobForm.description}
              onChange={handleJobFormChange}
              multiline
              rows={4}
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseJobDialog} disabled={jobActionLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveJobPosting}
            variant="contained"
            disabled={jobActionLoading}
          >
            {jobActionLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Save"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          onClose={() => setSuccessMessage("")}
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CareersManager;
