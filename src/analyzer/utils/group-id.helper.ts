export function normalizeGroupId(input: string): string {
  if (!input || typeof input !== 'string') {
    throw new Error('Group ID must be a non-empty string');
  }

  let normalized = input.trim();

  if (/^-?\d+$/.test(normalized)) {
    return normalized;
  }

  normalized = normalized
    .replace(/^https?:\/\//i, '')
    .replace(/^t\.me\//i, '')
    .replace(/^telegram\.me\//i, '')
    .replace(/^telegram\.dog\//i, '');

  normalized = normalized.replace(/^@/, '');
  normalized = normalized.split('/')[0].split('?')[0].trim();

  if (!/^[a-zA-Z0-9_]+$/.test(normalized)) {
    throw new Error(
      `Invalid group username format: "${normalized}". ` +
        'Username can only contain letters, numbers, and underscores.',
    );
  }

  if (normalized.length < 5 || normalized.length > 32) {
    throw new Error(
      `Invalid username length: ${normalized.length}. ` +
        'Telegram usernames must be 5-32 characters long.',
    );
  }

  return `@${normalized}`;
}

export function extractUsername(url: string): string | null {
  const patterns = [
    /t\.me\/([a-zA-Z0-9_]+)/i,
    /telegram\.me\/([a-zA-Z0-9_]+)/i,
    /telegram\.dog\/([a-zA-Z0-9_]+)/i,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}
