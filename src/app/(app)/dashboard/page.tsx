import type { Metadata } from 'next';
import { DashboardView } from '@/components/app/DashboardView';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your recorded income, claimable spending, tax already paid and upcoming FBR dates.',
};

export default function DashboardPage() {
  return <DashboardView />;
}
