import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Chip,
  TablePagination,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import tcgConfig from "./tcgConfig";

const getColorForRarity = (() => {
  // Primary base colors
  const baseColors = {
    'red': '#BF4427',
    'blue': '#598594',
    'green': '#4A8B54',
    'gold': '#A18C2C',
    'purple': '#9B6B9E',
    'brown': '#8B4A4A',
    'navy': '#4A4A8B',
  };

  // Common rarity mappings
  const rarityColorMap = {
    'common': baseColors.blue,
    'uncommon': baseColors.green,
    'rare': baseColors.gold,
    'mythic': baseColors.red,
    'mythic rare': baseColors.red,
    'special': baseColors.purple,
    'promo': baseColors.navy,
    'basic': baseColors.brown
  };

  // Function to blend two colors
  const blendColors = (color1, color2, ratio = 0.5) => {
    // Convert hex to RGB
    const hex2rgb = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    };

    // Convert RGB to hex
    const rgb2hex = (r, g, b) => 
      '#' + [r, g, b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('');

    const [r1, g1, b1] = hex2rgb(color1);
    const [r2, g2, b2] = hex2rgb(color2);

    return rgb2hex(
      r1 * ratio + r2 * (1 - ratio),
      g1 * ratio + g2 * (1 - ratio),
      b1 * ratio + b2 * (1 - ratio)
    );
  };

  // Keep track of assigned colors
  const assignedColors = new Map();
  const baseColorKeys = Object.keys(baseColors);
  let colorCombinationIndex = 0;

  return (rarity) => {
    if (!rarity) return 'primary.light';
    const lowercaseRarity = rarity.toLowerCase();

    // Return predefined color if it exists
    if (rarityColorMap[lowercaseRarity]) {
      return rarityColorMap[lowercaseRarity];
    }

    // Return previously assigned color if it exists
    if (assignedColors.has(lowercaseRarity)) {
      return assignedColors.get(lowercaseRarity);
    }

    // If we haven't used all base colors yet, use the next one
    if (colorCombinationIndex < baseColorKeys.length) {
      const color = baseColors[baseColorKeys[colorCombinationIndex]];
      assignedColors.set(lowercaseRarity, color);
      colorCombinationIndex++;
      return color;
    }

    // We've run out of base colors, start creating combinations
    const index1 = Math.floor((colorCombinationIndex - baseColorKeys.length) / baseColorKeys.length);
    const index2 = (colorCombinationIndex - baseColorKeys.length) % baseColorKeys.length;
    
    const color1 = baseColors[baseColorKeys[index1]];
    const color2 = baseColors[baseColorKeys[index2]];
    
    // Create a blended color with slightly different ratios to create variation
    const ratio = 0.6 - (0.1 * (Math.floor(colorCombinationIndex / baseColorKeys.length) % 3));
    const newColor = blendColors(color1, color2, ratio);
    
    assignedColors.set(lowercaseRarity, newColor);
    colorCombinationIndex++;
    
    return newColor;
  };
})();

const CardDisplay = ({
  items,
  selectedGame,
  onCardModification,
  onDuplicate,
  onDelete,
  canEditPrices,
  modifiedItems,
  setModifiedItems,
  }) => {
  const [displayedItems, setDisplayedItems] = useState(items);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const gameConfig = tcgConfig.games[selectedGame] || {};
  const variants = tcgConfig.commonFields?.variants || [];
  
  const qualities = variants.find(
    (v) => v?.name === "quality"
  )?.options || [];
  
  const languages = variants.find(
    (v) => v?.name === "language"
  )?.options || [];

  
  const variantFields = gameConfig.variantFields || [];

  const handleValueChange = (cardId, field, value) => {
    const originalItem = items.find(item => item.cardId === cardId);
    const existingModifications = modifiedItems[cardId] || {};
    
    // Don't mark as modified if value is empty/default and it's a new item
    const isEmptyValue = value === '' || value === 0 || value === null || value === undefined;
    const isNewItem = !originalItem.quantity && !originalItem.price;
    
    const updatedItem = {
        ...originalItem,
        ...existingModifications,
        [field]: field === 'price' ? (value || 0) : value,
        _isModified: !isNewItem || !isEmptyValue // Only mark as modified if it's not empty on a new item
    };

    const newModifiedItems = {
        ...modifiedItems,
        [cardId]: updatedItem,
    };

    setModifiedItems(newModifiedItems);

    onCardModification({
        hasChanges: Object.values(newModifiedItems).some(item => 
            item._isModified || 
            (item.quantity > 0) // Consider any item with quantity as having changes
        ),
        activeCount: items.filter(item => 
            !item._deleted && 
            (item.quantity > 0 || newModifiedItems[item.cardId]?.quantity > 0)
        ).length,
        items: Object.values(newModifiedItems).filter(item => 
            item._isModified || 
            (item.quantity > 0)
        )
    });
  };
  
  const handleDuplicate = (item) => {
    onDuplicate(item);
  };

  const handleDelete = (cardId) => {
    onDelete(cardId);
  };


  useEffect(() => {
    // Only update items that aren't already in modifiedItems
    const updatedItems = items.map(item => {
        const existingModified = modifiedItems[item.cardId];
        return existingModified ? { ...item, ...existingModified } : item;
    });
    
    setDisplayedItems(updatedItems.filter(item => !item._deleted));
  }, [items, modifiedItems]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getCurrentPageItems = () => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return displayedItems.slice(start, end);
  };

  return (
    <Box
      sx={{
        mt: 2,
        maxHeight: "calc(100vh - 200px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TableContainer
        component={Paper}
        sx={{
          flexGrow: 1,
          maxHeight: "none",
          overflowY: "auto",
          overflowX: "auto",  // Enable horizontal scrolling
          "& .MuiTable-root": {
            minWidth: 1200,   // Set a minimum width to ensure proper spacing
          }
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Card Name</TableCell>
              <TableCell>Set</TableCell>
              <TableCell>Rarity</TableCell>
              <TableCell>Quality</TableCell>
              <TableCell>Language</TableCell>
              <TableCell>Location</TableCell>
              <TableCell sx={{ width: '150px' }}>Price</TableCell>
              <TableCell>Quantity</TableCell>
              {variantFields.map((field) => (
                <TableCell key={field.name}>{field.name}</TableCell>
              ))}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getCurrentPageItems().map((item) => {
              const isModified = modifiedItems[item.cardId];

              return (
                <TableRow key={item.cardId}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    {item.expansionCode} 
                    <Typography variant="caption" display="block" color="text.secondary">
                      #{item.collectorNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                  <Chip
                    label={item.rarity}
                    size="small"
                    sx={{ 
                      backgroundColor: getColorForRarity(item.rarity),
                      color: 'white',  // Makes the text white for better contrast
                      fontWeight: 'medium'
                    }}
                  />
                  </TableCell>
                  <TableCell>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={isModified?.quality || item.quality || ""}
                          onChange={(e) =>
                            handleValueChange(
                              item.cardId,
                              "quality",
                              e.target.value,
                            )
                          }
                        >
                          {qualities.map((q) => (
                            <MenuItem key={q} value={q}>
                              {q}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                  </TableCell>
                  <TableCell>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={isModified?.language || item.language || ""}
                          onChange={(e) =>
                            handleValueChange(
                              item.cardId,
                              "language",
                              e.target.value,
                            )
                          }
                        >
                          {languages.map((lang) => (
                            <MenuItem key={lang} value={lang}>
                              {lang}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      fullWidth
                      value={isModified?.location || item.location || ""}
                      onChange={(e) =>
                        handleValueChange(
                          item.cardId,
                          "location",
                          e.target.value
                        )
                      }
                    />
                  </TableCell>
                  <TableCell sx={{ width: '150px' }}>
                    {canEditPrices ? (
                      <TextField
                        size="small"
                        type="number"
                        value={isModified?.price || item.price || ""}
                        fullWidth
                        onChange={(e) =>
                          handleValueChange(
                            item.cardId,
                            "price",
                            parseFloat(e.target.value),
                          )
                        }
                        InputProps={{
                          startAdornment: "€",
                        }}
                      />
                    ) : (
                      `€${item.price || 0}`
                    )}
                  </TableCell>
                  <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={isModified?.quantity || item.quantity || 0}
                        onChange={(e) =>
                          handleValueChange(
                            item.cardId,
                            "quantity",
                            parseInt(e.target.value),
                          )
                        }
                      />
                  </TableCell>
                  {variantFields.map((field) => (
                    <TableCell key={field.name}>
                      {field.type === "boolean" ? (
                        <FormControl size="small">
                          <Select
                            value={
                              isModified?.[field.name] ||
                              item[field.name] ||
                              false
                            }
                            onChange={(e) =>
                              handleValueChange(
                                item.cardId,
                                field.name,
                                e.target.value,
                              )
                            }
                          >
                            <MenuItem value={true}>Yes</MenuItem>
                            <MenuItem value={false}>No</MenuItem>
                          </Select>
                        </FormControl>
                      ) : field.type === "selection" ? (
                        <FormControl size="small">
                          <Select
                            value={
                              isModified?.[field.name] || item[field.name] || ""
                            }
                            onChange={(e) =>
                              handleValueChange(
                                item.cardId,
                                field.name,
                                e.target.value,
                              )
                            }
                          >
                            {field.options.map((opt) => (
                              <MenuItem key={opt} value={opt}>
                                {opt}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : null}
                    </TableCell>
                  ))}
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleDuplicate(item)}
                      title="Add variant"
                    >
                      <AddIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(item.cardId)}
                      title="Delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
          component="div"
          count={displayedItems.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} of ${count}`
          }
          sx={{
            borderTop: 1,
            borderColor: "divider",
            backgroundColor: "background.paper",
            // Add these properties:
            minHeight: "60px", // Makes it taller
            "& .MuiTablePagination-toolbar": {
              minHeight: "60px", // Makes the inner toolbar taller
            },
            "& .MuiTablePagination-select": {
              paddingY: 2, // Add some vertical padding to the select
            }
          }}
        />
    </Box>
  );
};

export default CardDisplay;
