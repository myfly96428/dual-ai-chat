
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Paperclip, XCircle, StopCircle, Play } from 'lucide-react';
import { ProcessingState } from '../types';

interface ChatInputProps {
  onSendMessage: (message: string, imageFile?: File | null) => void;
  processingState: ProcessingState;
  isApiKeyMissing: boolean;
  onPause: () => void;
  onResume: () => void;
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, processingState, isApiKeyMissing, onPause, onResume }) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isProcessing = processingState === 'processing';
  const isPaused = processingState === 'paused';
  const isIdle = processingState === 'idle';

  useEffect(() => {
    if (selectedImage) {
      const objectUrl = URL.createObjectURL(selectedImage);
      setImagePreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setImagePreviewUrl(null);
  }, [selectedImage]);

  const handleImageFile = (file: File | null) => {
    if (file && ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setSelectedImage(file);
    } else if (file) {
      alert('不支持的文件类型。请选择 JPG, PNG, GIF, 或 WEBP 格式的图片。');
      setSelectedImage(null);
    } else {
      setSelectedImage(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreviewUrl(null);
  };

  const triggerSendMessage = () => {
    if ((inputValue.trim() || selectedImage) && isIdle && !isApiKeyMissing) {
      onSendMessage(inputValue.trim(), selectedImage);
      setInputValue('');
      removeImage();
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isIdle) {
      triggerSendMessage();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isIdle) {
        triggerSendMessage();
      }
    }
  };

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (ACCEPTED_IMAGE_TYPES.includes(items[i].type)) {
          const file = items[i].getAsFile();
          if (file) {
            handleImageFile(file);
            e.preventDefault();
            break;
          }
        }
      }
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleFileButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImageFile(e.target.files[0]);
    }
  };
  
  const handleMainButtonClick = () => {
      if (isProcessing) {
          onPause();
      } else if (isPaused) {
          onResume();
      } else { // isIdle
          triggerSendMessage();
      }
  };

  const isDisabledInput = !isIdle || isApiKeyMissing;

  const getButtonState = () => {
      if(isProcessing) {
          return {
              label: "暂停生成",
              icon: <StopCircle size={24} />,
              className: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
              disabled: false
          };
      }
      if(isPaused) {
          return {
              label: "继续生成",
              icon: <Play size={24} />,
              className: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
              disabled: false
          };
      }
      // isIdle
      const isSendDisabled = isApiKeyMissing || (!inputValue.trim() && !selectedImage);
      return {
          label: "发送消息",
          icon: <Send size={24} />,
          className: `bg-sky-600 hover:bg-sky-700 focus:ring-sky-500 ${isSendDisabled ? 'opacity-50 cursor-not-allowed' : ''}`,
          disabled: isSendDisabled
      };
  }

  const buttonState = getButtonState();

  return (
    <form onSubmit={handleFormSubmit} className="px-4 pt-4 pb-0 mb-0 bg-gray-100 border-t border-gray-300">
      {imagePreviewUrl && selectedImage && (
        <div className="mb-2 p-2 bg-gray-200 rounded-md relative max-w-xs border border-gray-300">
          <img src={imagePreviewUrl} alt={selectedImage.name || "图片预览"} className="max-h-24 max-w-full rounded" />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-1 right-1 bg-black bg-opacity-40 text-white rounded-full p-0.5 hover:bg-opacity-60"
            aria-label="移除图片"
          >
            <XCircle size={20} />
          </button>
          <div className="text-xs text-gray-600 mt-1 truncate">{selectedImage.name} ({(selectedImage.size / 1024).toFixed(1)} KB)</div>
        </div>
      )}
      <div className="flex items-center space-x-2">
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          placeholder="询问任何问题"
          className={`flex-grow p-3 bg-white border border-gray-400 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none placeholder-gray-500 text-gray-800 disabled:opacity-60 resize-none min-h-[48px] max-h-[150px] ${isDraggingOver ? 'ring-2 ring-sky-500 border-sky-500' : ''}`}
          rows={1}
          disabled={isDisabledInput}
          aria-label="聊天输入框"
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${target.scrollHeight}px`;
          }}
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelected}
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          className="hidden"
          aria-label="选择图片文件"
        />
        <button
          type="button"
          onClick={handleFileButtonClick}
          className="p-3 bg-gray-300 hover:bg-gray-400 rounded-lg text-gray-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-gray-100 disabled:opacity-50 disabled:cursor-not-allowed h-[48px]"
          disabled={isDisabledInput}
          aria-label="添加图片附件"
          title="添加图片"
        >
          <Paperclip size={24} />
        </button>
        <button
          type="button"
          onClick={handleMainButtonClick}
          className={`p-3 rounded-lg text-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 h-[48px] flex items-center justify-center ${buttonState.className}`}
          disabled={buttonState.disabled}
          aria-label={buttonState.label}
          title={buttonState.label}
        >
          {buttonState.icon}
        </button>
      </div>
    </form>
  );
};

export default ChatInput;