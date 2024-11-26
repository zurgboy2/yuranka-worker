const handleApiError = (error, response) => {
  console.error('API call failed:', error);
  if (response) {
    throw new Error(`Server error: ${response.status} ${response.statusText}`);
  } else if (error.request) {
    throw new Error('No response from server');
  } else {
    throw new Error('Error setting up request');
  }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const retryWithBackoff = async (fn, maxRetries = 3, initialDelay = 1000) => {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      retries++;
      if (retries === maxRetries) {
        throw error;
      }
      
      const delayTime = initialDelay * Math.pow(2, retries - 1);
      console.log(`Attempt ${retries} failed. Retrying in ${delayTime}ms...`);
      await delay(delayTime);
    }
  }
};

const fetchWithTimeout = async (url, options, timeout = 120000) => { // Increased to 120 seconds
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

const getProxyToken = async (scriptId, action) => {
  const makeRequest = async () => {
    const url = new URL('https://isa-scavenger-761151e3e681.herokuapp.com/get_token');
    
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        script_id: scriptId, 
        action: action,
      })
    }, 60000); // 60 seconds for token request

    if (!response.ok) {
      const errorText = await response.text();
      handleApiError(new Error(errorText), response);
    }

    const data = await response.json();
    if (data.token) return data.token;
    throw new Error('Failed to get token: ' + JSON.stringify(data));
  };

  return retryWithBackoff(makeRequest);
};

const apiCall = async (scriptId, action, additionalData = {}) => {
  const makeRequest = async () => {
    const token = await getProxyToken(scriptId, action);
    const url = new URL('https://isa-scavenger-761151e3e681.herokuapp.com/proxy');

    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        token, 
        action, 
        script_id: scriptId, 
        ...additionalData 
      })
    }, 180000); // 180 seconds (3 minutes) for main API call

    if (!response.ok) {
      const errorText = await response.text();
      handleApiError(new Error(errorText), response);
    }

    return await response.json();
  };

  return retryWithBackoff(makeRequest, 5, 2000);
};

export default apiCall;