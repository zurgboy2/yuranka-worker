import React, { useState, useEffect } from 'react';
import { 
  TextField, Button, Paper, TableContainer, Table,
  TableBody, TableCell, TableHead, TableRow, Box,
  Tooltip, Checkbox, Select, MenuItem, Alert
} from '@mui/material';
import { useUserData } from '../UserContext';
import apiCall from '../api';

const ResponsiveEditableVariantCardTable = ({ cards, headers, onSave, mode, collectionName }) => {
  const { userData } = useUserData();
  const [editableCards, setEditableCards] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [incompleteRows, setIncompleteRows] = useState([]);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const flattenedCards = cards.flatMap((card, cardIndex) => 
      card.variants.map((variant, variantIndex) => ({
        ...card,
        ...variant,
        document_id: card.document_id,
        variantId: variant.variantId,
        id: `${cardIndex}-${variantIndex}`
      }))
    );
    setEditableCards(flattenedCards);
    setNextId(flattenedCards.length);
  }, [cards]);

  const handleEdit = (index, header, value) => {
    const newCards = [...editableCards];
    newCards[index][header.name] = value;
    setEditableCards(newCards);
  };

  const handleDuplicate = (index) => {
    const newCards = [...editableCards];
    const duplicatedCard = {
      ...newCards[index],
      id: `new-${nextId}`,
      variantId: null
    };
    if (mode === 'check') {
      duplicatedCard.notes = (duplicatedCard.notes || '') + ' (Duplicated)';
    }
    newCards.splice(index + 1, 0, duplicatedCard);
    setEditableCards(newCards);
    setNextId(nextId + 1);
  };

  const validateRow = (card) => {
    const requiredFields = ['quantity', 'price', 'location', 'language', 'construction'];
    return requiredFields.every(field => card[field] && card[field] !== '');
  };

  const handleSave = async () => {
    const invalidRows = [];
    const validCards = editableCards.filter((card, index) => {
      if (validateRow(card)) {
        return true;
      } else {
        const requiredFields = ['quantity', 'price', 'location', 'language', 'construction'];
        if (requiredFields.some(field => card[field] && card[field] !== '')) {
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
      const cardsToSave = validCards.map(card => ({
        document_id: card.document_id,
        variantId: card.variantId,
        sku: card.sku,
        construction: card.construction,
        edition: card.edition,
        inventory_item_id: card.inventory_item_id,
        quality: card.quality,
        price: card.price,
        quantity: card.quantity,
        location: card.location
      }));

      const action = mode === 'add' ? 'addingCards' : 'updatingCards';
      const response = await apiCall('cardmanager_script', action, {
        cardsToSave,
        collectionName,
        username: userData.username,
        role: userData.role
      });

      if (response.success) {
        setEditableCards(validCards);
        onSave(cardsToSave);
        alert('Cards saved successfully!');
      } else {
        alert('Error saving cards. Please try again.');
      }
    } catch (error) {
      console.error('Error saving cards:', error);
      alert('An error occurred while saving cards. Please try again.');
    }
  };

  const handleDelete = async (index) => {
    const cardToDelete = editableCards[index];
    try {
      if (cardToDelete.variantId) {
        const response = await apiCall('cardmanager_script', 'deleteVariant', {
          variantId: cardToDelete.variantId,
          document_id: cardToDelete.document_id,
          collectionName,
          username: userData.username,
          role: userData.role
        });
        
        if (response.success) {
          const newCards = editableCards.filter((_, i) => i !== index);
          setEditableCards(newCards);
          setIncompleteRows(incompleteRows.filter(i => i !== index));
        } else {
          alert('Error deleting variant. Please try again.');
        }
      } else {
        // If the card doesn't have a variantId, it's a new card that hasn't been saved to the backend
        const newCards = editableCards.filter((_, i) => i !== index);
        setEditableCards(newCards);
        setIncompleteRows(incompleteRows.filter(i => i !== index));
      }
    } catch (error) {
      console.error('Error deleting variant:', error);
      alert('An error occurred while deleting the variant. Please try again.');
    }
  };

  useEffect(() => {
    console.log('Current editableCards:', editableCards); // Debug log
  }, [editableCards]);

  const renderInput = (card, header, rowIndex) => {
    const isEditable = mode === 'add' || (mode === 'check' && 
      ['quantity', 'price', 'location', 'language', 'construction', 'quality'].includes(header.name));
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
    <Box sx={{ overflowX: 'auto' }} key={editableCards.length}>
      {showAlert && (
        <Alert severity="error" onClose={() => setShowAlert(false)} sx={{ mb: 2 }}>
          Please fill in all required fields (quantity, price, location, language, construction) or delete the incomplete rows to continue saving.
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
              <TableCell sx={{ minWidth: '200px' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {editableCards.map((card, rowIndex) => (
              <TableRow 
                key={card.id}
                sx={{
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
                    color="error"
                  >
                    Delete
                  </Button>
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

export default ResponsiveEditableVariantCardTable;