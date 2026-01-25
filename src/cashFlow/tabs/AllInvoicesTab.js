import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import InvoiceListComponent from './InvoiceListComponent';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`all-tabpanel-${index}`}
    aria-labelledby={`all-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
  </div>
);

const AllInvoicesTab = ({ onMaxWidthChange }) => {
  const [subTab, setSubTab] = useState(0);

  const handleSubTabChange = (event, newValue) => {
    setSubTab(newValue);
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={subTab} onChange={handleSubTabChange} aria-label="all sub tabs">
          <Tab label="Invoices" />
        </Tabs>
      </Box>

      <TabPanel value={subTab} index={0}>
        <InvoiceListComponent keyword="ALL" title="All Invoices" onMaxWidthChange={onMaxWidthChange} />
      </TabPanel>
    </Box>
  );
};

export default AllInvoicesTab;
