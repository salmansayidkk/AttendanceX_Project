# AttendX - Workforce Management System

## 🎯 Overview
AttendX is a complete attendance management solution designed to work with ZKTeco biometric devices. This is a **frontend prototype** demonstrating all the features and workflows of a production-ready system.

## ✨ Key Features

### 1. **Dashboard**
- Real-time attendance overview
- Live statistics (Total employees, Present, Late, On Leave)
- Department-wise attendance breakdown
- Quick action buttons
- Connected device monitoring
- Attendance trend charts

### 2. **Employee Management** 
- Add, edit, and delete employees
- Employee profiles with complete information
- Department and position tracking
- Salary management
- Employee status (active/inactive)
- Bulk import capabilities (planned)

### 3. **Attendance Tracking**
- Real-time attendance logs
- Check-in/Check-out times
- Late arrival tracking
- Absence management
- Monthly/daily attendance reports
- Filter by date, department, status

### 4. **Device Management** (CRITICAL FEATURE)
- **Add ZKTeco devices by IP address**
- Device enrollment workflow:
  1. Configure server IP on ZKTeco device
  2. Device appears in pending list
  3. Admin approves and adds device
  4. Automatic data synchronization
- Supported devices:
  - ZKTeco F18
  - ZKTeco MA300
  - ZKTeco K40
  - ZKTeco G3
  - ZKTeco MB360/MB460
  - ZKTeco SpeedFace-V5L
  - Other ZKTeco models
- Device monitoring (online/offline status)
- Connection testing
- Manual data sync
- Device statistics and logs

### 5. **Leave Management**
- Leave application system
- Multiple leave types (Annual, Sick, Emergency)
- Approval workflow
- Leave balance tracking
- Leave calendar view
- Email notifications (backend feature)

### 6. **Payroll**
- Automated salary calculation
- Attendance-based deductions
- Overtime calculation
- Monthly payroll processing
- Salary slips generation
- Bank transfer integration (planned)

### 7. **Reports**
- Attendance summary reports
- Late arrival reports
- Department-wise reports
- Monthly/Yearly reports
- Excel/PDF export
- Custom date range reports

### 8. **Settings**
- Company information
- Working hours configuration
- Leave policies
- Salary rules
- Email/SMS notifications
- User roles and permissions
- System preferences

## 🏗️ Technical Architecture

### Frontend (Current Implementation)
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables
- **Vanilla JavaScript** - No framework dependencies
- **LocalStorage** - Client-side data persistence (demo)

### Backend (To Be Implemented)
```
Recommended Stack:
├── Node.js + Express.js (API Server)
├── MongoDB / PostgreSQL (Database)
├── Redis (Caching)
├── Socket.io (Real-time updates)
└── ZKTeco SDK Integration
```

### ZKTeco Integration Flow
```
1. Device Configuration
   └─> Set server IP: 192.168.1.100:4370

2. Device Connection
   └─> Device sends connection request
   └─> Server stores device info
   └─> Device appears in "Pending Devices"

3. Device Enrollment
   └─> Admin reviews device
   └─> Admin adds device to system
   └─> Device starts sending attendance data

4. Data Sync
   └─> Real-time: Device pushes logs automatically
   └─> Manual: Admin triggers sync
   └─> Scheduled: Every 15 minutes
```

## 📱 Device Integration Details

### How to Add Devices (Step-by-Step)

#### Method 1: Manual IP Addition
1. Go to **Devices** page
2. Click **"Add Device"**
3. Enter:
   - Device Type (ZKTeco F18, etc.)
   - IP Address (e.g., 192.168.1.201)
   - Port (default: 4370)
   - Device Name & Location
4. Test connection
5. Save device

#### Method 2: Automatic Discovery (Backend Feature)
1. Configure server IP on device:
   - Device Settings > Network > Server IP
   - Enter: `192.168.1.100:4370`
2. Device automatically connects
3. Appears in "Pending Devices"
4. Admin approves and adds

### Supported ZKTeco Protocols
- **SOAP Protocol** (Older devices)
- **SDK Protocol** (Modern devices)
- **Push Protocol** (Real-time sync)
- **Pull Protocol** (Scheduled sync)

## 🔐 Security Features (To Implement)

- **Authentication**: JWT-based login
- **Authorization**: Role-based access control (Admin, Manager, HR, Employee)
- **Data Encryption**: AES-256 for sensitive data
- **API Security**: Rate limiting, CORS, input validation
- **Audit Logs**: Track all system changes

## 📊 Database Schema (Recommended)

```sql
-- Users/Employees
CREATE TABLE employees (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    department VARCHAR(50),
    position VARCHAR(50),
    salary DECIMAL(10,2),
    join_date DATE,
    status ENUM('active', 'inactive'),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Attendance
CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(20),
    date DATE,
    check_in TIME,
    check_out TIME,
    status ENUM('present', 'late', 'absent', 'leave'),
    device_id VARCHAR(20),
    created_at TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Devices
CREATE TABLE devices (
    id VARCHAR(20) PRIMARY KEY,
    type VARCHAR(50),
    name VARCHAR(100),
    location VARCHAR(100),
    ip_address VARCHAR(15),
    port INT,
    serial_number VARCHAR(50),
    status ENUM('online', 'offline', 'maintenance'),
    last_sync TIMESTAMP,
    created_at TIMESTAMP
);

-- Leaves
CREATE TABLE leaves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(20),
    type VARCHAR(50),
    start_date DATE,
    end_date DATE,
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected'),
    applied_date TIMESTAMP,
    approved_by VARCHAR(20),
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);
```

## 🚀 Deployment Guide

### Option 1: Simple Deployment
1. Upload to web server (Apache/Nginx)
2. No backend needed for demo
3. Uses localStorage for data

### Option 2: Full Production

```bash
# Backend Setup
git clone <your-repo>
cd attendx-backend
npm install
cp .env.example .env
# Configure database and ZKTeco SDK
npm run migrate
npm start

# Frontend Setup
cd ../attendx-frontend
npm install
npm run build
# Deploy dist/ folder to CDN/Server
```

## 🔧 Configuration

### Backend Environment Variables
```env
# Server
PORT=4370
NODE_ENV=production

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=attendx
DB_USER=admin
DB_PASS=secure_password

# ZKTeco
ZKTECO_PORT=4370
ZKTECO_TIMEOUT=30000

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRE=24h

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_password
```

## 📱 Mobile App Integration

### Future Features
- Employee mobile app for:
  - Check-in/out via GPS
  - View attendance history
  - Apply for leaves
  - View salary slips
- React Native or Flutter recommended

## 🎨 Customization

### Branding
1. Edit `styles.css` CSS variables:
```css
:root {
    --primary: #0A0E27;     /* Change main color */
    --accent: #00D9FF;      /* Change accent color */
    --success: #00FF94;     /* Change success color */
}
```

2. Replace logo in sidebar
3. Update company name in Settings

## 📈 Roadmap

### Phase 1: Core Features ✅
- [x] Dashboard
- [x] Employee Management
- [x] Attendance Tracking
- [x] Device Management
- [x] Leave Management
- [x] Payroll Basics

### Phase 2: Backend Development
- [ ] Node.js API server
- [ ] Database integration
- [ ] ZKTeco SDK integration
- [ ] Real-time sync
- [ ] Authentication system

### Phase 3: Advanced Features
- [ ] Mobile app
- [ ] Shift management
- [ ] Overtime calculation
- [ ] Geofencing
- [ ] Face recognition
- [ ] Analytics dashboard

### Phase 4: Enterprise Features
- [ ] Multi-company support
- [ ] Advanced reporting
- [ ] API for third-party integration
- [ ] SSO integration
- [ ] Compliance reports

## 🐛 Known Limitations (Demo Version)

1. **Data Persistence**: Uses localStorage (resets on clear)
2. **No Real Device Connection**: Simulated device communication
3. **No Authentication**: No login required
4. **Single User**: No multi-user support
5. **No Backend**: All client-side processing

## 💡 Next Steps

### For Development:
1. **Set up backend** with Node.js/Express
2. **Integrate ZKTeco SDK** for real device communication
3. **Implement database** (PostgreSQL recommended)
4. **Add authentication** with JWT
5. **Deploy to production** server

### For Testing:
1. Add demo employees
2. Add devices with various IP addresses
3. Test all CRUD operations
4. Review reports and statistics
5. Test mobile responsiveness

## 🤝 Support & Contribution

This is a prototype/demo. For production deployment:
- Hire a full-stack developer
- Purchase ZKTeco SDK license
- Set up proper server infrastructure
- Implement security best practices

## 📄 License

This prototype is for demonstration purposes. 

## 🔗 Resources

- **ZKTeco Documentation**: https://www.zkteco.com
- **ZKTeco SDK**: Contact ZKTeco for SDK access
- **Node.js**: https://nodejs.org
- **PostgreSQL**: https://www.postgresql.org

---

**Built with ❤️ by Claude & You**

For questions or customization needs, consult with a professional developer.
