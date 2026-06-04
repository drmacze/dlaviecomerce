'use client';

import type { AiMode, ModeContent } from './aiContent';

type AiModeSwitchProps = {
  mode: AiMode;
  modes: ModeContent[];
  onModeChange: (mode: AiMode) => void;
};

export function AiModeSwitch({ mode, modes, onModeChange }: AiModeSwitchProps) {
  return (
    <div className="ai-mode-switch" role="tablist" aria-label="DLavie AI product mode">
      {modes.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={mode === item.id}
          aria-pressed={mode === item.id}
          onClick={() => onModeChange(item.id)}
        >
          <span>{item.label}</span>
          <small>{item.id === 'ai' ? 'Conversation + support' : 'Actions + workflows'}</small>
        </button>
      ))}
    </div>
  );
}
