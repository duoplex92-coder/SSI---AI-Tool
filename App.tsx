import React, { useState, useEffect, useRef } from 'react';
import { Message, FinalizedPostData, MediaStatus, GeneratedMedia } from './types';
import { sendMessageToGemini, generateImage, generateVideo } from './services/geminiService';
import { ChatMessage } from './components/ChatMessage';
import { PostPreview } from './components/PostPreview';
import { Send, Sparkles, AlertTriangle, Key } from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [checkingKey, setCheckingKey] = useState(true);
  
  // Post Finalization State
  const [finalizedData, setFinalizedData] = useState<FinalizedPostData | null>(null);
  const [mediaStatus, setMediaStatus] = useState<MediaStatus>({ image: 'idle', video: 'idle' });
  const [generatedMedia, setGeneratedMedia] = useState<GeneratedMedia>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check for API Key on mount
  useEffect(() => {
    const checkKey = async () => {
      try {
        if (window.aistudio) {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setHasApiKey(hasKey);
        }
      } catch (e) {
        console.error("Error checking API key status", e);
      } finally {
        setCheckingKey(false);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    try {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    } catch (e) {
      console.error("Error selecting API key", e);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessageToGemini(userMessage.text);
      
      const botMessage: Message = { 
        role: 'model', 
        text: response.text 
      };
      
      setMessages(prev => [...prev, botMessage]);

      if (response.finalizedData) {
        setFinalizedData(response.finalizedData);
        // Reset media state when new data arrives
        setMediaStatus({ image: 'idle', video: 'idle' });
        setGeneratedMedia({});
      }

    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error. Please try again.', isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleGenerateImage = async () => {
    if (!finalizedData?.image_prompt) return;
    setMediaStatus(prev => ({ ...prev, image: 'loading' }));
    
    try {
      const imageUrl = await generateImage(finalizedData.image_prompt);
      setGeneratedMedia(prev => ({ ...prev, imageUrl }));
      setMediaStatus(prev => ({ ...prev, image: 'success' }));
    } catch (error) {
      setMediaStatus(prev => ({ ...prev, image: 'error' }));
    }
  };

  const handleGenerateVideo = async () => {
    if (!finalizedData?.video_prompt) return;
    setMediaStatus(prev => ({ ...prev, video: 'loading' }));
    
    try {
      const videoUrl = await generateVideo(finalizedData.video_prompt);
      setGeneratedMedia(prev => ({ ...prev, videoUrl }));
      setMediaStatus(prev => ({ ...prev, video: 'success' }));
    } catch (error) {
      setMediaStatus(prev => ({ ...prev, video: 'error' }));
    }
  };

  if (checkingKey) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Checking configuration...
      </div>
    );
  }

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Key className="text-indigo-500" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">API Key Required</h1>
          <p className="text-slate-400 mb-8">
            To use the advanced Veo video generation features, you must select a paid API key from Google AI Studio.
          </p>
          <button
            onClick={handleSelectKey}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            Select API Key
          </button>
          <p className="mt-6 text-xs text-slate-500">
            Learn more about billing at <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">Google AI Studio</a>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200">
      
      {/* Main Chat Area */}
      <main className={`flex flex-col h-full transition-all duration-500 ease-in-out ${finalizedData ? 'w-full lg:w-1/2' : 'w-full max-w-4xl mx-auto'}`}>
        
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center px-6 bg-slate-950/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="text-white" size={18} />
            </div>
            <h1 className="font-bold text-lg text-white tracking-tight">Social Strategist AI</h1>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-2">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50 pb-20">
              <Sparkles size={48} className="text-slate-600 mb-4" />
              <h2 className="text-xl font-semibold text-slate-300">Start Your Strategy</h2>
              <p className="max-w-md mt-2 text-slate-500">Tell me your raw idea for a post. I'll help you refine it, optimize it, and generate the assets.</p>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} />
          ))}
          
          {isLoading && (
            <div className="flex items-center gap-2 text-slate-500 text-sm ml-4 animate-pulse">
              <Sparkles size={14} />
              <span>Thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <div className="relative max-w-3xl mx-auto w-full">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your post idea..."
              className="w-full bg-slate-900 text-white placeholder-slate-500 border border-slate-800 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none h-[60px] custom-scrollbar"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-indigo-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </main>

      {/* Side Panel (Result) */}
      {finalizedData && (
        <aside className="hidden lg:block w-1/2 border-l border-slate-800 h-full animate-in slide-in-from-right duration-500">
           <PostPreview 
             data={finalizedData} 
             mediaStatus={mediaStatus}
             generatedMedia={generatedMedia}
             onGenerateImage={handleGenerateImage}
             onGenerateVideo={handleGenerateVideo}
           />
        </aside>
      )}

      {/* Mobile Modal for Result (if on small screen) */}
      {finalizedData && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950 flex flex-col">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h2 className="font-bold text-white">Finalized Post</h2>
            <button onClick={() => setFinalizedData(null)} className="text-slate-400">Close</button>
          </div>
          <div className="flex-1 overflow-hidden">
             <PostPreview 
               data={finalizedData} 
               mediaStatus={mediaStatus}
               generatedMedia={generatedMedia}
               onGenerateImage={handleGenerateImage}
               onGenerateVideo={handleGenerateVideo}
             />
          </div>
        </div>
      )}

    </div>
  );
};

export default App;