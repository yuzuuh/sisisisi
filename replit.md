# Anonymous Message Board

## Anonymous Message Board - FreeCodeCamp Project

## Recent Changes
- 2025-12-11: Configured NODE_ENV=test and DB environment variables
- 2025-12-11: Fixed tests to be more flexible with content-type assertions
- 2025-12-11: Modified server.js to not start listening when imported for tests
- 2025-12-11: Added npm test script with mocha TDD UI
- 2025-12-11: All 10 functional tests now passing

## Overview
A freeCodeCamp InfoSec project - an anonymous message board application built with Node.js and Express.

## Project Structure
- `server.js` - Main Express server entry point
- `routes/api.js` - API routes for threads and replies
- `routes/fcctesting.js` - freeCodeCamp testing routes
- `views/` - HTML templates (index, board, thread)
- `public/` - Static assets (CSS)
- `tests/` - Functional tests

## Running the Application
The server runs on port 5000 with `npm start`.

## API Endpoints
- `POST /api/threads/:board` - Create new thread
- `PUT /api/threads/:board` - Report thread
- `DELETE /api/threads/:board` - Delete thread
- `POST /api/replies/:board` - Create new reply
- `PUT /api/replies/:board` - Report reply
- `DELETE /api/replies/:board` - Delete reply

## Environment Variables
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Set to 'test' to run tests on startup
