import { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Backdrop,
} from "@mui/material";
import apiCall from "../api";
import StateFileViewer from "./StateFileViewer";
import {
  PayloadDataViewer,
  OrdersModalPayloadViewer,
} from "./PayloadDataViewer";

function getColumns(sheetName) {
  if (sheetName === "OrdersModalOperationLogs") {
    return [
      { label: "Batch ID", key: "Batch ID" },
      { label: "Timestamp", key: "Timestamp" },
      { label: "Status", key: "Status" },
      { label: "Payload", key: "Payload", clickable: true },
      { label: "Username", key: "Username" },
      { label: "Result/Error", key: "Result/Error", clickable: true },
      { label: "Platform", key: "Platform" },
    ];
  }
  // Default: OperationLogs
  return [
    { label: "Batch ID", key: "Batch ID" },
    { label: "Timestamp", key: "Timestamp" },
    { label: "Status", key: "Status" },
    { label: "Payload", key: "Payload", clickable: true },
    { label: "Username", key: "Username" },
    { label: "Result/Error", key: "Result/Error", clickable: true },
    { label: "Game", key: "Game" },
  ];
}

// Helper to classify type based on sheetName and column
function getDataType(sheetName, columnKey) {
  if (sheetName === "OperationLogs") {
    if (columnKey === "Payload") return "PayloadData";
    if (columnKey === "Result/Error") return "State Folder";
  }
  if (sheetName === "OrdersModalOperationLogs") {
    if (columnKey === "Payload") return "OrdersModalPayloadData";
    if (columnKey === "Result/Error") return "Orders Modal State Folder";
  }
  return null;
}

const SheetTablePanel = ({ sheetName }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewerData, setViewerData] = useState(null);
  const [viewerType, setViewerType] = useState(null);
  const [cellLoading, setCellLoading] = useState(false);

  const columns = getColumns(sheetName);

  useEffect(() => {
    const fetchRows = async () => {
      setLoading(true);
      try {
        const response = await apiCall(
          "cardmanager_script",
          "getSheetRowsBySheetName",
          { sheetName }
        );
        console.log(`Fetched rows for ${sheetName}:`, response.data);
        const data = Array.isArray(response.data)
          ? [...response.data].reverse()
          : [];

        setRows(data || []);
        console.log(`Rows set for ${sheetName}:`, response.data);
      } catch (err) {
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRows();
  }, [sheetName]);

  const stateFileRef = useRef(null);
  const payloadFileRef = useRef(null);
  const ordersModalPayloadRef = useRef(null);

  const handleCellClick = async (code, columnKey) => {
    console.log(`Cell clicked: ${code}, Column: ${columnKey}`);
    const type = getDataType(sheetName, columnKey);
    console.log(`Data type for ${sheetName} - ${columnKey}:`, type);
    if (!type || !code) return;
    setCellLoading(true);

    try {
      const response = await apiCall(
        "cardmanager_script",
        "getPayloadJsonByCode",
        { payloadCode: code, folderName: type }
      );

      console.log(
        `Viewer data for ${sheetName} - ${columnKey}:`,
        response.data
      );

      if (sheetName === "OperationLogs" && columnKey === "Result/Error") {
        console.log(`Setting viewer data for ${sheetName} - ${columnKey}`);
        setViewerData(response.data);
        setViewerType("stateFile");
        setTimeout(() => {
          if (stateFileRef.current) {
            stateFileRef.current.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }, 100);
      } else if (sheetName === "OperationLogs" && columnKey === "Payload") {
        setViewerData(response.data);
        setViewerType("payloadData");

        setTimeout(() => {
          if (payloadFileRef.current) {
            payloadFileRef.current.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }, 100);
      } else if (
        sheetName === "OrdersModalOperationLogs" &&
        columnKey === "Payload"
      ) {
        setViewerData(response.data);
        setViewerType("ordersModalPayloadData");
        setTimeout(() => {
          if (ordersModalPayloadRef.current) {
            ordersModalPayloadRef.current.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }, 100);
      } else if (
        sheetName === "OrdersModalOperationLogs" &&
        columnKey === "Result/Error"
      ) {
        setViewerData(response.data);
        setViewerType("ordersModalStateFile");
      }
    } catch (err) {
    } finally {
      setCellLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {sheetName}
      </Typography>
      <Typography variant="h7" sx={{ mb: 2 }}>
        Click on Payload or Result/Error of an operation to load the data.{" "}
      </Typography>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 200,
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            maxHeight: 650,
            overflowY: "auto",
            border: 1,
            borderColor: "divider",
            maxWidth: "90%",
            margin: "0 auto",
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell key={col.key}>{col.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, idx) => (
                <TableRow key={idx}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      {col.clickable ? (
                        <Button
                          variant="text"
                          color="primary"
                          onClick={() => handleCellClick(row[col.key], col.key)}
                          disabled={!row[col.key]}
                          sx={{
                            fontSize: "0.75rem",
                            minWidth: 0,
                            p: 2,
                            textTransform: "none",
                          }}
                        >
                          {row[col.key]}
                        </Button>
                      ) : col.key === "Timestamp" && row[col.key] ? (
                        new Date(row[col.key]).toLocaleString()
                      ) : (
                        row[col.key]
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Backdrop
        open={cellLoading}
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 2 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* Viewer Section */}
      {viewerType === "stateFile" && viewerData && rows && (
        <Box mt={4} ref={stateFileRef}>
          <StateFileViewer stateFile={viewerData} />
        </Box>
      )}
      {viewerType === "payloadData" && viewerData && rows && (
        <Box mt={4} ref={payloadFileRef}>
          <PayloadDataViewer payloadData={viewerData} />
        </Box>
      )}
      {viewerType === "ordersModalPayloadData" && viewerData && rows && (
        <Box mt={4} ref={ordersModalPayloadRef}>
          <OrdersModalPayloadViewer payload={viewerData} />
        </Box>
      )}
      {viewerType === "ordersModalStateFile" && viewerData && rows && (
        <Box mt={4}>
          {/* TODO: Implement Orders Modal State File Viewer */}
          <Typography variant="subtitle1">
            Orders Modal State File Viewer [Placeholder]
          </Typography>
          <pre>{JSON.stringify(viewerData, null, 2)}</pre>
        </Box>
      )}
    </Box>
  );
};

export default SheetTablePanel;
