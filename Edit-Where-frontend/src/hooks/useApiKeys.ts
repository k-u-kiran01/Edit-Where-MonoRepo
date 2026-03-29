import { useState, useEffect, useCallback } from 'react';
import { ApiKey } from '../types';
import { apiClient } from '../lib/apiClient';
export function useApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient('/auth/keys');
      setApiKeys(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  return { apiKeys, isLoading, error, refetch: fetchKeys };
}