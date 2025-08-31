# Multiply Monsters - Deployment Troubleshooting Guide

## Blank Screen Issue - RESOLVED

**Problem:** The initial deployment package showed a blank screen on subdomain deployment.

**Root Cause:** React build was using relative paths (`./`) which don't work properly when served from subdomain root.

**Solution:** Rebuilt with absolute paths (`/`) by changing `package.json` homepage setting from `"./"` to `"/"`.

---

## Updated Deployment Instructions

### Use the NEW Package
- ✅ Use: `multiply-monsters-deployment-fixed.tar.gz`
- ❌ Don't use: `multiply-monsters-deployment.tar.gz` (has path issues)

### Quick Deployment Steps

1. **Extract the fixed package:**
   ```bash
   tar -xzf multiply-monsters-deployment-fixed.tar.gz -C /path/to/your/subdomain/
   ```

2. **Ensure proper web server configuration:**

   **For Apache (.htaccess):**
   ```apache
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   ```

   **For Nginx:**
   ```nginx
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```

3. **Verify file permissions:**
   ```bash
   chmod -R 644 /path/to/your/subdomain/*
   chmod 755 /path/to/your/subdomain/
   ```

### Additional Troubleshooting

**If you still see a blank screen:**

1. **Check browser console (F12):**
   - Look for 404 errors on static files
   - Check for JavaScript errors
   - Verify network tab shows files loading

2. **Verify file structure after extraction:**
   ```
   your-subdomain/
   ├── index.html
   ├── favicon.svg
   ├── manifest.json
   ├── static/
   │   ├── css/
   │   │   └── main.*.css
   │   └── js/
   │       └── main.*.js
   └── [other files...]
   ```

3. **Test basic file access:**
   - Visit: `https://your-subdomain.example.com/index.html`
   - Visit: `https://your-subdomain.example.com/static/css/main.*.css`
   - Both should load without 404 errors

4. **Common server configuration issues:**
   - **Missing SPA routing:** App needs all routes to serve `index.html`
   - **Wrong document root:** Files should be in subdomain's root directory
   - **MIME type issues:** Ensure `.js` and `.css` files serve with correct Content-Type

### Testing Checklist

After deployment, verify:
- [ ] Page loads (not blank)
- [ ] Console shows no 404 errors
- [ ] Game menu appears
- [ ] Sound effects work (requires HTTPS)
- [ ] Background music plays during gameplay
- [ ] Mobile responsive design works

### Quick Test Command
```bash
# Test from your subdomain directory
python3 -m http.server 8080
# Then visit http://localhost:8080 in browser
```

The fixed package should resolve the blank screen issue completely!