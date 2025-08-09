import {
  Box,
  Chip,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Badge,
  Alert,
  Divider,
  Stack,
  Tooltip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

// Helper components
function StatusBadge({ completed }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Typography variant="subtitle2" sx={{ mr: 1 }}>
        Completed:
      </Typography>
      {completed ? (
        <Tooltip title="Completed">
          <CheckCircleIcon color="success" />
        </Tooltip>
      ) : (
        <Tooltip title="Incomplete">
          <ErrorIcon color="error" />
        </Tooltip>
      )}
    </Box>
  );
}

function BaseIdChips({ baseIds }) {
  return (
    <Stack direction="row" spacing={1}>
      {baseIds.map((id) => (
        <Chip key={id} label={id} size="small" color="primary" />
      ))}
    </Stack>
  );
}

function PendingBatchPanel({ pendingBatch }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography>
        Pending Batch:{" "}
        <Badge
          badgeContent={pendingBatch.length}
          color="warning"
          sx={{ ml: 2 }}
        />
      </Typography>

      {pendingBatch.length === 0 ? (
        <Typography>No pending cards.</Typography>
      ) : (
        pendingBatch.map((group, i) => (
          <Box key={i} mb={2} mt={1}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Group {i + 1}:
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Handle</TableCell>
                    <TableCell>Expansion</TableCell>
                    <TableCell>Rarity</TableCell>
                    <TableCell>Languages</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Base ID</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {group.map((card, j) => (
                    <TableRow key={j}>
                      <TableCell>{card.name}</TableCell>
                      <TableCell>{card.handle}</TableCell>
                      <TableCell>{card.expansion}</TableCell>
                      <TableCell>{card.rarity}</TableCell>
                      <TableCell>{(card.languages || []).join(", ")}</TableCell>
                      <TableCell>{card.totalQuantity}</TableCell>
                      <TableCell>{card.base_id}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))
      )}
    </Box>
  );
}

function UploadsTable({ uploads }) {
  if (!uploads || uploads.length === 0)
    return <Alert severity="info">No successful uploads.</Alert>;
  return (
    <TableContainer component={Paper} sx={{ mb: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Expansion</TableCell>
            <TableCell>Rarity</TableCell>
            <TableCell>Languages</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Handle</TableCell>
            <TableCell>CardMarket ID</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {uploads.map((card, idx) => (
            <TableRow key={idx}>
              <TableCell>{card.name}</TableCell>
              <TableCell>{card.expansion}</TableCell>
              <TableCell>{card.rarity}</TableCell>
              <TableCell>{(card.languages || []).join(", ")}</TableCell>
              <TableCell>{card.totalQuantity}</TableCell>
              <TableCell>{card.handle}</TableCell>
              <TableCell>{card.cardId}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function ErrorsTable({ errors }) {
  if (!errors || errors.length === 0)
    return <Alert severity="success">No errors.</Alert>;
  return (
    <TableContainer component={Paper} sx={{ mb: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Handle</TableCell>
            <TableCell>Error Message</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {errors.map((err, idx) => (
            <TableRow key={idx}>
              <TableCell>{err.name}</TableCell>
              <TableCell>{err.handle}</TableCell>
              <TableCell>{err.error}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function HighPriceTable({ highPrices }) {
  if (!highPrices || highPrices.length === 0)
    return <Alert severity="info">No high price cards flagged.</Alert>;
  return (
    <TableContainer component={Paper} sx={{ mb: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Expansion</TableCell>
            <TableCell>Rarity</TableCell>
            <TableCell>Languages</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Handle</TableCell>
            <TableCell>CardMarket ID</TableCell>
            <TableCell>Price</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {highPrices.map((card, idx) => (
            <TableRow key={idx}>
              <TableCell>{card.name}</TableCell>
              <TableCell>{card.expansion}</TableCell>
              <TableCell>{card.rarity}</TableCell>
              <TableCell>{(card.languages || []).join(", ")}</TableCell>
              <TableCell>{card.totalQuantity}</TableCell>
              <TableCell>{card.handle}</TableCell>
              <TableCell>{card.cardId}</TableCell>
              <TableCell>
                {typeof card.price !== "undefined" ? card.price : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default function StateFileViewer({ stateFile }) {
  const {
    processedBaseIds,
    pendingBatch,
    lastUpdate,
    completed,
    message,
    results,
    stateFileType,
    error,
    timestamp,
  } = stateFile || {};

  if (stateFileType === "error") {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6">Error File</Typography>
          <Typography variant="body1">
            Error: {error || "Unknown error"}
          </Typography>
          <Typography variant="body2">
            Timestamp: {timestamp || "N/A"}
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Status Panel */}
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="subtitle1" sx={{ mr: 1 }}>
            Processed Base IDs:
          </Typography>
          <BaseIdChips baseIds={processedBaseIds || []} />
        </Stack>
        <Divider sx={{ my: 2 }} />
        <PendingBatchPanel pendingBatch={pendingBatch || []} />
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Last Update: {lastUpdate ? new Date(lastUpdate).toLocaleString() : ""}
        </Typography>
        <StatusBadge completed={completed} />
        <Alert severity={completed ? "success" : "info"} sx={{ mt: 2 }}>
          {message}
        </Alert>
      </Paper>

      {/* Results */}
      {(results || []).map((result, idx) => (
        <Paper elevation={2} sx={{ p: 2, mb: 3 }} key={idx}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Batch Result:{" "}
            <Chip
              label={result.status === "success" ? "Success" : "Partial"}
              color={result.status === "success" ? "success" : "warning"}
              size="small"
              sx={{ mr: 1 }}
            />
            <span style={{ fontWeight: 400 }}>{result.message}</span>
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" sx={{ mt: 2 }}>
            Successful Uploads
          </Typography>
          <UploadsTable uploads={result.successfulUploads} />

          <Typography variant="subtitle2" sx={{ mt: 2 }}>
            Errors
          </Typography>
          <ErrorsTable errors={result.errors} />

          <Typography variant="subtitle2" sx={{ mt: 2 }}>
            High Price Cards
          </Typography>
          <HighPriceTable highPrices={result.highPrices} />
        </Paper>
      ))}
    </Box>
  );
}
