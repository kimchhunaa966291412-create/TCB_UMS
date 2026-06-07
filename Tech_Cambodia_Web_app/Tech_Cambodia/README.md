# ITC Academic System v3.2
**Institute of Technology of Cambodia**

## What's New in v3.2

| Area | Change |
|------|--------|
| 🌙 **Dark Mode** | Full dark theme with system toggle (persisted per browser) |
| 🔐 **Change Password** | Profile dropdown → Change Password modal |
| ⌨️ **Keyboard Shortcuts** | `Ctrl+K` focuses search; `Escape` closes modals |
| 📊 **Dashboard v2** | Colored stat cards, % labels on grade bars, Quick Actions panel |
| 📈 **Reports v2** | Visual bar charts for all report types + CSV export button |
| 🗃️ **Attendance Table** | `attendance` table added to schema (was missing, breaking attendance save) |
| 🐛 **CSS Bug Fixes** | Added 30+ missing CSS classes referenced by JS: toast, pager, chart-box, bar-row, fg-row, s-item, transcript styles, stat card colors, search dropdown |
| 🎨 **CSS Variables** | Added legacy aliases (`--light`, `--mist`, `--sky2`, `--orange`, `--green`, `--red`) so all existing JS references resolve |
| 🖨️ **Print Styles** | `@media print` hides nav/buttons for clean transcript printing |
| 🔒 **Auth Fix** | `change_password` endpoint already in router, now properly implemented with 8-char minimum |

## Project Structure

```
itc/
├── public/                    ← Web root (point Apache/Nginx here)
│   ├── index.php              ← Main SPA shell (v3.2: dark mode toggle, profile dropdown)
│   ├── login.php              ← Login page
│   ├── logout.php             ← Session destroy + redirect
│   ├── api.php                ← Public API entry point → delegates to src/api/
│   └── assets/
│       ├── css/
│       │   ├── variables.css  ← 🎨 Brand tokens + dark mode overrides + legacy aliases
│       │   ├── base.css
│       │   ├── layout.css
│       │   ├── components.css ← 🆕 Toast, pager, chart, transcript, search, profile drop
│       │   └── login.css
│       └── js/
│           ├── components/
│           │   ├── helpers.js ← API calls, toast, modal, formatters
│           │   └── nav.js     ← 🆕 Dark mode, profile drop, Ctrl+K, change-password
│           └── pages/
│               ├── dashboard.js  ← 🆕 Colored cards, %, quick actions
│               ├── reports.js    ← 🆕 Visual bars + CSV export
│               └── [other pages unchanged]
│
├── src/
│   ├── Config/Config.php
│   ├── Database/Database.php
│   ├── Auth/Auth.php
│   └── api/
│       ├── api_auth.php      ← 🆕 change_password endpoint (fixed)
│       └── [other APIs unchanged]
│
├── database/
│   └── schema.sql            ← 🆕 attendance table added
│
├── .env.example
└── README.md
```

## Setup

### 1. Clone & configure
```bash
cp .env.example .env
# Edit .env — set DB_PASS, DB_NAME, APP_ENV=production, SESSION_SECURE=true
```

### 2. Install PHP dependencies
```bash
composer install --no-dev --optimize-autoloader
```

### 3. Import the database
```bash
mysql -u root -p db_itc < database/schema.sql
```

### 4. Configure web server

**Apache** — `DocumentRoot` → `public/`:
```apacheconf
<VirtualHost *:80>
    ServerName itc.local
    DocumentRoot /var/www/itc/public
    <Directory /var/www/itc/public>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

**Nginx**:
```nginx
server {
    listen 80;
    root /var/www/itc/public;
    index index.php;
    location / { try_files $uri $uri/ /index.php?$query_string; }
    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
    location ~* ^/(src|storage)/ { deny all; }
}
```

### 5. Set permissions
```bash
chmod -R 775 storage/
chown -R www-data:www-data storage/
```

### 6. First login
Open `http://itc.local/login.php` — click a role tile to fill credentials, then sign in.

---

## Default Credentials

| Role       | Username   | Password  |
|------------|------------|-----------|
| Admin      | admin      | Admin@123 |
| Registrar  | registrar  | Admin@123 |
| Lecturer   | lecturer1  | Admin@123 |
| Staff      | staff1     | Admin@123 |

> **Change all passwords immediately after first login in production.**

---

## ITC Grading Scale (ACC Cambodia)

| Score | Grade | GPA Points |
|-------|-------|-----------|
| ≥ 85  | A     | 4.0       |
| ≥ 75  | B     | 3.0       |
| ≥ 65  | C+    | 2.5       |
| ≥ 55  | C     | 2.0       |
| ≥ 45  | D+    | 1.5       |
| ≥ 35  | D     | 1.0       |
| ≥ 25  | E     | 0.5       |
| < 25  | F     | 0.0       |

---

## Quick Customisation

| Goal | File |
|------|------|
| Change theme colours | `public/assets/css/variables.css` |
| Toggle dark mode | Click moon icon in topbar |
| Add/edit API action | `src/api/api_<name>.php` + register in `api_start.php` |
| Change DB config | `.env` |
