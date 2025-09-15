import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ChangeUrlModalProps {
  currentUrl: string;
  onConfirm: (newUrl: string) => void;
  onCancel: () => void;
}

const ChangeUrlModal = ({ currentUrl, onConfirm, onCancel }: ChangeUrlModalProps) => {
  const [newUrl, setNewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-populate current URL when modal opens
  useEffect(() => {
    setNewUrl(currentUrl);
  }, [currentUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUrl.trim()) {
      toast.error('Please enter a URL');
      return;
    }
    
    // Basic validation - only allow letters, numbers, hyphens, and underscores
    const cleanUrl = newUrl.trim().replace(/^\/+/, '').replace(/[^a-zA-Z0-9_-]/g, '');
    
    if (!cleanUrl) {
      toast.error('URL can only contain letters, numbers, hyphens, and underscores');
      return;
    }
    
    if (cleanUrl === currentUrl) {
      toast.error('New URL must be different from current URL');
      return;
    }

    if (cleanUrl.length < 3) {
      toast.error('URL must be at least 3 characters long');
      return;
    }

    if (cleanUrl.length > 50) {
      toast.error('URL must be less than 50 characters long');
      return;
    }

    setIsLoading(true);
    try {
      // console.log('Calling onConfirm with cleanUrl:', cleanUrl, 'type:', typeof cleanUrl);
      await onConfirm(cleanUrl);
    } catch (error) {
      console.error('URL change failed:', error);
    } finally {
      setIsLoading(false);
    }

  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow letters, numbers, hyphens, and underscores
    const cleanValue = value.replace(/[^a-zA-Z0-9_-]/g, '');
    setNewUrl(cleanValue);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="current-url">Current URL</Label>
        <Input
          id="current-url"
          value={currentUrl}
          disabled
          className="bg-muted"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-url">New URL</Label>
        <Input
          id="new-url"
          value={newUrl}
          onChange={handleInputChange}
          placeholder="Enter new URL"
          disabled={isLoading}
          maxLength={50}
          required
        />
        <p className="text-xs text-muted-foreground">
          Only letters, numbers, hyphens, and underscores allowed. 3-50 characters.
        </p>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Change URL'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ChangeUrlModal;
