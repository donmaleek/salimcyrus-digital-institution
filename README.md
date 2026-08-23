# Salim Cyrus - Digital Institution

Monorepo for SalimCyrus.com: a Next.js 14 frontend backed by a Strapi headless CMS,
implementing the coaching / academy / knowledge centre / Halisi Hub Connect
architecture described in the website & digital institution strategy.

## Structure

- `src/` - Next.js 14 App Router frontend
- `cms/` - Strapi headless CMS
- `infrastructure/` - Docker, Kubernetes, Terraform
- `tests/` - unit, integration, e2e

## Getting started

### Frontend

```
npm install
cp .env.local.example .env.local   # fill in real values
npm run dev
```

### CMS

```
cd cms
npm install
cp .env.example .env               # fill in real values
npm run develop
```
