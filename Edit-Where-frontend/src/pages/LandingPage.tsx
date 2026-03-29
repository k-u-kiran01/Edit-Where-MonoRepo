import { ArrowRight, Shield, Zap, FolderGit2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export function LandingPage() {
  const navigate = useNavigate();
  const onLoginClick = ()=>{
    navigate('/login');
  }
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="flex h-16 items-center justify-between px-6 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <div className="h-5 w-5" />
          </div>
          <span className="font-heading text-lg font-bold tracking-tight">
            CollabMate
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onLoginClick}>
            Log in
          </Button>
          <Button onClick={()=>{navigate('/download')}}>Get Started</Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        
        <h1 className="max-w-4xl font-heading text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Sync your local CLI files with the cloud.{' '}
          <span className="text-muted-foreground">Instantly.</span>
        </h1>

        <p className="max-w-2xl text-lg md:text-xl text-muted-foreground mb-10">
          The developer-first tool for managing workspaces, tracking file
          changes, and securely sharing API keys across your team.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-24">
          <Button
            size="lg"
            className="w-full sm:w-auto text-base h-12 px-8"
            onClick={onLoginClick}>
            
            Start for free <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto text-base h-12 px-8"
            onClick={()=>{navigate('/download')}}>
            
            Get Started
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full text-left">
          <div className="p-6 rounded-2xl border border-border/50 bg-card/50">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <FolderGit2 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Workspace Management</h3>
            <p className="text-muted-foreground">
              Organize your projects into workspaces. Track file counts, sync
              status, and manage everything from one dashboard.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-border/50 bg-card/50">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Easy Sync</h3>
            <p className="text-muted-foreground">
              Can sync in between Local and Cloud with simple command
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-border/50 bg-card/50">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Secure API Keys</h3>
            <p className="text-muted-foreground">
              Generate, manage, and revoke API keys for your workspaces with
              enterprise-grade security built in.
            </p>
          </div>
        </div>
      </main>
    </div>);

}