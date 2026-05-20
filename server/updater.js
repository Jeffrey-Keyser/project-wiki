#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const WIKI_EVENTS_EXCHANGE = 'wiki.events';
export const WIKI_UPDATER_QUEUE = 'wiki.updater.queue';
export const WIKI_UPDATE_ROUTING_KEY = 'wiki.update.#';

const __filename = fileURLToPath(import.meta.url);

export function getRabbitMqUrl(env = process.env) {
  const value = env.RABBITMQ_URL?.trim() || 'amqp://localhost:5672';
  let parsed;
  try {
    parsed = new URL(value);
  } catch (err) {
    throw new Error(
      `RABBITMQ_URL is invalid: ${err instanceof Error ? err.message : err}`,
    );
  }
  if (parsed.protocol !== 'amqp:' && parsed.protocol !== 'amqps:') {
    throw new Error(
      `RABBITMQ_URL must use amqp: or amqps:, got ${parsed.protocol}`,
    );
  }
  return value;
}

export function parseUpdateMessage(content) {
  const parsed = JSON.parse(Buffer.from(content).toString('utf8'));
  const sha =
    typeof parsed?.commit?.sha === 'string' ? parsed.commit.sha : '';
  const title =
    typeof parsed?.commit?.message === 'string' ? parsed.commit.message : '';
  return { sha, title };
}

export async function handleUpdateMessage(message, { channel, logger = console }) {
  if (!message) return;
  const routingKey = message.fields?.routingKey || '';
  try {
    const { sha, title } = parseUpdateMessage(message.content);
    logger.log(`received ${routingKey} sha=${sha} msg=${title}`);
  } catch (err) {
    logger.error(
      `[updater] invalid message on ${routingKey}: ${err instanceof Error ? err.message : err}`,
    );
  } finally {
    channel.ack(message);
  }
}

export async function startUpdater({
  connect: connectOverride,
  env = process.env,
  logger = console,
  registerSignalHandlers = true,
} = {}) {
  const amqp = connectOverride
    ? { connect: connectOverride }
    : await import('amqplib');
  const connection = await amqp.connect(getRabbitMqUrl(env));
  const channel = await connection.createChannel();

  await channel.assertExchange(WIKI_EVENTS_EXCHANGE, 'topic', { durable: true });
  await channel.assertQueue(WIKI_UPDATER_QUEUE, { durable: true });
  await channel.bindQueue(
    WIKI_UPDATER_QUEUE,
    WIKI_EVENTS_EXCHANGE,
    WIKI_UPDATE_ROUTING_KEY,
  );
  await channel.consume(
    WIKI_UPDATER_QUEUE,
    async (message) => {
      await handleUpdateMessage(message, { channel, logger });
    },
    { noAck: false },
  );

  logger.log(
    `[updater] consuming ${WIKI_UPDATER_QUEUE} from ${WIKI_EVENTS_EXCHANGE} (${WIKI_UPDATE_ROUTING_KEY})`,
  );

  let shuttingDown = false;
  const shutdown = async (signal = 'shutdown') => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.log(`[updater] ${signal} received, closing RabbitMQ connection`);
    try {
      await channel.close();
    } finally {
      await connection.close();
    }
  };

  if (registerSignalHandlers) {
    process.once('SIGINT', () => {
      void shutdown('SIGINT');
    });
    process.once('SIGTERM', () => {
      void shutdown('SIGTERM');
    });
  }

  return { connection, channel, shutdown };
}

const isMain =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);

if (isMain) {
  startUpdater().catch((err) => {
    console.error(`[updater] fatal: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  });
}
