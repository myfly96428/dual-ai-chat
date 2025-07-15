


import { useState, useRef, useCallback, useEffect } from 'react';
import { ChatMessage, MessageSender, MessagePurpose, DiscussionMode, ProcessingState, PausedState, DiscussionStep } from '../types'; 
import { generateResponse as generateGeminiResponse } from '../services/geminiService';
import { generateOpenAiResponse } from '../services/openaiService'; 
import {
  AiModel,
  DISCUSSION_COMPLETE_TAG,
  AI_DRIVEN_DISCUSSION_INSTRUCTION_PROMPT_PART,
  THINKING_BUDGET_CONFIG_HIGH_QUALITY,
  GEMINI_2_5_FLASH_MODEL_ID,
} from '../constants';
import { parseAIResponse, fileToBase64, ParsedAIResponse as ParsedResponseData } from '../utils/appUtils'; 
import {
  createCognitoInitialPrompt,
  createMuseReplyPrompt,
  createCognitoReplyPrompt,
  createFinalAnswerPrompt,
} from '../services/promptService';

interface UseChatLogicProps {
  addMessage: (text: string, sender: MessageSender, purpose: MessagePurpose, durationMs?: number, image?: ChatMessage['image'], retryCallbacks?: { onConfirm: () => void, onCancel: () => void }) => string;
  setGlobalApiKeyStatus: (status: {isMissing?: boolean, isInvalid?: boolean, message?: string}) => void;
  
  cognitoModelDetails: AiModel; 
  museModelDetails: AiModel;    
  
  useCustomApiConfig: boolean; 
  customApiKey: string; 
  customApiEndpoint: string; 

  useOpenAiApiConfig: boolean;
  openAiApiKey: string;
  openAiApiBaseUrl: string;
  openAiCognitoModelId: string; 
  openAiMuseModelId: string;    

  discussionMode: DiscussionMode;
  manualFixedTurns: number;
  isThinkingBudgetActive: boolean; 
  cognitoSystemPrompt: string;
  museSystemPrompt: string;

  notepadContent: string;
  setNotepadContent: (content: string) => void;

  startProcessingTimer: () => void;
  stopProcessingTimer: () => void;
  currentQueryStartTimeRef: React.MutableRefObject<number | null>;
}

type AIStepErrorType = 'ApiKeyMissing' | 'ApiKeyInvalid' | 'ApiCommunicationError' | 'QuotaExceeded' | 'UnknownAIError' | 'Cancelled';

interface AIStepExecutionResult {
  parsedResponse?: Omit<ParsedResponseData, 'durationMs'>; 
  durationMs: number; 
  errorType?: AIStepErrorType;
  errorMessage?: string; 
}

export const useChatLogic = ({
  addMessage,
  setGlobalApiKeyStatus,
  cognitoModelDetails, 
  museModelDetails, 
  useCustomApiConfig, 
  customApiKey, 
  customApiEndpoint, 
  useOpenAiApiConfig,
  openAiApiKey,
  openAiApiBaseUrl,
  openAiCognitoModelId,
  openAiMuseModelId,
  discussionMode,
  manualFixedTurns,
  isThinkingBudgetActive, 
  cognitoSystemPrompt,
  museSystemPrompt,
  notepadContent,
  setNotepadContent,
  startProcessingTimer,
  stopProcessingTimer,
  currentQueryStartTimeRef,
}: UseChatLogicProps) => {
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const pausedStateRef = useRef<PausedState | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const [discussionLog, setDiscussionLog] = useState<string[]>([]);
  const [currentDiscussionTurn, setCurrentDiscussionTurn] = useState<number>(0);
  const [isInternalDiscussionActive, setIsInternalDiscussionActive] = useState<boolean>(false);
  const [lastCompletedTurnCount, setLastCompletedTurnCount] = useState<number>(0);

  const getThinkingConfigForGeminiModel = useCallback((modelDetails: AiModel) : { thinkingBudget: number } | undefined => {
    if (!useOpenAiApiConfig && 
        modelDetails.apiName === GEMINI_2_5_FLASH_MODEL_ID &&
        modelDetails.supportsThinkingConfig &&
        isThinkingBudgetActive) {
      return THINKING_BUDGET_CONFIG_HIGH_QUALITY.thinkingConfig; 
    }
    return undefined;
  }, [useOpenAiApiConfig, isThinkingBudgetActive]);
  
  const commonPromptInstructions = useCallback(() => {
    return discussionMode === DiscussionMode.AiDriven ? AI_DRIVEN_DISCUSSION_INSTRUCTION_PROMPT_PART : "";
  }, [discussionMode]);

  const executeStepWithRetries = useCallback(async (
    prompt: string,
    modelDetails: AiModel,
    sender: MessageSender,
    imageApiPart?: { inlineData: { mimeType: string; data: string } },
    signal?: AbortSignal
  ): Promise<AIStepExecutionResult> => {
      let retryCount = 0;
      const MAX_RETRIES = 45;
      const RETRY_DELAY_MS = 2000;

      while (retryCount < MAX_RETRIES) {
          if (signal?.aborted) {
             return { durationMs: 0, errorType: 'Cancelled', errorMessage: "用户取消操作" };
          }

          let resultFromService: { text: string; durationMs: number; error?: string };
          const personaPrompt = sender === MessageSender.Cognito ? cognitoSystemPrompt : museSystemPrompt;
          const fullPrompt = `${personaPrompt}\n\n${prompt}`;
          const thinkingConfigToUseForGemini = getThinkingConfigForGeminiModel(modelDetails);

          try {
              if (useOpenAiApiConfig) {
                  resultFromService = await generateOpenAiResponse(fullPrompt, modelDetails.apiName, openAiApiKey, openAiApiBaseUrl, undefined, imageApiPart ? { mimeType: imageApiPart.inlineData.mimeType, data: imageApiPart.inlineData.data } : undefined, signal);
              } else {
                  resultFromService = await generateGeminiResponse(fullPrompt, modelDetails.apiName, useCustomApiConfig, customApiKey, customApiEndpoint, undefined, imageApiPart, thinkingConfigToUseForGemini, signal);
              }
          } catch(e) {
              const error = e as Error;
              console.error(`[${sender}] Error during API call:`, error);
              return { durationMs: 0, errorType: 'UnknownAIError', errorMessage: error.message || "AI 调用期间发生意外错误。" };
          }
          
          if (signal?.aborted) {
            return { durationMs: resultFromService.durationMs, errorType: 'Cancelled', errorMessage: "用户取消操作" };
          }

          if (resultFromService.error) {
              let errorType: AIStepErrorType = 'UnknownAIError';
              if (resultFromService.error === 'Cancelled') errorType = 'Cancelled';
              else if (resultFromService.error === "API key not configured" || resultFromService.error.toLowerCase().includes("api key not provided")) errorType = 'ApiKeyMissing';
              else if (resultFromService.error === "API key invalid or permission denied") errorType = 'ApiKeyInvalid';
              else if (resultFromService.error === "Quota exceeded") errorType = 'QuotaExceeded';
              else errorType = 'ApiCommunicationError';
              
              if (errorType === 'Cancelled' || errorType === 'ApiKeyMissing' || errorType === 'ApiKeyInvalid') {
                  return { durationMs: resultFromService.durationMs, errorType, errorMessage: resultFromService.text };
              }
              // It's a retryable error
          } else {
             const parsedTextResponse = parseAIResponse(resultFromService.text);
             return { parsedResponse: parsedTextResponse, durationMs: resultFromService.durationMs };
          }

          retryCount++;
          addMessage(
              `[${sender}] 调用失败: ${resultFromService.text || 'AI返回空响应。'} 将在${RETRY_DELAY_MS / 1000}秒后自动重试... (${retryCount}/${MAX_RETRIES})`,
              MessageSender.System, MessagePurpose.SystemNotification
          );
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      }

      // Max retries reached.
      addMessage(`[${sender}] 已达到最大重试次数 (${MAX_RETRIES})。`, MessageSender.System, MessagePurpose.SystemNotification);
      return { durationMs: 0, errorType: 'ApiCommunicationError', errorMessage: '已达到最大重试次数' };

  }, [cognitoSystemPrompt, museSystemPrompt, getThinkingConfigForGeminiModel, useOpenAiApiConfig, openAiApiKey, openAiApiBaseUrl, useCustomApiConfig, customApiKey, customApiEndpoint, addMessage]);

  const resumeChatProcessing = useCallback(async () => {
    if (!pausedStateRef.current) return;

    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;
    
    const { 
        nextStep, 
        userInput, 
        imageApiPart, 
        notepadContent: currentNotepadContent,
        discussionLog,
        lastTurnTextForLog,
        turn,
        previousAiSignaledStop
    } = pausedStateRef.current;
    const imageInstructionForAI = imageApiPart ? "用户还提供了一张图片。请在您的分析和回复中同时考虑此图片和文本查询。" : "";

    let result: AIStepExecutionResult | null = null;
    let nextDiscussionStep: DiscussionStep = 'finished';

    try {
        switch (nextStep) {
            case 'cognito_initial': {
                setIsInternalDiscussionActive(true);
                setCurrentDiscussionTurn(0);
                addMessage(`${MessageSender.Cognito} 正在为 ${MessageSender.Muse} 准备第一个观点 (使用 ${cognitoModelDetails.name})...`, MessageSender.System, MessagePurpose.SystemNotification);
                const prompt = createCognitoInitialPrompt(
                    userInput,
                    imageInstructionForAI,
                    commonPromptInstructions(),
                    currentNotepadContent
                );
                result = await executeStepWithRetries(prompt, cognitoModelDetails, MessageSender.Cognito, imageApiPart, signal);
                if (result.parsedResponse) {
                    addMessage(result.parsedResponse.spokenText, MessageSender.Cognito, MessagePurpose.CognitoToMuse, result.durationMs);
                    if (typeof result.parsedResponse.notepadContent === 'string') {
                      setNotepadContent(result.parsedResponse.notepadContent);
                      pausedStateRef.current.notepadContent = result.parsedResponse.notepadContent;
                    }
                    pausedStateRef.current.discussionLog.push(`${MessageSender.Cognito}: ${result.parsedResponse.spokenText}`);
                    pausedStateRef.current.lastTurnTextForLog = result.parsedResponse.spokenText;
                    pausedStateRef.current.previousAiSignaledStop = result.parsedResponse.discussionShouldEnd || false;
                    nextDiscussionStep = 'muse_reply';
                }
                break;
            }
            case 'muse_reply': {
                if (discussionMode === DiscussionMode.FixedTurns && turn >= manualFixedTurns) {
                    nextDiscussionStep = 'cognito_final';
                    break;
                }
                setIsInternalDiscussionActive(true);
                setCurrentDiscussionTurn(turn);
                addMessage(`${MessageSender.Muse} 正在回应 ${MessageSender.Cognito} (使用 ${museModelDetails.name})...`, MessageSender.System, MessagePurpose.SystemNotification);
                const prompt = createMuseReplyPrompt(
                    userInput,
                    imageInstructionForAI,
                    discussionLog,
                    lastTurnTextForLog,
                    commonPromptInstructions(),
                    currentNotepadContent,
                    discussionMode === DiscussionMode.AiDriven && previousAiSignaledStop
                );
                result = await executeStepWithRetries(prompt, museModelDetails, MessageSender.Muse, imageApiPart, signal);
                if (result.parsedResponse) {
                    addMessage(result.parsedResponse.spokenText, MessageSender.Muse, MessagePurpose.MuseToCognito, result.durationMs);
                     if (typeof result.parsedResponse.notepadContent === 'string') {
                      setNotepadContent(result.parsedResponse.notepadContent);
                      pausedStateRef.current.notepadContent = result.parsedResponse.notepadContent;
                    }
                    pausedStateRef.current.discussionLog.push(`${MessageSender.Muse}: ${result.parsedResponse.spokenText}`);
                    pausedStateRef.current.lastTurnTextForLog = result.parsedResponse.spokenText;
                    if (discussionMode === DiscussionMode.AiDriven && previousAiSignaledStop && result.parsedResponse.discussionShouldEnd) {
                       addMessage(`双方AI (${MessageSender.Cognito} 和 ${MessageSender.Muse}) 已同意结束讨论。`, MessageSender.System, MessagePurpose.SystemNotification);
                       nextDiscussionStep = 'cognito_final';
                    } else {
                       pausedStateRef.current.previousAiSignaledStop = result.parsedResponse.discussionShouldEnd || false;
                       nextDiscussionStep = 'cognito_reply';
                    }
                }
                break;
            }
            case 'cognito_reply': {
                setIsInternalDiscussionActive(true);
                addMessage(`${MessageSender.Cognito} 正在回应 ${MessageSender.Muse} (使用 ${cognitoModelDetails.name})...`, MessageSender.System, MessagePurpose.SystemNotification);
                const prompt = createCognitoReplyPrompt(
                    userInput,
                    imageInstructionForAI,
                    discussionLog,
                    lastTurnTextForLog,
                    commonPromptInstructions(),
                    currentNotepadContent,
                    discussionMode === DiscussionMode.AiDriven && previousAiSignaledStop
                );
                result = await executeStepWithRetries(prompt, cognitoModelDetails, MessageSender.Cognito, imageApiPart, signal);
                 if (result.parsedResponse) {
                    addMessage(result.parsedResponse.spokenText, MessageSender.Cognito, MessagePurpose.CognitoToMuse, result.durationMs);
                    if (typeof result.parsedResponse.notepadContent === 'string') {
                      setNotepadContent(result.parsedResponse.notepadContent);
                      pausedStateRef.current.notepadContent = result.parsedResponse.notepadContent;
                    }
                    pausedStateRef.current.discussionLog.push(`${MessageSender.Cognito}: ${result.parsedResponse.spokenText}`);
                    pausedStateRef.current.lastTurnTextForLog = result.parsedResponse.spokenText;
                    pausedStateRef.current.turn += 1;
                    if (discussionMode === DiscussionMode.AiDriven && previousAiSignaledStop && result.parsedResponse.discussionShouldEnd) {
                       addMessage(`双方AI (${MessageSender.Cognito} 和 ${MessageSender.Muse}) 已同意结束讨论。`, MessageSender.System, MessagePurpose.SystemNotification);
                       nextDiscussionStep = 'cognito_final';
                    } else {
                       pausedStateRef.current.previousAiSignaledStop = result.parsedResponse.discussionShouldEnd || false;
                       nextDiscussionStep = 'muse_reply';
                    }
                }
                break;
            }
            case 'cognito_final': {
                setIsInternalDiscussionActive(false);
                addMessage(`${MessageSender.Cognito} 正在综合讨论内容，准备最终答案 (使用 ${cognitoModelDetails.name})...`, MessageSender.System, MessagePurpose.SystemNotification);
                const prompt = createFinalAnswerPrompt(
                    userInput,
                    imageInstructionForAI,
                    discussionLog,
                    currentNotepadContent
                );
                result = await executeStepWithRetries(prompt, cognitoModelDetails, MessageSender.Cognito, imageApiPart, signal);
                if (result.parsedResponse) {
                   addMessage(result.parsedResponse.spokenText, MessageSender.Cognito, MessagePurpose.FinalResponse, result.durationMs);
                   if (typeof result.parsedResponse.notepadContent === 'string') {
                      setNotepadContent(result.parsedResponse.notepadContent);
                   }
                }
                nextDiscussionStep = 'finished';
                break;
            }
        }

        if (!result || result.errorType) {
            if(result?.errorType === 'Cancelled') {
                // This is fine, it means we paused. The state is already 'paused'. Don't do anything else.
                return; 
            }
            if(result?.errorType === 'ApiKeyMissing' || result?.errorType === 'ApiKeyInvalid') {
                 setGlobalApiKeyStatus({ isMissing: result.errorType === 'ApiKeyMissing', isInvalid: result.errorType === 'ApiKeyInvalid', message: result.errorMessage });
                 if(result.errorMessage) addMessage(result.errorMessage, MessageSender.System, MessagePurpose.SystemNotification);
            }
            // Any other error, we stop.
            setProcessingState('idle');
            stopProcessingTimer();
            setIsInternalDiscussionActive(false);
            return;
        }

        pausedStateRef.current.nextStep = nextDiscussionStep;
        setDiscussionLog([...pausedStateRef.current.discussionLog]);

        if (nextDiscussionStep === 'finished') {
            setLastCompletedTurnCount(pausedStateRef.current.turn);
            setProcessingState('idle');
            stopProcessingTimer();
            setIsInternalDiscussionActive(false);
        } else {
            // Check if we are still processing, if so, continue the loop
            if (processingStateRef.current === 'processing') {
                resumeChatProcessing();
            }
        }

    } catch (error) {
        console.error("Chat processing error:", error);
        addMessage(`处理中发生意外错误: ${(error as Error).message}`, MessageSender.System, MessagePurpose.SystemNotification);
        setProcessingState('idle');
        stopProcessingTimer();
        setIsInternalDiscussionActive(false);
    }
  }, [addMessage, executeStepWithRetries, cognitoModelDetails, museModelDetails, commonPromptInstructions, discussionMode, manualFixedTurns, setGlobalApiKeyStatus, stopProcessingTimer, setNotepadContent]);

  const processingStateRef = useRef(processingState);
  useEffect(() => {
    processingStateRef.current = processingState;
  }, [processingState]);

  const startChatProcessing = useCallback(async (userInput: string, imageFile?: File | null) => {
    if (processingState !== 'idle') return;
    if (!userInput.trim() && !imageFile) return;
    
    setProcessingState('processing');
    setDiscussionLog([]);
    setCurrentDiscussionTurn(0);
    setIsInternalDiscussionActive(false);
    setGlobalApiKeyStatus({}); 
    startProcessingTimer();

    let userImageForDisplay: ChatMessage['image'] | undefined = undefined;
    let imageApiPart: { inlineData: { mimeType: string; data: string } } | undefined = undefined;

    if (imageFile) {
      try {
        const dataUrl = URL.createObjectURL(imageFile); 
        userImageForDisplay = { dataUrl, name: imageFile.name, type: imageFile.type };
        const base64Data = await fileToBase64(imageFile); 
        imageApiPart = { inlineData: { mimeType: imageFile.type, data: base64Data } };
      } catch (error) {
        console.error("图片处理失败:", error);
        addMessage("图片处理失败，请重试。", MessageSender.System, MessagePurpose.SystemNotification);
        setProcessingState('idle');
        stopProcessingTimer();
        if (userImageForDisplay?.dataUrl.startsWith('blob:')) URL.revokeObjectURL(userImageForDisplay.dataUrl);
        return;
      }
    }
    
    addMessage(userInput, MessageSender.User, MessagePurpose.UserInput, undefined, userImageForDisplay);
    
    pausedStateRef.current = {
        nextStep: 'cognito_initial',
        userInput: userInput,
        imageApiPart: imageApiPart,
        discussionLog: [],
        lastTurnTextForLog: '',
        turn: 0,
        previousAiSignaledStop: false,
        notepadContent: notepadContent,
    };
    
    resumeChatProcessing();

  }, [processingState, addMessage, startProcessingTimer, stopProcessingTimer, setGlobalApiKeyStatus, resumeChatProcessing, notepadContent]);

  const pauseGenerating = useCallback(() => {
    if (processingState === 'processing') {
        setProcessingState('paused');
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        addMessage("讨论已暂停。", MessageSender.System, MessagePurpose.SystemNotification);
    }
  }, [processingState, addMessage]);

  const resumeGenerating = useCallback(() => {
    if (processingState === 'paused') {
        setProcessingState('processing');
        addMessage("正在继续讨论...", MessageSender.System, MessagePurpose.SystemNotification);
        resumeChatProcessing();
    }
  }, [processingState, addMessage, resumeChatProcessing]);

  const stopAndClear = useCallback((onClear?: () => void) => {
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
    }
    setProcessingState('idle');
    pausedStateRef.current = null;
    setIsInternalDiscussionActive(false);
    setDiscussionLog([]);
    setCurrentDiscussionTurn(0);
    setLastCompletedTurnCount(0);
    stopProcessingTimer();
    if(onClear) onClear();
  }, [stopProcessingTimer]);


  return {
    processingState,
    discussionLog,
    startChatProcessing,
    pauseGenerating,
    resumeGenerating,
    stopAndClear,
    currentDiscussionTurn,
    isInternalDiscussionActive,
    lastCompletedTurnCount,
  };
};