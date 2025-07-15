
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ChatMessage, MessageSender, MessagePurpose, DiscussionMode, ProcessingState } from './types';
import ChatInput from './components/ChatInput';
import MessageBubble from './components/MessageBubble';
import SettingsModal from './components/SettingsModal/index';
import Header from './components/Header';
import NotepadPanel from './components/NotepadPanel';
import {
  MODELS,
  DEFAULT_COGNITO_MODEL_API_NAME,
  DEFAULT_MUSE_MODEL_API_NAME,
  DEFAULT_MANUAL_FIXED_TURNS,
  MIN_MANUAL_FIXED_TURNS,
  COGNITO_SYSTEM_PROMPT_HEADER,
  MUSE_SYSTEM_PROMPT_HEADER
} from './constants';
import { AlertTriangle } from 'lucide-react'; 

import { useChatLogic } from './hooks/useChatLogic';
import { useAppUI } from './hooks/useAppUI';
import { useConfiguration } from './hooks/useConfiguration';
import { generateUniqueId, getWelcomeMessageText } from './utils/appUtils';
import { AiModel } from './constants';

interface ApiKeyStatus {
  isMissing?: boolean;
  isInvalid?: boolean;
  message?: string;
}

const NOTEPAD_CONTENT_STORAGE_KEY = 'dualAiChatNotepadContent';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus>({});
  
  const config = useConfiguration();

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState<boolean>(true);
  const [isNotepadVisible, setIsNotepadVisible] = useState<boolean>(true);
  const [notepadContent, setNotepadContent] = useState<string>(() => {
    return localStorage.getItem(NOTEPAD_CONTENT_STORAGE_KEY) || '';
  });

  useEffect(() => {
    localStorage.setItem(NOTEPAD_CONTENT_STORAGE_KEY, notepadContent);
  }, [notepadContent]);


  const {
    currentTotalProcessingTimeMs,
    isSettingsModalOpen,
    openSettingsModal,
    closeSettingsModal,
    startProcessingTimer,
    stopProcessingTimer,
    updateProcessingTimer,
    currentQueryStartTimeRef, 
  } = useAppUI();

  const addMessage = useCallback((
    text: string,
    sender: MessageSender,
    purpose: MessagePurpose,
    durationMs?: number,
    image?: ChatMessage['image'],
    retryCallbacks?: { onConfirm?: () => void; onCancel?: () => void; }
  ): string => {
    const messageId = generateUniqueId();
    setMessages(prev => [...prev, {
      id: messageId,
      text,
      sender,
      purpose,
      timestamp: new Date(),
      durationMs,
      image,
      onConfirm: retryCallbacks?.onConfirm,
      onCancel: retryCallbacks?.onCancel,
    }]);
    return messageId;
  }, []);
  
  const actualCognitoModelDetails: AiModel = useMemo(() => {
    if (config.useOpenAiApiConfig) {
      return {
        id: 'openai-cognito',
        name: `OpenAI Cognito: ${config.openAiCognitoModelId || '未指定'}`,
        apiName: config.openAiCognitoModelId || 'gemini-2.5-pro-preview-06-05',
        supportsThinkingConfig: false, 
        supportsSystemInstruction: true, 
      };
    }
    return MODELS.find(m => m.apiName === config.selectedCognitoModelApiName) || MODELS.find(m => m.apiName === DEFAULT_COGNITO_MODEL_API_NAME) || MODELS[0];
  }, [config.useOpenAiApiConfig, config.openAiCognitoModelId, config.selectedCognitoModelApiName]);

  const actualMuseModelDetails: AiModel = useMemo(() => {
    if (config.useOpenAiApiConfig) {
      return { 
        id: 'openai-muse',
        name: `OpenAI Muse: ${config.openAiMuseModelId || '未指定'}`,
        apiName: config.openAiMuseModelId || 'gemini-2.5-pro-preview-06-05',
        supportsThinkingConfig: false,
        supportsSystemInstruction: true,
      };
    }
    return MODELS.find(m => m.apiName === config.selectedMuseModelApiName) || MODELS.find(m => m.apiName === DEFAULT_MUSE_MODEL_API_NAME) || MODELS[0];
  }, [config.useOpenAiApiConfig, config.openAiMuseModelId, config.selectedMuseModelApiName]);

  const {
    processingState,
    startChatProcessing,
    pauseGenerating,
    resumeGenerating,
    stopAndClear,
    currentDiscussionTurn,
    isInternalDiscussionActive,
    lastCompletedTurnCount,
  } = useChatLogic({
    addMessage,
    setGlobalApiKeyStatus: setApiKeyStatus,
    cognitoModelDetails: actualCognitoModelDetails, 
    museModelDetails: actualMuseModelDetails,    
    useCustomApiConfig: config.useCustomApiConfig, 
    customApiKey: config.customApiKey,
    customApiEndpoint: config.customApiEndpoint,
    useOpenAiApiConfig: config.useOpenAiApiConfig,
    openAiApiKey: config.openAiApiKey,
    openAiApiBaseUrl: config.openAiApiBaseUrl,
    openAiCognitoModelId: config.openAiCognitoModelId,
    openAiMuseModelId: config.openAiMuseModelId,
    discussionMode: config.discussionMode,
    manualFixedTurns: config.manualFixedTurns,
    isThinkingBudgetActive: config.isThinkingBudgetActive, 
    cognitoSystemPrompt: config.cognitoSystemPrompt,
    museSystemPrompt: config.museSystemPrompt,
    notepadContent: notepadContent,
    setNotepadContent: setNotepadContent,
    startProcessingTimer,
    stopProcessingTimer,
    currentQueryStartTimeRef,
  });
  
  const isEffectivelyApiKeyMissing = useMemo(() => {
    if (config.useOpenAiApiConfig) {
      return !config.openAiApiBaseUrl.trim() || !config.openAiCognitoModelId.trim() || !config.openAiMuseModelId.trim();
    } else if (config.useCustomApiConfig) {
      return !config.customApiKey.trim();
    } else {
      return !(process.env.API_KEY && process.env.API_KEY.trim() !== "");
    }
  }, [config.useCustomApiConfig, config.customApiKey, config.useOpenAiApiConfig, config.openAiApiBaseUrl, config.openAiApiKey, config.openAiCognitoModelId, config.openAiMuseModelId]);

  const initializeChat = useCallback(() => {
    setMessages([]);
    setIsAutoScrollEnabled(true);
    setApiKeyStatus({});

    let missingKeyMsg = "";
    if (config.useOpenAiApiConfig) {
      if (!config.openAiApiBaseUrl.trim() || !config.openAiCognitoModelId.trim() || !config.openAiMuseModelId.trim()) {
        missingKeyMsg = "OpenAI API 配置不完整 (需要基地址和Cognito/Muse的模型ID)。请在设置中提供，或关闭“使用OpenAI API配置”。";
      }
    } else if (config.useCustomApiConfig) {
      if (!config.customApiKey.trim()) {
        missingKeyMsg = "自定义 Gemini API 密钥未在设置中提供。请在设置中输入密钥，或关闭“使用自定义API配置”。";
      }
    } else {
      if (!(process.env.API_KEY && process.env.API_KEY.trim() !== "")) {
        missingKeyMsg = "Google Gemini API 密钥未在环境变量中配置。请配置该密钥，或在设置中启用并提供自定义API配置。";
      }
    }

    if (missingKeyMsg) {
      const fullWarning = `严重警告：${missingKeyMsg} 在此之前，应用程序功能将受限。`;
      addMessage(fullWarning, MessageSender.System, MessagePurpose.SystemNotification);
      setApiKeyStatus({ isMissing: true, message: missingKeyMsg });
    } else {
      addMessage(
        getWelcomeMessageText(
            actualCognitoModelDetails.name, 
            actualMuseModelDetails.name, 
            config.discussionMode, 
            config.manualFixedTurns, 
            config.useOpenAiApiConfig, 
            config.openAiCognitoModelId, 
            config.openAiMuseModelId
        ),
        MessageSender.System,
        MessagePurpose.SystemNotification
      );
    }
  }, [addMessage, actualCognitoModelDetails.name, actualMuseModelDetails.name, config.discussionMode, config.manualFixedTurns, config.useCustomApiConfig, config.customApiKey, config.useOpenAiApiConfig, config.openAiApiBaseUrl, config.openAiApiKey, config.openAiCognitoModelId, config.openAiMuseModelId]);

  useEffect(() => {
    // This effect combines initialization and the hard stop/clear logic.
    // It should only run when the app is idle, to allow API config changes
    // during a pause without resetting the session.
    if (processingState === 'idle') {
      stopAndClear(initializeChat);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.useCustomApiConfig, config.useOpenAiApiConfig]);

   useEffect(() => {
     const welcomeMessage = messages.find(msg => msg.sender === MessageSender.System && msg.text.startsWith("欢迎使用Dual AI Chat！"));
     if (welcomeMessage && !apiKeyStatus.isMissing && !apiKeyStatus.isInvalid) {
        setMessages(msgs => msgs.map(msg =>
            msg.id === welcomeMessage.id
            ? {...msg, text: getWelcomeMessageText(
                actualCognitoModelDetails.name, 
                actualMuseModelDetails.name, 
                config.discussionMode, 
                config.manualFixedTurns, 
                config.useOpenAiApiConfig, 
                config.openAiCognitoModelId, 
                config.openAiMuseModelId
            ) }
            : msg
        ));
     }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actualCognitoModelDetails.name, actualMuseModelDetails.name, apiKeyStatus.isMissing, apiKeyStatus.isInvalid, config.discussionMode, config.manualFixedTurns, config.useOpenAiApiConfig, config.openAiCognitoModelId, config.openAiMuseModelId]); 

  useEffect(() => {
    let intervalId: number | undefined;
    if (processingState === 'processing' && currentQueryStartTimeRef.current) {
      intervalId = window.setInterval(() => {
        if (currentQueryStartTimeRef.current) { 
          updateProcessingTimer();
        }
      }, 100);
    } else {
      if (intervalId) clearInterval(intervalId);
      if (processingState === 'idle' && currentQueryStartTimeRef.current !== null) {
         updateProcessingTimer(); 
      }
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [processingState, updateProcessingTimer, currentQueryStartTimeRef]);

  const handleClearChat = useCallback(() => {
    stopAndClear(initializeChat); 
  }, [stopAndClear, initializeChat]);


  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isSettingsModalOpen) {
        closeSettingsModal();
      }
    };
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isSettingsModalOpen, closeSettingsModal]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior,
      });
    }
  }, []);

  useEffect(() => {
    if (isAutoScrollEnabled && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isAutoScrollEnabled, scrollToBottom]);

  const handleChatScroll = useCallback(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainer;
      const atBottom = scrollHeight - scrollTop - clientHeight < 20;

      if (atBottom) {
        setIsAutoScrollEnabled(true);
      } else {
        setIsAutoScrollEnabled(false);
      }
    }
  }, []);

  const apiKeyBannerMessage = useMemo(() => {
    if (!apiKeyStatus.message) return null;
    if (config.useOpenAiApiConfig) {
        if (apiKeyStatus.isMissing) return "OpenAI API 配置不完整 (需基地址和Cognito/Muse模型ID)。请在设置中提供，或关闭 OpenAI API 配置。";
        if (apiKeyStatus.isInvalid) return "提供的 OpenAI API 密钥无效或无法访问服务。请检查设置和网络。";
    } else if (config.useCustomApiConfig) {
        if (apiKeyStatus.isMissing) return "自定义 Gemini API 密钥缺失。请在设置中提供，或关闭自定义 Gemini API 配置。";
        if (apiKeyStatus.isInvalid) return "提供的自定义 Gemini API 密钥无效或权限不足。请检查设置中的密钥。";
    } else {
        if (apiKeyStatus.isMissing) return "环境变量中的 Google Gemini API 密钥缺失。请配置，或启用自定义 API 配置。";
        if (apiKeyStatus.isInvalid) return "环境变量中的 Google Gemini API 密钥无效或权限不足。请检查该密钥。";
    }
    return apiKeyStatus.message; 
  }, [apiKeyStatus, config.useCustomApiConfig, config.useOpenAiApiConfig]);

  const getStatusFooterText = () => {
    if (processingState === 'paused') {
        return `已暂停。耗时: ${(currentTotalProcessingTimeMs / 1000).toFixed(2)}s`;
    }
    if (processingState === 'processing') {
      if (isInternalDiscussionActive) {
        return (
          <>
            <span>
              AI 内部讨论: 第 {currentDiscussionTurn + 1} 轮
              {config.discussionMode === DiscussionMode.FixedTurns && ` / ${config.manualFixedTurns} 轮`}
            </span>
            {currentTotalProcessingTimeMs > 0 && (
              <>
                <span className="mx-2" aria-hidden="true">|</span>
                <span>耗时: {(currentTotalProcessingTimeMs / 1000).toFixed(2)}s</span>
              </>
            )}
          </>
        );
      }
      return `AI 正在处理...${currentTotalProcessingTimeMs > 0 ? ` 耗时: ${(currentTotalProcessingTimeMs / 1000).toFixed(2)}s` : ''}`;
    }
    // idle state
    return (
        <span>
          准备就绪
          {currentTotalProcessingTimeMs > 0 && ` | 上次耗时: ${(currentTotalProcessingTimeMs / 1000).toFixed(2)}s`}
          {lastCompletedTurnCount > 0 && ` | 上次轮数: ${lastCompletedTurnCount}`}
        </span>
    );
  };


  return (
    <div className="flex flex-col h-screen bg-white shadow-2xl overflow-hidden border-x border-gray-300 relative">
      <Header
        processingState={processingState}
        openSettingsModal={openSettingsModal}
        handleClearChat={handleClearChat}
        onNotepadToggle={() => setIsNotepadVisible(prev => !prev)}
        useOpenAiApiConfig={config.useOpenAiApiConfig}
        openAiCognitoModelId={config.openAiCognitoModelId}
        openAiMuseModelId={config.openAiMuseModelId}
        actualCognitoModelDetails={actualCognitoModelDetails}
        actualMuseModelDetails={actualMuseModelDetails}
        selectedCognitoModelApiName={config.selectedCognitoModelApiName}
        setSelectedCognitoModelApiName={config.setSelectedCognitoModelApiName}
        selectedMuseModelApiName={config.selectedMuseModelApiName}
        setSelectedMuseModelApiName={config.setSelectedMuseModelApiName}
      />

      <div className="flex flex-grow overflow-hidden">
          <div
            id="chat-panel-wrapper"
            className="flex flex-col h-full overflow-hidden flex-1"
          >
            <div className="flex flex-col flex-grow h-full"> 
              <div 
                ref={chatContainerRef} 
                className="flex-grow p-4 space-y-4 overflow-y-auto bg-gray-200 scroll-smooth"
                onScroll={handleChatScroll}
              >
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                  />
                ))}
              </div>
              <ChatInput
                onSendMessage={startChatProcessing}
                processingState={processingState}
                isApiKeyMissing={apiKeyStatus.isMissing || apiKeyStatus.isInvalid || false}
                onPause={pauseGenerating}
                onResume={resumeGenerating}
              />
              <div className="px-4 py-2 text-xs text-gray-600 text-center bg-gray-100">
                {getStatusFooterText()}
              </div>
            </div>
          </div>
          <div className={`transition-all duration-300 ease-in-out ${isNotepadVisible ? 'w-1/4 min-w-[280px]' : 'w-0'}`} style={{ visibility: isNotepadVisible ? 'visible' : 'hidden' }}>
            {isNotepadVisible && (
              <NotepadPanel
                content={notepadContent}
                onContentChange={setNotepadContent}
                onClear={() => setNotepadContent('')}
                processingState={processingState}
              />
            )}
          </div>
      </div>

       {(apiKeyStatus.isMissing || apiKeyStatus.isInvalid) && apiKeyBannerMessage && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg shadow-lg flex items-center text-sm z-50 max-w-md text-center">
            <AlertTriangle size={20} className="mr-2 shrink-0" /> {apiKeyBannerMessage}
        </div>
      )}
      {isSettingsModalOpen && (
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={closeSettingsModal}
          processingState={processingState}
          discussionMode={config.discussionMode}
          onDiscussionModeChange={(mode) => config.setDiscussionMode(mode)}
          manualFixedTurns={config.manualFixedTurns}
          onManualFixedTurnsChange={(e) => {
            let value = parseInt(e.target.value, 10);
            if (isNaN(value)) value = DEFAULT_MANUAL_FIXED_TURNS;
            value = Math.max(MIN_MANUAL_FIXED_TURNS, value); 
            config.setManualFixedTurns(value);
          }}
          minManualFixedTurns={MIN_MANUAL_FIXED_TURNS}
          isThinkingBudgetActive={config.isThinkingBudgetActive}
          onThinkingBudgetToggle={() => config.setIsThinkingBudgetActive(prev => !prev)}
          supportsThinkingConfig={actualCognitoModelDetails.supportsThinkingConfig || actualMuseModelDetails.supportsThinkingConfig} 
          cognitoSystemPrompt={config.cognitoSystemPrompt}
          onCognitoPromptChange={(e) => config.setCognitoSystemPrompt(e.target.value)}
          onResetCognitoPrompt={() => config.setCognitoSystemPrompt(COGNITO_SYSTEM_PROMPT_HEADER)}
          museSystemPrompt={config.museSystemPrompt}
          onMusePromptChange={(e) => config.setMuseSystemPrompt(e.target.value)}
          onResetMusePrompt={() => config.setMuseSystemPrompt(MUSE_SYSTEM_PROMPT_HEADER)}
          supportsSystemInstruction={actualCognitoModelDetails.supportsSystemInstruction || actualMuseModelDetails.supportsSystemInstruction} 
          fontSizeScale={config.fontSizeScale}
          onFontSizeScaleChange={config.setFontSizeScale}
          useCustomApiConfig={config.useCustomApiConfig}
          onUseCustomApiConfigChange={config.handleUseCustomGeminiApiConfigChange}
          customApiEndpoint={config.customApiEndpoint}
          onCustomApiEndpointChange={(e) => config.setCustomApiEndpoint(e.target.value)}
          customApiKey={config.customApiKey}
          onCustomApiKeyChange={(e) => config.setCustomApiKey(e.target.value)}
          useOpenAiApiConfig={config.useOpenAiApiConfig}
          onUseOpenAiApiConfigChange={config.handleUseOpenAiApiConfigChange}
          openAiApiBaseUrl={config.openAiApiBaseUrl}
          onOpenAiApiBaseUrlChange={(e) => config.setOpenAiApiBaseUrl(e.target.value)}
          openAiApiKey={config.openAiApiKey}
          onOpenAiApiKeyChange={(e) => config.setOpenAiApiKey(e.target.value)}
          openAiCognitoModelId={config.openAiCognitoModelId}
          onOpenAiCognitoModelIdChange={(e) => config.setOpenAiCognitoModelId(e.target.value)}
          openAiMuseModelId={config.openAiMuseModelId}
          onOpenAiMuseModelIdChange={(e) => config.setOpenAiMuseModelId(e.target.value)}
        />
      )}
    </div>
  );
};

export default App;
