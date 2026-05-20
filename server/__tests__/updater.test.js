import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  WIKI_EVENTS_EXCHANGE,
  WIKI_UPDATER_QUEUE,
  WIKI_UPDATE_ROUTING_KEY,
  getRabbitMqUrl,
  handleUpdateMessage,
  startUpdater,
} from '../updater.js';

test('getRabbitMqUrl defaults to local RabbitMQ and validates protocol', () => {
  assert.equal(getRabbitMqUrl({}), 'amqp://localhost:5672');
  assert.throws(
    () => getRabbitMqUrl({ RABBITMQ_URL: 'http://localhost:5672' }),
    /must use amqp: or amqps:/,
  );
});

test('startUpdater declares the durable queue/binding and consumes with manual ack', async () => {
  const calls = [];
  let consumeHandler = null;
  const channel = {
    async assertExchange(name, type, options) {
      calls.push(['assertExchange', name, type, options]);
    },
    async assertQueue(name, options) {
      calls.push(['assertQueue', name, options]);
    },
    async bindQueue(queue, exchange, routingKey) {
      calls.push(['bindQueue', queue, exchange, routingKey]);
    },
    async consume(queue, handler, options) {
      calls.push(['consume', queue, options]);
      consumeHandler = handler;
    },
    ack(message) {
      calls.push(['ack', message]);
    },
    async close() {
      calls.push(['channel.close']);
    },
  };
  const connection = {
    async createChannel() {
      calls.push(['createChannel']);
      return channel;
    },
    async close() {
      calls.push(['connection.close']);
    },
  };
  const logs = [];
  const logger = {
    log: (line) => logs.push(line),
    error: (line) => logs.push(`ERR:${line}`),
  };

  const updater = await startUpdater({
    connect: async (url) => {
      calls.push(['connect', url]);
      return connection;
    },
    env: { RABBITMQ_URL: 'amqp://guest:guest@localhost:5672' },
    logger,
    registerSignalHandlers: false,
  });

  assert.deepEqual(calls.slice(0, 5), [
    ['connect', 'amqp://guest:guest@localhost:5672'],
    ['createChannel'],
    ['assertExchange', WIKI_EVENTS_EXCHANGE, 'topic', { durable: true }],
    ['assertQueue', WIKI_UPDATER_QUEUE, { durable: true }],
    ['bindQueue', WIKI_UPDATER_QUEUE, WIKI_EVENTS_EXCHANGE, WIKI_UPDATE_ROUTING_KEY],
  ]);
  assert.deepEqual(calls[5], ['consume', WIKI_UPDATER_QUEUE, { noAck: false }]);
  assert.ok(
    logs.includes(
      `[updater] consuming ${WIKI_UPDATER_QUEUE} from ${WIKI_EVENTS_EXCHANGE} (${WIKI_UPDATE_ROUTING_KEY})`,
    ),
  );

  const message = {
    fields: { routingKey: 'wiki.update.Jeffrey-Keyser-dev-inbox' },
    content: Buffer.from(
      JSON.stringify({
        commit: { sha: 'abc123', message: 'Synthetic post-merge event' },
      }),
      'utf8',
    ),
  };
  await consumeHandler(message);
  assert.ok(
    logs.includes(
      'received wiki.update.Jeffrey-Keyser-dev-inbox sha=abc123 msg=Synthetic post-merge event',
    ),
  );
  assert.deepEqual(calls.at(-1), ['ack', message]);

  await updater.shutdown('test');
  assert.deepEqual(calls.slice(-2), [['channel.close'], ['connection.close']]);
});

test('handleUpdateMessage acknowledges malformed payloads without side effects', async () => {
  const acked = [];
  const errors = [];
  const message = {
    fields: { routingKey: 'wiki.update.bad' },
    content: Buffer.from('{not json', 'utf8'),
  };

  await handleUpdateMessage(message, {
    channel: {
      ack(value) {
        acked.push(value);
      },
    },
    logger: {
      log() {},
      error(line) {
        errors.push(line);
      },
    },
  });

  assert.equal(acked[0], message);
  assert.match(errors[0], /\[updater\] invalid message on wiki\.update\.bad:/);
});
