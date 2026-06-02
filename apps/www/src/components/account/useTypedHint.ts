'use client';

import { useEffect, useState } from 'react';

export function useTypedHint(text: string, isActive: boolean) {
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    if (!isActive) {
      setTypedText('');
      return;
    }

    setTypedText('');
    let index = 0;
    const interval = window.setInterval(() => {
      index += 1;
      setTypedText(text.slice(0, index));
      if (index >= text.length) {
        window.clearInterval(interval);
      }
    }, 24);

    return () => window.clearInterval(interval);
  }, [isActive, text]);

  return typedText;
}
