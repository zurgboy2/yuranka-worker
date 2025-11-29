import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import apiCall from "./api";
import { useUserData } from "./UserContext";

const currentYearDefault = new Date().getFullYear();
const currentMonthDefault = new Date().getMonth() + 1; // Months are 1-indexed for the API

const WorkerMonthlyWorkHistory = () => {
  const { userData } = useUserData();
  const [usernames, setUsernames] = useState([]);
  const [worker, setWorker] = useState("");
  const [year, setYear] = useState(currentYearDefault);
  const [month, setMonth] = useState(currentMonthDefault);
  const [results, setResults] = useState([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [fetchingResults, setFetchingResults] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all workers on load
  useEffect(() => {
    const fetchUsernames = async () => {
      setFetchingUsers(true);
      setError(null);
      try {
        const response = await apiCall(
          "dashboard_script",
          "getRegularUserUsernames",
          {
            username: userData.username,
            googleToken: userData.googleToken,
          }
        );
        if (Array.isArray(response)) {
          setUsernames(response);
        } else {
          throw new Error("Could not load workers");
        }
      } catch (err) {
        setError("Failed to load workers: " + err.message);
      } finally {
        setFetchingUsers(false);
      }
    };
    fetchUsernames();
  }, [userData]);

  // Filters: if any filter changes, clear results
  useEffect(() => {
    setResults([]);
    setError(null);
  }, [worker, year, month]);

  // Year selector options
  const years = [
    currentYearDefault - 1,
    currentYearDefault,
    currentYearDefault + 1,
  ];

  // Month selector options
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleSearch = async () => {
    setError(null);
    if (!year || !month || !worker) {
      let missing = [];
      if (!year) missing.push("Year");
      if (!month) missing.push("Month");
      if (!worker) missing.push("Worker");
      alert(
        `Please select the following before searching: ${missing.join(", ")}`
      );
      return;
    }
    setFetchingResults(true);
    try {
      const response = await apiCall(
        "dashboard_script",
        "getUserWorkForMonth",
        {
          username: userData.username,
          year,
          month: String(month).padStart(2, "0"),
          googleToken: userData.googleToken,
          workerUsername: worker,
        }
      );
      if (response && response.success && Array.isArray(response.records)) {
        console.log("Fetched records:", response.records);
        setResults(response.records);
      } else {
        setResults([]);
        setError("No data found or unexpected response.");
      }
    } catch (err) {
      setError("Error fetching records: " + err.message);
      setResults([]);
    } finally {
      setFetchingResults(false);
    }
  };

  return (
    <Paper elevation={4} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Worker Monthly Work History
      </Typography>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        {/* Year Filter */}
        <FormControl sx={{ minWidth: 100 }}>
          <InputLabel>Year</InputLabel>
          <Select
            label="Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            {years.map((y) => (
              <MenuItem value={y} key={y}>
                {y}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* Month Filter */}
        <FormControl sx={{ minWidth: 100 }}>
          <InputLabel>Month</InputLabel>
          <Select
            label="Month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            {months.map((m) => (
              <MenuItem value={m} key={m}>
                {new Date(0, m - 1).toLocaleString("default", {
                  month: "long",
                })}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* Worker Filter */}
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Worker</InputLabel>
          <Select
            label="Worker"
            value={worker}
            onChange={(e) => setWorker(e.target.value)}
            disabled={fetchingUsers}
          >
            {usernames.map((u) => (
              <MenuItem value={u} key={u}>
                {u}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* Search Button */}
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={fetchingUsers || fetchingResults}
          sx={{ minWidth: 100, mt: { xs: 2, sm: 0 } }}
        >
          {fetchingResults ? <CircularProgress size={20} /> : "Search"}
        </Button>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Results */}
      {results.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom>
            {`Results for ${worker} - ${new Date(0, month - 1).toLocaleString(
              "default",
              { month: "long" }
            )} - ${year}`}
          </Typography>
          <Box
            sx={{
              maxHeight: 550,
              overflowY: "auto",
              overflowX: "hidden",
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <List>
              {results.map((rec, idx) => (
                <ListItem key={idx} divider>
                  <ListItemText
                    primary={rec.date}
                    secondary={rec.workDone || "No work details"}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </>
      )}

      {/* No results message */}
      {!fetchingResults && results.length === 0 && (
        <Box sx={{ mt: 2, color: "gray" }}>
          <Typography>
            No records to display. Please use the filters above and Search.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default WorkerMonthlyWorkHistory;
