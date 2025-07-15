import { MessageSender, DiscussionMode } from '../types';
import { DISCUSSION_COMPLETE_TAG } from '../constants';

export const generateUniqueId = (): string => Date.now().toString() + Math.random().toString(36).substr(2, 9);

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Return only the base64 part
    };
    reader.onerror = (error) => reject(error);
  });
};

export interface ParsedAIResponse {
  spokenText: string;
  discussionShouldEnd?: boolean;
  notepadContent?: string;
  durationMs?: number; // Optional duration of the AI generation
}

export const parseAIResponse = (responseText: string): Omit<ParsedAIResponse, 'durationMs'> => {
  let spokenText = responseText.trim();
  let discussionShouldEnd = false;
  let notepadContent: string | undefined = undefined;

  // Extract notepad content
  const notepadRegex = /<notepad>([\s\S]*)<\/notepad>/;
  const match = spokenText.match(notepadRegex);
  if (match && typeof match[1] === 'string') {
    notepadContent = match[1].trim();
    spokenText = spokenText.replace(notepadRegex, '').trim();
  }

  // Check for discussion complete tag
  if (spokenText.endsWith(DISCUSSION_COMPLETE_TAG)) {
    discussionShouldEnd = true;
    spokenText = spokenText.substring(0, spokenText.length - DISCUSSION_COMPLETE_TAG.length).trim();
  }
  
  // If spokenText is empty after removing the tag, or was initially empty
  if (!spokenText.trim() && discussionShouldEnd) {
    spokenText = `(AI 建议结束讨论)`;
  } else if (!spokenText.trim() && !discussionShouldEnd) {
    spokenText = "(AI 未提供额外文本回复)";
  }

  return { spokenText, discussionShouldEnd, notepadContent };
};


export const getWelcomeMessageText = (
  cognitoModelNameFromDetails: string,
  museModelNameFromDetails: string,
  currentDiscussionMode: DiscussionMode,
  currentManualFixedTurns: number,
  isOpenAiActive: boolean,
  openAiCognitoModelId?: string,
  openAiMuseModelId?: string
): string => {
  let modeDescription = "";
  if (currentDiscussionMode === DiscussionMode.FixedTurns) {
    modeDescription = `固定轮次对话 (${currentManualFixedTurns}轮)`;
  } else {
    modeDescription = "AI驱动(不固定轮次)对话";
  }

  let modelInfo = "";
  if (isOpenAiActive) {
    const cognitoDisplay = openAiCognitoModelId || '未指定';
    const museDisplay = openAiMuseModelId || '未指定';
    if (cognitoDisplay === museDisplay) {
        modelInfo = `OpenAI 模型: ${cognitoDisplay}`;
    } else {
        modelInfo = `OpenAI Cognito: ${cognitoDisplay}, OpenAI Muse: ${museDisplay}`;
    }
  } else {
    modelInfo = `Cognito 模型: ${cognitoModelNameFromDetails}, Muse 模型: ${museModelNameFromDetails}`;
  }

  return `欢迎使用Dual AI Chat！当前模式: ${modeDescription}。\n${modelInfo}.\n在下方输入您的问题或上传图片。${MessageSender.Cognito} 和 ${MessageSender.Muse} 将进行讨论，然后 ${MessageSender.Cognito} 会提供最终答案。`;
};