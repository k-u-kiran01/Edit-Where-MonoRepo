
import { Search } from 'lucide-react';
import { Input } from '../ui/Input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar';
interface TopNavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onLogout: () => void;
}
export function TopNavbar({
  searchQuery,
  onSearchChange,
  onLogout
}: TopNavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <div className="h-5 w-5" />
        </div>
        <span className="font-heading text-lg font-semibold tracking-tight">
          CollabMate
        </span>
      </div>

      <div className="flex flex-1 items-center justify-center px-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search workspaces..."
            className="w-full bg-muted/50 pl-9 border-border focus-visible:ring-primary/50"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)} />
          
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onLogout}
          className="text-sm text-muted-foreground hover:text-foreground mr-2">
          
          Log out
        </button>
        <Avatar className="h-8 w-8 border border-border cursor-pointer hover:opacity-80 transition-opacity">
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>DV</AvatarFallback>
        </Avatar>
      </div>
    </header>);

}