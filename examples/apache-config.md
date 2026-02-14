# 🔧 Apache Configuration

## Option 1: Subdomain (Recommended)

**Easiest setup - dedicated subdomain**

Create `/etc/apache2/sites-available/uploader.conf`:

```apache
<VirtualHost *:443>
    ServerName uploader.yourdomain.com
    
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/uploader.yourdomain.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/uploader.yourdomain.com/privkey.pem
    
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    ProxyPreserveHost On
    ProxyTimeout 600
    LimitRequestBody 0
</VirtualHost>
```

**Deploy:**
```bash
sudo a2enmod proxy proxy_http ssl
sudo a2ensite uploader.conf
sudo systemctl reload apache2
```

**URL:** `https://uploader.yourdomain.com/upload-start`

---

## Option 2: Subdirectory (with n8n)

**Use same domain as n8n with /yt-upload path**

```apache
<VirtualHost *:443>
    ServerName n8n.yourdomain.com
    
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/n8n.yourdomain.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/n8n.yourdomain.com/privkey.pem
    
    # n8n
    ProxyPass / http://localhost:5678/
    ProxyPassReverse / http://localhost:5678/
    
    # Uploader
    ProxyPass /yt-upload http://localhost:3000/
    ProxyPassReverse /yt-upload http://localhost:3000/
    
    ProxyPreserveHost On
    ProxyTimeout 600
    LimitRequestBody 0
</VirtualHost>
```

**URL:** `https://n8n.yourdomain.com/yt-upload/upload-start`

---

## Option 3: .htaccess (Simple)

Create `.htaccess` in web root:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^yt-upload/(.*)$ http://localhost:3000/$1 [P,L]
</IfModule>

<IfModule mod_proxy.c>
    ProxyPreserveHost On
    ProxyTimeout 600
</IfModule>
```

**Enable modules:**
```bash
sudo a2enmod proxy proxy_http rewrite ssl
sudo systemctl restart apache2
```

---

## Get SSL Certificate

```bash
sudo certbot --apache -d uploader.yourdomain.com
```
