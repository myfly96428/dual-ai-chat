import { MessageSender } from '../types';
import { DISCUSSION_COMPLETE_TAG } from '../constants';

const getNotepadInstruction = (notepadContent: string): string => {
  return `\n\n--- 记事本内容 ---\n${notepadContent || '当前记事本为空。'}\n--- 记事本结束 ---\n\n你的任务分为两部分：\n1.  根据上述记事本和当前对话及你的身份，提供你的观点和回应。\n2.  在你完成回应后，你【必须】输出一个更新后的完整记事本。**将所有记事本内容包裹在 <notepad>...</notepad> 标签内**。请在记事本中添加新的经讨论核实确认后的观察与结论，并将过时包括错误的信息用 [过时] 标记出来。如果记事本内容没有变化，请在标签内重复原有内容。`;
};

export const createCognitoInitialPrompt = (
  userInput: string,
  imageInstruction: string,
  commonInstructions: string,
  notepadContent: string
): string => {
  const prompt = `${`用户的查询 (中文) 是: "${userInput}". ${imageInstruction} 请针对此查询提供您的完整方案，以便 ${MessageSender.Muse} (创意型AI) 可以回应并与您开始讨论。用中文回答。`}\n${commonInstructions}${getNotepadInstruction(notepadContent)}`;
  return prompt;
};

export const createMuseReplyPrompt = (
  userInput: string,
  imageInstruction: string,
  discussionLog: string[],
  lastTurnTextForLog: string,
  commonInstructions: string,
  notepadContent: string,
  shouldPromptForAgreement: boolean
): string => {
  let prompt = `用户的查询 (中文) 是: "${userInput}". ${imageInstruction} 当前讨论 (均为中文):\n${discussionLog.join("\n")}\n${MessageSender.Cognito} (逻辑AI) 刚刚说 (中文): "${lastTurnTextForLog}". 请回复 ${MessageSender.Cognito}。继续讨论。保持您的回复警惕、绝不容忍蒙混过关和逻辑漏洞，使用中文。\n${commonInstructions}`;
  if (shouldPromptForAgreement) {
    prompt += `\n${MessageSender.Cognito} 已包含 ${DISCUSSION_COMPLETE_TAG} 建议结束讨论。如果您同意，请在您的回复中也包含 ${DISCUSSION_COMPLETE_TAG}。否则，请继续讨论。`;
  }
  return prompt + getNotepadInstruction(notepadContent);
};

export const createCognitoReplyPrompt = (
  userInput: string,
  imageInstruction: string,
  discussionLog: string[],
  lastTurnTextForLog: string,
  commonInstructions: string,
  notepadContent: string,
  shouldPromptForAgreement: boolean
): string => {
  let prompt = `用户的查询 (中文) 是: "${userInput}". ${imageInstruction} 当前讨论 (均为中文):\n${discussionLog.join("\n")}\n${MessageSender.Muse} (创意AI) 刚刚说 (中文): "${lastTurnTextForLog}". 请回复 ${MessageSender.Muse}。继续讨论。保持您的回复严谨、分析深入并使用中文。\n${commonInstructions}`;
  if (shouldPromptForAgreement) {
    prompt += `\n${MessageSender.Muse} 已包含 ${DISCUSSION_COMPLETE_TAG} 建议结束讨论。如果**你实在找不出漏洞或提不出补充**，请在您的回复中也包含 ${DISCUSSION_COMPLETE_TAG}。否则，请继续讨论。`;
  }
  return prompt + getNotepadInstruction(notepadContent);
};

export const createFinalAnswerPrompt = (
  userInput: string,
  imageInstruction: string,
  discussionLog: string[],
  notepadContent: string
): string => {
  const prompt = `用户的查询 (中文) 是: "${userInput}". ${imageInstruction} 您 (${MessageSender.Cognito}) 和 ${MessageSender.Muse} 进行了以下讨论 (均为中文):\n${discussionLog.join("\n")}\n\n--- 以下是最终记事本内容，请将其作为您生成最终答案的最终参考依据 ---\n${notepadContent || '当前记事本为空。'}\n--- 记事本结束 ---\n\n**您的最终任务是为用户生成最终答案。**\n\n**指令:**\n1.  **生成最终答案:** 基于整个对话和上方提供的最终记事本内容，**综合原始问题和所有Cognito对Muse质疑的回应和论证，不放过任何讨论的细节**，为用户创建一个**全面完整细致**、结构良好、易于理解的最终答案。最终答案可以非常长，一定要汲取讨论的**所有**想法和细节。答案必须是中文，并使用 Markdown 格式化以提高可读性。\n2. 您的回复也【绝不能】包含任何 <notepad>...</notepad> 标签。**\n\n**严格遵守以上指令。您的完整回复将是最终答案。**`;
  return prompt;
};
