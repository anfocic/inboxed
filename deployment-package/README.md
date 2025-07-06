# 🚀 Inboxed Server Deployment Instructions

## Files to Transfer to Your Server

Copy these files to your server in a directory like `/home/user/inboxed/`:

### Required Files:
- `src/` (entire source directory)
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `jest.config.js`
- `Dockerfile`
- `docker-compose.yml`
- `docker-compose.prod.yml`
- `.env.production`
- `deploy.sh`
- `nginx/` (entire directory)

## Step-by-Step Deployment

### 1. Transfer Files to Server
```bash
# From your local machine
scp -r /path/to/inboxed user@your-server-ip:/home/user/inboxed
```

### 2. SSH into Your Server
```bash
ssh user@your-server-ip
cd /home/user/inboxed
```

### 3. Install Docker (if not installed)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Log out and back in for group changes to take effect
exit
# SSH back in
ssh user@your-server-ip
```

### 4. Verify Docker Installation
```bash
docker --version
docker-compose --version
```

### 5. Deploy the Application
```bash
cd /home/user/inboxed
chmod +x deploy.sh
./deploy.sh
```

### 6. Verify Deployment
```bash
# Check if containers are running
docker-compose ps

# Test health endpoint
curl http://localhost:3000/health

# View logs
docker-compose logs -f
```

### 7. Test the API
```bash
# Test form submission
curl -X POST http://localhost:3000/api/form/submit \
  -F "tenant=test" \
  -F "formId=contact" \
  -F "name=Test User" \
  -F "email=test@example.com" \
  -F "message=Test message from server"
```

## Configuration Notes

- Your `.env.production` file is already configured with:
  - Zoho SMTP settings (smtp.zoho.eu)
  - Email: booking@ldg.ie
  - Allowed origins: www.leixlip-dog-grooming.com

## Firewall Configuration

If you want to access the API from outside your server:

```bash
# Allow port 3000 (or configure nginx for port 80/443)
sudo ufw allow 3000
```

## SSL Setup (Optional but Recommended)

If you want to use HTTPS with nginx:

1. Get SSL certificates (Let's Encrypt):
```bash
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com
```

2. Copy certificates:
```bash
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/
sudo chown $USER:$USER nginx/ssl/*
```

3. Update nginx/nginx.conf with your actual domain name

4. Restart with nginx:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Troubleshooting

### If deployment fails:
```bash
# Check logs
docker-compose logs

# Rebuild
docker-compose build --no-cache

# Restart
docker-compose down && docker-compose up -d
```

### If email sending fails:
- Verify SMTP credentials in .env.production
- Check if Zoho requires app-specific passwords
- Test SMTP connection manually

### If health check fails:
```bash
# Check if port is available
sudo netstat -tlnp | grep 3000

# Check container status
docker ps -a
```

## Auto-Start on Server Reboot

To make the service start automatically:

```bash
# Copy systemd service
sudo cp inboxed.service /etc/systemd/system/

# Edit the service file to update the path
sudo nano /etc/systemd/system/inboxed.service
# Update WorkingDirectory to your actual path (e.g., /home/user/inboxed)

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable inboxed.service
sudo systemctl start inboxed.service

# Check status
sudo systemctl status inboxed.service
```
