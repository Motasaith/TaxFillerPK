'use client';

import { Send } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Primitives';
import { useToast } from '@/components/ui/Toast';

const SUPPORT_EMAIL = 'support@taxfillr.pk';

const subjects = ['General question', 'Bug report', 'Feature request', 'A tax question', 'Something else'];

export function ContactForm() {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(subjects[0]);
  const [message, setMessage] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast('Fill in your name, email and message.', { tone: 'error' });
      return;
    }

    const body = `${message}\n\nFrom: ${name}\nReply to: ${email}`;
    const href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`[${subject}] ${name}`)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    toast('Opening your mail app', {
      body: `If nothing happens, write to ${SUPPORT_EMAIL} directly.`,
      tone: 'info',
    });
  }

  return (
    <form onSubmit={submit} className="card p-7">
      <h2 className="text-[18px] font-semibold">Send a message</h2>
      <p className="mt-1.5 text-[14px] text-ink-soft">
        This form has no server behind it. Pressing send opens your own mail app with the message
        ready to go, which is also why we never see anything you did not choose to send.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Your name">
          <input
            className="field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ahmed Khan"
            autoComplete="name"
          />
        </Field>
        <Field label="Email">
          <input
            className="field"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </Field>
      </div>

      <Field label="Subject" className="mt-4">
        <select className="field" value={subject} onChange={(e) => setSubject(e.target.value)}>
          {subjects.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </Field>

      <Field label="Message" className="mt-4">
        <textarea
          className="field min-h-[150px] resize-y"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what happened, and which page you were on."
        />
      </Field>

      <Button type="submit" variant="primary" className="mt-6 w-full">
        <Send size={16} />
        Send message
      </Button>
    </form>
  );
}
