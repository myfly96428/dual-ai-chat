
import React from 'react';
import { Info, RotateCcw } from 'lucide-react';
import { commonClasses } from './index';
import { ProcessingState } from '../../types';

interface PersonaSettingsProps {
    processingState: ProcessingState;
    cognitoSystemPrompt: string;
    onCognitoPromptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onResetCognitoPrompt: () => void;
    museSystemPrompt: string;
    onMusePromptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onResetMusePrompt: () => void;
    supportsSystemInstruction: boolean;
}

const PersonaSettings: React.FC<PersonaSettingsProps> = ({
    processingState,
    cognitoSystemPrompt,
    onCognitoPromptChange,
    onResetCognitoPrompt,
    museSystemPrompt,
    onMusePromptChange,
    onResetMusePrompt,
    supportsSystemInstruction,
}) => {
    const isLocked = processingState === 'processing';
    return (
        <section aria-labelledby="persona-settings-heading">
            <h3 id="persona-settings-heading" className={`${commonClasses.sectionHeading} mb-1`}>AI 角色设定 (系统提示词)</h3>
            {!supportsSystemInstruction && ( 
              <div className="mt-2 mb-3 p-3 bg-yellow-50 border border-yellow-300 rounded-md text-sm text-yellow-700 flex items-start">
                <Info size={18} className="mr-2 mt-0.5 shrink-0" />
                当前选定模型或API配置可能不支持自定义系统提示词。以下设置可能无效。
              </div>
            )}
            
            <div className="space-y-5 mt-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="cognitoPrompt" className="block text-sm font-medium text-gray-700">Cognito (逻辑AI) 提示词:</label>
                    <button 
                        onClick={onResetCognitoPrompt}
                        disabled={isLocked || !supportsSystemInstruction}
                        className="text-xs text-sky-600 hover:text-sky-800 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center focus:outline-none focus:ring-1 focus:ring-sky-500 rounded px-1 py-0.5"
                        title="重置为默认提示词"
                    >
                        <RotateCcw size={14} className="mr-1" /> 重置
                    </button>
                </div>
                <textarea
                  id="cognitoPrompt"
                  value={cognitoSystemPrompt}
                  onChange={onCognitoPromptChange}
                  rows={5}
                  className={`${commonClasses.inputBase} resize-y min-h-[90px]`}
                  disabled={isLocked || !supportsSystemInstruction}
                  aria-label="Cognito系统提示词"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="musePrompt" className="block text-sm font-medium text-gray-700">Muse (创意AI) 提示词:</label>
                     <button 
                        onClick={onResetMusePrompt}
                        disabled={isLocked || !supportsSystemInstruction}
                        className="text-xs text-sky-600 hover:text-sky-800 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center focus:outline-none focus:ring-1 focus:ring-sky-500 rounded px-1 py-0.5"
                        title="重置为默认提示词"
                    >
                        <RotateCcw size={14} className="mr-1" /> 重置
                    </button>
                </div>
                <textarea
                  id="musePrompt"
                  value={museSystemPrompt}
                  onChange={onMusePromptChange}
                  rows={5}
                  className={`${commonClasses.inputBase} resize-y min-h-[90px]`}
                  disabled={isLocked || !supportsSystemInstruction}
                  aria-label="Muse系统提示词"
                />
              </div>
            </div>
        </section>
    );
};

export default PersonaSettings;
