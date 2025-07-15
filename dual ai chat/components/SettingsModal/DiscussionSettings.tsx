
import React from 'react';
import { DiscussionMode, ProcessingState } from '../../types';
import { Bot, MessagesSquare } from 'lucide-react';
import { commonClasses } from './index';

interface DiscussionSettingsProps {
    processingState: ProcessingState;
    discussionMode: DiscussionMode;
    onDiscussionModeChange: (mode: DiscussionMode) => void;
    manualFixedTurns: number;
    onManualFixedTurnsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    minManualFixedTurns: number;
}

const DiscussionSettings: React.FC<DiscussionSettingsProps> = ({
    processingState,
    discussionMode,
    onDiscussionModeChange,
    manualFixedTurns,
    onManualFixedTurnsChange,
    minManualFixedTurns,
}) => {
    const isLocked = processingState !== 'idle';

    const handleDiscussionModeToggle = () => {
        if (!isLocked) {
          onDiscussionModeChange(discussionMode === DiscussionMode.FixedTurns ? DiscussionMode.AiDriven : DiscussionMode.FixedTurns);
        }
    };

    return (
        <section aria-labelledby="discussion-settings-heading">
            <h3 id="discussion-settings-heading" className={commonClasses.sectionHeading}>讨论设置</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="discussionModeToggleModal" className={`${commonClasses.toggleLabelBase} ${isLocked ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:text-sky-600'}`}
                  title={discussionMode === DiscussionMode.FixedTurns ? "切换到AI驱动轮次模式" : "切换到固定轮次模式"}>
                  {discussionMode === DiscussionMode.FixedTurns ? <MessagesSquare size={20} className="mr-2 text-sky-600" /> : <Bot size={20} className="mr-2 text-sky-600" />}
                  <span className="select-none">对话轮数模式:</span>
                </label>
                <div className={commonClasses.toggleButtonContainer}>
                    <button
                        id="discussionModeToggleModal"
                        onClick={handleDiscussionModeToggle}
                         className={`${commonClasses.toggleButton} ${isLocked ? 'cursor-not-allowed opacity-70' : ''}`}
                        disabled={isLocked} role="switch" aria-checked={discussionMode === DiscussionMode.AiDriven}>
                        <span className={`${commonClasses.toggleButtonSwitch} ${discussionMode === DiscussionMode.AiDriven ? 'bg-sky-500' : 'bg-gray-300'}`}></span>
                        <span className={`${commonClasses.toggleButtonKnob} ${discussionMode === DiscussionMode.AiDriven ? 'translate-x-4' : ''}`}></span>
                    </button>
                    <span className={commonClasses.toggleText}>
                        {discussionMode === DiscussionMode.FixedTurns ? '固定轮次' : 'AI驱动'}
                    </span>
                </div>
              </div>
              {discussionMode === DiscussionMode.FixedTurns && (
                <div className="flex items-center space-x-2 pl-7">
                  <label htmlFor="manualFixedTurnsInputModal" className="text-sm text-gray-700 font-medium">固定轮数:</label>
                  <input 
                    type="number" 
                    id="manualFixedTurnsInputModal" 
                    value={manualFixedTurns} 
                    onChange={onManualFixedTurnsChange}
                    min={minManualFixedTurns} 
                    disabled={isLocked}
                    className="w-20 bg-white border border-gray-300 text-gray-800 text-sm rounded-md p-1.5 text-center focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                    aria-label={`设置固定对话轮数, 最小 ${minManualFixedTurns}`}
                  />
                  <span className="text-sm text-gray-600">轮 (最小: {minManualFixedTurns})</span>
                </div>
              )}
            </div>
        </section>
    );
};

export default DiscussionSettings;
