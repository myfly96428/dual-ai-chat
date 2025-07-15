
import React from 'react';
import { CaseSensitive } from 'lucide-react';
import { commonClasses } from './index';
import { ProcessingState } from '../../types';

const FONT_SIZE_OPTIONS = [
  { label: '小', value: 0.875 },
  { label: '中', value: 1.0 },
  { label: '大', value: 1.125 },
  { label: '特大', value: 1.25 },
];

interface AppearanceSettingsProps {
    processingState: ProcessingState;
    fontSizeScale: number;
    onFontSizeScaleChange: (scale: number) => void;
}

const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({
    processingState,
    fontSizeScale,
    onFontSizeScaleChange,
}) => {
    const isLocked = processingState === 'processing';
    return (
        <section aria-labelledby="font-size-settings-heading">
            <h3 id="font-size-settings-heading" className={commonClasses.sectionHeading}>文字大小</h3>
            <div className="flex items-center space-x-2">
                <CaseSensitive size={20} className="mr-1 text-sky-600 flex-shrink-0" />
                <label className="text-sm text-gray-700 font-medium whitespace-nowrap">界面文字:</label>
                <div className="flex flex-wrap gap-2">
                {FONT_SIZE_OPTIONS.map(option => (
                    <button
                    key={option.value}
                    onClick={() => !isLocked && onFontSizeScaleChange(option.value)}
                    disabled={isLocked}
                    className={`px-3 py-1.5 text-xs rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1
                        ${fontSizeScale === option.value 
                            ? 'bg-sky-600 text-white border-sky-700' 
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed'}
                    `}
                    aria-pressed={fontSizeScale === option.value}
                    >
                    {option.label}
                    </button>
                ))}
                </div>
            </div>
        </section>
    );
};

export default AppearanceSettings;
