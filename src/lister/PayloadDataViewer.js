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
  Chip,
  Tooltip,
  Alert,
  Divider,
} from "@mui/material";

function formatBool(val) {
  if (typeof val === "boolean") {
    return val ? (
      <Chip label="Yes" color="success" size="small" />
    ) : (
      <Chip label="No" color="default" size="small" />
    );
  }
  return "";
}

export function PayloadDataViewer({ payloadData }) {
  if (!payloadData || payloadData.length === 0) {
    return <Alert severity="info">No payload data available.</Alert>;
  }

  // Get all possible keys in the array (for dynamic headers)
  const allKeys = Array.from(
    payloadData.reduce((acc, row) => {
      Object.keys(row).forEach((k) => acc.add(k));
      return acc;
    }, new Set())
  );

  // Order important keys first if present
  const preferredOrder = [
    "name",
    "cardmarketId",
    "cardId",
    "collectorNumber",
    "expansionCode",
    "rarity",
    "language",
    "location",
    "quantity",
    "price",
    "variantID",
    "firstEdition",
    "reverseHolo",
    "quality",
    "full_id",
    "_isModified",
  ];
  const columns = [
    ...preferredOrder.filter((k) => allKeys.includes(k)),
    ...allKeys.filter((k) => !preferredOrder.includes(k)),
  ];

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Payload Data
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((key) => (
                <TableCell key={key}>
                  <Tooltip title={key}>
                    <span>{key.replace(/([A-Z])/g, " $1")}</span>
                  </Tooltip>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {payloadData.map((row, idx) => (
              <TableRow key={idx}>
                {columns.map((key) => (
                  <TableCell key={key}>
                    {typeof row[key] === "boolean"
                      ? formatBool(row[key])
                      : Array.isArray(row[key])
                      ? row[key].join(", ")
                      : row[key] !== undefined
                      ? row[key].toString()
                      : ""}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export function OrdersModalPayloadViewer({ payload }) {
  if (!payload) {
    return <Alert severity="info">No order payload data available.</Alert>;
  }

  const {
    orderNumber,
    customerUsername,
    platform,
    shippingAddress,
    orderSummary,
    tcg,
    items,
    fileFound,
    stateFileType,
  } = payload;

  return (
    <Box sx={{mb: 4}}>
      <Typography variant="h6" sx={{ mb: 2, mt: 7 }}>
        Order #{orderNumber} ({tcg})
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Typography>
        <b>Customer Username:</b> {customerUsername}
      </Typography>
      <Typography>
        <b>Platform:</b> {platform || "-"}
      </Typography>
      {shippingAddress && (
        <Box sx={{ mt: 2 }}>
          <Typography><b>Shipping Address:</b></Typography>
          <Typography>Name: {shippingAddress.name}</Typography>
          <Typography>Street: {shippingAddress.street}</Typography>
          <Typography>City: {shippingAddress.city}</Typography>
          <Typography>Postal Code: {shippingAddress.postalCode}</Typography>
          <Typography>Country: {shippingAddress.country}</Typography>
        </Box>
      )}
      {orderSummary && (
        <Box sx={{ mt: 2 }}>
          <Typography><b>Order Summary:</b></Typography>
          <Typography>Article Count: {orderSummary.articleCount}</Typography>
          <Typography>Article Value: €{orderSummary.articleValue}</Typography>
          <Typography>Shipping Cost: €{orderSummary.shippingCost}</Typography>
          <Typography><b>Total: €{orderSummary.total}</b></Typography>
        </Box>
      )}
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Items
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Qty</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Card #</TableCell>
              <TableCell>Set</TableCell>
              <TableCell>Rarity</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Language</TableCell>
              <TableCell>Quality</TableCell>
              <TableCell>Price (€)</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items &&
              items.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.cardNumber}</TableCell>
                  <TableCell>{item.set}</TableCell>
                  <TableCell>{item.rarity}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>{item.language}</TableCell>
                  <TableCell>{item.quality}</TableCell>
                  <TableCell>{item.price}</TableCell>
                  <TableCell>{item.details}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}