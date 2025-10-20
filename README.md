# Telegram Group Analyzer

NestJS application that analyzes the last 7 days of messages in Telegram groups/supergroups and identifies the most active discussion threads.

## Features

- 📊 Analyzes message activity for the last 7 days
- 🧵 Detects discussion threads (reply chains & forum topics)
- 📈 Identifies most active discussions by message and user count
- 🌍 Timezone-aware (Asia/Tashkent)
- 🔄 Smart reply chain root detection
- 📝 Comprehensive Swagger API documentation

## Requirements

- Node.js 18+
- Yarn or NPM
- Telegram API credentials (API ID & API Hash)

## Installation

### 1. Get Telegram API Credentials

1. Visit https://my.telegram.org/apps
2. Log in with your Telegram account
3. Create a new app in "API development tools"
4. Copy your `api_id` and `api_hash`

### 2. Setup Project

```bash
yarn install
cp .env.example .env
```

### 3. Configure Environment

Edit `.env` file with your credentials:

```env
API_ID=12345678
API_HASH=your_api_hash_here
PHONE_NUMBER=+998901234567
SESSION_NAME=telegram_session
PORT=3000
```

## Usage

### Development Mode

```bash
yarn start:dev
```

### Production Mode

```bash
yarn build
yarn start:prod
```

## API Documentation

Interactive Swagger documentation is available at:

**http://localhost:3000/api**

### Endpoint: POST /analyze

Analyzes a Telegram group. Supports multiple input formats:

#### 1. Telegram Link (easiest)
```bash
curl -X POST http://localhost:3000/analyze \
  -H "Content-Type: application/json" \
  -d '{"groupId": "t.me/nestjs_uz"}'
```

#### 2. Full URL
```bash
curl -X POST http://localhost:3000/analyze \
  -H "Content-Type: application/json" \
  -d '{"groupId": "https://t.me/nestjs_uz"}'
```

#### 3. Username (with or without @)
```bash
curl -X POST http://localhost:3000/analyze \
  -H "Content-Type: application/json" \
  -d '{"groupId": "@nestjs_uz"}'
```

#### 4. Private Group (numeric ID)
```bash
curl -X POST http://localhost:3000/analyze \
  -H "Content-Type: application/json" \
  -d '{"groupId": "-1001234567890"}'
```

### Response Format

```json
{
  "timezone": "Asia/Tashkent",
  "days": [
    {
      "date": "2025-10-18",
      "threads": [
        {
          "topic": "How to use NestJS with Telegram API?",
          "messages": 45,
          "users": 12
        }
      ]
    }
  ]
}
```

## First-Time Authentication

On first run, you'll need to authenticate:

1. Start the application: `yarn start:dev`
2. Send your first API request
3. Check server terminal - you'll be prompted for a verification code
4. Enter the code from Telegram
5. If 2FA is enabled, enter your password
6. Session is saved - no authentication needed for subsequent requests

## Project Structure

```
src/
├── analyzer/
│   ├── analyzer.controller.ts    # REST API endpoint
│   ├── analyzer.service.ts       # Analysis logic
│   ├── analyzer.module.ts
│   ├── dto/
│   │   └── analysis-result.dto.ts
│   └── utils/
│       └── group-id.helper.ts
├── telegram/
│   ├── telegram.service.ts       # GramJS integration
│   ├── telegram.module.ts
│   └── interfaces/
│       └── message.interface.ts
├── config/
│   └── telegram.config.ts
├── app.module.ts
└── main.ts
```

## Analysis Algorithm

### 1. Fetch Messages
Retrieves all messages from the last 7 days via Telegram API

### 2. Thread Detection (Smart Algorithm)
- **Forum topics**: Grouped by `forum_topic_id`
- **Reply chains**: ROOT DETECTION algorithm
  ```
  A → B → C → D  (4 messages, 1 thread) ✅
  NOT: A-B (thread1), B-C (thread2) ❌
  ```
- **Root finding**: Recursive algorithm finds the root of each reply chain
- **Topic name**: Extracted from root message text

### 3. Filtering
Only active discussions (2+ messages OR 2+ users)
- Single standalone messages are excluded
- Focus on real discussions

### 4. Statistics
- Message count per thread
- Unique user count per thread
- Thread start date (root message date)

### 5. Grouping
Results grouped by day (Asia/Tashkent timezone)
- Threads grouped by root message date
- Each thread appears only once

### 6. Sorting
Threads sorted by message count (descending), then by user count

## Key Features

- **7-day window**: Analyzes from today back 7 days
- **Active discussions**: Minimum 2 messages or 2 users
- **Empty days**: Days without discussions are not shown
- **Reply chain grouping**: A→B→C = 1 thread (3 messages)
- **Root detection**: Finds root for each reply chain
- **Circular protection**: Protected from infinite loops

## Tech Stack

- **Framework**: NestJS 11.x
- **Telegram API**: GramJS (npm: `telegram`)
- **Language**: TypeScript
- **Date handling**: date-fns
- **Config**: @nestjs/config, dotenv
- **API Docs**: Swagger/OpenAPI

## Important Notes

- Telegram API has rate limits
- Large groups may take time to fetch messages
- Session data is stored securely (.gitignore)
- You must be a member of groups you analyze
- Empty result means no discussions in last 7 days

## Understanding Results

### If `days: []` (empty):
1. No messages in the last 7 days
2. All messages are standalone (no discussions)
3. Group has low activity

**Solution**: Try more active groups (e.g., @nestjs_uz, @nodejs_uz)

### Active Group Example:
```json
{
  "days": [
    {
      "date": "2025-10-18",
      "threads": [
        {"topic": "NestJS setup", "messages": 12, "users": 5},
        {"topic": "DB migration", "messages": 8, "users": 3}
      ]
    }
  ]
}
```

## License

MIT

## Author

Sunnatullo Hayitov
- Telegram: @code_craft01
- Email: sunnatullosun@gmail.com
