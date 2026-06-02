import type { HTMLAttributes, ReactNode } from 'react';
import { createElement } from 'react';

type RevealTag = 'div' | 'section' | 'article' | 'h2' | 'h3' | 'p' | 'span';

type RevealSectionProps = HTMLAttributes<HTMLElement> & {
  as?: RevealTag;
  children: ReactNode;
  delay?: number;
};

export function RevealSection({ as = 'div', children, delay = 0, className, ...props }: RevealSectionProps) {
  return createElement(
    as,
    {
      ...props,
      'data-motion': 'reveal',
      'data-delay': delay,
      className,
    },
    children,
  );
}
