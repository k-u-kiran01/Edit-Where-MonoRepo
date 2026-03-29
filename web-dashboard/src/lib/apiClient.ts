
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export async function apiClient(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include', // Automatically attaches cookies to EVERY request!
    headers: {
      'Content-Type': 'application/json', // Automatically assume we are sending/receiving JSON
      ...options.headers,
    },
  });

  // Automatically catch HTTP errors so we don't have to do `if (!response.ok)` everywhere
  if (!response.ok) {
    // Try to parse the backend error message, fallback to generic text if it fails
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || 'An API error occurred');
  }

  // Automatically parse and return the JSON data!
  return response.json();
}