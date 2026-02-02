# 📚 Documentation Index

Welcome to the Image Scanner Full Stack project! Here's a guide to all available documentation.

## 🎯 Start Here

### First Time Setup

👉 **[GETTING_STARTED.md](GETTING_STARTED.md)** - Start here! Quick overview and 4-step setup guide

### Comprehensive Setup Guide

📖 **[SETUP.md](SETUP.md)** - Detailed setup with troubleshooting, architecture, and all options

### Quick Reference

⚡ **[BACKEND_SETUP_SUMMARY.md](BACKEND_SETUP_SUMMARY.md)** - 1-page quick reference for backend

---

## 📖 Documentation by Topic

### Backend Development

| Document                                                     | Purpose                                  |
| ------------------------------------------------------------ | ---------------------------------------- |
| [backend/README.md](backend/README.md)                       | Backend-specific setup and configuration |
| [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md) | Complete API endpoint reference          |
| [backend/package.json](backend/package.json)                 | Dependencies and scripts                 |

### Frontend Development

| Document                                                     | Purpose            |
| ------------------------------------------------------------ | ------------------ |
| [README.md](README.md)                                       | Project overview   |
| [src/components/SidePanel.tsx](src/components/SidePanel.tsx) | Main UI component  |
| [src/api/imageAPI.ts](src/api/imageAPI.ts)                   | Backend API client |

### Configuration

| File                                                         | Purpose               |
| ------------------------------------------------------------ | --------------------- |
| [backend/.env.example](backend/.env.example)                 | Environment template  |
| [backend/docker-compose.yml](backend/docker-compose.yml)     | MySQL container setup |
| [backend/prisma/schema.prisma](backend/prisma/schema.prisma) | Database schema       |

### Quick Scripts

| File                                         | Purpose                     |
| -------------------------------------------- | --------------------------- |
| [quickstart.bat](quickstart.bat)             | One-click setup for Windows |
| [package.json](package.json)                 | Frontend scripts            |
| [backend/package.json](backend/package.json) | Backend scripts             |

---

## 🚀 Common Tasks

### I want to...

**...setup the project from scratch**
→ Read [GETTING_STARTED.md](GETTING_STARTED.md)

**...understand how it all works**
→ Read [SETUP.md](SETUP.md) - Architecture Overview section

**...use the REST API**
→ Read [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)

**...configure WordPress**
→ See SETUP.md → Step 5: WordPress Integration Setup

**...troubleshoot an issue**
→ See [SETUP.md](SETUP.md) → Troubleshooting section

**...run just the backend**
→ See [backend/README.md](backend/README.md)

**...modify the extension**
→ See [src/components/SidePanel.tsx](src/components/SidePanel.tsx)

**...understand the database**
→ See [backend/prisma/schema.prisma](backend/prisma/schema.prisma)

---

## 📋 File Structure

```
c:\pv\
├── 📖 Documentation
│   ├── GETTING_STARTED.md ..................... ⭐ START HERE
│   ├── SETUP.md .............................. Complete guide
│   ├── BACKEND_SETUP_SUMMARY.md .............. Quick ref
│   ├── README.md ............................ Project overview
│   └── 📄 This file
│
├── 🔧 Backend (NestJS)
│   └── backend/
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── prisma/ ...................... Database layer
│       │   └── images/ ...................... Image module
│       ├── prisma/schema.prisma ............ Database schema
│       ├── README.md
│       ├── API_DOCUMENTATION.md ............ API reference
│       ├── package.json
│       ├── docker-compose.yml ............ MySQL setup
│       ├── .env.example
│       └── .gitignore
│
├── 🎨 Frontend (Chrome Extension)
│   ├── src/
│   │   ├── components/SidePanel.tsx ....... Main UI
│   │   ├── api/imageAPI.ts .............. API client
│   │   ├── content.ts ................... Image scanner
│   │   ├── background.ts ............... Service worker
│   │   └── manifest.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── public/
│
├── 📦 Built Extension
│   └── dist/ .............................. Ready for Chrome
│
└── ⚡ Scripts
    ├── quickstart.bat ..................... Quick setup
    └── Other config files
```

---

## 🔄 Quick Command Reference

### Initial Setup

```bash
# Option 1: Windows quick start
cd c:\pv
quickstart.bat

# Option 2: Manual setup
cd backend
docker-compose up -d          # Start MySQL
npm install                   # Install deps
npx prisma migrate dev        # Setup database
npm run start:dev             # Start backend
cd ..
npm run build                 # Build frontend
```

### Daily Development

```bash
# Start backend (in backend/ folder)
npm run start:dev             # Dev server with hot reload

# Build extension
npm run build                 # When you make changes

# Access services
Backend: http://localhost:3001
API Docs: http://localhost:3001/api/...
```

### Database Management

```bash
cd backend
npx prisma studio            # GUI database browser
npx prisma migrate dev        # Create migration
npx prisma db push            # Sync schema
```

---

## 📊 Architecture Overview

```
┌──────────────────────────┐
│   Chrome Extension       │
│   (React + TypeScript)   │
│   - Image scanning       │
│   - UI with Ant Design   │
│   - Upload controls      │
└────────────┬─────────────┘
             │ HTTP
             ▼
┌──────────────────────────┐
│   NestJS Backend         │
│   (Port 3001)            │
│   - REST API             │
│   - Image processing     │
│   - WordPress integration│
└────────┬────────┬────────┘
         │        │
         ▼        ▼
    ┌────────┐  ┌──────────┐
    │ MySQL  │  │ /uploads │
    │ Database│ │ folder   │
    └────────┘  └──────────┘
```

---

## 🎯 Key Features

✅ **Image Scanning** - Automatically detect all images on any webpage
✅ **Batch Upload** - Upload multiple images at once
✅ **Backend Storage** - Save images to MySQL + local disk
✅ **WordPress Integration** - Push to WordPress Media Library
✅ **Status Tracking** - pending → uploaded → published
✅ **REST API** - Full-featured HTTP API
✅ **CORS Enabled** - Works with Chrome extension
✅ **Docker Support** - Easy database setup

---

## 🆘 Need Help?

1. **First time?** → Read [GETTING_STARTED.md](GETTING_STARTED.md)
2. **Setup issues?** → Check [SETUP.md](SETUP.md) Troubleshooting
3. **API questions?** → See [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)
4. **Backend help?** → Read [backend/README.md](backend/README.md)
5. **Still stuck?** → Review troubleshooting in SETUP.md

---

## 📝 Document Guide

### GETTING_STARTED.md

- Quick overview
- 4-step setup
- What's included
- Feature summary

### SETUP.md

- Full setup instructions
- Architecture details
- All configuration options
- Extensive troubleshooting
- Next steps ideas

### BACKEND_SETUP_SUMMARY.md

- 1-page quick reference
- File structure
- Setup checklist
- API summary

### backend/README.md

- Backend-specific docs
- Database schema
- API endpoints
- Configuration

### backend/API_DOCUMENTATION.md

- Complete API reference
- Request/response examples
- Error handling
- Testing with cURL

---

## ✨ Next Steps

1. **Read** [GETTING_STARTED.md](GETTING_STARTED.md)
2. **Follow** the 4-step setup
3. **Load** extension in Chrome
4. **Test** by scanning a webpage
5. **Upload** images to backend and WordPress
6. **Explore** the API with provided examples

---

## 📞 Command Cheat Sheet

```bash
# Backend setup
cd backend && npm install
docker-compose up -d
npx prisma migrate dev

# Start development
npm run start:dev              # Backend
cd .. && npm run build        # Frontend

# Rebuild extension after changes
npm run build

# Database GUI
npx prisma studio

# Test API
curl http://localhost:3001/health
```

---

**Happy coding!** 🚀

For the most comprehensive guide, start with [GETTING_STARTED.md](GETTING_STARTED.md)
