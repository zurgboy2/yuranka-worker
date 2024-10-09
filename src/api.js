// const CORS_BYPASS_KEY = '';

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

const getProxyToken = async (scriptId, action) => {
    const url = new URL('https://isa-scavenger-761151e3e681.herokuapp.com/get_token');
    // url.searchParams.append('bypass_key', CORS_BYPASS_KEY);
    try {
        const response = await fetch(url, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            // 'X-CORS-Bypass-Key': CORS_BYPASS_KEY
        },
        body: JSON.stringify({ 
            script_id: scriptId, 
            action: action,
            // bypass_key: CORS_BYPASS_KEY 
        }),
        });

        if (!response.ok) {
        const errorText = await response.text();
        handleApiError(new Error(errorText), response);
        }

        const data = await response.json();
        if (data.token) return data.token;
        throw new Error('Failed to get token: ' + JSON.stringify(data));
    } catch (error) {
        handleApiError(error);
    }
};

const apiCall = async (scriptId, action, additionalData = {}) => {
  try {
    const token = await getProxyToken(scriptId, action);
    const url = new URL('https://isa-scavenger-761151e3e681.herokuapp.com/proxy');
    // url.searchParams.append('bypass_key', CORS_BYPASS_KEY);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        token, 
        action, 
        script_id: scriptId, 
        // bypass_key: CORS_BYPASS_KEY,  // Add the bypass key here
        ...additionalData 
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      handleApiError(new Error(errorText), response);
    }

    const returnedData = response.json();
    return await returnedData;
  } catch (error) {
    handleApiError(error);
  }
};

export default apiCall;