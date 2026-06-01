import { HeroShowcase } from '../components/HeroShowcase';
import { SmoothScrollProvider } from '../components/SmoothScrollProvider';

export default function Page() {
  return (
    <SmoothScrollProvider>
      <HeroShowcase />
    </SmoothScrollProvider>
  );
}
