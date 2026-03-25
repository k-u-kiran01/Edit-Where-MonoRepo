import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, FileCode, Loader2 } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';

export function FileEditView() {
  // 1. Grab workspaceId and fileId (instead of fileName)
  const { workspaceId, fileId } = useParams();
  const navigate = useNavigate();

  const [content, setContent] = useState('');
  const [filePath, setFilePath] = useState(''); // Store the real path for the UI
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log(workspaceId);
    const fetchFile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Use your clean apiClient!
        const data = await apiClient(`/web/files/${fileId}`);
        setContent(data.content || '');
        setFilePath(data.filePath || 'Unknown File');
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (workspaceId && fileId) fetchFile();
  }, [workspaceId, fileId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // apiClient automatically handles the headers, URL, and JSON!
      await apiClient(`/web/files/${fileId}`, {
        method: 'PUT',
        body: JSON.stringify({ content }),
      });
      console.log('File saved successfully!');
    } catch (err: any) {
      console.error(err);
      setError('Could not save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  
  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
        <p className="text-destructive">{error}</p>
        <button onClick={() => navigate(`/workspaces/${workspaceId}`)} className="rounded-md bg-secondary px-4 py-2 text-secondary-foreground hover:bg-secondary/80">
          Go Back to Workspace
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center justify-between border-b border-border bg-muted/50 p-4">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(`/workspaces/${workspaceId}`)} className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </button>
          <div className="flex items-center space-x-2 border-l border-border pl-4">
            <FileCode className="h-5 w-5 text-primary" />
            {/* Display the real file path we fetched from the DB */}
            <h2 className="font-semibold">{filePath.split('/').pop()}</h2> 
          </div>
        </div>

        <button onClick={handleSave} disabled={isSaving} className="flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="flex-1 bg-[#1e1e1e] p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="h-full w-full resize-none bg-transparent font-mono text-sm text-gray-300 focus:outline-none"
          spellCheck={false}
          placeholder="// Start coding here..."
        />
      </div>
    </div>
  );
}