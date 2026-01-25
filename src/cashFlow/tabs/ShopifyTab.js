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

const ShopifyTab = () => {
  const [subTab, setSubTab] = useState(0);

  const handleSubTabChange = (event, newValue) => {
    setSubTab(newValue);
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={subTab} onChange={handleSubTabChange} aria-label="shopify sub tabs">
          <Tab label="Invoices" />
          <Tab label="Shopify Orders" />
        </Tabs>
      </Box>

      <TabPanel value={subTab} index={0}>
        <InvoiceListComponent keyword="SH" title="Shopify Invoices" />
      </TabPanel>

      <TabPanel value={subTab} index={1}>
        <ShopifyOrdersTab />
      </TabPanel>
    </Box>
  );
};

export default ShopifyTab;
