// ==========================================
// 1. WORKSPACE INTERFACE
// ==========================================
export interface Workspace {
  id: string;             // UUID or database ID
  name: string;           // e.g., "eXpServer_Project"
  userId: string;         // The ID of the logged-in user who owns it
  
  // UI Helpers (These might be calculated by your Express backend)
  status: 'UP_TO_DATE' | 'PENDING_SYNC' | 'ERROR'; 
  fileCount: number;      // Total number of files currently synced
  
  createdAt: string;      // ISO Date string
  updatedAt: string;      // ISO Date string (Updates when CLI pushes)
}

// ==========================================
// 2. FILE ITEM INTERFACE
// ==========================================
export interface FileItem {
  id: string;
  workspaceId: string;    // The workspace this file belongs to
  
  // CLI Sync Data
  filePath: string;       // e.g., "src/main.cpp" (Crucial: Includes the relative folders!)
  fileHash: string;       // The SHA-256 hash your C++ CLI generated
  
  // Editor Data
  content?: string;       // Optional: We only fetch this when opening the FileEditView!
  sizeBytes?: number;     // Optional: Good for showing file sizes in the UI table
  
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 3. API KEY INTERFACE
// ==========================================
export interface ApiKey {
  id: string;
  userId: string;         // The user this key belongs to
  
  name: string;           // e.g., "My Laptop" or "WSL Environment"
  keyString: string;      // The actual token they paste into ew.config
  
  // Optional: If you want to restrict a key to a single workspace
  workspaceId?: string;   
  
  createdAt: string;
  lastUsedAt?: string | null; // Great for security: track when the C++ CLI last connected
}