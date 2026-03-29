import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/apiClient';
export function useWorkspaceDetail(workspaceId: string | undefined) {
  const [workspace, setWorkspace] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingFile, setIsCreatingFile] = useState(false);

  const fetchWorkspace = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    try {
      const data = await apiClient(`/web/workspaces/${workspaceId}`);
      setWorkspace(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch workspace');
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchWorkspace();
  }, [fetchWorkspace]);

  const createFile = async (fileName: string) => {
    if (!workspaceId) throw new Error("No workspace ID");
    
    setIsCreatingFile(true);
    try {
      const formattedPath = fileName.startsWith('/') ? fileName : `/${fileName}`;
      
      const newFile = await apiClient(`/web/workspaces/${workspaceId}/files`, {
        method: 'POST',
        body: JSON.stringify({ filePath: formattedPath })
      });
      await fetchWorkspace(); 
      return newFile; 
    } catch (err: any) {
      console.error("Failed to create file", err);
      throw err; 
    } finally {
      setIsCreatingFile(false);
    }
  };

  return { 
    workspace, 
    isLoading, 
    error, 
    createFile, 
    isCreatingFile
  };
}