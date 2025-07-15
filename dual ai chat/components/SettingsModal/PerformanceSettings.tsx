
import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { commonClasses } from './index';
import { ProcessingState } from '../../types';

interface PerformanceSettingsProps {
    processingState: ProcessingState;
    isThinkingBudgetActive: boolean;
    onThinkingBudgetToggle: () => void;
    supportsThinkingConfig: boolean;
    useOpenAiApiConfig: boolean; // Need this to determine actual support
}

const PerformanceSettings: React.FC<PerformanceSettingsProps> = ({
    processingState,
    isThinkingBudgetActive,
    onThinkingBudgetToggle,
    supportsThinkingConfig,
    useOpenAiApiConfig,
}) => {
    const actualSupportsThinkingConfig = supportsThinkingConfig && !useOpenAiApiConfig;
    const isLocked = processingState !== 'idle';

    const handleThinkingBudgetToggle = () => {
        if (!isLocked && actualSupportsThinkingConfig) {
            onThinkingBudgetToggle();
        }
    };

    return (
        <section aria-labelledby="performance-settings-heading">
            <h3 id="performance-settings-heading" className={commonClasses.sectionHeading}>模型性能</h3>
            <div className="flex items-center justify-between">
                <label htmlFor="thinkingBudgetToggleModal"
                    className={`${commonClasses.toggleLabelBase} transition-opacity ${isLocked || !actualSupportsThinkingConfig ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:text-sky-600'}`}
                    title={actualSupportsThinkingConfig ? "切换AI思考预算 (仅Gemini Flash/Pro模型)。优质模式可获得更高质量回复。" : "当前模型或API配置不支持思考预算。"}>
                    <SlidersHorizontal size={20} className={`mr-2 ${actualSupportsThinkingConfig && isThinkingBudgetActive ? 'text-sky-600' : 'text-gray-400'}`} />
                    <span className="select-none">AI思考预算 (Gemini):</span>
                </label>
                <div className={commonClasses.toggleButtonContainer}>
                     <button
                        id="thinkingBudgetToggleModal"
                        onClick={handleThinkingBudgetToggle}
                        className={`${commonClasses.toggleButton} ${isLocked || !actualSupportsThinkingConfig ? 'cursor-not-allowed opacity-70' : ''}`}
                        disabled={isLocked || !actualSupportsThinkingConfig} role="switch" aria-checked={isThinkingBudgetActive && actualSupportsThinkingConfig}>
                        <span className={`${commonClasses.toggleButtonSwitch} ${actualSupportsThinkingConfig ? (isThinkingBudgetActive ? 'bg-sky-500' : 'bg-gray-300') : 'bg-gray-200'}`}></span>
                        <span className={`${commonClasses.toggleButtonKnob} ${actualSupportsThinkingConfig && isThinkingBudgetActive ? 'translate-x-4' : ''}`}></span>
                    </button>
                    <span className={commonClasses.toggleText}>
                        {actualSupportsThinkingConfig ? (isThinkingBudgetActive ? '优质' : '标准') : 'N/A'}
                    </span>
                </div>
            </div>
             {!actualSupportsThinkingConfig && (
                <p className="text-xs text-gray-500 mt-1 pl-7">当前选定模型或API配置不支持思考预算功能。</p>
            )}
        </section>
    );
};

export default PerformanceSettings;
