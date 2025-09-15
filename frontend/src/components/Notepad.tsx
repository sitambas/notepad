import { useState, useCallback, useEffect } from "react";
import { FileText, Save, Lock, Share2, Download, Settings, Mic, Volume2, Plus, Edit, User, Lightbulb, Wrench, SpellCheck, Type, Upload, Image, FileSpreadsheet, Presentation, File, Trash2, LogIn } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SimpleEncryption, NoteStorage } from "@/utils/encryption";
import { notepadAPI, type NoteData } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";
import PasswordModal from "./PasswordModal";
import ShareModal from "./ShareModal";
import TextToSpeech from "./TextToSpeech";
import SpeechToText from "./SpeechToText";
import FileUpload from "./FileUpload";
import Login from "./auth/Login";
import Register from "./auth/Register";
import { toast } from "sonner";

interface NotepadProps {
  noteId?: string;
}

const Notepad = ({ noteId: propNoteId }: NotepadProps) => {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [isMonospace, setIsMonospace] = useState(false);
  const [spellCheck, setSpellCheck] = useState(true);
  const [isSaved, setIsSaved] = useState(true);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState("");
  const [noteId, setNoteId] = useState("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isFileUploadModalOpen, setIsFileUploadModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  // Initialize note ID and load existing content
  useEffect(() => {
    const loadNote = async () => {
      if (propNoteId && propNoteId !== '') {
        // Use the prop note ID (from URL parameter)
        setNoteId(propNoteId);
        
        try {
          // Try to load existing note data from API
          const response = await notepadAPI.loadNote(propNoteId);
          if (response.success) {
            setText(response.pad || "");
            setIsPasswordProtected(response.pw === '1');
            setIsMonospace(response.monospace === '1');
            
            // Load files from backend
            if (response.files && response.files.length > 0) {
              console.log('Loading files from backend:', response.files);
              setUploadedFiles(response.files);
            } else {
              console.log('No files found in backend response');
              setUploadedFiles([]);
            }
            
            if (response.pw === '1') {
              // Note is encrypted, show password modal
              setIsPasswordModalOpen(true);
              setText(""); // Clear text until decrypted
            }
          } else {
            // Note doesn't exist yet, start with empty text
            setText("");
            setIsPasswordProtected(false);
            setPassword("");
            setUploadedFiles([]);
          }
        } catch (error) {
          console.error('Failed to load note:', error);
          // Fallback to empty note
          setText("");
          setIsPasswordProtected(false);
          setPassword("");
          setUploadedFiles([]);
        }
      } else {
        // No prop note ID, create new note with random ID
        const currentNoteId = NoteStorage.generateNoteId();
        setNoteId(currentNoteId);
        const newUrl = `${window.location.origin}/${currentNoteId}`;
        window.history.replaceState({}, '', newUrl);
        
        // Load current note from localStorage as fallback
        const currentNote = NoteStorage.getCurrentNote();
        if (currentNote) {
          setText(currentNote);
        }
      }
    };

    loadNote();
  }, [propNoteId]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setIsSaved(false);
  }, []);

  // Auto-save with API
  useEffect(() => {
    if (!isSaved && text) {
      const timer = setTimeout(async () => {
        try {
          // Save to API
          const noteData: Partial<NoteData> = {
            key: noteId,
            pad: text,
            url: propNoteId || noteId,
            monospace: isMonospace ? '1' : '0',
            caret: 0
          };

          if (isPasswordProtected && password) {
            noteData.pw = password;
          }

          const response = await notepadAPI.saveNote(noteData);
          
          if (response.success) {
            setIsSaved(true);
            // Also save to localStorage as backup
            if (isPasswordProtected && password) {
              const encryptedText = await SimpleEncryption.encrypt(text, password);
              NoteStorage.saveNote(noteId, encryptedText, true, password);
            } else {
              NoteStorage.saveNote(noteId, text, false);
            }
            NoteStorage.saveCurrentNote(text);
          } else {
            console.error('API save failed:', response.error);
            // Fallback to localStorage
            if (isPasswordProtected && password) {
              const encryptedText = await SimpleEncryption.encrypt(text, password);
              NoteStorage.saveNote(noteId, encryptedText, true, password);
            } else {
              NoteStorage.saveNote(noteId, text, false);
            }
            NoteStorage.saveCurrentNote(text);
            setIsSaved(true);
          }
        } catch (error) {
          console.error('Save failed:', error);
          // Fallback to localStorage
          try {
            if (isPasswordProtected && password) {
              const encryptedText = await SimpleEncryption.encrypt(text, password);
              NoteStorage.saveNote(noteId, encryptedText, true, password);
            } else {
              NoteStorage.saveNote(noteId, text, false);
            }
            NoteStorage.saveCurrentNote(text);
        setIsSaved(true);
          } catch (fallbackError) {
            console.error('Fallback save failed:', fallbackError);
            toast.error('Failed to save note');
          }
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [text, isSaved, isPasswordProtected, password, noteId, isMonospace, propNoteId]);

  const handlePasswordSet = async (newPassword: string) => {
    try {
      // Save to API with password
      const noteData: Partial<NoteData> = {
        key: noteId,
        pad: text,
        pw: newPassword,
        url: propNoteId || noteId,
        monospace: isMonospace ? '1' : '0',
        caret: 0
      };

      const response = await notepadAPI.saveNote(noteData);
      
      if (response.success) {
        // Also save to localStorage as backup
        if (text) {
          const encryptedText = await SimpleEncryption.encrypt(text, newPassword);
          NoteStorage.saveNote(noteId, encryptedText, true, newPassword);
        }
        setPassword(newPassword);
        setIsPasswordProtected(true);
        setIsPasswordModalOpen(false);
        toast.success('Note is now password protected');
      } else {
        throw new Error(response.error || 'Failed to save with password');
      }
    } catch (error) {
      console.error('Failed to set password:', error);
      toast.error('Failed to set password');
    }
  };

  const handlePasswordRemove = async () => {
    try {
      // Save to API without password
      const noteData: Partial<NoteData> = {
        key: noteId,
        pad: text,
        url: propNoteId || noteId,
        monospace: isMonospace ? '1' : '0',
        caret: 0
      };

      const response = await notepadAPI.saveNote(noteData);
      
      if (response.success) {
        // Also save to localStorage as backup
        NoteStorage.saveNote(noteId, text, false);
        setPassword("");
        setIsPasswordProtected(false);
        toast.success('Password protection removed');
      } else {
        throw new Error(response.error || 'Failed to remove password');
      }
    } catch (error) {
      console.error('Failed to remove password:', error);
      // Fallback to localStorage
      NoteStorage.saveNote(noteId, text, false);
      setPassword("");
      setIsPasswordProtected(false);
      toast.success('Password protection removed (saved locally)');
    }
  };

  const handleDecrypt = async (decryptPassword: string) => {
    try {
      setIsDecrypting(true);
      
      // Try to load from API with password
      const response = await notepadAPI.loadNote(noteId, decryptPassword);
      
      if (response.success) {
        setText(response.pad || "");
        setPassword(decryptPassword);
        setIsPasswordProtected(true);
        setIsPasswordModalOpen(false);
        toast.success('Note decrypted successfully');
      } else {
        throw new Error(response.error || 'Invalid password');
      }
    } catch (error) {
      console.error('Decrypt failed:', error);
      toast.error('Failed to decrypt note. Check your password.');
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const handleFileUpload = () => {
    setIsFileUploadModalOpen(true);
  };

  const handleFilesUploaded = async (files: File[]) => {
    try {
      // Upload files to backend
      const result = await notepadAPI.uploadFiles(noteId, files);
      
      if (result.success && result.files) {
        console.log('Files uploaded successfully:', result.files);
        // Add backend file data directly to uploaded files
        setUploadedFiles(prev => [...prev, ...result.files]);
        // Add file references to the text content
        const fileReferences = files.map(file => `[File: ${file.name}]`).join('\n');
        setText(prev => prev + (prev ? '\n\n' : '') + fileReferences);
        setIsSaved(false);
        
        toast.success(`${files.length} file(s) uploaded successfully`);
      } else {
        console.error('Upload failed:', result);
        toast.error(result.error || 'Failed to upload files');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    }
  };

  const handleFileRemove = async (index: number) => {
    const fileToRemove = uploadedFiles[index];
    
    // If file has backend ID, delete from backend
    if (fileToRemove.id) {
      try {
        await notepadAPI.deleteFile(fileToRemove.id);
        toast.success('File deleted successfully');
      } catch (error) {
        console.error('Error deleting file from backend:', error);
        toast.error('Failed to delete file from server');
      }
    }
    
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setIsSaved(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (file: any) => {
    const type = file.mimeType || file.type;
    if (type.includes("image")) return <Image className="h-5 w-5 text-blue-500" />;
    if (type.includes("pdf")) return <FileText className="h-5 w-5 text-red-500" />;
    if (type.includes("word") || type.includes("document")) return <FileText className="h-5 w-5 text-blue-600" />;
    if (type.includes("excel") || type.includes("spreadsheet")) return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    if (type.includes("powerpoint") || type.includes("presentation")) return <Presentation className="h-5 w-5 text-orange-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const handleTogglePassword = (enabled: boolean) => {
    if (enabled) {
      setIsPasswordModalOpen(true);
    } else {
      handlePasswordRemove();
    }
  };


  const handleSpeechTranscript = (transcript: string) => {
    setText(prev => prev + (prev ? ' ' : '') + transcript);
  };

  const handleNewNote = () => {
    // Generate new note ID
    const newNoteId = NoteStorage.generateNoteId();
    setNoteId(newNoteId);
    
    // Clear current text
    setText("");
    
    // Reset states
    setIsPasswordProtected(false);
    setPassword("");
    
    // Update URL with new note ID
    const newUrl = `${window.location.origin}/${newNoteId}`;
    window.history.pushState({}, '', newUrl);
    
    // Clear current note from storage
    NoteStorage.saveCurrentNote("");
    
    toast.success('New note created');
  };

  const exportAsHTML = () => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Notepad Export</title>
    <style>
        body { font-family: ${isMonospace ? 'monospace' : 'sans-serif'}; padding: 20px; }
        .content { white-space: pre-wrap; }
    </style>
</head>
<body>
    <h1>Notepad Export</h1>
    <div class="content">${text}</div>
</body>
</html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notepad-export-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Note exported as HTML');
  };

  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const charCount = text.length;

  return (
    <div className="h-screen w-screen bg-background flex flex-col">
      <div className="h-full w-full flex flex-col p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {propNoteId ? `Notepad - ${propNoteId}` : 'Notepad'}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="stats-badge">
                  {wordCount} {wordCount === 1 ? 'word' : 'words'}
                </span>
                <span>•</span>
                <span className="stats-badge">
                  {charCount} {charCount === 1 ? 'character' : 'characters'}
                </span>
                <span>•</span>
                <div className="flex items-center gap-2">
                  {isSaved ? (
                    <>
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span className="text-success">Saved</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3 h-3 text-muted-foreground animate-spin" />
                      <span className="text-muted-foreground">Saving...</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
            {/* Left side - Main actions */}
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNewNote}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>New Note</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="h-8 w-8 p-0"
                  >
                    <Lock className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isPasswordProtected ? "Password Protected" : "Set Password"}</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Change Url</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setIsLoginModalOpen(true)}
                  >
                    <User className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{user ? 'User Profile' : 'Sign In'}</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Center - Text controls */}
            <div className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSpellCheck(!spellCheck)}
                    className={`h-8 w-8 p-0 transition-colors ${
                      spellCheck 
                        ? 'text-primary' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <SpellCheck className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Spell Check {spellCheck ? '(ON)' : '(OFF)'}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMonospace(!isMonospace)}
                    className={`h-8 w-8 p-0 transition-colors ${
                      isMonospace 
                        ? 'text-primary' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Type className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Monospace {isMonospace ? '(ON)' : '(OFF)'}</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Right side - Tools */}
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Lightbulb className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle Theme</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Wrench className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Settings</p>
                </TooltipContent>
              </Tooltip>
              
              {/* <TextToSpeech text={text} /> */}
              {/* <SpeechToText onTranscript={handleSpeechTranscript} /> */}
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFileUpload}
                    className="h-8 w-8 p-0"
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upload Files</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="h-8 w-8 p-0"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share Note</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={exportAsHTML}
                    className="h-8 w-8 p-0"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export as HTML</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex gap-6 flex-1">
          {/* Editor - 90% width */}
          <div className="flex-1">
        <div className="notepad-container h-full relative">
          <textarea
            className={`notepad-textarea h-full ${isMonospace ? 'monospace' : ''}`}
            placeholder="Start typing your notes..."
            value={text}
            onChange={handleTextChange}
            spellCheck={spellCheck}
          />
        </div>
          </div>

          {/* Uploaded Files - 20% width - Only show if files exist */}
          {uploadedFiles.length > 0 && (
            <div className="w-[20%] min-w-[200px] border-l border-muted-foreground/20 pl-4 flex flex-col">
              <div className="space-y-2 h-full flex flex-col">
                <h4 className="text-sm font-medium text-center">
                  Uploaded Files ({uploadedFiles.length})
                </h4>
                <div className="flex flex-col gap-2 overflow-y-auto">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center p-3 bg-muted/30 rounded-lg w-full shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex-shrink-0">
                            {getFileIcon(file)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium truncate" title={file.originalName || file.name}>
                              {file.originalName || file.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // If file has backend ID, download from backend
                              if (file.id) {
                                notepadAPI.downloadFile(file.id);
                              } else {
                                // Fallback to local download
                                const url = URL.createObjectURL(file);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = file.originalName || file.name;
                                a.click();
                                URL.revokeObjectURL(url);
                              }
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFileRemove(index)}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>


      </div>

      {/* Modals */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onConfirm={isPasswordProtected ? handleDecrypt : handlePasswordSet}
        title={isPasswordProtected ? "Decrypt Note" : "Password Protection"}
        description={isPasswordProtected ? "Enter password to decrypt this note" : "Set a password to protect your note"}
        isDecrypt={isPasswordProtected}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        noteId={noteId}
        isPasswordProtected={isPasswordProtected}
        onTogglePassword={handleTogglePassword}
      />

      <FileUpload
        isOpen={isFileUploadModalOpen}
        onOpenChange={setIsFileUploadModalOpen}
        onFilesUploaded={handleFilesUploaded}
        uploadedFiles={uploadedFiles}
        onFileRemove={handleFileRemove}
      />

      {/* Authentication Modals */}
      <Login
        isOpen={isLoginModalOpen}
        onOpenChange={setIsLoginModalOpen}
        onSwitchToRegister={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />

      <Register
        isOpen={isRegisterModalOpen}
        onOpenChange={setIsRegisterModalOpen}
        onSwitchToLogin={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
    </div>
  );
};

export default Notepad;