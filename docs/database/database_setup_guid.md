# Database Setup Guide

## 🗄️ RetroRetro Database Installation Guide

### Prerequisites
- Windows 10/11
- Node.js 18+
- Administrative privileges

### 1. PostgreSQL Installation

```powershell
# Install PostgreSQL 17
winget install PostgreSQL.PostgreSQL.17

# Configure service user
sc config postgresql-x64-17 obj= "NT AUTHORITY\NetworkService"

# Start service
Start-Service postgresql-x64-17
```

**Configuration:**
- Port: 5433
- User: postgres
- Password: Retroretro_001

### 2. Redis Installation

```powershell
# Install Redis via MSI from GitHub releases
# Register as Windows service
& "C:\Program Files\Redis\redis-server.exe" --service-install --service-name Redis --port 6379

# Start and configure auto-start
Start-Service Redis
Set-Service -Name Redis -StartupType Automatic
```

### 3. Database Setup

```bash
# Create project database
psql -h localhost -p 5433 -U postgres
CREATE DATABASE legal_retro_gaming;
\q

# Initialize schema
cd backend
node -e "const setup = require('./src/database/setup'); setup.setupDatabase();"
```

### 4. Testing

```bash
# Run database connection tests
node scripts/db_test.js

# Expected result: All ✅ OK
```

### 5. Environment Configuration

**backend/.env:**
```
DB_HOST=localhost
DB_PORT=5433
DB_NAME=legal_retro_gaming
DB_USER=postgres
DB_PASSWORD=Retroretro_001
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Troubleshooting

**Service not starting:**
- Check Windows Event Log
- Verify service user permissions
- Ensure ports are not blocked

**Connection refused:**
- Verify service is running: `Get-Service postgresql-x64-17`
- Check port: `netstat -an | findstr :5433`
- Test with psql directly

**Password authentication failed:**
- Reset password in psql: `ALTER USER postgres PASSWORD 'Retroretro_001';`
- Update .env file
- Restart application