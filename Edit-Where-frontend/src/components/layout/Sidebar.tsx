
import { useLocation, useNavigate } from 'react-router-dom'; // ⚡ Added Router Hooks
import {
  FolderGit2,
  KeyRound,
  Settings,
  PanelLeftClose,
  PanelLeftOpen 
} from 'lucide-react';
import { Button } from '../ui/Button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '../ui/Tooltip';

// ⚡ Simplified Props! No more activeView or onNavigate needed
interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // ⚡ Added explicit paths for React Router
  const navItems = [
    { id: 'workspaces', label: 'Workspaces', icon: FolderGit2, path: '/workspaces' },
    { id: 'api-keys', label: 'API Keys', icon: KeyRound, path: '/api-keys' },
    // { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' }
  ];

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={`flex h-[calc(100vh-4rem)] flex-col border-r border-border bg-card transition-all duration-300 ease-in-out ${collapsed ? 'w-16' : 'w-64'}`}>
        
        <div className="flex items-center justify-end p-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => {
            // ⚡ Determine active state dynamically based on the current URL
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            
            const NavButton = (
              <Button
                key={item.id}
                variant={isActive ? 'secondary' : 'ghost'}
                className={`w-full justify-start ${collapsed ? 'px-2' : 'px-3'} ${isActive ? 'bg-secondary/50 font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                onClick={() => navigate(item.path)} // ⚡ Navigate using React Router
              >
                <Icon className={`h-4 w-4 ${collapsed ? 'mx-auto' : 'mr-3'} ${isActive ? 'text-primary' : ''}`} />
                {!collapsed && <span>{item.label}</span>}
              </Button>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.id} placement="right">
                  <TooltipTrigger asChild>{NavButton}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }
            return NavButton;
          })}
        </nav>

        {!collapsed && (
          <div className="p-4 mt-auto">
            {/* <div className="rounded-lg bg-muted/50 p-4 border border-border/50">
              <p className="text-xs font-medium text-foreground mb-1">
                CollabMate CLI
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                v2.4.1 is available
              </p>
              <Button variant="outline" size="xs" className="w-full text-xs h-7">
                Update Now
              </Button>
            </div> */}
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}