export interface TelegramConfig {
  apiId: number;
  apiHash: string;
  phoneNumber: string;
  sessionName: string;
}

export const getTelegramConfig = (): TelegramConfig => {
  const apiId = parseInt(process.env.API_ID || '0', 10);
  const apiHash = process.env.API_HASH || '';
  const phoneNumber = process.env.PHONE_NUMBER || '';
  const sessionName = process.env.SESSION_NAME || 'telegram_session';

  if (!apiId || !apiHash || !phoneNumber) {
    throw new Error(
      'Missing required Telegram configuration. Please check your .env file.',
    );
  }

  return { apiId, apiHash, phoneNumber, sessionName };
};
