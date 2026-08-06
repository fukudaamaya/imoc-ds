import React, { useState } from 'react';

export function CopyButton({
  label,
  value,
  kind = 'default',
}: {
  label: string;
  value: string;
  kind?: 'css' | 'dart' | 'default';
}) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // clipboard API unavailable (e.g. insecure context) — fail silently, no flash
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <button className="copy-btn" data-kind={kind} data-copied={copied} onClick={onClick} title={value}>
      {copied ? '✓ Copied' : label}
    </button>
  );
}
