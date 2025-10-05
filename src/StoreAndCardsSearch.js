import React, { useState, useCallback, useEffect } from 'react';
import {
  Typography, Button, TextField, Grid, Paper,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Checkbox, FormControlLabel, Snackbar,  Chip, MenuItem, InputAdornment
} from '@mui/material';
import 'material-icons/iconfont/material-icons.css';
import apiCall from './api';
import { useUserData } from './UserContext';
import { List, ListItem, ListItemText } from '@mui/material';

const StoreSearch = ({ onClose }) => {
  const { userData } = useUserData();
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [allItems, setAllItems] = useState([]);
  const [productData, setProductData] = useState({
    Title: '',
    Type: '',
    'Variant Price': '',
    'Variant Inventory Qty': '',
    'Variant Grams': '',
    'Variant Barcode': '',
    Description: '',
    Tags: '',
    Shopify: false,
    Store: false,
    'Original Cost': '',
    Supplier: '',
    'Date Obtained': '',
    Height: '',
    Width: '',
    Length: ''
  });
  const [selectedUniqueId, setSelectedUniqueId] = useState(null);
  const [shopifyPopup, setShopifyPopup] = useState({ open: false, url: '' });
  const [addProductDisabled, setAddProductDisabled] = useState(false);

  const handleSearch = useCallback(() => {
    console.log("=== SEARCH INITIATED ===");
    console.log("searchText:", searchText);
    console.log("selectedUniqueId:", selectedUniqueId);
    console.log("allItems count:", allItems.length);
    
    if (!searchText.trim() && !selectedUniqueId) {
      console.log("No search criteria provided, clearing results");
      setSearchResults([]);
      return;
    }
    
    setLoading(true);
    
    try {
      // If we have a unique ID selected, filter by that
      if (selectedUniqueId) {
        console.log("Filtering by uniqueId:", selectedUniqueId);
        
        const filteredResults = allItems.filter(item => {
          const matches = String(item.uniqueId) === String(selectedUniqueId);
          console.log(`Item ${item.uniqueId} (${item.title}) matches: ${matches}`);
          return matches;
        });
        
        console.log("Results count (by uniqueId):", filteredResults.length);
        console.log("Filtered results:", filteredResults);
        setSearchResults(filteredResults);
      } 
      // Otherwise filter by text
      else {
        const query = searchText.toLowerCase().trim();
        console.log("Filtering by text query:", query);
        
        // Log a sample of the allItems to verify structure
        if (allItems.length > 0) {
          console.log("Sample item structure:", JSON.stringify(allItems[0], null, 2));
        }
        
        const filteredResults = allItems.filter(item => {
          // Check each field individually and log the result
          const titleMatch = item.title && item.title.toLowerCase().includes(query);
          const supplierMatch = item.supplier && item.supplier.toLowerCase().includes(query);
          const typeMatch = item.type && item.type.toLowerCase().includes(query);
          
          console.log(`Item ${item.uniqueId || 'unknown'} (${item.title || 'untitled'}): titleMatch=${titleMatch}, supplierMatch=${supplierMatch}, typeMatch=${typeMatch}`);
          
          return titleMatch || supplierMatch || typeMatch;
        });
        
        console.log("Results count (by text):", filteredResults.length);
        console.log("Filtered results:", filteredResults.map(r => r.title));
        setSearchResults(filteredResults);
      }
    } catch (err) {
      console.error("Search error:", err);
      setError('Failed to filter results. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchText, selectedUniqueId, allItems]);
  

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };


  const fetchTagSuggestions = useCallback(async () => {
    try {
      const tags = await apiCall('stocker_script', 'getTags', {
        googleToken: userData.googleToken,
        username: userData.username,
        type: 'Individual Products'
      });
      setTagSuggestions(tags);
    } catch (err) {
      console.error('Failed to fetch tag suggestions:', err);
    }
  }, [userData]);

  const uploadImage = async (base64Image, uniqueId) => {
    setLoading(true);
    setError(null);
    try {
      await apiCall('stocker_script', 'uploadImageToServer', {
        googleToken: userData.googleToken,
        username: userData.username,
        base64Image,
        uniqueId,
        productType: 'Individual Products'
      });
    } catch (err) {
      setError('Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall('register_script', 'getSpreadsheetData', {
        googleToken: userData.googleToken,
        username: userData.username
      });
      setAllItems(result);
    } catch (err) {
      setError('Failed to fetch products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    fetchAllItems();
  }, [fetchAllItems]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
    fetchTagSuggestions();
  };

  const handleAddProduct = async () => {
    setAddProductDisabled(true);
    setLoading(true);
    setError(null);
    setSuccessMessage('');
    try {
      const response = await apiCall('stocker_script', 'addProduct', {
        googleToken: userData.googleToken,
        username: userData.username,
        productData,
        addToShopify: productData.Shopify,
        addToStore: productData.Store
      });
      console.log("Add product response:", response);
      setOpenDialog(false);
      setSuccessMessage(response.message || 'Product added successfully');
      if (response.handle) {
        setShopifyPopup({ 
          open: true, 
          url: `https://store.yuranka.com/products/${response.handle}`
        });
      }
      // Reset the form
      setProductData({
        Title: '',
        Type: '',
        'Variant Price': '',
        'Variant Inventory Qty': '',
        'Variant Grams': '',
        'Variant Barcode': '',
        Description: '',
        Tags: '',
        Shopify: false,
        Store: false,
        'Original Cost': '',
        Supplier: '',
        'Date Obtained': '',
        Height: '',
        Width: '',
        Length: ''
      });
      handleSearch(); // Refresh the search results
      setAddProductDisabled(false);
    } catch (err) {
      setError('Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateField = (productId, field, value) => {
    setSearchResults(prevResults =>
      prevResults.map(product =>
        product.Unique_ID === productId ? { ...product, [field]: value } : product
      )
    );
  };
  
  const handleFileChange = async (e, productId) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;
        try {
          setLoading(true);
          const response = await apiCall('stocker_script', 'uploadImageToServer', {
            googleToken: userData.googleToken,
            username: userData.username,
            base64Image,
            uniqueId: productId,
            productType: 'Individual Products'
          });
          
          if (response.success) {
            setSearchResults(prevResults =>
              prevResults.map(product =>
                product.Unique_ID === productId ? { ...product, 'Image Src': response['Image Src'] } : product
              )
            );
            setSuccessMessage(response.message || 'Image uploaded successfully.');
          } else {
            throw new Error(response.message || 'Failed to upload image');
          }
        } catch (err) {
          setError(err.message || 'Failed to upload image. Please try again.');
        } finally {
          setLoading(false);
          e.target.value = '';
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleUpdateProduct = async (productId) => {
    setLoading(true);
    setError(null);
    try {
        const productToUpdate = searchResults.find(product => product.Unique_ID === productId);
        const response = await apiCall('stocker_script', 'updateProduct', {
        googleToken: userData.googleToken,
        username: userData.username,
        productId,
        productData: productToUpdate
      });
       if (response.success) {
        setShopifyPopup({ open: true, url: `https://store.yuranka.com/products/${productToUpdate.Handle}` });
        setSuccessMessage(response.message || 'Product updated successfully');
      } else {
        setError(response.message || 'Failed to update product.');
      }

    } catch (err) {
      setError('Failed to update product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setLoading(true);
      setError(null);
      try {
        await apiCall('stocker_script', 'deleteProduct', {
          googleToken: userData.googleToken,
          username: userData.username,
          productId
        });
        setSearchResults(prev => prev.filter(product => product.Unique_ID !== productId));
      } catch (err) {
        setError('Failed to delete product. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const TagInput = ({ tags, onAddTag, onRemoveTag }) => {
    const [inputValue, setInputValue] = useState('');
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  
    const handleInputChange = (e) => {
      const value = e.target.value;
      setInputValue(value);
      setFilteredSuggestions(
        tagSuggestions.filter(tag => 
          tag.toLowerCase().includes(value.toLowerCase())
        )
      );
    };
  
    const handleAddTag = (tag) => {
      if (tag && !tags.includes(tag)) {
        onAddTag(tag);
        setInputValue('');
        setFilteredSuggestions([]);
      }
    };
    return (
      <Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          {tags.map((tag, index) => (
            <Chip 
              key={index} 
              label={tag} 
              onDelete={() => onRemoveTag(tag)}
              sx={{ bgcolor: '#4a4a4a', color: 'white' }}
            />
          ))}
        </Box>
        <TextField
          fullWidth
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAddTag(inputValue);
            }
          }}
          placeholder="Add a tag..."
        />
        {filteredSuggestions.length > 0 && (
          <Paper sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
            {filteredSuggestions.map((suggestion, index) => (
              <MenuItem key={index} onClick={() => handleAddTag(suggestion)}>
                {suggestion}
              </MenuItem>
            ))}
          </Paper>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '80vh',
      width: '100%',
      overflow: 'hidden',
      bgcolor: '#1a1a1a',
      color: '#ffffff'
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider'
      }}>
        <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
          Store Search
        </Typography>
        <Button onClick={onClose} size="small" sx={{ color: '#8b0000' }}>
          Close
        </Button>
      </Box>
      
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={9}>
            <TextField
              fullWidth
              placeholder="Search Store Products..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setSelectedUniqueId(null);
              }}
              InputProps={{
                style: { color: '#ffffff' },
                sx: { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                startAdornment: (
                  <span className="material-icons" style={{ marginRight: '8px' }}>search</span>
                ),
                endAdornment: searchText ? (
                  <span 
                    className="material-icons" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setSearchText('');
                      setSelectedUniqueId(null);
                      setSearchResults([]);
                    }}
                  >
                    clear
                  </span>
                ) : null
              }}
            />
            {searchText && (
              <Paper 
                sx={{ 
                  maxHeight: '300px',
                  overflow: 'auto',
                  mt: 1,
                  bgcolor: '#2a2a2a',
                }}
              >
                <List dense>
                  {allItems.filter(item => {
                    const query = searchText.toLowerCase().trim();
                    return (
                      (item.title && item.title.toLowerCase().includes(query)) ||
                      (item.supplier && item.supplier.toLowerCase().includes(query)) ||
                      (item.type && item.type.toLowerCase().includes(query))
                    );
                  }).slice(0, 10).map((item, index) => (
                    <ListItem 
                      button 
                      key={item.uniqueId || index}
                      onClick={async () => {
                        try {
                          setLoading(true);
                          setError(null);
                          
                          // Call the backend searchStoreProduct function
                          const response = await apiCall('stocker_script', 'searchStoreProduct', {
                            googleToken: userData.googleToken,
                            username: userData.username,
                            searchText: item.title || '',
                            uniqueId: item.uniqueId
                          });
                          
                          if (response && Array.isArray(response)) {
                            setSearchResults(response);
                            setSearchText(item.title || '');
                          } else {
                            // Handle case when response is not as expected
                            throw new Error('Invalid response from server');
                          }
                        } catch (err) {
                          console.error("Search error:", err);
                          setError('Failed to retrieve product. Please try again.');
                          setSearchResults([]);
                        } finally {
                          setLoading(false);
                        }
                      }}
                      sx={{ 
                        '&:hover': { 
                          bgcolor: 'rgba(255, 255, 255, 0.1)' 
                        },
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <ListItemText 
                        primary={
                          <Typography variant="body1" sx={{ color: '#ffffff' }}>
                            {item.title || 'Untitled'} 
                            {item.price && ` - €${item.price}`}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {item.type || 'No type'} 
                            {item.supplier && ` - ${item.supplier}`}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button 
              fullWidth 
              variant="contained"
              onClick={handleOpenDialog}
              sx={{ height: '100%', bgcolor: '#4a4a4a' }}
            >
              + Add Product
            </Button>
          </Grid>
        </Grid>
      </Box>
  
      {loading && <CircularProgress sx={{ m: 'auto' }} />}
      {error && <Typography color="error">{error}</Typography>}
      
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
      {searchResults.map((product) => (
        <Paper key={product.Unique_ID} sx={{ p: 2, mb: 2, bgcolor: '#2a2a2a', color: '#ffffff' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Product Name"
                value={product.Title}
                onChange={(e) => handleUpdateField(product.Unique_ID, 'Title', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Product Type"
                value={product.Type}
                onChange={(e) => handleUpdateField(product.Unique_ID, 'Type', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price (€)"
                type="number"
                value={product['Variant Price']}
                onChange={(e) => handleUpdateField(product.Unique_ID, 'Variant Price', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">€</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantity"
                type="text" // Changed from "number" to "text" to prevent scrollable behavior
                value={product['Variant Inventory Qty']}
                onChange={(e) => {
                  // Only allow whole numbers
                  const value = e.target.value;
                  if (value === '' || /^[0-9]+$/.test(value)) {
                    handleUpdateField(product.Unique_ID, 'Variant Inventory Qty', value);
                  }
                }}
                inputProps={{
                  inputMode: 'numeric', // For mobile keyboards
                  pattern: '[0-9]*',    // HTML5 validation
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Grams"
                type="number"
                value={product['Variant Grams']}
                onChange={(e) => handleUpdateField(product.Unique_ID, 'Variant Grams', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Barcode"
                value={product['Variant Barcode']}
                onChange={(e) => handleUpdateField(product.Unique_ID, 'Variant Barcode', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Height"
                type="number"
                value={product.Height}
                onChange={(e) => handleUpdateField(product.Unique_ID, 'Height', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Width"
                type="number"
                value={product.Width}
                onChange={(e) => handleUpdateField(product.Unique_ID, 'Width', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Length"
                type="number"
                value={product.Length}
                onChange={(e) => handleUpdateField(product.Unique_ID, 'Length', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={product.Description}
                onChange={(e) => handleUpdateField(product.Unique_ID, 'Description', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TagInput
                tags={(product.Tags || '').split(',').filter(Boolean)}
                onAddTag={(newTag) => handleUpdateField(product.Unique_ID, 'Tags', product.Tags ? `${product.Tags},${newTag}` : newTag)}
                onRemoveTag={(tagToRemove) => handleUpdateField(product.Unique_ID, 'Tags', (product.Tags || '').split(',').filter(tag => tag !== tagToRemove).join(','))}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={product.Shopify}
                    onChange={(e) => handleUpdateField(product.Unique_ID, 'Shopify', e.target.checked)}
                  />
                }
                label="Shopify"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={product.Store}
                    onChange={(e) => handleUpdateField(product.Unique_ID, 'Store', e.target.checked)}
                  />
                }
                label="Store"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Original Cost (€)"
                type="number"
                value={product['Original Cost']}
                onChange={(e) => handleUpdateField(product.Unique_ID, 'Original Cost', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">€</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Supplier"
                value={product.Supplier}
                onChange={(e) => handleUpdateField(product.Unique_ID, 'Supplier', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Date Obtained"
              value={product['Date Obtained']}
              onChange={(e) => handleUpdateField(product.Unique_ID, 'Date Obtained', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            </Grid>
            <Grid item xs={12}>
              <input
                accept="image/*"
                id={`image-upload-${product.Unique_ID}`}
                type="file"
                style={{ display: 'none' }}
                onChange={(e) => handleFileChange(e, product.Unique_ID)}
              />
              <label htmlFor={`image-upload-${product.Unique_ID}`}>
                <Button variant="contained" component="span">
                  Change Image
                </Button>
              </label>
              {product['Image Src'] && (
                <img src={product['Image Src']} alt="Product" style={{ maxWidth: '100%', marginTop: '10px' }} />
              )}
            </Grid>
            <Grid item xs={12}>
              <Button onClick={() => handleUpdateProduct(product.Unique_ID)} sx={{ mr: 1, bgcolor: '#4a4a4a' }}>
                Update
              </Button>
              {(userData.role === 'Admin' || userData.role === 'Store Manager') && (
                <Button onClick={() => handleDeleteProduct(product.Unique_ID)} sx={{ bgcolor: '#4a4a4a' }}>
                  Delete
                </Button>
              )}
            </Grid>
          </Grid>
        </Paper>
      ))}
    </Box>
  
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth margin="dense" name="Title" label="Product Name" value={productData.Title} onChange={handleInputChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth margin="dense" name="Type" label="Product Type" value={productData.Type} onChange={handleInputChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth margin="dense" name="Variant Price" label="Price" type="number" value={productData['Variant Price']} onChange={handleInputChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField 
              fullWidth 
              margin="dense" 
              name="Variant Inventory Qty" 
              label="Quantity" 
              type="text" // Changed from "number" to "text"
              value={productData['Variant Inventory Qty']} 
              onChange={(e) => {
                const { name, value } = e.target;
                // Only allow whole numbers
                if (name === "Variant Inventory Qty") {
                  if (value === '' || /^[0-9]+$/.test(value)) {
                    setProductData(prev => ({
                      ...prev,
                      [name]: value
                    }));
                  }
                } else {
                  setProductData(prev => ({
                    ...prev,
                    [name]: value
                  }));
                }
              }}
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth margin="dense" name="Variant Grams" label="Grams" type="number" value={productData['Variant Grams']} onChange={handleInputChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth margin="dense" name="Variant Barcode" label="Barcode" value={productData['Variant Barcode']} onChange={handleInputChange} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth margin="dense" name="Height" label="Height" type="number" value={productData.Height} onChange={handleInputChange} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth margin="dense" name="Width" label="Width" type="number" value={productData.Width} onChange={handleInputChange} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth margin="dense" name="Length" label="Length" type="number" value={productData.Length} onChange={handleInputChange} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth margin="dense" name="Description" label="Description" multiline rows={3} value={productData.Description} onChange={handleInputChange} />
          </Grid>
          <Grid item xs={12}>
            <TagInput
              tags={(productData.Tags || '').split(',').filter(Boolean)}
              onAddTag={(newTag) => {
                setProductData(prev => ({
                  ...prev,
                  Tags: prev.Tags ? `${prev.Tags},${newTag}` : newTag
                }));
              }}
              onRemoveTag={(tagToRemove) => {
                setProductData(prev => ({
                  ...prev,
                  Tags: (prev.Tags || '').split(',').filter(tag => tag !== tagToRemove).join(',')
                }));
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1">Platforms</Typography>
            <FormControlLabel
              control={<Checkbox checked={productData.Shopify} onChange={handleInputChange} name="Shopify" />}
              label="Shopify"
            />
            <FormControlLabel
              control={<Checkbox checked={productData.Store} onChange={handleInputChange} name="Store" />}
              label="Store"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth margin="dense" name="Original Cost" label="Original Cost" type="number" value={productData['Original Cost']} onChange={handleInputChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth margin="dense" name="Supplier" label="Supplier" value={productData.Supplier} onChange={handleInputChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth margin="dense" name="Date Obtained" label="Date Obtained" type="date" value={productData['Date Obtained']} onChange={handleInputChange} InputLabelProps={{ shrink: true }} />
          </Grid>
        </Grid>
      </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddProduct} disabled={addProductDisabled}>
            {productData.Shopify && productData.Store ? 'Add to Shopify & Store' :
             productData.Shopify ? 'Add to Shopify' :
             productData.Store ? 'Add to Store' : 'Add Product'}
          </Button>
        </DialogActions>
      </Dialog>
  
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        message={error}
      />
      
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        message={successMessage}
        ContentProps={{
          sx: { backgroundColor: 'green' }
        }}
      />
    <Dialog
  open={shopifyPopup.open}
  onClose={() => setShopifyPopup({ open: false, url: '' })}
  maxWidth="md"
  fullWidth 
  PaperProps={{
    style: { minHeight: '300px', minWidth: '500px', padding: 32 } // further increases size
  }}
>
  <DialogTitle style={{ fontSize: 28, fontWeight: 600 }}>Check The Shopify Product</DialogTitle>
  <DialogContent>
    <Typography style={{ fontSize: 20, marginBottom: 16 }}>
      Please double check the Shopify product.
    </Typography>
  </DialogContent>
  <DialogActions style={{ paddingBottom: 32 }}>
    <Grid container spacing={2} justifyContent="center">
      <Grid item>
        <Button
          variant="contained"
          color="primary"
          href={shopifyPopup.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 18, padding: '12px 32px' }}
        >
          Go to Product
        </Button>
      </Grid>
      <Grid item>
        <Button
          onClick={() => setShopifyPopup({ open: false, url: '' })}
          style={{ fontSize: 18, padding: '12px 32px' }}
        >
          Close
        </Button>
        </Grid>
      </Grid>
    </DialogActions>
  </Dialog>
    </Box>
  );
};

export default StoreSearch;