import React from 'react';
import AccountingSystem from './AccountingSystem';

// Re-export the new AccountingSystem as the main CashFlow component
const CashFlowSuperApp = ({ onMaxWidthChange }) => {
  return <AccountingSystem onMaxWidthChange={onMaxWidthChange} />;
};

export default CashFlowSuperApp;