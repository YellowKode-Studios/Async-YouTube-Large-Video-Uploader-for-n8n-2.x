# 🔧 Nginx Configuration

## Option 1: Subdomain (Recommended)

**Easiest setup - dedicated subdomain for uploader**

```nginx
server {
    listen 443 ssl;
    server_name uploader.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/uploader.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/uploader.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        
        # Important for large files
        proxy_connect_timeout 600s;
        proxy_read_timeout 600s;
        client_max_body_size 0;
    }
}
```

**Deploy:**
```bash
sudo nano /etc/nginx/sites-available/uploader
# Paste config above
sudo ln -s /etc/nginx/sites-available/uploader /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**URL:** `https://uploader.yourdomain.com/upload-start`

---

## Option 2: Subdirectory (with n8n)

**Use same domain as n8n with /yt-upload path**

```nginx
server {
    listen 443 ssl;
    server_name n8n.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/n8n.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/n8n.yourdomain.com/privkey.pem;

    # n8n
    location / {
        proxy_pass http://localhost:5678;
        proxy_set_header Host $host;
    }

    # Uploader
    location /yt-upload/ {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
        proxy_connect_timeout 600s;
        proxy_read_timeout 600s;
        client_max_body_size 0;
    }
}
```

**URL:** `https://n8n.yourdomain.com/yt-upload/upload-start`

---

## Get SSL Certificate

```bash
sudo certbot --nginx -d uploader.yourdomain.com
```
