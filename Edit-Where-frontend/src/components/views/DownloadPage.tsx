import { Monitor, Terminal, Download, FileArchive } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { ScrollArea } from '../ui/ScrollArea';

export function DownloadPage() {
  const windowsLink = import.meta.env.VITE_WINDOWS_CLIENT_DOWNLOAD;
  const linuxLink = import.meta.env.VITE_LINUX_CLIENT_DOWNLOAD;

  return (
    <ScrollArea className="h-full w-full">
      <div className="p-6 md:p-12 max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex p-3 bg-primary/10 rounded-2xl mb-4">
            <FileArchive className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-heading tracking-tight text-foreground mb-4">
            Download Edit-Where CLI
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            To sync your local code with your web workspaces, you need the CollabMate command-line tool. Choose your operating system below to get started.
          </p>
        </div>

        {/* Download Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          
          {/* Windows Card */}
          <Card className="border-border/60 bg-card hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="text-center pb-2 pt-8">
              <div className="mx-auto p-4 bg-blue-500/10 rounded-full w-fit mb-4 text-blue-500">
                <Monitor className="h-10 w-10" />
              </div>
              <CardTitle className="text-2xl font-bold">Windows</CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <p className="text-sm text-muted-foreground mb-8 px-4">
                Requires Windows 10 or 11 (64-bit). Downloads as a standalone executable folder.
              </p>
              <Button 
                className="w-full sm:w-4/5 mx-auto" 
                onClick={() => window.open(windowsLink, '_blank')}
              >
                <Download className="mr-2 h-4 w-4" />
                Download for Windows
              </Button>
            </CardContent>
          </Card>

          {/* Linux Card */}
          <Card className="border-border/60 bg-card hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="text-center pb-2 pt-8">
              <div className="mx-auto p-4 bg-orange-500/10 rounded-full w-fit mb-4 text-orange-500">
                <Terminal className="h-10 w-10" />
              </div>
              <CardTitle className="text-2xl font-bold">Linux</CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <p className="text-sm text-muted-foreground mb-8 px-4">
                Tested on Ubuntu/Debian distributions. Downloads as a compiled binary.
              </p>
              <Button 
                className="w-full sm:w-4/5 mx-auto" 
                onClick={() => window.open(linuxLink, '_blank')}
              >
                <Download className="mr-2 h-4 w-4" />
                Download for Linux
              </Button>
            </CardContent>
          </Card>

        </div>

        {/* Quick Start Guide */}
        <div className="mt-16 max-w-3xl mx-auto border border-border/60 rounded-xl bg-muted/20 p-6 md:p-8">
          <h3 className="text-lg font-semibold text-foreground mb-6">Quick Start Guide</h3>
          <ol className="space-y-6 text-sm text-muted-foreground">
            
            {/* Step 1 */}
            <li className="flex gap-4">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-medium text-xs mt-0.5">1</span>
              <div>
                <p className="font-medium text-foreground mb-1">Place the executable</p>
                <p>Download and extract the client files, then copy the executable directly into your project's root directory.</p>
              </div>
            </li>

            {/* Step 2 */}
            <li className="flex gap-4">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-medium text-xs mt-0.5">2</span>
              <div>
                <p className="font-medium text-foreground mb-1">Get your credentials</p>
                <p>Log in to the web dashboard, create a new Workspace, and generate an API key. Keep both the Workspace ID and API Key handy.</p>
              </div>
            </li>

            {/* Step 3 */}
            <li className="flex gap-4">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-medium text-xs mt-0.5">3</span>
              <div className="w-full">
                <p className="font-medium text-foreground mb-1">Create the config file</p>
                <p className="mb-3">Create a new file named <code className="bg-background border border-border px-1.5 py-0.5 rounded text-foreground">ew.config</code> in your project root. Paste your details and add any file names you want to skip syncing to the IGNORE list:</p>
                <div className="bg-background border border-border rounded-md p-4 overflow-x-auto">
                  <pre className="text-xs text-foreground/80 font-mono leading-relaxed">
{`SERVER_URL=http://localhost:8000
WORKSPACE_ID=9
API_KEY=f66c7797e2d145c6d56a260af918ef76c660700c5da60fbdd78ff772e5f1ae03
IGNORE=[ew.config,ew_client_windows.exe,.env,node_modules]`}
                  </pre>
                </div>
              </div>
            </li>

            {/* Step 4 */}
            <li className="flex gap-4">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-medium text-xs mt-0.5">4</span>
              <div>
                <p className="font-medium text-foreground mb-1">Run the client</p>
                <p className="mb-3">Open your terminal in the project directory and run the executable to sync your code:</p>
                
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <code className="bg-background border border-border px-2 py-1 rounded text-foreground font-mono w-fit">./ew_client_windows.exe push</code>
                    <span className="text-muted-foreground text-xs">Uploads your local files to the web dashboard</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <code className="bg-background border border-border px-2 py-1 rounded text-foreground font-mono w-fit">./ew_client_windows.exe pull</code>
                    <span className="text-muted-foreground text-xs">Downloads web changes back to your machine</span>
                  </div>
                </div>
              </div>
            </li>

          </ol>
        </div>

      </div>
    </ScrollArea>
  );
}