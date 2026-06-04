'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { gsap } from '@dlavie/animations';
import type { DlavieAccountSession } from '../../lib/supabase/account-session';
import type { AiMode, ModeContent } from './aiContent';
import { thinkingStages } from './aiContent';

type AiConsoleProps = {
  mode: AiMode;
  content: ModeContent;
  accountSession: DlavieAccountSession;
  onModeChange: (mode: AiMode) => void;
};

type PreviewResult = {
  answer: string;
  source: 'backend' | 'demo';
  detail?: string;
};

type ChatApiResponse = {
  answer?: unknown;
  error?: {
    code?: unknown;
    message?: unknown;
  };
};

function isChatApiResponse(value: unknown): value is ChatApiResponse {
  return typeof value === 'object' && value !== null;
}

async function requestDlavieAiPreview(prompt: string, mode: AiMode, isAuthenticated: boolean, signal: AbortSignal): Promise<PreviewResult> {
  if (!isAuthenticated) {
    return {
      answer: mode === 'ai'
        ? 'Public preview mode is active. Sign in once to connect DLavie Account context, commerce guidance, and protected knowledge retrieval.'
        : 'Public preview mode is active. Sign in before DLavieOS Agent can inspect tools, queue operations, or prepare guarded actions.',
      source: 'demo',
      detail: 'No verified DLavie Account cookie was detected on the server for this page render.',
    };
  }

  const response = await fetch('/api/v1/chat', {
    method: 'POST',
    signal,
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mode: 'dlavie',
      use_rag: true,
      stream: false,
      messages: [{ role: 'user', content: prompt }],
      metadata: { surface: 'dlavie-ai-page', ui_mode: mode },
    }),
  });

  const payload: unknown = await response.json().catch(() => ({}));
  if (!isChatApiResponse(payload)) {
    return { answer: 'The AI endpoint returned an unreadable response. The local preview remains available.', source: 'demo' };
  }

  if (!response.ok) {
    const message = typeof payload.error?.message === 'string' ? payload.error.message : 'The AI endpoint could not complete this preview.';
    return {
      answer: response.status === 401
        ? 'Your DLavie Account was detected on the page, but the chat endpoint could not validate the session. Please refresh or sign in again if the session expired.'
        : message,
      source: 'demo',
      detail: response.status === 401 ? 'Account cookie validation failed at the chat endpoint.' : 'Authenticated endpoint returned an error.',
    };
  }

  if (typeof payload.answer !== 'string' || payload.answer.trim().length === 0) {
    return { answer: 'The AI endpoint responded without answer text. The local preview remains available.', source: 'demo' };
  }

  return { answer: payload.answer, source: 'backend' };
}

export function AiConsole({ mode, content, accountSession, onModeChange }: AiConsoleProps) {
  const isAuthenticated = accountSession.isAuthenticated;
  const [prompt, setPrompt] = useState(content.prompt);
  const [answer, setAnswer] = useState(content.answer);
  const [stageIndex, setStageIndex] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const [source, setSource] = useState<'backend' | 'demo'>('demo');
  const [detail, setDetail] = useState<string>(isAuthenticated ? 'DLavie Account session ready' : 'Public preview ready');
  const runIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPrompt(content.prompt);
    setAnswer(content.answer);
    setSource('demo');
    setDetail(isAuthenticated ? 'DLavie Account session ready' : 'Public preview ready');
  }, [content, isAuthenticated]);

  useEffect(() => {
    if (!isThinking) return undefined;
    const interval = window.setInterval(() => {
      setStageIndex((current) => (current + 1) % thinkingStages.length);
    }, 640);
    return () => window.clearInterval(interval);
  }, [isThinking]);

  useEffect(() => {
    if (!orbRef.current) return;
    const tween = gsap.to(orbRef.current, {
      scale: isThinking ? 1.06 : 1,
      opacity: isThinking ? 1 : 0.9,
      duration: 0.78,
      repeat: isThinking ? -1 : 0,
      yoyo: true,
      ease: 'sine.inOut',
    });
    return () => {
      tween.kill();
    };
  }, [isThinking]);

  const runPreview = async () => {
    const currentRun = runIdRef.current + 1;
    runIdRef.current = currentRun;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsThinking(true);
    setStageIndex(0);
    setDetail(isAuthenticated ? 'Checking secure DLavie Account cookie' : 'Running safe public preview');
    setAnswer('');

    if (outputRef.current) {
      gsap.fromTo(outputRef.current, { opacity: 0.52, y: 6 }, { opacity: 1, y: 0, duration: 0.36, ease: 'power2.out' });
    }

    const minimumDelay = new Promise((resolve) => window.setTimeout(resolve, 1400));
    const resultPromise = requestDlavieAiPreview(prompt, mode, isAuthenticated, controller.signal).catch((error: unknown): PreviewResult => {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return { answer: '', source: 'demo', detail: 'Preview superseded by a newer request.' };
      }
      return {
        answer: mode === 'ai'
          ? 'I prepared a safe DLavie AI preview using local context while the authenticated endpoint is unavailable.'
          : 'I prepared a guarded agent preview using local context while the authenticated endpoint is unavailable.',
        source: 'demo',
        detail: 'Network or authentication boundary reached.',
      };
    });

    const [result] = await Promise.all([resultPromise, minimumDelay]);
    if (runIdRef.current !== currentRun || controller.signal.aborted) return;

    setIsThinking(false);
    setSource(result.source);
    setDetail(result.detail ?? (result.source === 'backend' ? 'Answered by authenticated DLavie chat endpoint' : 'Answered by local page preview'));
    setAnswer(result.answer || content.answer);

    if (outputRef.current) {
      gsap.fromTo(outputRef.current, { opacity: 0, y: 10, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, ease: 'power3.out' });
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runPreview();
  };

  return (
    <article className="ai-console" data-ai-console>
      <div className="ai-console__chrome">
        <div className="ai-console__window" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="ai-console__status">
          <span className="ai-console__status-dot" />
          {source === 'backend' ? 'Connected endpoint' : isAuthenticated ? 'Account ready' : 'Safe preview'}
        </div>
      </div>

      <div className="ai-console__mode" role="tablist" aria-label="AI console mode">
        <button type="button" role="tab" aria-selected={mode === 'ai'} aria-pressed={mode === 'ai'} onClick={() => onModeChange('ai')}>
          AI
        </button>
        <button type="button" role="tab" aria-selected={mode === 'agent'} aria-pressed={mode === 'agent'} onClick={() => onModeChange('agent')}>
          Agent
        </button>
      </div>

      <div className="ai-console__account" aria-live="polite">
        <span>{isAuthenticated ? accountSession.user.initials : 'DL'}</span>
        <p>
          {isAuthenticated
            ? `Using ${accountSession.user.fullName}'s DLavie Account session.`
            : 'Public preview. Login unlocks account-connected responses.'}
        </p>
      </div>

      <div className="ai-console__body">
        <div className="ai-console__orb-wrap" aria-hidden="true">
          <div ref={orbRef} className="ai-console__orb" />
        </div>
        <div>
          <p className="ai-console__label">{content.consoleLabel}</p>
          <h2>{mode === 'ai' ? 'Conversation intelligence' : 'Workflow execution plan'}</h2>
          <p className="ai-console__prompt">{prompt}</p>
        </div>
      </div>

      <div className="ai-console__thinking" aria-live="polite">
        <span>{isThinking ? thinkingStages[stageIndex] : 'Ready for preview'}</span>
        <span>{detail}</span>
      </div>

      <div ref={outputRef} className="ai-console__output" aria-live="polite">
        {isThinking ? (
          <div className="ai-console__skeleton" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        ) : (
          <p>{answer}</p>
        )}
      </div>

      <form className="ai-console__input" onSubmit={onSubmit}>
        <label className="sr-only" htmlFor="ai-preview-prompt">AI preview prompt</label>
        <input
          id="ai-preview-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Ask DLavie AI..."
          maxLength={500}
        />
        <button type="submit" disabled={isThinking}>{isThinking ? 'Thinking' : isAuthenticated ? 'Run with account' : 'Run preview'}</button>
      </form>
    </article>
  );
}
