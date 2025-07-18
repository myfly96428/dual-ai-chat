
import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";

// Helper to create a GoogleGenAI instance with potential custom fetch and AbortSignal
const createGoogleAIClient = (apiKey: string, customApiEndpoint?: string, signal?: AbortSignal): GoogleGenAI => {
  const clientOptions: any = { apiKey };

  // Only add a custom fetch function if we need to inject a signal or use a custom endpoint.
  if (signal || (customApiEndpoint && customApiEndpoint.trim() !== '')) {
      clientOptions.fetchFunction = async (url: any, init: any) => {
          const finalInit = { ...init, signal };
          try {
              const sdkUrl = new URL(url.toString());
              // sdkUrl.pathname includes the leading slash e.g. /v1beta/models/..
              // sdkUrl.search includes the leading question mark e.g. ?alt=json
              // sdkUrl.hash includes the leading hash
              const sdkPathAndQuery = sdkUrl.pathname + sdkUrl.search + sdkUrl.hash;
              
              let basePath = (customApiEndpoint || '').trim();
              if (basePath) { // Use custom endpoint only if it's provided
                  if (basePath.endsWith('/')) {
                      basePath = basePath.slice(0, -1);
                  }
                  const finalUrl = basePath + sdkPathAndQuery;
                  return fetch(finalUrl, finalInit);
              }
          } catch (e) {
              console.error(
                "Error constructing URL with custom endpoint. Using original SDK URL.",
                e,
                "Original URL:", url,
                "Custom Endpoint:", customApiEndpoint
              );
          }
          // Fallback to original URL if custom endpoint logic fails or endpoint is not provided
          return fetch(url, finalInit);
      };
  }
  return new GoogleGenAI(clientOptions);
};

interface GeminiResponsePayload {
  text: string;
  durationMs: number;
  error?: string; // Standardized error key
}

export const generateResponse = async (
  prompt: string,
  modelName: string,
  useCustomConfig: boolean, // New parameter to decide API config source
  customApiKey?: string,
  customApiEndpoint?: string,
  systemInstruction?: string,
  imagePart?: { inlineData: { mimeType: string; data: string } },
  thinkingConfig?: { thinkingBudget: number },
  signal?: AbortSignal
): Promise<GeminiResponsePayload> => {
  const startTime = performance.now();
  try {
    let apiKeyToUse: string | undefined;
    let endpointForClient: string | undefined;
    let missingKeyUserMessage = "";
    let invalidKeyUserMessage = "API密钥无效或权限不足。请检查您的API密钥配置和权限。";


    if (useCustomConfig) {
      apiKeyToUse = customApiKey?.trim();
      endpointForClient = customApiEndpoint; // createGoogleAIClient handles if it's empty/default
      missingKeyUserMessage = "自定义API密钥未在设置中提供。请在设置中输入密钥，或关闭“使用自定义API配置”以使用环境变量。";
      if (apiKeyToUse) { // If custom key is provided, tailor invalid message slightly
        invalidKeyUserMessage = "提供的自定义API密钥无效或权限不足。请检查设置中的密钥。";
      }
    } else {
      apiKeyToUse = process.env.API_KEY;
      endpointForClient = undefined; // Ensures default Google endpoint is used by SDK
      missingKeyUserMessage = "API密钥未在环境变量中配置。请配置该密钥，或在设置中启用并提供自定义API配置。";
      if (apiKeyToUse) { // If env key is present, tailor invalid message
         invalidKeyUserMessage = "环境变量中的API密钥无效或权限不足。请检查该密钥。";
      }
    }

    if (!apiKeyToUse) {
      console.error(missingKeyUserMessage);
      // This specific error "API key not configured" will be checked by useChatLogic
      return { text: missingKeyUserMessage, durationMs: performance.now() - startTime, error: "API key not configured" };
    }
    
    const genAI = createGoogleAIClient(apiKeyToUse, endpointForClient, signal);

    const configForApi: {
      systemInstruction?: string;
      thinkingConfig?: { thinkingBudget: number };
    } = {};

    if (systemInstruction) {
      configForApi.systemInstruction = systemInstruction;
    }
    if (thinkingConfig) {
      configForApi.thinkingConfig = thinkingConfig;
    }

    const textPart: Part = { text: prompt };
    let requestContents: string | { parts: Part[] };

    if (imagePart) {
      requestContents = { parts: [imagePart, textPart] };
    } else {
      requestContents = prompt;
    }

    const response: GenerateContentResponse = await genAI.models.generateContent({
      model: modelName,
      contents: requestContents,
      config: Object.keys(configForApi).length > 0 ? configForApi : undefined,
    });

    const durationMs = performance.now() - startTime;
    return { text: response.text, durationMs };
  } catch (error) {
    console.error("调用Gemini API时出错:", error);
    const durationMs = performance.now() - startTime;
    let errorMessage = "与AI通信时发生未知错误。";
    let errorType = "Unknown AI error";

    // Default messages, might be overridden by specific checks
    let specificMissingKeyMsg = "API密钥未配置。";
    let specificInvalidKeyMsg = "API密钥无效或权限不足。";

    if (useCustomConfig) {
        specificMissingKeyMsg = "自定义API密钥未在设置中提供。";
        specificInvalidKeyMsg = customApiKey?.trim() ? "提供的自定义API密钥无效或权限不足。" : specificMissingKeyMsg;
    } else {
        specificMissingKeyMsg = "API密钥未在环境变量中配置。";
        specificInvalidKeyMsg = process.env.API_KEY ? "环境变量中的API密钥无效或权限不足。" : specificInvalidKeyMsg;
    }


    if (error instanceof Error) {
      if (error.name === 'AbortError') {
          errorMessage = "用户取消操作";
          errorType = "Cancelled";
      } else {
          errorMessage = `与AI通信时出错: ${error.message}`;
          errorType = error.name; 
          // Error messages from GenAI lib can be generic, map them to our standardized types
          if (error.message.includes('API key not valid') || 
              error.message.includes('API_KEY_INVALID') || 
              error.message.includes('permission-denied') || // Broader permission issue
              (error.message.includes('forbidden') && error.message.toLowerCase().includes('api key'))) { // Another way an invalid key might present
             errorMessage = specificInvalidKeyMsg;
             errorType = "API key invalid or permission denied";
          } else if (error.message.includes('Quota exceeded')) {
            errorMessage = "API配额已超出。请检查您的Google AI Studio配额。";
            errorType = "Quota exceeded";
          }
      }
      // The "API key not configured" case is handled before calling createGoogleAIClient
      // and directly returned if apiKeyToUse is null/empty. This catch is for other errors.
    }
    return { text: errorMessage, durationMs, error: errorType };
  }
};