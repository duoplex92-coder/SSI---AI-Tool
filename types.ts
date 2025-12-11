export interface Message {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export interface FinalizedPostData {
  status: string;
  content_caption: string;
  hashtags: string[];
  image_prompt: string;
  video_prompt: string;
}

export interface MediaStatus {
  image: 'idle' | 'loading' | 'success' | 'error';
  video: 'idle' | 'loading' | 'success' | 'error';
}

export interface GeneratedMedia {
  imageUrl?: string;
  videoUrl?: string;
}

// Global declaration for AI Studio window object
// We augment the AIStudio interface which is expected by the existing window.aistudio declaration
declare global {
  interface AIStudio {
    hasSelectedApiKey(): Promise<boolean>;
    openSelectKey(): Promise<void>;
  }
}
