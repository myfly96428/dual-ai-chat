
export const GEMINI_2_5_FLASH_MODEL_ID = 'gemini-2.5-flash-preview-04-17';
export const GEMINI_PRO_MODEL_ID = 'gemini-2.5-pro'; // Kept as an option
export const GEMINI_FLASH_LITE_PREVIEW_MODEL_ID = 'gemini-2.5-flash-lite-preview-06-17';
export const GEMMA_3_27B_IT_MODEL_ID = 'gemma-3-27b-it';
export const GEMINI_2_5_PRO_PREVIEW_05_06_MODEL_ID = 'gemini-2.5-pro-preview-05-06';


export interface AiModel {
  id: string;
  name: string;
  apiName: string;
  supportsThinkingConfig?: boolean;
  supportsSystemInstruction?: boolean;
}

export const MODELS: AiModel[] = [
  {
    id: 'gemini-2.5-flash-preview-04-17',
    name: 'Gemini 2.5 Flash (0417)',
    apiName: GEMINI_2_5_FLASH_MODEL_ID, 
    supportsThinkingConfig: true, // Only this model supports thinking config per guidelines
    supportsSystemInstruction: true,
  },
  {
    id: 'pro-2.5',
    name: 'Gemini 2.5 Pro',
    apiName: GEMINI_PRO_MODEL_ID, 
    supportsThinkingConfig: false, // Per guidelines
    supportsSystemInstruction: true,
  },
  {
    id: 'pro-2.5-preview-05-06',
    name: 'Gemini 2.5 Pro (0506)',
    apiName: GEMINI_2_5_PRO_PREVIEW_05_06_MODEL_ID,
    supportsThinkingConfig: false, // Per guidelines
    supportsSystemInstruction: true,
  },
  {
    id: 'flash-lite-preview-06-17',
    name: 'Gemini 2.5 Flash Lite',
    apiName: GEMINI_FLASH_LITE_PREVIEW_MODEL_ID, 
    supportsThinkingConfig: false, // Per guidelines
    supportsSystemInstruction: true,
  },
  {
    id: 'gemma-3-27b-it',
    name: 'Gemma-3-27B',
    apiName: GEMMA_3_27B_IT_MODEL_ID, 
    supportsThinkingConfig: false,
    supportsSystemInstruction: false,
  },
];

export const DEFAULT_COGNITO_MODEL_API_NAME = GEMINI_PRO_MODEL_ID;
export const DEFAULT_MUSE_MODEL_API_NAME = GEMINI_PRO_MODEL_ID;


// Configuration for a high-quality thinking budget for Flash models
export const THINKING_BUDGET_CONFIG_HIGH_QUALITY = { thinkingConfig: { thinkingBudget: 24576 } };

// Configuration for a high-quality thinking budget for Pro model (kept if Pro is an option)
// This constant remains defined but will not be used by getThinkingConfigForGeminiModel if Pro models don't support it.
export const THINKING_BUDGET_CONFIG_PRO_HIGH_QUALITY = { thinkingConfig: { thinkingBudget: 32768 } };

export const DISCUSSION_COMPLETE_TAG = "<DISCUSSION_COMPLETE>";

export const COGNITO_SYSTEM_PROMPT_HEADER = `You are Cognito, an AI with strong logical thinking and proficient in analysis and argumentation. Your duty is to generate accurate, rigorous, and on - topic answers and solutions in each round of debate with Muse to respond to and address Muse's challenges, while absorbing Muse's beneficial views and insights.  Your AI partner Muse is designed to be highly skeptical and will critically challenge your views in a demanding tone. Collaborate with Muse to make your solutions more rigorous, accurate, and insightful. **Maintain logical rigor, provide clear and well-supported arguments and profound reasoning to respond to Muse's challenges, and integrate its beneficial perspectives into your solutions. ** The dialogue between you should be a rigorous and constructive debate despite the challenges. Strive to reach a final response that is rigorous, accurate, profound, and comprehensive. You will **use a shared notepad** to track facts, especially complex calculation or proof processes to prevent forgetting in subsequent discussions; your primary instructions for using it will be provided with **each turn**. Indicate the conclusion when you believe all necessary aspects have been explored and all solution details perfected.`;
export const MUSE_SYSTEM_PROMPT_HEADER = `You are Muse, an AI with profound creativity and deep - seated skepticism. Your primary responsibility is to examine Cognito's responses from an opposing stance with rigorous logic, rigorously question assumptions, ensuring every angle is thoroughly examined. Your AI partner, Cognito, is highly logical and adept at analysis. Your task is to provoke Cognito into deeper thinking by adopting a challenging, even slightly taunting, yet professional tone. Question Cognito's statements intensely: 'Are you *sure* about that?', 'That sounds too simple, what are you missing?', 'Is that *all* you've got, Cognito?'. Don't just accept Cognito's points; dissect them, ** **always stay extreme vigilant, continuously** point out logical flaws, Check the accuracy of cognito calculations and demand airtight justifications. Repeatedly examine and observe extreme, boundary, and subtle situations, construct counterexamples to refute, and explore different answer and lines of thinking based on these observations.** Your aim is not to simply praise or agree, but to force a more robust and comprehensive answer through relentless, critical, and imaginative inquiry. Your dialogue should be a serious, rigorous, and intellectually deep - diving debate, leading to an optimal, high - quality final response. **You must be loyal to the user's original question and avoid making overly nitpicky attacks or overly divergent topic expansions.** **Focus on uncover the real flaws in logic, calculation, and details.** You will also check and question the conclusions and observations **in the shared notepad**, taking care to **retain those conclusions and observations that have been fully verified or confirmed to be outdated**; your primary instructions for using it will be provided with **each turn**.`;

export const DEFAULT_MANUAL_FIXED_TURNS = 2;
export const MIN_MANUAL_FIXED_TURNS = 1;

export const AI_DRIVEN_DISCUSSION_INSTRUCTION_PROMPT_PART = `
Instruction for ending discussion: If you believe the current topic has been sufficiently explored between you and your AI partner for Cognito to synthesize a final answer for the user, include the exact tag ${DISCUSSION_COMPLETE_TAG} at the very end of your current message. **Use this tag extremely cautiously, because your companion will use deceptive arguments to cover up logical loopholes.** Do not use this tag if you wish to continue the discussion or require more input/response from your partner.
`;

// RETRY_DELAY_BASE_MS is not used.

// Gemini Custom API Config
export const CUSTOM_API_ENDPOINT_STORAGE_KEY = 'dualAiChatCustomApiEndpoint';
export const CUSTOM_API_KEY_STORAGE_KEY = 'dualAiChatCustomApiKey';
export const USE_CUSTOM_API_CONFIG_STORAGE_KEY = 'dualAiChatUseCustomApiConfig';
export const DEFAULT_GEMINI_CUSTOM_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta';

// OpenAI-Compatible API Config
export const USE_OPENAI_API_CONFIG_STORAGE_KEY = 'dualAiChatUseOpenAiApiConfig';
export const OPENAI_API_BASE_URL_STORAGE_KEY = 'dualAiChatOpenAiApiBaseUrl';
export const OPENAI_API_KEY_STORAGE_KEY = 'dualAiChatOpenAiApiKey';
export const OPENAI_COGNITO_MODEL_ID_STORAGE_KEY = 'dualAiChatOpenAiCognitoModelId';
export const OPENAI_MUSE_MODEL_ID_STORAGE_KEY = 'dualAiChatOpenAiMuseModelId';

export const DEFAULT_OPENAI_API_BASE_URL = 'https://x666.me/v1'; 
export const DEFAULT_OPENAI_COGNITO_MODEL_ID = 'gemini-2.5-pro'; 
export const DEFAULT_OPENAI_MUSE_MODEL_ID = 'gemini-2.5-pro';