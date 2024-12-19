// TransactionPanel.js
import React from 'react';
import { Paper, Typography, CircularProgress } from '@mui/material';

const TransactionPanel = ({ transactions }) => {
 return (
   <Paper sx={{ p: 2, height: '100vh', overflowY: 'auto' }}>
     <Typography variant="h6">Ongoing Transactions</Typography>
     {transactions.map((transaction) => (
       <Paper 
         key={transaction.id} 
         sx={{ p: 2, mb: 2, backgroundColor: 
           transaction.status === 'pending' ? '#fff8e1' :
           transaction.status === 'completed' ? '#e8f5e9' :
           transaction.status === 'error' ? '#ffebee' : 'white'
         }}
       >
         <Typography variant="subtitle1">
           {transaction.customerName || 'Anonymous Customer'}
         </Typography>
         <Typography variant="body2">
           Status: {transaction.status}
           {transaction.status === 'pending' && 
             <CircularProgress size={16} sx={{ ml: 1 }} />
           }
         </Typography>
         <Typography variant="body2">
           Total: €{transaction.total.toFixed(2)}
         </Typography>
         {transaction.error && (
           <Typography color="error" variant="body2">
             {transaction.error}
           </Typography>
         )}
       </Paper>
     ))}
   </Paper>
 );
};

export default TransactionPanel;