---
title: "Operations"
description: "How Cream City Web is started, deployed, tested, health-checked, and observed, with documented commands separated from what the snapshot can verify."
---

# Operations

Cream City Web is not a library. It is an operator repo with a payment API, a static site server, a Cloudflare email worker, and many operator-invoked CLIs ([package.json:L2-L4](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/package.json#L2-L4)).

**Documented versus verified:** the snapshot shows what is intended and how it is configured. It contains no runtime evidence, such as logs, unit status, or CI results. Every runtime claim below is documented, not verified.

## Start commands

- **Static server.** `node scripts/serve.mjs [port]`, default 3050 ([serve.mjs:L8-L9](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/scripts/serve.mjs#L8-L9)). The unit file runs it as user `jkeyser` with `Restart=on-failure` ([cream-city-web-server.service:L7-L10](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/cream-city-web-server.service#L7-L10)).
- **Systemd name mismatch.** The README says `sudo systemctl start ccw-static` ([README.md:L69-L70](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/README.md#L69-L70)). The unit in the snapshot is `cream-city-web-server.service` ([cream-city-web-server.service:L2](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/cream-city-web-server.service#L2)). Which is installed on any host is unknown.
- **`npm start`.** The README documents it ([README.md:L66-L67](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/README.md#L66-L67)), but `package.json` defines no `start` script ([package.json:L6-L16](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/package.json#L6-L16)).
- **Payment API.** No script exists. The runbook restarts it with `node api/server.mjs` ([runbook.md:L148](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/docs/runbook.md#L148)).
- **Email worker.** `npm run deploy` runs `wrangler deploy`, and `npm run dev` runs `wrangler dev` ([workers/email-receiver/package.json:L5-L8](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/workers/email-receiver/package.json#L5-L8)). Its webhook secret is set with `wrangler secret put` ([wrangler.toml:L8](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/workers/email-receiver/wrangler.toml#L8)). Whether it is deployed is unknown.
- **Database.** `npm run db:reset` pipes `schema.sql` into psql ([package.json:L7](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/package.json#L7)). The core `CREATE TABLE` statements lack `IF NOT EXISTS` ([schema.sql:L5](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/schema.sql#L5)), unlike later tables ([schema.sql:L114](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/schema.sql#L114)).
- **Required environment names:** `DATABASE_URL`, `PAY_API_URL`, `PAY_API_TOKEN`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY` ([README.md:L56-L60](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/README.md#L56-L60)). Values are not recorded here.

## Deploy a site

`node scripts/deploy.mjs <slug>` checks for `index.html`, creates the DNS route through tunnel `beelink`, updates the `sites` table, and runs a curl test ([deploy.mjs:L5-L6](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/scripts/deploy.mjs#L5-L6), [deploy.mjs:L46](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/scripts/deploy.mjs#L46), [deploy.mjs:L60-L82](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/scripts/deploy.mjs#L60-L82), [deploy.mjs:L88](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/scripts/deploy.mjs#L88)).

## Test and validation

- `npm run lint` and `npm run build` run `node --check` only ([package.json:L13](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/package.json#L13), [package.json:L15](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/package.json#L15)).
- `npm test` runs one test file that is not in the snapshot ([package.json:L14](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/package.json#L14)).

## Health checks

- **Payment API:** `GET /health` returns `status ok` and `service ccw-api` ([api/server.mjs:L101-L103](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/api/server.mjs#L101-L103)). It does not test the database or Stripe in the visible code.
- **Sites:** `node scripts/site.mjs health` sends HEAD requests to each non-staging site and exits 1 if any fail ([site.mjs:L19-L26](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/scripts/site.mjs#L19-L26), [site.mjs:L162-L164](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/scripts/site.mjs#L162-L164)).
- **Static server:** no health route is visible. The root returns a landing page ([serve.mjs:L79-L89](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/scripts/serve.mjs#L79-L89)).

## Observability

- `node scripts/run.mjs history` and `dashboard` read the `runs` table and pipeline counts ([run.mjs:L111-L137](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/scripts/run.mjs#L111-L137), [run.mjs:L139-L215](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/scripts/run.mjs#L139-L215)).
- Run failures send an IPC alert ([run.mjs:L291-L293](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/scripts/run.mjs#L291-L293)).
- The API and worker write to the console ([api/server.mjs:L149](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/api/server.mjs#L149), [index.js:L39](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/workers/email-receiver/src/index.js#L39)).
- The runbook uses journalctl for PostgreSQL ([runbook.md:L42](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/docs/runbook.md#L42)) and RabbitMQ ([runbook.md:L301](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/docs/runbook.md#L301)). No static-server journal command appears in the source.

## Security notes

If the Stripe secret or signature header is missing, the webhook accepts the body without verification ([api/server.mjs:L257-L259](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/api/server.mjs#L257-L259)). The visible verification code shows no timestamp tolerance check ([api/server.mjs:L246-L256](https://github.com/Jeffrey-Keyser/cream-city-web/blob/2415ed7675f004fc1f879d5b43cab444b4bbb495/api/server.mjs#L246-L256)).
