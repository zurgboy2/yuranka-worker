import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import InvoiceListComponent from './InvoiceListComponent';
import CustomInvoiceGenerator from './CustomInvoiceGenerator';
import PurchaseAdderComponent from '../purchaseAdder';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`custom-tabpanel-${index}`}
    aria-labelledby={`custom-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
  </div>
);

const CustomTab = ({ onMaxWidthChange }) => {
  const [subTab, setSubTab] = useState(null);
  const [visitedTabs, setVisitedTabs] = useState(new Set());

  const handleSubTabChange = (event, newValue) => {
    setSubTab(newValue);
    setVisitedTabs(prev => new Set([...prev, newValue]));
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={subTab !== null ? subTab : false} onChange={handleSubTabChange} aria-label="custom sub tabs">
          <Tab label="Invoices" />
          <Tab label="Invoice Generator" />
          <Tab label="Purchase Adder" />
        </Tabs>
      </Box>

      <TabPanel value={subTab} index={0}>
        {visitedTabs.has(0) && (
          <InvoiceListComponent keyword="YG" title="Custom Invoices" onMaxWidthChange={onMaxWidthChange} />
        )}
      </TabPanel>

      <TabPanel value={subTab} index={1}>
        {visitedTabs.has(1) && (
          <CustomInvoiceGenerator onMaxWidthChange={onMaxWidthChange} />
        )}
      </TabPanel>

      <TabPanel value={subTab} index={2}>
        {visitedTabs.has(2) && (
          <PurchaseAdderComponent onMaxWidthChange={onMaxWidthChange} />
        )}
      </TabPanel>
    </Box>
  );
};

export default CustomTab;
