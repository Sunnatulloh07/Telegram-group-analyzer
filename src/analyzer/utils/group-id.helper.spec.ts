import { normalizeGroupId, extractUsername } from './group-id.helper';

describe('GroupId Helper', () => {
  describe('normalizeGroupId', () => {
    it('should normalize username with @ prefix', () => {
      expect(normalizeGroupId('@nestjs_uz')).toBe('@nestjs_uz');
    });

    it('should normalize username without @ prefix', () => {
      expect(normalizeGroupId('nestjs_uz')).toBe('@nestjs_uz');
    });

    it('should normalize t.me link', () => {
      expect(normalizeGroupId('t.me/nestjs_uz')).toBe('@nestjs_uz');
    });

    it('should normalize full Telegram URL', () => {
      expect(normalizeGroupId('https://t.me/nestjs_uz')).toBe('@nestjs_uz');
    });

    it('should normalize telegram.me link', () => {
      expect(normalizeGroupId('telegram.me/nestjs_uz')).toBe('@nestjs_uz');
    });

    it('should handle numeric IDs', () => {
      expect(normalizeGroupId('-1001234567890')).toBe('-1001234567890');
    });

    it('should handle positive numeric IDs', () => {
      expect(normalizeGroupId('1234567890')).toBe('1234567890');
    });

    it('should throw error for empty string', () => {
      expect(() => normalizeGroupId('')).toThrow(
        'Group ID must be a non-empty string',
      );
    });

    it('should throw error for invalid characters', () => {
      expect(() => normalizeGroupId('test-group')).toThrow(
        'Invalid group username format',
      );
    });

    it('should throw error for too short username', () => {
      expect(() => normalizeGroupId('test')).toThrow('Invalid username length');
    });

    it('should throw error for too long username', () => {
      const longName = 'a'.repeat(33);
      expect(() => normalizeGroupId(longName)).toThrow(
        'Invalid username length',
      );
    });

    it('should handle URLs with query parameters', () => {
      expect(normalizeGroupId('t.me/nestjs_uz?start=123')).toBe('@nestjs_uz');
    });

    it('should handle URLs with trailing slash', () => {
      expect(normalizeGroupId('t.me/nestjs_uz/')).toBe('@nestjs_uz');
    });
  });

  describe('extractUsername', () => {
    it('should extract username from t.me link', () => {
      expect(extractUsername('t.me/nestjs_uz')).toBe('nestjs_uz');
    });

    it('should extract username from full URL', () => {
      expect(extractUsername('https://t.me/nodejs_community')).toBe(
        'nodejs_community',
      );
    });

    it('should return null for invalid URL', () => {
      expect(extractUsername('invalid_url')).toBeNull();
    });

    it('should extract from telegram.me', () => {
      expect(extractUsername('telegram.me/test_group')).toBe('test_group');
    });
  });
});
