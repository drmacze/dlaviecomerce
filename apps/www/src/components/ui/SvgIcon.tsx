import type { SVGProps } from 'react';

type SvgIconProps = SVGProps<SVGSVGElement> & {
  name: 'brand' | 'commerce' | 'ai' | 'arrow' | 'menu';
};

export function SvgIcon({ name, ...props }: SvgIconProps) {
  if (name === 'brand') {
    return <svg viewBox="0 0 40 40" aria-hidden="true" {...props}><path d="M20 2 36 10v20L20 38 4 30V10L20 2Z" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M14 12h7.2c5 0 8.8 3.3 8.8 8s-3.8 8-8.8 8H14V12Zm4.5 4.2v11.6h2.5c2.9 0 5.1-2.2 5.1-5.8s-2.2-5.8-5.1-5.8h-2.5Z" fill="currentColor"/></svg>;
  }
  if (name === 'commerce') {
    return <svg viewBox="0 0 40 40" aria-hidden="true" {...props}><path d="M7 13h26l-3 12H12L9.4 8H5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 32h.01M28 32h.01" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/><path d="M15 18h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
  }
  if (name === 'ai') {
    return <svg viewBox="0 0 40 40" aria-hidden="true" {...props}><circle cx="20" cy="20" r="6" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M20 3v7M20 30v7M3 20h7M30 20h7M8 8l5 5M27 27l5 5M32 8l-5 5M13 27l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
  }
  if (name === 'menu') {
    return <svg viewBox="0 0 40 40" aria-hidden="true" {...props}><path d="M10 14h20M10 20h20M10 26h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
  }
  return <svg viewBox="0 0 40 40" aria-hidden="true" {...props}><path d="M8 20h23M22 11l9 9-9 9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
