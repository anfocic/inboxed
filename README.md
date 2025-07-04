## 📬 Inboxed

**Inboxed** is an open source form handler that receives form submissions from any frontend and delivers them straight to your inbox with beautiful HTML emails and file attachments.

> ✅ Production ready with Docker support, structured logging, and security features!

---

### 🎯 Goal

To make a **zero-login**, plug-and-play form handler that:

* ✅ Accepts POST requests from any frontend (HTML, React, static sites, etc.)
* 📧 Delivers submitted form data directly to an email address
* 🔐 Requires no user accounts or dashboards
* ⚒️ Works as a lightweight drop-in microservice or Docker container

---

### ✨ Features

* ✅ **Beautiful HTML Emails** - Professional email templates with form data
* ✅ **File Attachments** - Support for image uploads (JPEG, PNG, WebP)
* ✅ **Structured Logging** - Winston-based logging with request tracking
* ✅ **Docker Ready** - Production-ready containerization
* ✅ **Security Features** - Honeypot spam protection, file validation, rate limiting
* ✅ **Auto Cleanup** - Uploaded files are automatically cleaned up after sending
* ✅ **Health Checks** - Built-in health endpoint for monitoring
* ✅ **Multi-tenant** - Support for multiple forms/tenants
* ⚙️ **Configurable** - Environment variable configuration
* 🔒 **Secure** - Input sanitization and validation

### 🚀 Quick Start

#### Option 1: Docker (Recommended)
```bash
# 1. Clone the repository
git clone <your-repo>
cd inboxed

# 2. Configure environment
cp .env.example .env
# Edit .env with your SMTP settings

# 3. Run with Docker
docker-compose up -d

# 4. Check health
curl http://localhost:3000/health
```

#### Option 2: Local Development
```bash
# 1. Clone and install
git clone <your-repo>
cd inboxed
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your SMTP settings

# 3. Run in development mode
npm run dev

# 4. Or build and run production
npm run build:prod
npm run start:prod
```

### 📧 SMTP Configuration

**Required environment variables:**
```env
# SMTP Settings (Required)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
TO_EMAIL=recipient@example.com

# Security (Required in production)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Optional Settings
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
MAX_FILE_SIZE=5242880
MAX_FILES=5
```

**Popular SMTP Providers:**
- **Gmail**: `smtp.gmail.com:587` (use App Password)
- **SendGrid**: `smtp.sendgrid.net:587`
- **Mailgun**: `smtp.mailgun.org:587`
- **AWS SES**: `email-smtp.region.amazonaws.com:587`

### 📝 API Usage

**Endpoint:** `POST /api/form/submit`

**JavaScript Example:**
```javascript
const formData = new FormData();
formData.append('tenant', 'my-website');
formData.append('formId', 'contact-form');
formData.append('name', 'John Doe');
formData.append('email', 'john@example.com');
formData.append('message', 'Hello!');
formData.append('data', JSON.stringify({
    phone: '123-456-7890',
    company: 'Acme Corp'
}));
formData.append('attachments', file1);
formData.append('attachments', file2);

fetch('/api/form/submit', {
    method: 'POST',
    body: formData
});
```

**HTML Form Example:**
```html
<form action="/api/form/submit" method="POST" enctype="multipart/form-data">
    <input type="hidden" name="tenant" value="my-website">
    <input type="hidden" name="formId" value="contact-form">
    <input type="hidden" name="website" value=""> <!-- Honeypot -->
    <input type="hidden" name="data" value='{"source":"website"}'>

    <input type="text" name="name" required>
    <input type="email" name="email" required>
    <textarea name="message"></textarea>
    <input type="file" name="attachments" multiple accept="image/*">

    <button type="submit">Submit</button>
</form>
```

### 🔒 Security Features

- **Honeypot Protection**: Automatic bot detection
- **Rate Limiting**: Configurable per-IP limits
- **File Validation**: Type and size restrictions
- **Input Sanitization**: XSS protection
- **CORS Protection**: Configurable origin restrictions
- **Structured Logging**: Security event tracking

### 🐳 Docker Deployment

**Production:**
```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Scale if needed
docker-compose up -d --scale inboxed=3
```

**Development:**
```bash
# Run with hot reloading
npm run docker:compose:dev
```

### 📊 Monitoring

**Health Check:**
```bash
curl http://localhost:3000/health
```

**Logs:**
```bash
# Docker logs
docker-compose logs -f

# Local logs (if LOG_FILE is set)
tail -f ./logs/error.log
```

**Metrics Available:**
- Request processing time
- Email delivery success/failure
- File upload statistics
- Security events (rate limits, CORS violations, etc.)

### 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in CI mode
npm run test:ci

# Run specific test file
npm test -- integration.test.ts
```

### 🔧 Configuration Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SMTP_HOST` | ✅ | - | SMTP server hostname |
| `SMTP_PORT` | ❌ | 587 | SMTP server port |
| `SMTP_USER` | ✅ | - | SMTP username |
| `SMTP_PASS` | ✅ | - | SMTP password |
| `TO_EMAIL` | ✅ | - | Destination email address |
| `ALLOWED_ORIGINS` | ✅* | - | Comma-separated allowed origins (*required in production) |
| `NODE_ENV` | ❌ | development | Environment (development/production/test) |
| `PORT` | ❌ | 3000 | Server port |
| `LOG_LEVEL` | ❌ | info | Log level (error/warn/info/debug) |
| `LOG_FILE` | ❌ | - | Optional log file path |
| `RATE_LIMIT_WINDOW_MS` | ❌ | 900000 | Rate limit window (15 minutes) |
| `RATE_LIMIT_MAX` | ❌ | 100 | Max requests per window |
| `MAX_FILE_SIZE` | ❌ | 5242880 | Max file size in bytes (5MB) |
| `MAX_FILES` | ❌ | 5 | Max number of files per request |
| `UPLOAD_DIR` | ❌ | /tmp | Temporary upload directory |
| `ALLOWED_FILE_TYPES` | ❌ | image/jpeg,image/png,image/webp | Allowed MIME types |

### 🚨 Troubleshooting

**Common Issues:**

1. **CORS Errors**
   ```bash
   # Make sure ALLOWED_ORIGINS is set correctly
   ALLOWED_ORIGINS=https://yourdomain.com
   ```

2. **SMTP Authentication Failed**
   ```bash
   # For Gmail, use App Password instead of regular password
   # Enable 2FA and generate App Password
   ```

3. **File Upload Errors**
   ```bash
   # Check file size and type restrictions
   # Ensure upload directory has write permissions
   ```

4. **Rate Limit Issues**
   ```bash
   # Adjust rate limiting settings
   RATE_LIMIT_MAX=200
   RATE_LIMIT_WINDOW_MS=900000
   ```

**Debug Mode:**
```bash
# Enable verbose logging
LOG_LEVEL=debug

# Run tests with verbose output
VERBOSE_TESTS=true npm test
```

### 📈 Performance Tips

1. **Use a reverse proxy** (nginx/Apache) for SSL termination
2. **Set up log rotation** for production deployments
3. **Monitor disk space** for temporary file uploads
4. **Configure appropriate rate limits** based on your traffic
5. **Use environment-specific configurations**

### 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run tests: `npm test`
5. Build: `npm run build`
6. Commit: `git commit -m 'Add amazing feature'`
7. Push: `git push origin feature/amazing-feature`
8. Open a Pull Request

### 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### 🙏 Acknowledgments

- Built with [Express.js](https://expressjs.com/)
- Email handling with [Nodemailer](https://nodemailer.com/)
- File uploads with [Multer](https://github.com/expressjs/multer)
- Logging with [Winston](https://github.com/winstonjs/winston)
- Testing with [Jest](https://jestjs.io/) and [Supertest](https://github.com/visionmedia/supertest)

---

### 🚧 Status

Inboxed is still in its early stages. Follow this repo to stay updated or contribute ideas via [issues](https://github.com/anfocic/inboxed/issues).

---

### 📄 License

MIT — open for anyone to build on or modify.
