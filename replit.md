# Anonymous Message Board - FreeCodeCamp Project

## Recent Changes
- 2025-12-11: Configured NODE_ENV=test and DB environment variables
- 2025-12-11: Fixed tests to be more flexible with content-type assertions
- 2025-12-11: Modified server.js to not start listening when imported for tests
- 2025-12-11: Added npm test script with mocha TDD UI
- 2025-12-11: Improved /_api/app-info endpoint for better header reporting
- 2025-12-11: All 10 functional tests passing locally

## Overview
A freeCodeCamp InfoSec project - an anonymous message board application built with Node.js and Express.

## Security Features (Helmet)
- X-Frame-Options: SAMEORIGIN
- X-DNS-Prefetch-Control: off
- Referrer-Policy: same-origin

## Project Structure
- `server.js` - Main Express server with security middleware
- `controllers/` - Thread and Reply controllers
- `models/` - Mongoose schemas (Thread, Reply)
- `routes/api.js` - API routes for threads and replies
- `routes/fcctesting.js` - freeCodeCamp testing routes
- `tests/2_functional-tests.js` - 10 functional tests
- `views/` - HTML templates
- `public/` - Static assets

## Running the Application
- `npm start` - Start the server on port 5000
- `npm test` - Run all 10 functional tests

## API Endpoints
- `GET /api/threads/:board` - Get 10 most recent threads (3 replies max)
- `POST /api/threads/:board` - Create new thread (text, delete_password)
- `PUT /api/threads/:board` - Report thread (thread_id)
- `DELETE /api/threads/:board` - Delete thread (thread_id, delete_password)
- `GET /api/replies/:board` - Get single thread with all replies (thread_id)
- `POST /api/replies/:board` - Create reply (text, delete_password, thread_id)
- `PUT /api/replies/:board` - Report reply (thread_id, reply_id)
- `DELETE /api/replies/:board` - Delete reply (thread_id, reply_id, delete_password)

## Environment Variables
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Set to 'test' for testing
- `DB` - MongoDB connection string (secret)
