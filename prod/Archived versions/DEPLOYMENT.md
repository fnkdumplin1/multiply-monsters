# Multiply Monsters - Deployment Instructions

## Package Contents
The deployment package `multiply-monsters-deployment.tar.gz` contains the complete production build of the Multiply Monsters game.

## Server Requirements
- Static file hosting (Apache, Nginx, or similar)
- Support for single-page applications (SPA routing)

## Subdomain Deployment Instructions

### 1. Upload Files
Extract the deployment package to your subdomain directory:
```bash
# On your server
tar -xzf multiply-monsters-deployment.tar.gz -C /path/to/your/subdomain/
```

### 2. Web Server Configuration

#### Apache (.htaccess)
Create or update `.htaccess` in your subdomain root:
```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QR,L]

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Set cache headers for static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType audio/mpeg "access plus 1 year"
</IfModule>
```

#### Nginx
Add this location block to your subdomain configuration:
```nginx
location / {
    try_files $uri $uri/ /index.html;
    
    # Cache static assets
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|mp3)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. Custom Audio (Optional)
To use custom background music:
1. Replace `spooky-music.mp3` with your audio file
2. Keep the same filename or update the filename in the code

### 4. SSL/HTTPS
- Ensure HTTPS is enabled for Web Audio API compatibility
- Modern browsers require secure context for audio features

### 5. Testing
After deployment, test:
- ✅ Main menu loads properly
- ✅ All game modes work (Training, Timed, Advanced)
- ✅ Sound effects play
- ✅ Background music works during gameplay
- ✅ Mobile numeric keypad appears on mobile devices
- ✅ All floating animations display correctly

## Files Included
- `index.html` - Main application entry point
- `static/` - Optimized JavaScript and CSS bundles
- `manifest.json` - PWA configuration
- `favicon.svg` - Custom monster favicon
- `spooky-music.mp3` - Background music (placeholder)
- Various icon files for PWA support

## Troubleshooting
- **No sound**: Ensure HTTPS is enabled and check browser console for audio errors
- **Blank page**: Check browser console for errors, verify server configuration
- **Music not playing**: Verify audio file exists and is accessible via HTTPS

## Performance Notes
- App is optimized for mobile and desktop
- Animations automatically pause during user interactions
- Reduced motion support for accessibility preferences
- Gzipped bundle size: ~66KB total

The app is now ready for production use on your subdomain!