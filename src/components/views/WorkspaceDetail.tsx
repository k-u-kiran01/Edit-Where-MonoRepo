import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, FileCode, FileJson, FileImage,
  File, Folder, ChevronRight, ChevronDown, Loader2, FilePlus, X
} from 'lucide-react';
import { Button } from '../ui/Button';
import { FileItem } from '../../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { ScrollArea } from '../ui/ScrollArea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/Tooltip';

// ⚡ 1. Import your brand new custom hook
import { useWorkspaceDetail } from '../../hooks/useWorkspaceDetail'; 

// ----------------------------------------------------------------------
// Types & Helpers (Unchanged - These are perfect)
// ----------------------------------------------------------------------
interface FolderNode {
  name: string;
  path: string;
  files: FileItem[];
  subfolders: Record<string, FolderNode>;
}

function buildFolderTree(files: FileItem[]): FolderNode {
  const root: FolderNode = { name: '', path: '', files: [], subfolders: {} };
  const sortedFiles = [...files].sort((a, b) => a.filePath.localeCompare(b.filePath));
  
  for (const file of sortedFiles) {
    const parts = file.filePath.split('/');
    if (parts.length === 1) {
      root.files.push(file);
    } else {
      let current = root;
      for (let i = 0; i < parts.length - 1; i++) {
        const folderName = parts[i];
        const folderPath = parts.slice(0, i + 1).join('/');
        if (!current.subfolders[folderName]) {
          current.subfolders[folderName] = { name: folderName, path: folderPath, files: [], subfolders: {} };
        }
        current = current.subfolders[folderName];
      }
      current.files.push(file);
    }
  }
  return root;
}

function getFileIcon(path: string) {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  const codeExts = ['ts', 'tsx', 'js', 'jsx', 'cpp', 'c', 'h', 'go', 'py', 'java'];
  const configExts = ['json', 'yaml', 'yml', 'xml', 'properties', 'toml'];
  const docExts = ['md', 'txt', 'rst'];
  const imageExts = ['png', 'svg', 'jpg', 'jpeg', 'gif', 'webp', 'ico'];
  
  if (codeExts.includes(ext)) return <FileCode className="h-4 w-4 text-blue-400" />;
  if (configExts.includes(ext)) return <FileJson className="h-4 w-4 text-yellow-400" />;
  if (docExts.includes(ext)) return <FileText className="h-4 w-4 text-slate-400" />;
  if (imageExts.includes(ext)) return <FileImage className="h-4 w-4 text-purple-400" />;
  return <File className="h-4 w-4 text-muted-foreground" />;
}

function truncateHash(hash: string) {
  if (!hash) return '';
  return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
}

function countFiles(node: FolderNode): number {
  return node.files.length + Object.values(node.subfolders).reduce((sum, sub) => sum + countFiles(sub), 0);
}

// ----------------------------------------------------------------------
// Sub-Components
// ----------------------------------------------------------------------
function FileRow({ file, depth = 0 }: { file: FileItem; depth?: number }) {
  const fileName = file.filePath.split('/').pop() || file.filePath;
  const navigate = useNavigate();

  return (
    <TableRow className="hover:bg-muted/30 border-border/40 transition-colors">
      <TableCell className="font-mono text-sm">
        <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 16}px` }}>
          {getFileIcon(file.filePath)}
          <span 
            className="truncate max-w-[300px] cursor-pointer hover:text-blue-400 hover:underline" 
            title={file.filePath}
            onClick={() => navigate(`/workspaces/${file.workspaceId}/edit/${file.id}`)}
          >
            {fileName}
          </span>
        </div>
      </TableCell>
      <TableCell className="font-mono text-xs text-muted-foreground">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger className="cursor-default hover:text-foreground transition-colors">
              {truncateHash(file.fileHash)}
            </TooltipTrigger>
            <TooltipContent className="font-mono text-xs">{file.fileHash}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {new Date(file.updatedAt).toLocaleDateString()}
      </TableCell>
      <TableCell className="text-right">
        {/* Actions */}
      </TableCell>
    </TableRow>
  );
}

function FolderSection({ node, depth = 0 }: { node: FolderNode; depth?: number }) {
  const [expanded, setExpanded] = useState(true);
  const totalFiles = countFiles(node);

  return (
    <>
      <TableRow
        className="hover:bg-muted/20 border-border/40 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <TableCell colSpan={4}>
          <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 16}px` }}>
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <Folder className="h-4 w-4 text-blue-400/80" />
            <span className="font-mono text-sm font-medium text-foreground">{node.name}</span>
            <span className="text-xs text-muted-foreground ml-1">
              ({totalFiles} {totalFiles === 1 ? 'file' : 'files'})
            </span>
          </div>
        </TableCell>
      </TableRow>
      
      {expanded && (
        <>
          {Object.values(node.subfolders)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((subfolder) => (
              <FolderSection key={subfolder.path} node={subfolder} depth={depth + 1} />
            ))}
          {node.files
            .sort((a, b) => a.filePath.localeCompare(b.filePath))
            .map((file) => (
              <FileRow key={file.id} file={file} depth={depth + 1} />
            ))}
        </>
      )}
    </>
  );
}

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------
export function WorkspaceDetail() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  
  // ⚡ 2. Destructure everything from the hook! Look how clean this is.
  const { workspace, isLoading, error, createFile, isCreatingFile } = useWorkspaceDetail(workspaceId);

  // ⚡ 3. Local UI state for the modal
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  // ⚡ 4. The Submit Handler
  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    try {
      const newFile = await createFile(newFileName);
      setIsFileModalOpen(false);
      setNewFileName('');
      // Route directly to the new file
      navigate(`/workspaces/${workspaceId}/edit/${newFile.id}`);
    } catch (err) {
      alert("Could not create file. Check console.");
    }
  };

  const folderTree = useMemo(() => {
    return workspace?.files ? buildFolderTree(workspace.files) : null;
  }, [workspace?.files]);

  if (isLoading) return <div className="flex h-full w-full items-center justify-center"><Loader2 className="animate-spin text-primary h-8 w-8"/></div>;
  if (error || !workspace || !folderTree) return <div className="text-destructive p-8">Error: {error || 'Workspace not found'}</div>;

  const isUpToDate = workspace.status === 'UP_TO_DATE';
  const sortedFolders = Object.values(folderTree.subfolders).sort((a, b) => a.name.localeCompare(b.name));
  const sortedRootFiles = [...folderTree.files].sort((a, b) => a.filePath.localeCompare(b.filePath));

  return (
    <>
      <ScrollArea className="h-full w-full">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          
          {/* Header Section */}
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/workspaces')}
              className="text-muted-foreground hover:text-foreground mb-4 -ml-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Workspaces
            </Button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground">
                  {workspace.name}
                </h1>
                <Badge
                  variant="outline"
                  className={`font-normal border-0 ${isUpToDate ? 'bg-emerald-500/15 text-emerald-400' : 'bg-yellow-500/15 text-yellow-400'}`}
                >
                  {workspace.status === 'UP_TO_DATE' ? 'Up to date' : 'Pending Sync'}
                </Badge>
              </div>
              
              {/* ⚡ New File Button */}
              <Button size="sm" onClick={() => setIsFileModalOpen(true)}>
                <FilePlus className="mr-2 h-4 w-4" />
                New File
              </Button>
            </div>
          </div>

          {/* File Tree Table */}
          <div className="rounded-md border border-border/60 bg-card overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-border/60">
                  <TableHead className="w-[40%]">File Path</TableHead>
                  <TableHead>SHA-256 Hash</TableHead>
                  <TableHead>Last Synced</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedFolders.map((folder) => (
                  <FolderSection key={folder.path} node={folder} depth={0} />
                ))}
                {sortedRootFiles.map((file) => (
                  <FileRow key={file.id} file={file} depth={0} />
                ))}
                
                {workspace.files.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No files synced yet. Run the CollabMate CLI to push your project!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </ScrollArea>

      {/* ⚡ New File Modal Overlay */}
      {isFileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground">Create New File</h2>
              <button
                onClick={() => setIsFileModalOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFile}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="file-name" className="block text-sm font-medium text-foreground mb-1.5">
                    File Path & Name
                  </label>
                  <input
                    id="file-name"
                    type="text"
                    autoFocus
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="e.g. /src/utils/api.js"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <Button type="button" variant="ghost" onClick={() => setIsFileModalOpen(false)} disabled={isCreatingFile}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!newFileName.trim() || isCreatingFile}>
                  {isCreatingFile ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                  ) : 'Create File'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
