// CardSearch.js
import React, { useState } from 'react';
import tcgConfig from './lister/tcgConfig';
import apiCall from './api';
import './styles/CardSearch.css';
import { useUserData } from './UserContext';

function CardSearch() {
  const [selectedTcg, setSelectedTcg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cardData, setCardData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('front');
  const { userData } = useUserData();

  const SCRIPT_ID = 'tester_script'; // Replace with your Google Apps Script ID

  const handleSearch = async () => {
    if (!selectedTcg || !searchTerm) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiCall(SCRIPT_ID, 'searchCard', {
        tcg: selectedTcg,
        searchTerm: searchTerm,
        googleToken: userData.googleToken,
        username: userData.username,
      });

      if (result.success) {
        setCardData(result.cardData);
      } else {
        setError(result.error || 'Failed to fetch card data');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateManifest = async () => {
    if (!cardData?.manifest) return;
  
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiCall(SCRIPT_ID, 'uppendManifest', {
        tcg: selectedTcg,
        manifest: cardData.manifest,
        googleToken: userData.googleToken,
        username: userData.username,
      });
  
      if (result.success) {
        // You might want to show a success message
        console.log('Manifest updated successfully');
      } else {
        setError(result.error || 'Failed to update card data');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getRelevantHeaders = () => {
    const tcg = tcgConfig.find(t => t.name === selectedTcg);
    if (!tcg) return [];
    
    const excludedHeaders = [
      'quantity', 'price', 'avg7', 'location', 'name', 
      'expansion', 'collectorNumber', 'expansionCode', 'cardmarketId'
    ];
    
    return tcg.headers.filter(header => !excludedHeaders.includes(header.name));
  };

  return (
    <div className="card-search">
      <div className="search-section">
        <select 
          value={selectedTcg} 
          onChange={(e) => {
            setSelectedTcg(e.target.value);
            setCardData(null);
            setError(null);
          }}
          className="tcg-select"
          disabled={isLoading}
        >
          <option value="">Select TCG</option>
          {tcgConfig.map((tcg) => (
            <option key={tcg.name} value={tcg.name}>{tcg.name}</option>
          ))}
        </select>

        <div className="search-bar">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter card name..."
            className="search-input"
            disabled={isLoading}
          />
          <button 
            onClick={handleSearch}
            disabled={!selectedTcg || !searchTerm || isLoading}
            className="search-button"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

        {cardData && (
        <div className="card-details">
            <div className="card-images">
            {cardData.frontImageBase64 || cardData.backImageBase64 ? (
                <>
                <div className="image-controls">
                    <button 
                    className={`view-button ${activeView === 'front' ? 'active' : ''}`}
                    onClick={() => setActiveView('front')}
                    >
                    Front
                    </button>
                    <button 
                    className={`view-button ${activeView === 'back' ? 'active' : ''}`}
                    onClick={() => setActiveView('back')}
                    disabled={!cardData.backImageBase64}
                    >
                    Back
                    </button>
                </div>
                
                <div className="card-image-container">
                    <img 
                    src={`data:image/jpeg;base64,${
                        activeView === 'front' 
                        ? cardData.frontImageBase64 
                        : cardData.backImageBase64
                    }`} 
                    alt={`${activeView} of card`}
                    className="card-image"
                    />
                </div>
                </>
            ) : (
                <div className="no-card-found">
                <p>Card Not Found</p>
                </div>
            )}
            </div>

          <div className="manifest-editor">
            <h3>Card Details</h3>
            <div className="manifest-fields">
              <div className="field-group">
                <label>Name</label>
                <input
                  type="text"
                  value={cardData.manifest.name || ''}
                  onChange={(e) => setCardData(prev => ({
                    ...prev,
                    manifest: { ...prev.manifest, name: e.target.value }
                  }))}
                />
              </div>
              
              <div className="field-group">
                <label>Set Name</label>
                <input
                  type="text"
                  value={cardData.manifest.setName || ''}
                  onChange={(e) => setCardData(prev => ({
                    ...prev,
                    manifest: { ...prev.manifest, setName: e.target.value }
                  }))}
                />
              </div>

              {getRelevantHeaders().map(header => (
                <div key={header.name} className="field-group">
                  <label>{header.name.replace(/([A-Z])/g, ' $1').trim()}</label>
                  {header.type === 'selection' ? (
                    <select
                      value={cardData.manifest[header.name] || ''}
                      onChange={(e) => setCardData(prev => ({
                        ...prev,
                        manifest: { ...prev.manifest, [header.name]: e.target.value }
                      }))}
                    >
                      <option value="">Select {header.name}</option>
                      {header.options.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : header.type === 'boolean' ? (
                    <div className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        checked={cardData.manifest[header.name] || false}
                        onChange={(e) => setCardData(prev => ({
                          ...prev,
                          manifest: { ...prev.manifest, [header.name]: e.target.checked }
                        }))}
                      />
                      <span>{header.name}</span>
                    </div>
                  ) : (
                    <input
                      type={header.type}
                      value={cardData.manifest[header.name] || ''}
                      onChange={(e) => setCardData(prev => ({
                        ...prev,
                        manifest: { ...prev.manifest, [header.name]: e.target.value }
                      }))}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="manifest-actions">
            <button 
                className="save-button"
                onClick={handleUpdateManifest}
                disabled={isLoading}
                >
                {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CardSearch;