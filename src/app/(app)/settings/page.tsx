import type { Metadata } from 'next';
import { SettingsView } from '@/components/app/SettingsView';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Your Ollama connection, taxpayer details and the data stored in this browser.',
};

export default function SettingsPage() {
  return <SettingsView />;
}
