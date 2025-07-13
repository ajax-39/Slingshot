# Ajax NSE Server

Backend service for automated NSE (National Stock Exchange) data download and processing.

## Features

- 🤖 Automated NSE market data scraping using Puppeteer
- 🛡️ Rate limiting and security headers
- 📝 Comprehensive logging and debugging
- 🔄 Error handling with detailed error messages
- 🌐 CORS support for frontend integration
- 📊 Health check endpoints

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Chrome/Chromium browser (for Puppeteer)

## Installation

1. Navigate to the server directory:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Copy environment variables:

```bash
cp .env.example .env
```

4. Modify `.env` file as needed for your environment.

## Usage

### Development Mode

```bash
npm run dev
```

This starts the server with file watching enabled.

### Production Mode

```bash
npm start
```

### Debug Mode

```bash
npm run debug
```

This starts the server with Node.js inspector enabled.

## API Endpoints

### Health Check

- **GET** `/health`
- Returns server status and timestamp

### Download NSE Data

- **GET** `/api/download-nse-csv`
- Downloads the latest NSE market data as CSV
- Rate limited: 5 requests per minute per IP
- Returns CSV file with appropriate headers

## Configuration

Environment variables can be set in `.env` file:

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment mode (development/production)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:5173)
- `DEBUG` - Enable debug logging (true/false)

## Error Handling

The server includes comprehensive error handling:

- **504** - NSE website timeout or connectivity issues
- **502** - NSE website structure changes or download issues
- **500** - Internal server errors
- **429** - Rate limit exceeded

## Logging

The server uses a custom logging system with different levels:

- 🚀 **START** - Server startup messages
- ℹ️ **INFO** - General information
- ⚠️ **WARN** - Warning messages
- ❌ **ERROR** - Error messages
- ✅ **SUCCESS** - Success messages
- 🐛 **DEBUG** - Debug messages (only in development mode)

## Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting on API endpoints
- Request logging and monitoring
- Input validation and sanitization

## Troubleshooting

### Common Issues

1. **Download fails**: Check if NSE website is accessible and the page structure hasn't changed
2. **Browser launch fails**: Ensure Chrome/Chromium is installed
3. **Rate limit errors**: Wait for the rate limit to reset (1 minute)
4. **CORS errors**: Check `FRONTEND_URL` environment variable

### Debug Mode

Enable debug mode by setting `DEBUG=true` in `.env` file. This will show detailed logs including:

- Request/response details
- Browser navigation steps
- File system operations
- Puppeteer actions

### Screenshots

When download fails, the server automatically saves a screenshot to the downloads directory for debugging purposes.

## Legal Compliance

⚠️ **Important**: Ensure your use of this automated scraping tool complies with:

- NSE India's Terms of Service
- Website's robots.txt file
- Applicable data protection and privacy laws
- Rate limiting to avoid overwhelming the servers

## License

This project is for educational and personal use only. Please respect the terms of service of the websites being accessed.
