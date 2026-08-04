import type { Metadata } from 'next';
import { ScanView } from '@/components/app/ScanView';

export const metadata: Metadata = {
  title: 'Scan a document',
  description: 'Upload a receipt, salary slip, bill or statement and turn it into a tax record.',
};

export default function ScanPage() {
  return <ScanView />;
}
