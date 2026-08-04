import type { Metadata } from 'next';
import { DocumentsView } from '@/components/app/DocumentsView';

export const metadata: Metadata = {
  title: 'My documents',
  description: 'Every record you have saved, searchable by head of account and exportable to CSV.',
};

export default function DocumentsPage() {
  return <DocumentsView />;
}
