# Anonymous Message Board

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
