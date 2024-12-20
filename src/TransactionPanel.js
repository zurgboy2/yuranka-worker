// TransactionPanel.js
import React from 'react';
import { Paper, Typography, CircularProgress } from '@mui/material';

const TransactionPanel = ({ transactions, onRetryTransaction }) => {
  const handleTransactionClick = (transaction) => {
    if (transaction.status === 'error' && onRetryTransaction) {
      onRetryTransaction(transaction);
    }
  };

  return (
    <Paper sx={{ 
      p: 2, 
      height: 'calc(100vh - 32px)', 
      overflowY: 'auto',
      backgroundColor: '#2b2b2b',
      color: 'white'
    }}>
      <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
        Ongoing Transactions
      </Typography>
      {transactions.map((transaction) => (
        <Paper 
          key={transaction.id} 
          sx={{ 
            p: 2, 
            mb: 2,
            backgroundColor: 
              transaction.status === 'pending' ? '#4a3f10' :
              transaction.status === 'completed' ? '#1b4332' :
              transaction.status === 'error' ? '#4a1010' : '#333333',
            color: 'white',
            cursor: transaction.status === 'error' ? 'pointer' : 'default',
            '&:hover': transaction.status === 'error' ? {
              backgroundColor: '#5a1515',
              transition: 'background-color 0.3s'
            } : {}
          }}
          onClick={() => handleTransactionClick(transaction)}
        >
          <Typography variant="subtitle1" sx={{ color: 'white' }}>
            {transaction.customerName || 'Anonymous Customer'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#e0e0e0' }}>
            Status: {transaction.status}
            {transaction.status === 'pending' && 
              <CircularProgress size={16} sx={{ ml: 1, color: '#ffd700' }} />
            }
          </Typography>
          <Typography variant="body2" sx={{ color: '#e0e0e0' }}>
            Total: €{transaction.total.toFixed(2)}
          </Typography>
          {transaction.error && (
            <Typography sx={{ color: '#ff8a80' }} variant="body2">
              {transaction.error}
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#bbb' }}>
                Click to retry this transaction
              </Typography>
            </Typography>
          )}
        </Paper>
      ))}
    </Paper>
  );
};

export default TransactionPanel;