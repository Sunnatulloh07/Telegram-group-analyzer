import { ApiProperty } from '@nestjs/swagger';

export class DayThread {
  @ApiProperty({
    description:
      'Topic or thread name (message preview, forum topic name, or reply chain subject)',
    example: 'How to use NestJS with Telegram API?',
  })
  topic: string;

  @ApiProperty({
    description: 'Total number of messages in this thread',
    example: 45,
    minimum: 1,
  })
  messages: number;

  @ApiProperty({
    description: 'Number of unique users participating in this thread',
    example: 12,
    minimum: 1,
  })
  users: number;
}

export class DayAnalysis {
  @ApiProperty({
    description: 'Date in YYYY-MM-DD format',
    example: '2025-10-18',
    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
  })
  date: string;

  @ApiProperty({
    description:
      'List of threads for this day, sorted by message count (descending)',
    type: [DayThread],
  })
  threads: DayThread[];
}

export class AnalysisResult {
  @ApiProperty({
    description: 'Timezone used for date calculations',
    example: 'Asia/Tashkent',
    default: 'Asia/Tashkent',
  })
  timezone: string;

  @ApiProperty({
    description: 'Analysis results grouped by day (last 7 days)',
    type: [DayAnalysis],
  })
  days: DayAnalysis[];
}

export class AnalyzeRequestDto {
  @ApiProperty({
    description:
      'Telegram group identifier. Accepts multiple formats:\n' +
      '- Username: @groupname or groupname\n' +
      '- Telegram link: t.me/groupname or https://t.me/groupname\n' +
      '- Numeric ID: -1001234567890 (for private groups)',
    example: 't.me/nestjs_uz',
    examples: [
      '@nestjs_uz',
      'nestjs_uz',
      't.me/nestjs_uz',
      'https://t.me/nestjs_uz',
      '-1001234567890',
    ],
    required: true,
  })
  groupId: string;
}
