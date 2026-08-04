import type { Metadata } from 'next';
import { NoticesView } from '@/components/app/NoticesView';

export const metadata: Metadata = {
  title: 'Notice handler',
  description:
    'Upload an FBR notice for a plain reading of the section, the deadline and a draft reply.',
};

export default function NoticesPage() {
  return <NoticesView />;
}
