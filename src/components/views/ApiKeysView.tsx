import { useState } from 'react';
import { Plus, Trash2, Copy, Check, KeyRound, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ScrollArea } from '../ui/ScrollArea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/Tooltip';
import { ApiKey } from '../../types';
// 1. Import your custom hook and types!
import { useApiKeys } from '../../hooks/useApiKeys';

function truncateKey(key: string): string {
  if (!key) return '';
  return `${key.substring(0, 12)}${'•'.repeat(20)}${key.substring(key.length - 4)}`;
}

export function ApiKeysView() {
  // 2. Consume the hook
  const { apiKeys, isLoading, error, refetch } = useApiKeys();

  // Component State
  const [deleteTarget, setDeleteTarget] = useState<ApiKey | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<ApiKey | null>(null);
  
  // Track loading state for our POST/DELETE actions
  const [isMutating, setIsMutating] = useState(false); 

  // 3. Update Delete to hit the backend
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsMutating(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/keys/${deleteTarget.id}`, {
        method: 'DELETE',
        credentials: 'include' // Important if using cookies!
      });

      if (!response.ok) throw new Error('Failed to delete key');

      // Refresh the table!
      await refetch();
      
      setRevealedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteTarget.id);
        return next;
      });
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      // Optional: Add a toast notification here to show the error
    } finally {
      setIsMutating(false);
    }
  };

  // 4. Update Create to hit the backend
  const handleCreate = async () => {
    if (!newKeyName.trim()) return;
    setIsMutating(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          name: newKeyName.trim(),
          workspaceId: 'ALL' // Or pass a specific ID if you want scoped keys
        })
      });

      if (!response.ok) throw new Error('Failed to create API key');

      const newKeyData = await response.json();
      
      // Refresh the table to show the new key in the list
      await refetch(); 
      
      // Show the success dialog with the newly generated raw key string
      setCreatedKey(newKeyData); 
      setNewKeyName('');
      setShowCreateDialog(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsMutating(false);
    }
  };

  const handleCopy = (keyString: string, id: string) => {
    navigator.clipboard.writeText(keyString);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // UI Loading State (Initial Fetch)
  if (isLoading && apiKeys.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // UI Error State
  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-destructive">
        Error loading API Keys: {error}
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="h-full w-full">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground">
                API Keys
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your API keys for CLI authentication.
              </p>
            </div>
            <Button
              className="shadow-sm"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add API Key
            </Button>
          </div>

          {apiKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <KeyRound className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">
                No API keys yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Create an API key to authenticate your CLI with CollabMate.
              </p>
            </div>
          ) : (
            <div className="rounded-md border border-border/60 bg-card overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent border-border/60">
                    <TableHead>Name</TableHead>
                    <TableHead className="w-[35%]">Key</TableHead>
                    <TableHead>Workspace</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((apiKey) => (
                    <TableRow key={apiKey.id} className="hover:bg-muted/30 border-border/40 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <KeyRound className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">
                            {/* Assumes 'name' is added to your ApiKey interface */}
                            {apiKey.name || 'Untitled Key'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        <span className="select-all">
                          {/* Mapped to keyString to match your hook interface */}
                          {revealedIds.has(apiKey.id) ? apiKey.keyString : truncateKey(apiKey.keyString)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-xs font-normal">
                          {apiKey.workspaceId === 'ALL' ? 'All Workspaces' : apiKey.workspaceId}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(apiKey.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <TooltipProvider delayDuration={300}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  onClick={() => toggleReveal(apiKey.id)}
                                >
                                  {revealedIds.has(apiKey.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {revealedIds.has(apiKey.id) ? 'Hide' : 'Reveal'}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider delayDuration={300}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  onClick={() => handleCopy(apiKey.keyString, apiKey.id)}
                                >
                                  {copiedId === apiKey.id ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {copiedId === apiKey.id ? 'Copied!' : 'Copy key'}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider delayDuration={300}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  onClick={() => setDeleteTarget(apiKey)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete key</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !isMutating) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete API Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-medium text-foreground">
                {deleteTarget?.name}
              </span>
              ? Any applications using this key will lose access immediately.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isMutating}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isMutating}>
              {isMutating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              {isMutating ? 'Deleting...' : 'Delete Key'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create API Key Confirmation Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => !isMutating && setShowCreateDialog(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New API Key</DialogTitle>
            <DialogDescription>
              This will generate a new API key for CLI authentication. Give it a
              descriptive name so you can identify it later.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Key Name
            </label>
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="e.g. Production Deploy Key"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
              }}
              disabled={isMutating}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setNewKeyName('');
              }}
              disabled={isMutating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isMutating || !newKeyName.trim()}>
              {isMutating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              {isMutating ? 'Creating...' : 'Create Key'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Newly Created Key Dialog */}
      <Dialog
        open={createdKey !== null}
        onOpenChange={(open) => {
          if (!open) setCreatedKey(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Created</DialogTitle>
            <DialogDescription>
              Your new API key has been created. Copy it now — you won't be able
              to see the full key again.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium text-foreground mb-2 block">
              {createdKey?.name}
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-md border border-border bg-muted/50 px-3 py-2 font-mono text-xs text-foreground break-all">
                {/* Note: In a real app, the backend should only ever send this raw key ONCE during creation! */}
                {createdKey?.keyString}
              </code>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => {
                  if (createdKey) handleCopy(createdKey.keyString, createdKey.id);
                }}
              >
                {copiedId === createdKey?.id ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setCreatedKey(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}