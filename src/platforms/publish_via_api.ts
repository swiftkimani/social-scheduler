import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const BEARER = process.env.xBearerToken;
if (!BEARER) {
  console.error('❌ xBearerToken not found in .env');
  process.exit(1);
}

const MAX_TWEET_LENGTH = 280;

function splitIntoChunks(text: string): string[] {
  const lines = text.split('\n');
  const chunks: string[] = [];
  let current = '';
  for (const line of lines) {
    if ((current + '\n' + line).trim().length <= MAX_TWEET_LENGTH) {
      current = current ? current + '\n' + line : line;
    } else {
      if (current) chunks.push(current.trim());
      current = line;
    }
  }
  if (current) chunks.push(current.trim());
  return chunks;
}

async function postTweet(text: string, replyTo?: string): Promise<string> {
  const body: any = { text };
  if (replyTo) body.reply = { in_reply_to_tweet_id: replyTo };
  const resp = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${BEARER}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await resp.json();
  if (!resp.ok) {
    console.error('❌ Tweet failed:', data);
    process.exit(1);
  }
  console.log('✅ Tweet posted, id:', data.data.id);
  return data.data.id;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: npx tsx src/platforms/publish_via_api.ts "<thread text>"');
    process.exit(0);
  }
  const thread = args.join(' ');
  const chunks = splitIntoChunks(thread);
  let replyId: string | undefined;
  for (const chunk of chunks) {
    replyId = await postTweet(chunk, replyId);
    // small pause to respect rate limits
    await new Promise(r => setTimeout(r, 2000));
  }
}

main();
