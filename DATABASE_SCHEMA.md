# Database schema

See `migrations/0001_init.sql` for authoritative DDL. Main relations: users → sessions; users → products; products → support, feedback, offers, alerts, events; offers → orders; webhook_events records idempotency keys; audit records actor and action. Support is unique per user and product. PayPal order IDs are unique. No real-world statistics are seeded.
