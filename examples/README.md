# 📂 Configuration Examples

Copy-paste ready configurations for quick deployment.

---

## 📄 Files

| File | Description |
|------|-------------|
| `nginx-config.md` | Nginx configs (subdirectory & subdomain) |
| `apache-config.md` | Apache configs (subdirectory & subdomain) |
| `curl-examples.md` | cURL test examples with responses |
| `yt-uploader.service` | Systemd service for VPS |

---

## ⚡ Quick Deploy

### Nginx
```bash
# Copy config from nginx-config.md to:
sudo nano /etc/nginx/sites-available/uploader

# Enable
sudo ln -s /etc/nginx/sites-available/uploader /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Apache
```bash
# Copy config from apache-config.md to:
sudo nano /etc/apache2/sites-available/uploader.conf

# Enable
sudo a2enmod proxy proxy_http ssl
sudo a2ensite uploader.conf
sudo systemctl reload apache2
```

### Systemd (VPS)
```bash
# Copy yt-uploader.service to:
sudo cp yt-uploader.service /etc/systemd/system/

# Start
sudo systemctl enable yt-uploader
sudo systemctl start yt-uploader
```

### Test
```bash
# Use curl-examples.md
curl -X POST http://localhost:3000/upload-start \
  -H "Content-Type: application/json" \
  -d '{"videoUrl":"...","resumableUrl":"..."}'
```

---

**Need help?** See main [README.md](../README.md)
