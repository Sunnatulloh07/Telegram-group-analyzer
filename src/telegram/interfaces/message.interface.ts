export interface ThreadInfo {
  id: string;
  topicName: string;
  messages: Array<{
    id: number;
    text: string;
    date: Date;
    userId: number;
  }>;
  userIds: Set<number>;
  date: Date;
}

export interface GroupedThreads {
  [date: string]: ThreadInfo[];
}
