import { useState } from 'react';
import { Folder, FileCode2, MoreVertical, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Workspace } from '../types';

interface WorkspaceCardProps {
  workspace: Workspace;
  onClick: () => void;
  onDelete: (id: number | string) => void; 
}

export function WorkspaceCard({ workspace, onClick, onDelete }: WorkspaceCardProps) {
  const isUpToDate = workspace.status === 'UP_TO_DATE';
  
  // 2. State to manage the dropdown menu visibility
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 3. Handlers with stopPropagation to prevent navigating when interacting with the menu
  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    onDelete(workspace.id);
  };

  return (
    <Card
      className="group relative cursor-pointer transition-all duration-200 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5 border-border/60 hover:border-border bg-card"
      onClick={onClick}
    >
      <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0 relative">
        <div className="flex items-center space-x-3 w-full pr-8">
          <div className="p-2 bg-primary/10 rounded-md text-primary group-hover:bg-primary/20 transition-colors shrink-0">
            <Folder className="h-5 w-5" />
          </div>
          <CardTitle className="text-base font-medium font-heading tracking-tight truncate">
            {workspace.name}
          </CardTitle>
        </div>

        {/* 4. The 3-Dots Menu Button */}
        <div className="absolute right-4 top-4">
          <button 
            onClick={handleMenuToggle}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus:outline-none"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <>
              {/* Invisible overlay to close menu when clicking outside */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                }} 
              />
              
              {/* The actual menu */}
              <div className="absolute right-0 mt-1 w-36 bg-popover border border-border rounded-md shadow-lg z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <button 
                  onClick={handleDeleteClick}
                  className="w-full text-left px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 flex items-center transition-colors focus:outline-none"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> 
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <FileCode2 className="mr-1.5 h-4 w-4" />
            <span>{workspace?.fileCount || 0} files</span>
          </div>
          <Badge
            variant="outline"
            className={`font-normal border-0 ${
              isUpToDate 
                ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25' 
                : 'bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25'
            }`}
          >
            <span
              className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                isUpToDate ? 'bg-emerald-400' : 'bg-yellow-400'
              }`}
            ></span>
            {isUpToDate ? 'Up to date' : 'Pending Sync'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}