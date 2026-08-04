import type { Metadata } from 'next';
import { CalculatorView } from '@/components/app/CalculatorView';

export const metadata: Metadata = {
  title: 'Tax calculator',
  description:
    'Slab by slab income tax working for salaried and non salaried individuals in Pakistan.',
};

export default function CalculatorPage() {
  return <CalculatorView />;
}
