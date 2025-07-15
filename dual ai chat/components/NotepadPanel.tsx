


import React from 'react';
import { BookText, Trash2 } from 'lucide-react';
import { ProcessingState } from '../types';

interface NotepadPanelProps {
  content: string;
  onContentChange: (newContent: string) => void;
  onClear: () => void;
  processingState: ProcessingState;
}

const NotepadPanel: React.FC<NotepadPanelProps> = ({ 
  content, 
  onContentChange, 
  onClear, 
  processingState,
}) => {
  const isLocked = processingState === 'processing';
  return (
    <div className="relative flex flex-col bg-yellow-50 border-l border-gray-300 h-full overflow-y-auto">
        <div className="flex flex-col h-full p-4 overflow-hidden">
          <header className="flex items-center justify-between pb-3 border-b border-yellow-200 mb-3 shrink-0">
            <div className="flex items-center">
              <BookText className="mr-2 text-yellow-600" size={24} />
              <h2 className="text-lg font-semibold text-yellow-700">记事本</h2>
            </div>
            <button
              onClick={onClear}
              disabled={isLocked || !content}
              className="p-1.5 text-gray-500 hover:text-red-600 rounded-md disabled:text-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500"
              title="清空记事本"
              aria-label="清空记事本"
            >
              <Trash2 size={18} />
            </button>
          </header>
          <textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            disabled={isLocked}
            placeholder="AI 将在这里记录讨论的要点。您也可以随时编辑。"
            className="flex-grow w-full p-2 bg-white border border-yellow-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm text-gray-800 placeholder-gray-500"
            aria-label="记事本编辑区"
          />
          <footer className="text-xs text-yellow-600 mt-2 shrink-0">
            AI会更新此记事本。您也可以直接编辑。
          </footer>
        </div>
    </div>
  );
};

export default NotepadPanel;
