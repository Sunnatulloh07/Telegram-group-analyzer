import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AnalyzerService } from './analyzer.service';
import {
  AnalyzeRequestDto,
  AnalysisResult,
} from './dto/analysis-result.dto';
import { normalizeGroupId } from './utils/group-id.helper';

@ApiTags('analyzer')
@Controller('analyze')
export class AnalyzerController {
  private readonly logger = new Logger(AnalyzerController.name);

  constructor(private readonly analyzerService: AnalyzerService) {}

  @Post()
  @ApiOperation({
    summary: 'Analyze Telegram group messages',
    description:
      'Analyzes the last 7 days of messages in a Telegram group/supergroup. ' +
      'Identifies the most active discussion threads including reply chains and forum topics. ' +
      'Groups results by day and sorts threads by message count. ' +
      '\n\n**Thread filtering:** Only discussions with 2+ messages or 2+ users are included. ' +
      'Single standalone messages are excluded to focus on active discussions. ' +
      '\n\n**Date range:** Covers 7 complete days from today. Empty days (no discussions) are not shown. ' +
      '\n\n**Note:** First request will require Telegram authentication (you will be prompted in the server console).',
  })
  @ApiBody({
    type: AnalyzeRequestDto,
    description: 'Group identifier in any supported format',
    examples: {
      telegramLink: {
        summary: 'Telegram link format',
        description: 'Copy group link directly from Telegram',
        value: { groupId: 't.me/nestjs_uz' },
      },
      telegramLinkFull: {
        summary: 'Full Telegram link',
        description: 'Complete URL with https://',
        value: { groupId: 'https://t.me/nestjs_uz' },
      },
      usernameWithAt: {
        summary: 'Username with @ prefix',
        description: 'Traditional format with @ symbol',
        value: { groupId: '@nestjs_uz' },
      },
      usernameOnly: {
        summary: 'Username without @',
        description: 'Just the username',
        value: { groupId: 'nestjs_uz' },
      },
      privateGroup: {
        summary: 'Private group by numeric ID',
        description: 'Numeric ID with -100 prefix for private groups',
        value: { groupId: '-1001234567890' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'Analysis completed successfully. Returns only active discussions (2+ messages or 2+ users)',
    type: AnalysisResult,
    content: {
      'application/json': {
        examples: {
          activeDiscussions: {
            summary: 'Group with active discussions',
            description: 'Multiple days with various discussion threads',
            value: {
              timezone: 'Asia/Tashkent',
              days: [
                {
                  date: '2025-10-18',
                  threads: [
                    {
                      topic: 'How to use NestJS with Telegram API?',
                      messages: 45,
                      users: 12,
                    },
                    {
                      topic: 'Best practices for async programming',
                      messages: 23,
                      users: 8,
                    },
                  ],
                },
                {
                  date: '2025-10-17',
                  threads: [
                    {
                      topic: 'TypeScript generics explained',
                      messages: 67,
                      users: 15,
                    },
                  ],
                },
              ],
            },
          },
          noDiscussions: {
            summary: 'No active discussions found',
            description:
              'Group has messages but no discussions (all single messages)',
            value: {
              timezone: 'Asia/Tashkent',
              days: [],
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - groupId is required',
    content: {
      'application/json': {
        example: {
          statusCode: 400,
          message: 'groupId is required',
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - Failed to analyze group',
    content: {
      'application/json': {
        example: {
          statusCode: 500,
          message:
            'Failed to analyze group: Cannot find any entity corresponding to "@invalid_group"',
        },
      },
    },
  })
  async analyze(@Body() request: AnalyzeRequestDto): Promise<AnalysisResult> {
    const { groupId } = request;

    if (!groupId) {
      throw new HttpException('groupId is required', HttpStatus.BAD_REQUEST);
    }

    this.logger.log(`Received analysis request for group: ${groupId}`);

    try {
      const normalizedGroupId = normalizeGroupId(groupId);
      this.logger.log(`Normalized group ID: ${normalizedGroupId}`);

      const result =
        await this.analyzerService.analyzeGroup(normalizedGroupId);
      return result;
    } catch (error) {
      this.logger.error(`Analysis failed for ${groupId}:`, error);

      if (error.message.includes('Invalid')) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }

      throw new HttpException(
        `Failed to analyze group: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
