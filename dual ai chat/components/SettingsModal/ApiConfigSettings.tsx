
import React from 'react';
import { Settings, Database, Globe, KeyRound, Brain, Sparkles } from 'lucide-react'; 
import { commonClasses } from './index';
import { ProcessingState } from '../../types';

interface ApiConfigSettingsProps {
    processingState: ProcessingState;
    useCustomApiConfig: boolean; 
    onUseCustomApiConfigChange: () => void; 
    customApiEndpoint: string;
    onCustomApiEndpointChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    customApiKey: string;
    onCustomApiKeyChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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

const ApiConfigSettings: React.FC<ApiConfigSettingsProps> = ({
    processingState,
    useCustomApiConfig,
    onUseCustomApiConfigChange,
    customApiEndpoint,
    onCustomApiEndpointChange,
    customApiKey,
    onCustomApiKeyChange,
    useOpenAiApiConfig,
    onUseOpenAiApiConfigChange,
    openAiApiBaseUrl,
    onOpenAiApiBaseUrlChange,
    openAiApiKey,
    onOpenAiApiKeyChange,
    openAiCognitoModelId,
    onOpenAiCognitoModelIdChange,
    openAiMuseModelId,
    onOpenAiMuseModelIdChange,
}) => {
    const isLocked = processingState === 'processing';

    const handleUseCustomGeminiApiConfigToggle = () => {
        if (!isLocked) onUseCustomApiConfigChange(); 
    };

    const handleUseOpenAiApiConfigToggle = () => {
        if (!isLocked) onUseOpenAiApiConfigChange();
    };

    return (
        <section aria-labelledby="api-config-settings-heading">
            <h3 id="api-config-settings-heading" className={commonClasses.sectionHeading}>API 配置</h3>
            <div className="space-y-5">
              {/* Gemini Custom API */}
              <div className={`p-4 border rounded-lg ${useCustomApiConfig ? 'border-sky-300 bg-sky-50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-3">
                  <label htmlFor="useCustomGeminiApiToggle" className={`${commonClasses.toggleLabelBase} ${isLocked ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:text-sky-600'}`}
                    title={useCustomApiConfig ? "禁用自定义Gemini API配置" : "启用自定义Gemini API配置"}>
                    <Settings size={20} className="mr-2 text-sky-600" />
                    <span className="select-none">使用自定义 Gemini API 配置:</span>
                  </label>
                  <div className={commonClasses.toggleButtonContainer}>
                      <button
                          id="useCustomGeminiApiToggle"
                          onClick={handleUseCustomGeminiApiConfigToggle}
                          className={`${commonClasses.toggleButton} ${isLocked ? 'cursor-not-allowed opacity-70' : ''}`}
                          disabled={isLocked} role="switch" aria-checked={useCustomApiConfig} >
                          <span className={`${commonClasses.toggleButtonSwitch} ${useCustomApiConfig ? 'bg-sky-500' : 'bg-gray-300'}`}></span>
                          <span className={`${commonClasses.toggleButtonKnob} ${useCustomApiConfig ? 'translate-x-4' : ''}`}></span>
                      </button>
                      <span className={commonClasses.toggleText}>{useCustomApiConfig ? '开启' : '关闭'}</span>
                  </div>
                </div>
                <div className="space-y-3 pl-1">
                  <div>
                    <label htmlFor="customApiEndpoint" className={`flex items-center text-sm font-medium mb-1 ${useCustomApiConfig ? 'text-gray-700' : 'text-gray-400'}`}>
                      <Globe size={16} className={`mr-2 ${useCustomApiConfig ? 'text-sky-600' : 'text-gray-400'}`} />
                      Gemini API 端点 (可选)
                    </label>
                    <input type="text" id="customApiEndpoint" value={customApiEndpoint} onChange={onCustomApiEndpointChange} className={commonClasses.inputBase}
                      placeholder="例如: https://my-proxy.com/gemini" disabled={isLocked || !useCustomApiConfig} aria-label="自定义 Gemini API 端点" />
                    <p className={`text-xs mt-1 ${useCustomApiConfig ? 'text-gray-500' : 'text-gray-400'}`}>若留空，将使用默认 Google API 端点。</p>
                  </div>
                  <div>
                    <label htmlFor="customApiKey" className={`flex items-center text-sm font-medium mb-1 ${useCustomApiConfig ? 'text-gray-700' : 'text-gray-400'}`}>
                      <KeyRound size={16} className={`mr-2 ${useCustomApiConfig ? 'text-sky-600' : 'text-gray-400'}`} />
                      Gemini API 密钥
                    </label>
                    <input type="password" id="customApiKey" value={customApiKey} onChange={onCustomApiKeyChange} className={commonClasses.inputBase}
                      placeholder="输入您的 Gemini API 密钥" disabled={isLocked || !useCustomApiConfig} aria-label="自定义 Gemini API 密钥" required={useCustomApiConfig} />
                  </div>
                </div>
              </div>

              {/* OpenAI-Compatible API */}
              <div className={`p-4 border rounded-lg ${useOpenAiApiConfig ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-3">
                   <label htmlFor="useOpenAiApiToggle" className={`${commonClasses.toggleLabelBase} ${isLocked ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:text-indigo-600'}`}
                    title={useOpenAiApiConfig ? "禁用OpenAI API配置" : "启用OpenAI API配置 (例如本地Ollama, LM Studio)"}>
                    <Database size={20} className="mr-2 text-indigo-600" />
                    <span className="select-none">使用 OpenAI 兼容 API 配置:</span>
                  </label>
                  <div className={commonClasses.toggleButtonContainer}>
                      <button
                          id="useOpenAiApiToggle"
                          onClick={handleUseOpenAiApiConfigToggle}
                          className={`${commonClasses.toggleButton} ${isLocked ? 'cursor-not-allowed opacity-70' : ''}`}
                          disabled={isLocked} role="switch" aria-checked={useOpenAiApiConfig} >
                          <span className={`${commonClasses.toggleButtonSwitch} ${useOpenAiApiConfig ? 'bg-indigo-500' : 'bg-gray-300'}`}></span>
                          <span className={`${commonClasses.toggleButtonKnob} ${useOpenAiApiConfig ? 'translate-x-4' : ''}`}></span>
                      </button>
                      <span className={commonClasses.toggleText}>{useOpenAiApiConfig ? '开启' : '关闭'}</span>
                  </div>
                </div>
                <div className="space-y-3 pl-1">
                  <div>
                    <label htmlFor="openAiApiBaseUrl" className={`flex items-center text-sm font-medium mb-1 ${useOpenAiApiConfig ? 'text-gray-700' : 'text-gray-400'}`}>
                      <Globe size={16} className={`mr-2 ${useOpenAiApiConfig ? 'text-indigo-600' : 'text-gray-400'}`} />
                      API 基地址 (Base URL)
                    </label>
                    <input type="text" id="openAiApiBaseUrl" value={openAiApiBaseUrl} onChange={onOpenAiApiBaseUrlChange} className={commonClasses.inputBase}
                      placeholder="例如: http://localhost:11434/v1" disabled={isLocked || !useOpenAiApiConfig} aria-label="OpenAI API 基地址" required={useOpenAiApiConfig}/>
                  </div>
                  <div>
                    <label htmlFor="openAiApiKey" className={`flex items-center text-sm font-medium mb-1 ${useOpenAiApiConfig ? 'text-gray-700' : 'text-gray-400'}`}>
                      <KeyRound size={16} className={`mr-2 ${useOpenAiApiConfig ? 'text-indigo-600' : 'text-gray-400'}`} />
                      API 密钥 (可选)
                    </label>
                    <input type="password" id="openAiApiKey" value={openAiApiKey} onChange={onOpenAiApiKeyChange} className={commonClasses.inputBase}
                      placeholder="输入您的 OpenAI API 密钥 (部分服务可能不需要)" disabled={isLocked || !useOpenAiApiConfig} aria-label="OpenAI API 密钥" />
                  </div>
                  <div>
                    <label htmlFor="openAiCognitoModelId" className={`flex items-center text-sm font-medium mb-1 ${useOpenAiApiConfig ? 'text-gray-700' : 'text-gray-400'}`}>
                      <Brain size={16} className={`mr-2 ${useOpenAiApiConfig ? 'text-indigo-600' : 'text-gray-400'}`} />
                      Cognito 模型 ID
                    </label>
                    <input type="text" id="openAiCognitoModelId" value={openAiCognitoModelId} onChange={onOpenAiCognitoModelIdChange} className={commonClasses.inputBase}
                      placeholder="例如: llama3, gpt-4-turbo" disabled={isLocked || !useOpenAiApiConfig} aria-label="OpenAI Cognito 模型 ID" required={useOpenAiApiConfig}/>
                  </div>
                  <div>
                    <label htmlFor="openAiMuseModelId" className={`flex items-center text-sm font-medium mb-1 ${useOpenAiApiConfig ? 'text-gray-700' : 'text-gray-400'}`}>
                      <Sparkles size={16} className={`mr-2 ${useOpenAiApiConfig ? 'text-purple-600' : 'text-gray-400'}`} />
                      Muse 模型 ID
                    </label>
                    <input type="text" id="openAiMuseModelId" value={openAiMuseModelId} onChange={onOpenAiMuseModelIdChange} className={commonClasses.inputBase}
                      placeholder="例如: llama3, gpt-3.5-turbo" disabled={isLocked || !useOpenAiApiConfig} aria-label="OpenAI Muse 模型 ID" required={useOpenAiApiConfig}/>
                  </div>
                </div>
              </div>
              
              {!useCustomApiConfig && !useOpenAiApiConfig && (
                <p className="text-xs text-gray-600 text-center mt-1 p-2 bg-gray-100 rounded-md">当前配置为使用环境变量中的 Google Gemini API 密钥。</p>
              )}
            </div>
        </section>
    );
};

export default ApiConfigSettings;
