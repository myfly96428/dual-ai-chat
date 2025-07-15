export enum MessageSender {
  User = '用户',
  Cognito = 'Cognito', // Logical AI
  Muse = 'Muse',     // Creative AI
  System = '系统',
}

export enum MessagePurpose {
  UserInput = 'user-input',
  SystemNotification = 'system-notification',
  CognitoToMuse = 'cognito-to-muse',      // Cognito's message to Muse for discussion
  MuseToCognito = 'muse-to-cognito',      // Muse's response to Cognito
  FinalResponse = 'final-response',       // Final response from Cognito to User
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: MessageSender;
  purpose: MessagePurpose;
  timestamp: Date;
  durationMs?: number; // Time taken to generate this message (for AI messages)
  image?: { // Optional image data for user messages
    dataUrl: string; // base64 data URL for displaying the image
    name: string;
    type: string;
  };
  onConfirm?: () => void;
  onCancel?: () => void;
}

export enum DiscussionMode {
  FixedTurns = 'fixed',
  AiDriven = 'ai-driven',
}

// New types for pause/resume functionality
export type ProcessingState = 'idle' | 'processing' | 'paused';

export type DiscussionStep = 'cognito_initial' | 'muse_reply' | 'cognito_reply' | 'cognito_final' | 'finished';

export interface PausedState {
  nextStep: DiscussionStep;
  userInput: string;
  imageApiPart?: { inlineData: { mimeType: string; data: string } };
  discussionLog: string[];
  lastTurnTextForLog: string;
  turn: number;
  previousAiSignaledStop: boolean;
  notepadContent: string;
}