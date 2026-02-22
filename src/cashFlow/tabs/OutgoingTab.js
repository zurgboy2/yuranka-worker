import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import InvoiceListComponent from './InvoiceListComponent';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`outgoing-tabpanel-${index}`}
    aria-labelledby={`outgoing-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
  </div>
);

const OutgoingTab = ({ onMaxWidthChange }) => {
  const [subTab, setSubTab] = useState(null);
  const [visitedTabs, setVisitedTabs] = useState(new Set());

  const handleSubTabChange = (event, newValue) => {
    setSubTab(newValue);
    setVisitedTabs(prev => new Set([...prev, newValue]));
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={subTab !== null ? subTab : false} onChange={handleSubTabChange} aria-label="outgoing sub tabs">
          <Tab label="Invoices" />
        </Tabs>
      </Box>

      <TabPanel value={subTab} index={0}>
        {visitedTabs.has(0) && (
          <InvoiceListComponent keyword="OP" title="Outgoing/Labour Invoices" onMaxWidthChange={onMaxWidthChange} />
        )}
      </TabPanel>
    </Box>
  );
};

export default OutgoingTab;
