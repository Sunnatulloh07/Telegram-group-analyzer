import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { TelegramClient } from 'telegram';
import { StoreSession } from 'telegram/sessions';
import { Api } from 'telegram/tl';
import { getTelegramConfig } from '../config/telegram.config';
import { subDays, startOfDay } from 'date-fns';
import * as input from 'input';

@Injectable()
export class TelegramService implements OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);
  private client: TelegramClient;
  private config = getTelegramConfig();
  private isConnected = false;

  async onModuleDestroy() {
    await this.disconnect();
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      this.logger.log('Already connected to Telegram');
      return;
    }

    try {
      // Persist session to disk using StoreSession (backed by node-localstorage)
      const session = new StoreSession(this.config.sessionName);
      this.client = new TelegramClient(session, this.config.apiId, this.config.apiHash, {
        connectionRetries: 5,
      });

      this.logger.log('Connecting to Telegram...');
      
      await this.client.start({
        phoneNumber: async () => this.config.phoneNumber,
        password: async () => await input.text('Please enter your password: '),
        phoneCode: async () =>
          await input.text('Please enter the code you received: '),
        onError: (err) => {
          this.logger.error('Authentication error:', err);
          throw err;
        },
      });

      this.isConnected = true;
      this.logger.log('Successfully connected to Telegram');
    } catch (error) {
      this.logger.error('Failed to connect to Telegram:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      try {
        await this.client.disconnect();
        this.isConnected = false;
        this.logger.log('Disconnected from Telegram');
      } catch (error) {
        this.logger.error('Error disconnecting:', error);
      }
    }
  }

  async getMessages(groupId: string, days: number = 7): Promise<Api.Message[]> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      this.logger.log(`Fetching messages from ${groupId} for last ${days} days`);

      const entity = await this.client.getEntity(groupId);
      const fromDate = startOfDay(subDays(new Date(), days));
      const messages: Api.Message[] = [];

      let offsetId = 0;
      let hasMore = true;

      while (hasMore) {
        const result: Api.Message[] = await this.client.getMessages(entity, {
          limit: 100,
          offsetId: offsetId,
        });

        if (result.length === 0) {
          hasMore = false;
          break;
        }

        for (const msg of result) {
          if (msg.date && msg.date * 1000 >= fromDate.getTime()) {
            messages.push(msg);
            offsetId = msg.id;
          } else {
            hasMore = false;
            break;
          }
        }

        if (result.length < 100) {
          hasMore = false;
        }
      }

      this.logger.log(`Fetched ${messages.length} messages from ${groupId}`);
      return messages;
    } catch (error) {
      this.logger.error(`Failed to fetch messages from ${groupId}:`, error);
      throw error;
    }
  }
}
