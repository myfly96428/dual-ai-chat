
import React from 'react';
import { DiscussionMode, ProcessingState } from '../../types';
import { X } from 'lucide-react'; 

import ApiConfigSettings from './ApiConfigSettings';
import AppearanceSettings from './AppearanceSettings';
import DiscussionSettings from './DiscussionSettings';
import PerformanceSettings from './PerformanceSettings';
import PersonaSettings from './PersonaSettings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  processingState: ProcessingState;

  // Discussion
  discussionMode: DiscussionMode;
  onDiscussionModeChange: (mode: DiscussionMode) => void;
  manualFixedTurns: number;
  onManualFixedTurnsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  minManualFixedTurns: number;

  // Performance
  isThinkingBudgetActive: boolean;
  onThinkingBudgetToggle: () => void;
  supportsThinkingConfig: boolean; 

  // Persona
  cognitoSystemPrompt: string;
  onCognitoPromptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onResetCognitoPrompt: () => void;
  museSystemPrompt: string;
  onMusePromptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onResetMusePrompt: () => void;
  supportsSystemInstruction: boolean; 

  // Appearance
  fontSizeScale: number;
  onFontSizeScaleChange: (scale: number) => void;
  
  // Gemini Custom API
  useCustomApiConfig: boolean; 
  onUseCustomApiConfigChange: () => void; 
  customApiEndpoint: string;
  onCustomApiEndpointChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  customApiKey: string;
  onCustomApiKeyChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  // OpenAI Custom API
  useOpenAiApiConfig: boolean;
  onUseOpenAiApiConfigChange: () => void;
  openAiApiBaseUrl: string;
  onOpenAiApiBaseUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  openAiApiKey: string;
  onOpenAiApiKeyChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  openAiCognitoModelId: string;
  onOpenAiCognitoModelIdChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  openAiMuseModelId: string;
  onOpenAiMuseModelIdChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const commonClasses = {
  inputBase: "w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed",
  sectionHeading: "text-lg font-medium text-gray-800 mb-3 border-b pb-2",
  toggleLabelBase: "flex items-center text-sm font-medium",
  toggleButtonContainer: "flex items-center",
  toggleButton: "relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500",
  toggleButtonSwitch: "inline-block w-11 h-6 rounded-full",
  toggleButtonKnob: "absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform",
  toggleText: "ml-3 select-none text-sm text-gray-600 min-w-[3rem] text-left",
};

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  processingState,
  ...props
}) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out scale-100">
        <header className="p-4 border-b border-gray-300 flex items-center justify-between sticky top-0 bg-gray-50 rounded-t-lg z-10">
          <h2 id="settings-modal-title" className="text-xl font-semibold text-sky-700">应用程序设置</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-red-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="关闭设置面板"
            title="关闭设置"
            disabled={processingState === 'processing'}
          >
            <X size={24} />
          </button>
        </header>

        <div className="p-6 space-y-6 overflow-y-auto settings-modal-content-scrollbar">
          <ApiConfigSettings processingState={processingState} {...props} />
          <AppearanceSettings processingState={processingState} {...props} />
          <DiscussionSettings processingState={processingState} {...props} />
          <PerformanceSettings processingState={processingState} {...props} />
          <PersonaSettings processingState={processingState} {...props} />
        </div>

        <footer className="p-4 border-t border-gray-300 bg-gray-50 rounded-b-lg sticky bottom-0 z-10">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:bg-sky-400 disabled:cursor-not-allowed"
            disabled={processingState === 'processing'}
            aria-label="完成并关闭设置"
          >
            完成
          </button>
        </footer>
      </div>
    </div>
  );
};

export default SettingsModal;
