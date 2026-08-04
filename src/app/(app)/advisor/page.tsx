import type { Metadata } from 'next';
import { AdvisorView } from '@/components/app/AdvisorView';

export const metadata: Metadata = {
  title: 'Tax advisor',
  description: 'Ask about Pakistani income tax, IRIS, NTN registration, credits and notices.',
};

export default function AdvisorPage() {
  return <AdvisorView />;
}
