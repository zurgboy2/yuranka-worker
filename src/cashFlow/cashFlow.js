import React from 'react';
import AccountingSystem from './AccountingSystem';

// Re-export the new AccountingSystem as the main CashFlow component
const CashFlowSuperApp = () => {
  return <AccountingSystem />;
};

export default CashFlowSuperApp;