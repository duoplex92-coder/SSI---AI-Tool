import React from 'react';
import { FinalizedPostData, MediaStatus, GeneratedMedia } from '../types';
import { Loader2, Image as ImageIcon, Video as VideoIcon, CheckCircle2, Copy } from 'lucide-react';

interface PostPreviewProps {
  data: FinalizedPostData;
  mediaStatus: MediaStatus;
  generatedMedia: GeneratedMedia;
  onGenerateImage: () => void;
  onGenerateVideo: () => void;
}

export const PostPreview: React.FC<PostPreviewProps> = ({
  data,
  mediaStatus,
  generatedMedia,
  onGenerateImage,
  onGenerateVideo
}) => {
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 border-l border-slate-800 overflow-y-auto custom-scrollbar">
      <div className="p-6 border-b border-slate-800 bg-slate-900/50 sticky top-0 backdrop-blur-md z-10">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <CheckCircle2 className="text-emerald-500" />
          Finalized Strategy
        </h2>
        <p className="text-slate-400 text-sm mt-1">Ready for production</p>
      </div>

      <div className="p-6 space-y-8">
        
        {/* Text Content Section */}
        <section className="space-y-4">
          <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider">Caption</h3>
              <button 
                onClick={() => copyToClipboard(data.content_caption)}
                className="text-slate-500 hover:text-white transition-colors"
                title="Copy caption"
              >
                <Copy size={16} />
              </button>
            </div>
            <p className="text-slate-100 whitespace-pre-wrap font-medium">{data.content_caption}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {data.hashtags.map(tag => (
                <span key={tag} className="text-indigo-400 text-sm">{tag}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Media Generation Section */}
        <section className="space-y-6">
          <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider">Visual Assets</h3>

          {/* Image Generator */}
          <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
              <div className="flex items-center gap-2 text-slate-200 font-medium">
                <ImageIcon size={18} className="text-pink-500" />
                <span>Image (Imagen 3)</span>
              </div>
              {mediaStatus.image === 'idle' && (
                <button 
                  onClick={onGenerateImage}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-md transition-colors"
                >
                  Generate
                </button>
              )}
            </div>
            
            <div className="relative min-h-[200px] flex items-center justify-center bg-slate-900">
              {mediaStatus.image === 'loading' && (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="animate-spin text-indigo-500" size={32} />
                  <span className="text-slate-400 text-sm">Generating Image...</span>
                </div>
              )}
              {mediaStatus.image === 'error' && (
                <div className="text-red-400 text-sm px-4 text-center">Failed to generate image. Try again.</div>
              )}
              {mediaStatus.image === 'success' && generatedMedia.imageUrl && (
                <img 
                  src={generatedMedia.imageUrl} 
                  alt="Generated content" 
                  className="w-full h-auto object-cover animate-in fade-in duration-500"
                />
              )}
              {mediaStatus.image === 'idle' && (
                <div className="p-4 text-slate-500 text-sm italic text-center">
                  Prompt: "{data.image_prompt}"
                </div>
              )}
            </div>
          </div>

          {/* Video Generator */}
          <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
              <div className="flex items-center gap-2 text-slate-200 font-medium">
                <VideoIcon size={18} className="text-blue-500" />
                <span>Video (Veo)</span>
              </div>
              {mediaStatus.video === 'idle' && (
                <button 
                  onClick={onGenerateVideo}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-md transition-colors"
                >
                  Generate
                </button>
              )}
            </div>
            
            <div className="relative min-h-[200px] flex items-center justify-center bg-slate-900">
              {mediaStatus.video === 'loading' && (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="animate-spin text-blue-500" size={32} />
                  <span className="text-slate-400 text-sm">Generating Video (this takes a moment)...</span>
                </div>
              )}
              {mediaStatus.video === 'error' && (
                <div className="text-red-400 text-sm px-4 text-center">Failed to generate video. Ensure you have a paid key selected.</div>
              )}
              {mediaStatus.video === 'success' && generatedMedia.videoUrl && (
                <video 
                  src={generatedMedia.videoUrl} 
                  controls 
                  autoPlay
                  loop
                  className="w-full h-auto object-cover max-h-[400px] animate-in fade-in duration-500"
                />
              )}
              {mediaStatus.video === 'idle' && (
                <div className="p-4 text-slate-500 text-sm italic text-center">
                   Prompt: "{data.video_prompt}"
                </div>
              )}
            </div>
          </div>

        </section>
      </div>
    </div>
  );
};