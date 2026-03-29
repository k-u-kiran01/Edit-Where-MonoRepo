import { useState } from 'react';
import { Plus, Loader2, X, Copy, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { WorkspaceCard } from '../WorkspaceCard';
import { ScrollArea } from '../ui/ScrollArea';
import { useWorkspaces } from '../../hooks/useWorkspaces';
import { useNavigate } from 'react-router-dom';

export function WorkspaceOverview() {
  // 1. Hook Data (Aliased addWorkshop to addWorkspace just in case you haven't renamed it yet)
  const { addWorkspace, deleteWorkspace, workspaces, isLoading, error } = useWorkspaces();
  const navigate = useNavigate();

  // 2. Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // 3. Success State
  const [createdWorkspaceId, setCreatedWorkspaceId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // --- Handlers ---
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    setIsCreating(true);
    try {
      const response = await addWorkspace(newWorkspaceName);
      // Move to the success screen inside the modal
      setCreatedWorkspaceId(response.workspaceId);
    } catch (err) {
      console.error("Failed to create workspace", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyId = () => {
    if (createdWorkspaceId) {
      navigator.clipboard.writeText(createdWorkspaceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset copy icon after 2s
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Wait for the fade-out animation before clearing the data
    setTimeout(() => {
      setNewWorkspaceName('');
      setCreatedWorkspaceId(null);
      setCopied(false);
    }, 200);
  };

  // --- Early Returns for Loading/Error ---
  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-destructive">
        Error loading workspaces: {error}
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="h-full w-full">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground">
                Workspaces
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage and monitor your synced local directories.
              </p>
            </div>
            <Button className="shadow-sm" onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Workspace
            </Button>
          </div>

          {/* Empty State vs Grid */}
          {workspaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border/60 rounded-xl bg-card/30">
              <p className="text-muted-foreground">
                No workspaces found. Click "New Workspace" to start syncing.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workspaces.map((workspace) => (
                <WorkspaceCard
                  key={workspace.id}
                  workspace={workspace}
                  onClick={() => navigate(`/workspaces/${workspace.id}`)} 
                  onDelete={()=> { deleteWorkspace(workspace.id); }}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* --- Modal Overlay --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground">
                {createdWorkspaceId ? "Workspace Created!" : "Create New Workspace"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Conditional Content: Form vs Success Screen */}
            {!createdWorkspaceId ? (
              <form onSubmit={handleCreateSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="workspace-name" className="block text-sm font-medium text-foreground mb-1.5">
                      Workspace Name
                    </label>
                    <input
                      id="workspace-name"
                      type="text"
                      autoFocus
                      value={newWorkspaceName}
                      onChange={(e) => setNewWorkspaceName(e.target.value)}
                      placeholder="e.g. My Web Server Project"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <Button type="button" variant="ghost" onClick={handleCloseModal} disabled={isCreating}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!newWorkspaceName.trim() || isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Workspace'
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              // Success State
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Your workspace is ready. Paste this ID into your local <code className="text-primary bg-primary/10 px-1 py-0.5 rounded">ew.config</code> file to start syncing.
                </p>
                
                <div className="flex items-center justify-between bg-muted/50 border border-border rounded-md p-3">
                  <code className="text-sm font-mono text-foreground break-all mr-3">
                    {createdWorkspaceId}
                  </code>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    size="sm" 
                    onClick={handleCopyId}
                    className="shrink-0"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button type="button" onClick={handleCloseModal}>
                    Done
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}