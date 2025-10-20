import { Injectable, Logger } from '@nestjs/common';
import { TelegramService } from '../telegram/telegram.service';
import { Api } from 'telegram/tl';
import { format } from 'date-fns';
import {
  AnalysisResult,
  DayAnalysis,
  DayThread,
} from './dto/analysis-result.dto';
import {
  ThreadInfo,
  GroupedThreads,
} from '../telegram/interfaces/message.interface';

@Injectable()
export class AnalyzerService {
  private readonly logger = new Logger(AnalyzerService.name);

  constructor(private readonly telegramService: TelegramService) {}

  async analyzeGroup(groupId: string): Promise<AnalysisResult> {
    this.logger.log(`Starting analysis for group: ${groupId}`);

    const messages = await this.telegramService.getMessages(groupId, 7);

    if (messages.length === 0) {
      this.logger.warn('No messages found in the last 7 days');
      return { timezone: 'Asia/Tashkent', days: [] };
    }

    this.logger.log(`Processing ${messages.length} messages`);

    const threads = this.groupByThreads(messages);
    const result = this.formatResults(threads);

    const totalThreads = result.days.reduce(
      (sum, day) => sum + day.threads.length,
      0,
    );

    this.logger.log(
      `Analysis complete: ${result.days.length} days, ${totalThreads} threads`,
    );

    if (totalThreads === 0) {
      this.logger.warn('No active discussions found');
    }

    return result;
  }

  private groupByThreads(messages: Api.Message[]): GroupedThreads {
    const threadMap = new Map<string, ThreadInfo>();
    const messageMap = new Map<number, Api.Message>();
    const replyChainRoots = new Map<number, number>();

    for (const msg of messages) {
      if (msg.id) {
        messageMap.set(msg.id, msg);
      }
    }

    const findRoot = (msgId: number, visited = new Set<number>()): number => {
      if (visited.has(msgId)) return msgId;
      visited.add(msgId);

      const msg = messageMap.get(msgId);
      if (!msg) return msgId;

      const replyToId = (msg.replyTo as any)?.replyToMsgId;
      if (!replyToId) return msgId;

      if (messageMap.has(replyToId)) {
        return findRoot(replyToId, visited);
      }

      return msgId;
    };

    for (const msg of messages) {
      if (msg.id && msg.replyTo && (msg.replyTo as any).replyToMsgId) {
        const rootId = findRoot(msg.id);
        replyChainRoots.set(msg.id, rootId);
      }
    }

    for (const msg of messages) {
      if (!msg.date || !msg.peerId || !msg.id) continue;

      const messageDate = new Date(msg.date * 1000);
      const userId = this.extractUserId(msg);

      let threadId: string;
      let topicName: string;

      if (msg.replyTo && (msg.replyTo as any).forumTopic) {
        const topicId = (msg.replyTo as any).replyToTopId || 'general';
        threadId = `topic_${topicId}`;
        topicName = this.getTopicName(msg, topicId);
      } else if (replyChainRoots.has(msg.id)) {
        const rootId = replyChainRoots.get(msg.id)!;
        threadId = `reply_${rootId}`;

        const rootMsg = messageMap.get(rootId);
        topicName = rootMsg
          ? this.getMessagePreview(rootMsg)
          : this.getMessagePreview(msg);
      } else if (msg.replyTo && (msg.replyTo as any).replyToMsgId) {
        const replyToId = (msg.replyTo as any).replyToMsgId;
        threadId = `reply_${replyToId}`;
        topicName = this.getMessagePreview(msg);
      } else {
        threadId = `msg_${msg.id}`;
        topicName = this.getMessagePreview(msg);
      }

      if (!threadMap.has(threadId)) {
        threadMap.set(threadId, {
          id: threadId,
          topicName,
          messages: [],
          userIds: new Set<number>(),
          date: messageDate,
        });
      }

      const thread = threadMap.get(threadId)!;

      thread.messages.push({
        id: msg.id,
        text: msg.message || '',
        date: messageDate,
        userId,
      });

      if (userId) {
        thread.userIds.add(userId);
      }

      if (messageDate < thread.date) {
        thread.date = messageDate;
      }
    }

    const groupedThreads: GroupedThreads = {};

    for (const thread of threadMap.values()) {
      const dateKey = format(thread.date, 'yyyy-MM-dd');

      if (!groupedThreads[dateKey]) {
        groupedThreads[dateKey] = [];
      }

      groupedThreads[dateKey].push(thread);
    }

    this.logger.log(
      `Grouped into ${threadMap.size} threads across ${Object.keys(groupedThreads).length} days`,
    );

    return groupedThreads;
  }

  private formatResults(groupedThreads: GroupedThreads): AnalysisResult {
    const days: DayAnalysis[] = [];
    const sortedDates = Object.keys(groupedThreads).sort();

    for (const date of sortedDates) {
      const threads = groupedThreads[date];

      const dayThreads: DayThread[] = threads
        .filter(
          (thread) => thread.messages.length >= 2 || thread.userIds.size >= 2,
        )
        .map((thread) => ({
          topic: thread.topicName,
          messages: thread.messages.length,
          users: thread.userIds.size,
        }))
        .sort((a, b) => {
          if (b.messages !== a.messages) {
            return b.messages - a.messages;
          }
          return b.users - a.users;
        });

      if (dayThreads.length > 0) {
        days.push({ date, threads: dayThreads });
      }
    }

    return { timezone: 'Asia/Tashkent', days };
  }

  private extractUserId(msg: Api.Message): number {
    if (msg.fromId) {
      if ('userId' in msg.fromId) {
        return (msg.fromId as any).userId;
      }
      if ('channelId' in msg.fromId) {
        return (msg.fromId as any).channelId;
      }
    }
    return 0;
  }

  private getTopicName(msg: Api.Message, topicId: any): string {
    if (msg.message) {
      return this.truncateText(msg.message, 1000);
    }
    return `Topic ${topicId}`;
  }

  private getMessagePreview(msg: Api.Message): string {
    if (msg.message && msg.message.trim()) {
      return this.truncateText(msg.message, 1000);
    }

    if (msg.media) {
      if ('photo' in msg.media) return '📷 Photo';
      if ('document' in msg.media) return '📄 Document';
      if ('video' in msg.media) return '🎥 Video';
      return '📎 Media';
    }

    return 'Message';
  }

  private truncateText(text: string, maxLength: number): string {
    const cleaned = text.trim().replace(/\n/g, ' ');
    if (cleaned.length <= maxLength) {
      return cleaned;
    }
    return cleaned.substring(0, maxLength) + '...';
  }
}
