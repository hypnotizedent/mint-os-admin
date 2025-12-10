import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FolderOpen, File, FilePdf, FileImage, FileText, Upload, MagnifyingGlass, DotsThree, CaretLeft, House, DownloadSimple } from "@phosphor-icons/react"
import type { FileItem } from "@/lib/types"
import { toast } from "sonner"

interface FilesPageProps {
  files: FileItem[]
}

export function FilesPage({ files: initialFiles = [] }: FilesPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPath, setCurrentPath] = useState("/")
  const [files, setFiles] = useState<FileItem[]>(initialFiles)
  const [folders, setFolders] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch files from MinIO via API
  const fetchFiles = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // TODO: Add authentication headers when auth is implemented
      // const token = getAuthToken();
      // const headers = { 'Authorization': `Bearer ${token}` };
      const response = await fetch(`${API_BASE}/api/files?path=${encodeURIComponent(currentPath)}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch files')
      }
      
      const result = await response.json()
      
      if (result.success && result.data) {
        setFiles(result.data.files || [])
        setFolders(result.data.folders || [])
      } else {
        throw new Error(result.error || 'Failed to load files')
      }
    } catch (err) {
      console.error('Error fetching files:', err)
      setError(err instanceof Error ? err.message : 'Failed to load files')
      setFiles([])
      setFolders([])
    } finally {
      setLoading(false)
    }
  }, [currentPath])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FilePdf size={24} weight="fill" className="text-destructive" />
    if (type.includes('image')) return <FileImage size={24} weight="fill" className="text-cyan" />
    return <FileText size={24} weight="fill" className="text-primary" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // Get files for current path
  // TODO: Implement MinIO/S3 folder navigation API
  // Expected API: GET /api/files?folder=${encodeURIComponent(currentPath)}
  // Expected response: { data: FileItem[], meta: { folder: string, totalSize: number } }
  // Auth: Should use same auth token as other API calls
  // For now, folder navigation shows empty state. Files prop only works at root level.
  const currentFiles = currentPath === '/' 
    ? files 
    : [] // Empty until folder-based file API is implemented

  const filteredFiles = currentFiles.filter(file =>
    searchQuery === "" ||
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleFolderClick = (folderName: string) => {
    const newPath = currentPath === '/' ? `/${folderName}` : `${currentPath}/${folderName}`
    setCurrentPath(newPath)
    toast.success(`Opened ${folderName} folder`)
  }

  const handleNavigateUp = () => {
    const parts = currentPath.split('/').filter(p => p)
    if (parts.length > 0) {
      parts.pop()
      setCurrentPath(parts.length > 0 ? `/${parts.join('/')}` : '/')
    }
  }

  const handleDownload = async (file: FileItem) => {
    try {
      const response = await fetch(`${API_BASE}/api/files/download?path=${encodeURIComponent(file.path)}`)
      
      if (!response.ok) {
        throw new Error('Failed to get download URL')
      }
      
      const result = await response.json()
      
      if (result.success && result.data?.url) {
        // Create a temporary anchor element for secure download
        const link = document.createElement('a')
        link.href = result.data.url
        link.download = file.name
        link.rel = 'noopener noreferrer' // Security: prevent window.opener access
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        toast.success(`Downloading ${file.name}`)
      } else {
        throw new Error(result.error || 'Failed to get download URL')
      }
    } catch (err) {
      console.error('Error downloading file:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to download file')
    }
  }

  const isInSubfolder = currentPath !== "/"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Files</h1>
          <p className="text-muted-foreground mt-1">Browse and manage your print shop files</p>
        </div>
        <Button className="gap-2">
          <Upload size={18} weight="bold" />
          Upload Files
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isInSubfolder && (
            <Button variant="ghost" size="sm" onClick={handleNavigateUp} className="mr-2 -ml-2">
              <CaretLeft size={16} className="mr-1" />
              Back
            </Button>
          )}
          <button 
            onClick={() => setCurrentPath("/")}
            className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
          >
            <House size={18} weight="fill" className="text-primary" />
            <span className="font-medium text-foreground">Home</span>
          </button>
          {isInSubfolder && (
            <>
              <span>/</span>
              <span className="font-medium text-foreground">{currentPath.slice(1)}</span>
            </>
          )}
        </div>
      </Card>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading && (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading files...</p>
          </div>
        </Card>
      )}

      {error && (
        <Card className="p-12 text-center border-destructive">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-destructive/10">
              <File size={48} className="text-destructive" />
            </div>
            <div>
              <p className="font-medium text-foreground">Error loading files</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
            <Button onClick={fetchFiles}>
              Try Again
            </Button>
          </div>
        </Card>
      )}

      {!loading && !error && folders.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Folders</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {folders.map((folderName) => (
              <Card
                key={folderName}
                className="p-6 hover:shadow-lg hover:border-primary transition-all cursor-pointer group"
                onClick={() => handleFolderClick(folderName)}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="p-4 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <FolderOpen size={32} weight="fill" className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {folderName}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!loading && !error && filteredFiles.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {isInSubfolder ? `Files in ${currentPath.slice(1)}` : 'Recent Files'}
          </h2>
          <Card>
            <div className="divide-y divide-border">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-4 hover:bg-muted/50 transition-colors group flex items-center gap-4"
                >
                  <div className="flex-shrink-0">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      {file.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>Uploaded {new Date(file.uploadedAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>By {file.uploadedBy || 'Unknown'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {file.jobId && (
                      <span className="text-xs px-2 py-1 rounded bg-cyan/10 text-cyan font-medium">
                        Job #{file.jobId.slice(0, 8)}
                      </span>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDownload(file)}
                      title="Download file"
                    >
                      <DownloadSimple size={20} weight="bold" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <DotsThree size={20} weight="bold" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {!loading && !error && filteredFiles.length === 0 && folders.length === 0 && (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-muted">
              <File size={48} className="text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">No files found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery ? "Try a different search term" : "Upload some files to get started"}
              </p>
            </div>
            <Button>
              <Upload size={18} weight="bold" className="mr-2" />
              Upload Files
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
