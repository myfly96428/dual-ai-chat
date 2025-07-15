
import { useState, useEffect } from 'react';
import { DiscussionMode } from '../types';
import {
  DEFAULT_COGNITO_MODEL_API_NAME,
  DEFAULT_MUSE_MODEL_API_NAME,
  COGNITO_SYSTEM_PROMPT_HEADER,
  MUSE_SYSTEM_PROMPT_HEADER,
  DEFAULT_MANUAL_FIXED_TURNS,
  CUSTOM_API_ENDPOINT_STORAGE_KEY,
  CUSTOM_API_KEY_STORAGE_KEY,
  USE_CUSTOM_API_CONFIG_STORAGE_KEY,
  USE_OPENAI_API_CONFIG_STORAGE_KEY,
  OPENAI_API_BASE_URL_STORAGE_KEY,
  OPENAI_API_KEY_STORAGE_KEY,
  OPENAI_COGNITO_MODEL_ID_STORAGE_KEY,
  OPENAI_MUSE_MODEL_ID_STORAGE_KEY,
  DEFAULT_OPENAI_API_BASE_URL,
  DEFAULT_OPENAI_COGNITO_MODEL_ID,
  DEFAULT_OPENAI_MUSE_MODEL_ID,
  DEFAULT_GEMINI_CUSTOM_API_ENDPOINT,
} from '../constants';

const FONT_SIZE_STORAGE_KEY = 'dualAiChatFontSizeScale';
const DEFAULT_FONT_SIZE_SCALE = 0.875;

export const useConfiguration = () => {
    const [useCustomApiConfig, setUseCustomApiConfig] = useState<boolean>(() => {
        const storedValue = localStorage.getItem(USE_CUSTOM_API_CONFIG_STORAGE_KEY);
        return storedValue ? storedValue === 'true' : false; 
    });
    const [customApiEndpoint, setCustomApiEndpoint] = useState<string>(() => localStorage.getItem(CUSTOM_API_ENDPOINT_STORAGE_KEY) || DEFAULT_GEMINI_CUSTOM_API_ENDPOINT);
    const [customApiKey, setCustomApiKey] = useState<string>(() => localStorage.getItem(CUSTOM_API_KEY_STORAGE_KEY) || '');
    
    const [useOpenAiApiConfig, setUseOpenAiApiConfig] = useState<boolean>(() => {
        const storedValue = localStorage.getItem(USE_OPENAI_API_CONFIG_STORAGE_KEY);
        const customConfig = localStorage.getItem(USE_CUSTOM_API_CONFIG_STORAGE_KEY) === 'true';
        if (customConfig && storedValue === null) return false;
        return storedValue ? storedValue === 'true' : false;
    });
    const [openAiApiBaseUrl, setOpenAiApiBaseUrl] = useState<string>(() => localStorage.getItem(OPENAI_API_BASE_URL_STORAGE_KEY) || DEFAULT_OPENAI_API_BASE_URL);
    const [openAiApiKey, setOpenAiApiKey] = useState<string>(() => localStorage.getItem(OPENAI_API_KEY_STORAGE_KEY) || '');
    const [openAiCognitoModelId, setOpenAiCognitoModelId] = useState<string>(() => localStorage.getItem(OPENAI_COGNITO_MODEL_ID_STORAGE_KEY) || DEFAULT_OPENAI_COGNITO_MODEL_ID);
    const [openAiMuseModelId, setOpenAiMuseModelId] = useState<string>(() => localStorage.getItem(OPENAI_MUSE_MODEL_ID_STORAGE_KEY) || DEFAULT_OPENAI_MUSE_MODEL_ID);

    const [selectedCognitoModelApiName, setSelectedCognitoModelApiName] = useState<string>(DEFAULT_COGNITO_MODEL_API_NAME);
    const [selectedMuseModelApiName, setSelectedMuseModelApiName] = useState<string>(DEFAULT_MUSE_MODEL_API_NAME);
    const [discussionMode, setDiscussionMode] = useState<DiscussionMode>(DiscussionMode.AiDriven);
    const [manualFixedTurns, setManualFixedTurns] = useState<number>(DEFAULT_MANUAL_FIXED_TURNS);
    const [isThinkingBudgetActive, setIsThinkingBudgetActive] = useState<boolean>(true);
    const [cognitoSystemPrompt, setCognitoSystemPrompt] = useState<string>(COGNITO_SYSTEM_PROMPT_HEADER);
    const [museSystemPrompt, setMuseSystemPrompt] = useState<string>(MUSE_SYSTEM_PROMPT_HEADER);
    const [fontSizeScale, setFontSizeScale] = useState<number>(() => {
        const storedScale = localStorage.getItem(FONT_SIZE_STORAGE_KEY);
        return storedScale ? parseFloat(storedScale) : DEFAULT_FONT_SIZE_SCALE;
    });

    useEffect(() => { localStorage.setItem(USE_CUSTOM_API_CONFIG_STORAGE_KEY, useCustomApiConfig.toString()); }, [useCustomApiConfig]);
    useEffect(() => { localStorage.setItem(CUSTOM_API_ENDPOINT_STORAGE_KEY, customApiEndpoint); }, [customApiEndpoint]);
    useEffect(() => { localStorage.setItem(CUSTOM_API_KEY_STORAGE_KEY, customApiKey); }, [customApiKey]);

    useEffect(() => { localStorage.setItem(USE_OPENAI_API_CONFIG_STORAGE_KEY, useOpenAiApiConfig.toString()); }, [useOpenAiApiConfig]);
    useEffect(() => { localStorage.setItem(OPENAI_API_BASE_URL_STORAGE_KEY, openAiApiBaseUrl); }, [openAiApiBaseUrl]);
    useEffect(() => { localStorage.setItem(OPENAI_API_KEY_STORAGE_KEY, openAiApiKey); }, [openAiApiKey]);
    useEffect(() => { localStorage.setItem(OPENAI_COGNITO_MODEL_ID_STORAGE_KEY, openAiCognitoModelId); }, [openAiCognitoModelId]);
    useEffect(() => { localStorage.setItem(OPENAI_MUSE_MODEL_ID_STORAGE_KEY, openAiMuseModelId); }, [openAiMuseModelId]);

    useEffect(() => {
        document.documentElement.style.fontSize = `${fontSizeScale * 100}%`;
        localStorage.setItem(FONT_SIZE_STORAGE_KEY, fontSizeScale.toString());
    }, [fontSizeScale]);

    const handleUseCustomGeminiApiConfigChange = () => {
        const newValue = !useCustomApiConfig;
        setUseCustomApiConfig(newValue);
        if (newValue && useOpenAiApiConfig) { 
            setUseOpenAiApiConfig(false);      
        }
    };

    const handleUseOpenAiApiConfigChange = () => {
        const newValue = !useOpenAiApiConfig;
        setUseOpenAiApiConfig(newValue);
        if (newValue && useCustomApiConfig) { 
            setUseCustomApiConfig(false);       
        }
    };

    return {
        useCustomApiConfig, setUseCustomApiConfig,
        customApiEndpoint, setCustomApiEndpoint,
        customApiKey, setCustomApiKey,
        useOpenAiApiConfig, setUseOpenAiApiConfig,
        openAiApiBaseUrl, setOpenAiApiBaseUrl,
        openAiApiKey, setOpenAiApiKey,
        openAiCognitoModelId, setOpenAiCognitoModelId,
        openAiMuseModelId, setOpenAiMuseModelId,
        selectedCognitoModelApiName, setSelectedCognitoModelApiName,
        selectedMuseModelApiName, setSelectedMuseModelApiName,
        discussionMode, setDiscussionMode,
        manualFixedTurns, setManualFixedTurns,
        isThinkingBudgetActive, setIsThinkingBudgetActive,
        cognitoSystemPrompt, setCognitoSystemPrompt,
        museSystemPrompt, setMuseSystemPrompt,
        fontSizeScale, setFontSizeScale,
        handleUseCustomGeminiApiConfigChange,
        handleUseOpenAiApiConfigChange,
    };
};
