const API_BASE = '/api';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token_v1');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  // Handle body - if it's an object and not already a string, stringify it
  let body = options.body;
  if (body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Blob)) {
    body = JSON.stringify(body);
  }

  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  // Debug logging (remove in production)
  if (import.meta.env.DEV) {
    console.log(`[API] ${options.method || 'GET'} ${API_BASE}${endpoint}`, {
      hasToken: !!localStorage.getItem('auth_token_v1'),
      headers: Object.keys(headers),
    });
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    method: options.method || 'GET',
    headers,
    body: body,
  });
  
  if (!response.ok) {
    let errorMessage = 'Request failed';
    try {
      const error = await response.json();
      errorMessage = error.message || errorMessage;
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    
    // Debug logging
    if (import.meta.env.DEV) {
      console.error(`[API Error] ${endpoint}:`, errorMessage, response.status);
    }
    
    throw new Error(errorMessage);
  }
  
  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
};

