# Vietnam Itinerary Backend

NestJS backend service for Vietnam itinerary sharing. Built with clean architecture, CQRS, and Kysely.

## Features

- **Auth**: JWT-based authentication with role-based permissions (Register, Login, Me).
- **Itineraries**: 
  - Write Model: Create drafts, update, publish, and archive.
  - Read Model: Explore with region/tag filters, trending itineraries, and deep details.
  - View Tracking: IP-deduped view count tracking.
- **Bookmarks**: Authenticated users can save their favorite itineraries.
- **Leaderboard**: Public ranking of top itineraries.

## Requirements

- Node.js 20+
- PostgreSQL 15+

## Quick Start

1. Copy `.env.example` to `.env` and configure your database.
2. Install dependencies: `npm install`
3. Run migrations: `npm run migrate`
4. Start development: `npm run start:dev`

## Scripts

- `npm run start:dev`: Development server
- `npm run build`: Production build
- `npm run start:prod`: Start production server
- `npm run migrate`: Run database migrations
- `npm run migrate:rollback`: Rollback last migration
- `npm run codegen:database`: Generate Kysely types from database

## API Documentation

- Swagger UI: `http://localhost:3000/api`
- Bruno Collection: Located in `api-doc/VN-Itinerary/`
