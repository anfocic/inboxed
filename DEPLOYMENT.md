# 🚀 Inboxed Production Deployment Guide

This guide will help you deploy Inboxed to your home server using Docker.

## 📋 Prerequisites

- Docker and Docker Compose installed on your server
- Domain name pointing to your server (for SSL)
- SMTP credentials (Gmail, SendGrid, etc.)
- SSH access to your server

## 🔧 Step-by-Step Deployment

### 1. Prepare Your Server

```bash
# Update your server
sudo apt update && sudo apt upgrade -y

# Install Docker (if not already installed)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose (if not already installed)
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Transfer Files to Server

```bash
# From your local machine, copy the project to your server
scp -r /path/to/inboxed user@your-server:/home/user/inboxed

# Or clone from your repository
git clone https://github.com/your-username/inboxed.git
cd inboxed
```

### 3. Configure Environment

```bash
# Edit the .env file with your production settings
nano .env
```

**Required settings to update in .env:**
- `SMTP_HOST` - Your SMTP server (e.g., smtp.gmail.com)
- `SMTP_USER` - Your email address
- `SMTP_PASS` - Your email password/app password
- `TO_EMAIL` - Where form submissions should be sent
- `ALLOWED_ORIGINS` - Your domain (https://www.leixlip-dog-grooming.com)

### 4. SSL Certificates (Recommended)

If using the nginx reverse proxy, obtain SSL certificates:

```bash
# Install certbot
sudo apt install certbot

# Get certificates (replace with your domain)
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Copy certificates to nginx directory
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/
sudo chown $USER:$USER nginx/ssl/*
```

### 5. Deploy the Application

```bash
# Make deployment script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### 6. Verify Deployment

```bash
# Check if containers are running
docker-compose ps

# Check health endpoint
curl http://localhost:3000/health

# View logs
docker-compose logs -f
```

### 7. Set Up Auto-Start (Optional)

```bash
# Copy systemd service file
sudo cp inboxed.service /etc/systemd/system/

# Edit the service file to update the path
sudo nano /etc/systemd/system/inboxed.service
# Update WorkingDirectory to your actual path

# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable inboxed.service
sudo systemctl start inboxed.service
```

## 🔍 Testing Your Deployment

### Test the API endpoint:

```bash
curl -X POST http://localhost:3000/api/form/submit \
  -F "tenant=test" \
  -F "formId=contact" \
  -F "name=Test User" \
  -F "email=test@example.com" \
  -F "message=Test message"
```

### Test from your frontend:

Update your frontend form to point to your server:
```javascript
fetch('https://your-domain.com/api/form/submit', {
    method: 'POST',
    body: formData
});
```

## 📊 Monitoring and Maintenance

### View Logs
```bash
# Application logs
docker-compose logs -f inboxed

# Nginx logs (if using)
docker-compose logs -f nginx

# System logs
journalctl -u inboxed.service -f
```

### Update Application
```bash
# Pull latest changes
git pull

# Rebuild and restart
./deploy.sh
```

### Backup
```bash
# Backup logs
tar -czf inboxed-logs-$(date +%Y%m%d).tar.gz logs/

# Backup configuration
tar -czf inboxed-config-$(date +%Y%m%d).tar.gz .env docker-compose*.yml nginx/
```

## 🚨 Troubleshooting

### Common Issues:

1. **Port 3000 already in use**
   ```bash
   sudo lsof -i :3000
   # Kill the process or change PORT in .env
   ```

2. **SMTP authentication failed**
   - For Gmail: Enable 2FA and use App Password
   - Check SMTP credentials in .env

3. **CORS errors**
   - Verify ALLOWED_ORIGINS in .env matches your domain exactly

4. **SSL certificate issues**
   - Check certificate paths in nginx/nginx.conf
   - Verify certificates are readable by nginx container

### Health Checks:
```bash
# Container health
docker-compose ps

# Application health
curl http://localhost:3000/health

# Disk space
df -h

# Memory usage
free -h
```

## 🔒 Security Considerations

- Keep your server updated
- Use strong passwords for SMTP
- Regularly rotate SSL certificates
- Monitor logs for suspicious activity
- Consider setting up fail2ban for additional protection
- Use a firewall to restrict access to necessary ports only

## 📞 Support

If you encounter issues:
1. Check the logs: `docker-compose logs -f`
2. Verify your .env configuration
3. Test SMTP settings separately
4. Check firewall and port settings
5. Review the troubleshooting section above
