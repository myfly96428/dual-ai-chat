
import React from 'react';
import { BotMessageSquare, RefreshCcw as RefreshCwIcon, Settings2, Brain, Sparkles, BookOpen } from 'lucide-react'; 
import { AiModel, MODELS } from '../constants';
import { ProcessingState } from '../types';

interface HeaderProps {
    processingState: ProcessingState;
    openSettingsModal: () => void;
    handleClearChat: () => void;
    onNotepadToggle: () => void;
    useOpenAiApiConfig: boolean;
    openAiCognitoModelId: string;
    openAiMuseModelId: string;
    actualCognitoModelDetails: AiModel;
    actualMuseModelDetails: AiModel;
    selectedCognitoModelApiName: string;
    setSelectedCognitoModelApiName: (name: string) => void;
    selectedMuseModelApiName: string;
    setSelectedMuseModelApiName: (name: string) => void;
}

const Separator = () => <div className="h-6 w-px bg-gray-300 mx-1 md:mx-1.5" aria-hidden="true"></div>;

const Header: React.FC<HeaderProps> = ({
    processingState,
    openSettingsModal,
    handleClearChat,
    onNotepadToggle,
    useOpenAiApiConfig,
    openAiCognitoModelId,
    openAiMuseModelId,
    actualCognitoModelDetails,
    actualMuseModelDetails,
    selectedCognitoModelApiName,
    setSelectedCognitoModelApiName,
    selectedMuseModelApiName,
    setSelectedMuseModelApiName,
}) => {
    const modelSelectorBaseClass = "bg-white border border-gray-400 text-gray-800 text-sm rounded-md p-1.5 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed";
    const modelSelectorWidthClass = "w-40 md:w-44"; 

    return (
        <header className="p-3 md:p-4 bg-gray-50 border-b border-gray-300 flex items-center justify-between shrink-0 space-x-2 md:space-x-3 flex-wrap relative z-10">
            <div className="flex items-center shrink-0">
                <BotMessageSquare size={28} className="mr-2 md:mr-3 text-sky-600" />
                <h1 className="text-xl md:text-2xl font-semibold text-sky-600">Dual AI Chat</h1>
            </div>

            <div className="flex items-center space-x-1 md:space-x-2 flex-wrap justify-end gap-y-2">
                {useOpenAiApiConfig ? (
                    <>
                        <div className="flex items-center p-1.5 bg-indigo-50 border border-indigo-300 rounded-md" title={`OpenAI Cognito: ${openAiCognitoModelId || '未指定'}`}>
                            <Brain size={18} className="mr-1.5 text-indigo-600 flex-shrink-0" />
                            <span className="text-sm font-medium text-indigo-700 whitespace-nowrap hidden sm:inline">Cognito:</span>
                            <span className="text-sm font-medium text-indigo-700 whitespace-nowrap ml-1 sm:ml-0">{openAiCognitoModelId || '未指定'}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center p-1.5 bg-purple-50 border border-purple-300 rounded-md" title={`OpenAI Muse: ${openAiMuseModelId || '未指定'}`}>
                            <Sparkles size={18} className="mr-1.5 text-purple-600 flex-shrink-0" />
                            <span className="text-sm font-medium text-purple-700 whitespace-nowrap hidden sm:inline">Muse:</span>
                            <span className="text-sm font-medium text-purple-700 whitespace-nowrap ml-1 sm:ml-0">{openAiMuseModelId || '未指定'}</span>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-center" title={`Cognito Model: ${actualCognitoModelDetails.name}`}>
                            <label htmlFor="cognitoModelSelector" className="sr-only">Cognito AI 模型</label>
                            <Brain size={18} className="mr-1.5 text-green-600 flex-shrink-0" aria-hidden="true" />
                            <span className="text-sm font-medium text-gray-700 mr-1 hidden sm:inline">Cognito:</span>
                            <select 
                                id="cognitoModelSelector" 
                                value={selectedCognitoModelApiName} 
                                onChange={(e) => setSelectedCognitoModelApiName(e.target.value)}
                                className={`${modelSelectorBaseClass} ${modelSelectorWidthClass}`}
                                aria-label="选择Cognito的AI模型" 
                                disabled={processingState === 'processing' || useOpenAiApiConfig}>
                                {MODELS.map((model) => (<option key={`cognito-${model.id}`} value={model.apiName}>{model.name}</option>))}
                            </select>
                        </div>
                        <Separator />
                        <div className="flex items-center" title={`Muse Model: ${actualMuseModelDetails.name}`}>
                            <label htmlFor="museModelSelector" className="sr-only">Muse AI 模型</label>
                            <Sparkles size={18} className="mr-1.5 text-purple-600 flex-shrink-0" aria-hidden="true" />
                            <span className="text-sm font-medium text-gray-700 mr-1 hidden sm:inline">Muse:</span>
                            <select 
                                id="museModelSelector" 
                                value={selectedMuseModelApiName} 
                                onChange={(e) => setSelectedMuseModelApiName(e.target.value)}
                                className={`${modelSelectorBaseClass} ${modelSelectorWidthClass}`}
                                aria-label="选择Muse的AI模型" 
                                disabled={processingState === 'processing' || useOpenAiApiConfig}>
                                {MODELS.map((model) => (<option key={`muse-${model.id}`} value={model.apiName}>{model.name}</option>))}
                            </select>
                        </div>
                    </>
                )}
                <Separator />
                <button onClick={onNotepadToggle}
                    className="p-1.5 md:p-2 text-gray-500 hover:text-sky-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-gray-50 rounded-md shrink-0 disabled:opacity-70 disabled:cursor-not-allowed"
                    aria-label="切换记事本" title="切换记事本" disabled={processingState === 'processing'}>
                    <BookOpen size={20} /> 
                </button>
                <button onClick={openSettingsModal}
                    className="p-1.5 md:p-2 text-gray-500 hover:text-sky-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-gray-50 rounded-md shrink-0 disabled:opacity-70 disabled:cursor-not-allowed"
                    aria-label="打开设置" title="打开设置" disabled={processingState === 'processing'}>
                    <Settings2 size={20} /> 
                </button>
                <button onClick={handleClearChat}
                    className="p-1.5 md:p-2 text-gray-500 hover:text-sky-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-gray-50 rounded-md shrink-0 disabled:opacity-70 disabled:cursor-not-allowed"
                    aria-label="清空会话" title="清空会话"
                    ><RefreshCwIcon size={20} /> 
                </button>
            </div>
        </header>
    );
};

export default Header;
