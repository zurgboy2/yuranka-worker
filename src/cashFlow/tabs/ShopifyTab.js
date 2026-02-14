import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import InvoiceListComponent from './InvoiceListComponent';
import ShopifyOrdersTab from './ShopifyOrdersTab';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`shopify-tabpanel-${index}`}
    aria-labelledby={`shopify-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
  </div>
);

const ShopifyTab = ({ onMaxWidthChange }) => {
  const [subTab, setSubTab] = useState(null); // Start with no tab selected
  const [visitedTabs, setVisitedTabs] = useState(new Set());

  const handleSubTabChange = (event, newValue) => {
    setSubTab(newValue);
    setVisitedTabs(prev => new Set([...prev, newValue]));
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={subTab !== null ? subTab : false} onChange={handleSubTabChange} aria-label="shopify sub tabs">
          <Tab label="Invoices" />
          <Tab label="Shopify Orders" />
        </Tabs>
      </Box>

      <TabPanel value={subTab} index={0}>
        {visitedTabs.has(0) && (
          <InvoiceListComponent keyword="SH" title="Shopify Invoices" onMaxWidthChange={onMaxWidthChange} />
        )}
      </TabPanel>

      <TabPanel value={subTab} index={1}>
        {visitedTabs.has(1) && (
          <ShopifyOrdersTab onMaxWidthChange={onMaxWidthChange} />
        )}
      </TabPanel>
    </Box>
  );
};

export default ShopifyTab;
