import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import InvoiceListComponent from './InvoiceListComponent';
import CardmarketOrdersComponent from './CardmarketOrdersComponent';
import BulkOrderUploadComponent from './BulkOrderUploadComponent';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`cardmarket-tabpanel-${index}`}
    aria-labelledby={`cardmarket-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
  </div>
);

const CardmarketTab = ({ onMaxWidthChange }) => {
  const [subTab, setSubTab] = useState(null);
  const [visitedTabs, setVisitedTabs] = useState(new Set());

  const handleSubTabChange = (event, newValue) => {
    setSubTab(newValue);
    setVisitedTabs(prev => new Set([...prev, newValue]));
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={subTab !== null ? subTab : false} onChange={handleSubTabChange} aria-label="cardmarket sub tabs">
          <Tab label="Invoices" />
          <Tab label="Orders" />
          <Tab label="Bulk Order Upload" />
        </Tabs>
      </Box>

      <TabPanel value={subTab} index={0}>
        {visitedTabs.has(0) && (
          <InvoiceListComponent keyword="CM" title="Cardmarket Invoices" onMaxWidthChange={onMaxWidthChange} />
        )}
      </TabPanel>

      <TabPanel value={subTab} index={1}>
        {visitedTabs.has(1) && (
          <CardmarketOrdersComponent onMaxWidthChange={onMaxWidthChange} />
        )}
      </TabPanel>

      <TabPanel value={subTab} index={2}>
        {visitedTabs.has(2) && (
          <BulkOrderUploadComponent onMaxWidthChange={onMaxWidthChange} />
        )}
      </TabPanel>
    </Box>
  );
};

export default CardmarketTab;
