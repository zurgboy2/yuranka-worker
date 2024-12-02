// CardSearch.js
import React, { useState } from 'react';
import tcgConfig from './lister/tcgConfig';
import apiCall from './apiCall';
import './styles/CardSearch.css';

function CardSearch() {
  const [selectedTcg, setSelectedTcg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cardData, setCardData] = useState(null);
  const [characteristics, setCharacteristics] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const SCRIPT_ID = 'tester_script'; // Replace with your Google Apps Script ID

  const handleSearch = async () => {
    if (!selectedTcg || !searchTerm) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiCall(SCRIPT_ID, 'searchCard', {
        tcg: selectedTcg,
        searchTerm: searchTerm
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

  const getRelevantHeaders = () => {
    const tcg = tcgConfig.find(t => t.name === selectedTcg);
    if (!tcg) return [];
    return tcg.headers.filter(header => 
      !['quantity', 'price', 'avg7', 'location'].includes(header.name)
    );
  };

  return (
    <div className="card-search">
      <div className="search-section">
        <select 
          value={selectedTcg} 
          onChange={(e) => {
            setSelectedTcg(e.target.value);
            setCardData(null);
            setCharacteristics({});
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
          <div className="card-info">
            <img 
              src={cardData.imageUrl} 
              alt={cardData.name} 
              className="card-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'placeholder-image.jpg';
              }}
            />
            <h2>{cardData.name}</h2>
            <p>{cardData.setName}</p>
          </div>

          <div className="characteristics-form">
            {getRelevantHeaders().map(header => (
              <div key={header.name} className="characteristic-input">
                <label>{header.name.replace(/([A-Z])/g, ' $1').trim()}</label>
                {header.type === 'selection' ? (
                  <select
                    value={characteristics[header.name] || ''}
                    onChange={(e) => setCharacteristics(prev => ({
                      ...prev,
                      [header.name]: e.target.value
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
                      checked={characteristics[header.name] || false}
                      onChange={(e) => setCharacteristics(prev => ({
                        ...prev,
                        [header.name]: e.target.checked
                      }))}
                    />
                    <span>{header.name}</span>
                  </div>
                ) : (
                  <input
                    type={header.type}
                    value={characteristics[header.name] || ''}
                    onChange={(e) => setCharacteristics(prev => ({
                      ...prev,
                      [header.name]: e.target.value
                    }))}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CardSearch;