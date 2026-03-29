import { useState, useEffect, useCallback } from 'react';
import { Workspace } from '../types';
import { apiClient } from '../lib/apiClient';

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspaces = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient('/web/workspaces',{
        headers: {
          'Content-Type': 'application/json'
        }
      }); 
      setWorkspaces(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);


  const addWorkspace = async (name:string)=> {
    if (!name || name.trim() === '') return;
    
    try {
      const data = await apiClient('/web/workspaces', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim() })
      });
      await fetchWorkspaces(); 
      return data; 
    } catch (err) {
      console.error("Failed to create workspace:", err);
      throw err; // Throw it so the UI can catch it and show a red error toast
    }
  }

  const deleteWorkspace = async (workspaceId:string | number) => {
    
    if(!workspaceId){
      return;
    }
    try{
      const res = await apiClient('/web/workspaces', {
        method: 'DELETE',
        body: JSON.stringify({ workspaceId: workspaceId})
      })
      await fetchWorkspaces();
      return 
    }catch(error){
      console.error("Failed to delete workspace:", error);
      throw error;
    }
  }

  return { workspaces, addWorkspace, deleteWorkspace, isLoading, error, refetch: fetchWorkspaces };
}