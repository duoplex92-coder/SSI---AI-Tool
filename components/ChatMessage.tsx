import React from 'react';
import { Message } from '../types';
import { Bot, User, AlertCircle } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-indigo-600' : isError ? 'bg-red-500' : 'bg-emerald-600'
        }`}>
          {isUser ? <User size={16} className="text-white" /> : 
           isError ? <AlertCircle size={16} className="text-white" /> :
           <Bot size={16} className="text-white" />}
        </div>

        {/* Bubble */}
        <div className={`p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed whitespace-pre-wrap ${
          isUser 
            ? 'bg-indigo-600 text-white rounded-tr-none' 
            : isError
              ? 'bg-red-900/20 border border-red-500/50 text-red-200 rounded-tl-none'
              : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
        }`}>
          {message.text}
        </div>
      </div>
    </div>
  );
};