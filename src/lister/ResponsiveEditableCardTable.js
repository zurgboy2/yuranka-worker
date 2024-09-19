import React, { useState, useEffect } from 'react';
import { 
  TextField, Button, Paper, TableContainer, Table,
  TableBody, TableCell, TableHead, TableRow, Box,
  Tooltip, Checkbox, Select, MenuItem, Alert
} from '@mui/material';
import { useUserData } from '../UserContext';
import apiCall from '../api';


const ResponsiveEditableCardTable = ({ cards, headers, onSave, mode, collectionName }) => {
  const { userData } = useUserData();
  const [editableCards, setEditableCards] = useState([]);
  const [nextId, setNextId] = useState(2);
  const [incompleteRows, setIncompleteRows] = useState([]);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const cardsWithIds = cards.map(card => ({...card, isDeleted: false, id: 1}));
    setEditableCards(cardsWithIds);
    setNextId(2);
  }, [cards]);

  const handleEdit = (index, header, value) => {
    const newCards = [...editableCards];
    newCards[index][header.name] = value;
    setEditableCards(newCards);
  };

  const validateRow = (card, cardHeaders) => {
    return cardHeaders.every(header => card[header.name] !== undefined && card[header.name] !== '');
  };
  
  const handleSave = async () => {
    const invalidRows = [];
    const validCards = editableCards.filter((card, index) => {
      const cardHeaders = headers.filter(header => header.name in card);
      if (validateRow(card, cardHeaders)) {
        return true;
      } else {
        if (cardHeaders.some(header => card[header.name] && card[header.name] !== '')) {
          invalidRows.push(index);
        }
        return false;
      }
    });

    if (invalidRows.length > 0) {
      setIncompleteRows(invalidRows);
      setShowAlert(true);
      return;
    }

    try {
      const action = mode === 'add' ? 'addingCards' : 'updatingCards';
      const response = await apiCall('cardmanager_script', action, {
        cardsToSave: validCards,
        collectionName: collectionName,
        username: userData.username,
        role: userData.role
      });

      if (response.cardmarket.success && response.shopify.success && response.firestore.success) {
        setEditableCards(validCards);
        onSave(validCards);
        alert('Cards saved successfully to Cardmarket, Shopify, and Firestore!');
      } else {
        let errorMessage = 'Error saving cards:\n';
        if (!response.cardmarket.success) errorMessage += '- Cardmarket: ' + response.cardmarket.message + '\n';
        if (!response.shopify.success) errorMessage += '- Shopify: ' + response.shopify.message + '\n';
        if (!response.firestore.success) errorMessage += '- Firestore: ' + response.firestore.message + '\n';
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error saving cards:', error);
      alert('An error occurred while saving cards. Please try again.');
    }
  };

  const handleDuplicate = (index) => {
    const newCards = [...editableCards];
    const duplicatedCard = {...newCards[index], isDeleted: false, id: nextId};
    if (mode === 'check') {
      duplicatedCard.notes = (duplicatedCard.notes || '') + ' (Duplicated)';
    }
    newCards.splice(index + 1, 0, duplicatedCard);
    setEditableCards(newCards);
    setNextId(nextId + 1);
  };

  const handleDelete = (index) => {
    if (mode === 'add') {
      const newCards = editableCards.filter((_, i) => i !== index);
      // Reassign IDs to ensure continuity
      const updatedCards = newCards.map((card, idx) => ({...card, id: idx + 1}));
      setEditableCards(updatedCards);
      setNextId(updatedCards.length + 1);
    } else if (mode === 'check') {
      const newCards = [...editableCards];
      newCards[index].isDeleted = !newCards[index].isDeleted;
      setEditableCards(newCards);
    }
    setIncompleteRows(incompleteRows.filter(i => i !== index));
  };

  const handleOpenUrl = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const renderInput = (card, header, rowIndex) => {
    const isEditable = mode === 'add' || (mode === 'check' && header.name === 'quantity');
    const isIncomplete = incompleteRows.includes(rowIndex);

    const commonProps = {
      value: card[header.name] || '',
      onChange: (e) => handleEdit(rowIndex, header, e.target.value),
      variant: "outlined",
      size: "small",
      disabled: !isEditable,
      error: isIncomplete,
      sx: {
        minWidth: '100px',
        '& .MuiInputBase-root': {
          width: 'auto',
          '& input': {
            width: '100%',
            boxSizing: 'border-box',
          }
        }
      }
    };

    switch (header.type) {
      case 'boolean':
        return (
          <Checkbox
            checked={card[header.name] || false}
            onChange={(e) => handleEdit(rowIndex, header, e.target.checked)}
            disabled={!isEditable}
          />
        );
      case 'number':
        return (
          <TextField
            {...commonProps}
            type="number"
          />
        );
      case 'selection':
        return (
          <Select
            {...commonProps}
            autoWidth
          >
            {header.options.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
        );
      case 'text':
      default:
        return (
          <TextField
            {...commonProps}
            InputProps={{
              sx: {
                width: 'auto',
                '& input': {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }
              }
            }}
          />
        );
    }
  };

  return (
    <Box sx={{ overflowX: 'auto' }}>
      {showAlert && (
        <Alert severity="error" onClose={() => setShowAlert(false)} sx={{ mb: 2 }}>
          Please fill in all fields or delete the incomplete rows to continue saving.
        </Alert>
      )}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: '50px' }}>ID</TableCell>
              {headers.map((header, index) => (
                <TableCell key={index} sx={{ minWidth: '150px' }}>{header.name}</TableCell>
              ))}
              <TableCell sx={{ minWidth: '250px' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {editableCards.map((card, rowIndex) => (
              <TableRow 
                key={rowIndex}
                sx={{
                  ...(card.isDeleted ? { textDecoration: 'line-through', color: 'text.disabled' } : {}),
                  ...(incompleteRows.includes(rowIndex) ? { backgroundColor: 'rgba(255, 0, 0, 0.1)' } : {})
                }}
              >
                <TableCell>{card.id}</TableCell>
                {headers.map((header, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <Tooltip title={card[header.name]?.toString() || ''} arrow>
                      {renderInput(card, header, rowIndex)}
                    </Tooltip>
                  </TableCell>
                ))}
                <TableCell>
                  <Button onClick={() => handleDuplicate(rowIndex)} size="small" sx={{ mr: 1 }}>
                    Duplicate
                  </Button>
                  <Button 
                    onClick={() => handleDelete(rowIndex)} 
                    size="small" 
                    color={mode === 'check' && card.isDeleted ? 'primary' : 'error'}
                    sx={{ mr: 1 }}
                  >
                    {mode === 'check' ? (card.isDeleted ? 'Undelete' : 'Delete') : 'Delete'}
                  </Button>
                  {card.cardMarketUrl && (
                    <Button
                      onClick={() => handleOpenUrl(card.cardMarketUrl)}
                      size="small"
                      variant="outlined"
                    >
                      Open URL
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button onClick={handleSave} variant="contained" color="primary" sx={{ mt: 2 }}>
        Save Changes
      </Button>
    </Box>
  );
};

export default ResponsiveEditableCardTable;