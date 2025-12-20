import React, { useState } from "react";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import { styled } from "@mui/system";
import CreditTransferTab from "./CreditTransferTab";
import ApprovalsTab from "./ApprovalsTab";
import RecentChangesTab from "./RecentChangesTab";
// Styled components for consistent theming
const StyledTabs = styled(Tabs)({
  backgroundColor: "#333",
  "& .MuiTabs-indicator": {
    backgroundColor: "#b22222",
  },
});

const StyledTab = styled(Tab)({
  color: "#ccc",
  "&.Mui-selected": {
    color: "#b22222",
  },
  "&:hover": {
    color: "#ff6347",
  },
});

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`loyalty-tabpanel-${index}`}
      aria-labelledby={`loyalty-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

const LoyaltyDashboard = ({ onMaxWidthChange }) => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);

    if (onMaxWidthChange) {
      if (newValue === 1 || newValue === 2) {
        onMaxWidthChange("lg");
      } else {
        onMaxWidthChange("md");
      }
    }
  };

  return (
    <Box sx={{ backgroundColor: "#000", color: "#fff", minHeight: "100vh" }}>
      <Box sx={{ borderBottom: 1, borderColor: "#333" }}>
        <StyledTabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="loyalty dashboard tabs"
          variant="fullWidth"
        >
          <StyledTab label="Transfer Credit" />
          <StyledTab label="Approvals" />
          <StyledTab label="Recent Changes" />
        </StyledTabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <CreditTransferTab />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <ApprovalsTab />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <RecentChangesTab />
      </TabPanel>
    </Box>
  );
};

export default LoyaltyDashboard;
