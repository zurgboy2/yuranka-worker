// testUser.js
import React, { useState } from 'react';
import tcgConfig from './lister/tcgConfig';
import apiCall from './api';
import './styles/TestUser.css';
import { useUserData } from './UserContext';

function TestUser() {
  const [selectedTcg, setSelectedTcg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cardData, setCardData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('front');
  const [testAnswers, setTestAnswers] = useState([]);
  const [testConfig, setTestConfig] = useState({
    targetCards: 10,
    timeLimit: 0, // 0 means no limit
    specificSet: '',
  });
  const { userData } = useUserData();

  const SCRIPT_ID = 'tester_script';

  const createEmptyManifest = (tcg) => {
    const manifest = {};
    const tcgData = tcgConfig.find(t => t.name === tcg);
    if (!tcgData) return manifest;

    tcgData.headers.forEach(header => {
      if (header.type === 'boolean') {
        manifest[header.name] = false;
      } else if (header.type === 'number') {
        manifest[header.name] = 0;
      } else {
        manifest[header.name] = '';
      }
    });
    return manifest;
  };

  const handleSearch = async () => {
    if (!selectedTcg || !searchTerm) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiCall(SCRIPT_ID, 'searchUserCard', {
        tcg: selectedTcg,
        searchTerm: searchTerm,
        googleToken: userData.googleToken,
        username: userData.username,
        testConfig,
      });

      if (result.success) {
        setCardData({
          frontImageBase64: result.frontImageBase64,
          backImageBase64: result.backImageBase64,
          manifest: createEmptyManifest(selectedTcg)
        });
      } else {
        setError(result.error || 'Failed to fetch card data');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitTest = async () => {
    if (testAnswers.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiCall(SCRIPT_ID, 'submitTestAnswers', {
        tcg: selectedTcg,
        answers: testAnswers,
        testConfig,
        googleToken: userData.googleToken,
        username: userData.username,
      });

      if (result.success) {
        // Reset the test
        setTestAnswers([]);
        setCardData(null);
        setSearchTerm('');
        // You might want to show results here
        alert(`Test completed! Score: ${result.score}%`);
      } else {
        setError(result.error || 'Failed to submit test answers');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextCard = () => {
    if (!cardData?.manifest) return;

    setTestAnswers(prev => [...prev, {
      searchTerm,
      manifest: cardData.manifest
    }]);
    
    setSearchTerm('');
    setCardData(null);
    setActiveView('front');
  };

  const getRelevantHeaders = () => {
    const tcg = tcgConfig.find(t => t.name === selectedTcg);
    if (!tcg) return [];
    
    const excludedHeaders = [
      'quantity', 'price', 'avg7', 'location',
      'cardmarketId'
    ];
    
    return tcg.headers.filter(header => !excludedHeaders.includes(header.name));
  };

  const updateManifestField = (fieldName, value) => {
    setCardData(prev => ({
      ...prev,
      manifest: {
        ...prev.manifest,
        [fieldName]: value
      }
    }));
  };

  return (
    <div className="test-user">
      <div className="test-header">
        <h2>Card Knowledge Test</h2>
        <div className="test-progress">
          <span>Cards Completed: {testAnswers.length} / {testConfig.targetCards}</span>
        </div>
      </div>

      <div className="test-config">
        <select 
          value={selectedTcg} 
          onChange={(e) => {
            setSelectedTcg(e.target.value);
            setCardData(null);
            setTestAnswers([]);
            setError(null);
          }}
          className="tcg-select"
          disabled={isLoading || testAnswers.length > 0}
        >
          <option value="">Select TCG</option>
          {tcgConfig.map((tcg) => (
            <option key={tcg.name} value={tcg.name}>{tcg.name}</option>
          ))}
        </select>

        <div className="search-section">
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
            <h3>Enter Card Details</h3>
            <div className="manifest-fields">
              {getRelevantHeaders().map(header => (
                <div key={header.name} className="field-group">
                  <label>{header.name.replace(/([A-Z])/g, ' $1').trim()}</label>
                  {header.type === 'selection' ? (
                    <select
                      value={cardData.manifest[header.name] || ''}
                      onChange={(e) => updateManifestField(header.name, e.target.value)}
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
                        onChange={(e) => updateManifestField(header.name, e.target.checked)}
                      />
                      <span>{header.name}</span>
                    </div>
                  ) : (
                    <input
                      type={header.type}
                      value={cardData.manifest[header.name] || ''}
                      onChange={(e) => updateManifestField(header.name, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="test-actions">
              <button 
                onClick={handleNextCard}
                disabled={isLoading}
                className="next-card-button"
              >
                Next Card
              </button>
              
              {testAnswers.length > 0 && (
                <button 
                  onClick={handleSubmitTest}
                  disabled={isLoading}
                  className="submit-test-button"
                >
                  Submit Test ({testAnswers.length} cards)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TestUser;