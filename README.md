# 🏢 Planör Portal

**Planör** is a secure, full-stack property asset management portal built on modern web technologies and hosted entirely on **Azure Cloud**. It enables stakeholders to manage **Properties**, **Buildings**, **Maintenance Plans**, **SmartPDFs**, **360° Views**, and document workflows in one centralized platform.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Azure account (for production deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd planor-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start the development servers**
   ```bash
   # Start both frontend and backend
   npm run dev:full
   
   # Or start them separately:
   npm run dev          # Frontend (Next.js) - http://localhost:3000
   npm run server:dev   # Backend (Express) - http://localhost:3001
   ```

## 📁 Project Structure

```
planor-portal/
├── src/                    # Frontend (Next.js)
│   ├── app/               # App Router pages
│   ├── components/        # React components
│   ├── lib/              # Utility functions
│   └── types/            # TypeScript types
├── server/               # Backend (Express)
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Express middleware
│   │   ├── services/     # Business logic
│   │   └── types/        # TypeScript types
│   ├── index.ts          # Server entry point
│   └── tsconfig.json     # TypeScript config
├── public/               # Static assets
├── env.example           # Environment variables template
└── package.json          # Dependencies and scripts
```

## 🔧 Available Scripts

### Frontend (Next.js)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Backend (Express)
- `npm run server:dev` - Start development server with nodemon
- `npm run server:build` - Build TypeScript to JavaScript
- `npm run server:start` - Start production server

### Combined
- `npm run dev:full` - Start both frontend and backend in development

## 🏗️ Architecture

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Azure AD** authentication (pending)

### Backend
- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **Azure Cosmos DB** for database
- **Azure Blob Storage** for file storage
- **Azure AD** for authentication

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

#### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (Admin)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin)

#### Properties
- `GET /api/properties` - Get all properties
- `GET /api/properties/:id` - Get property by ID
- `POST /api/properties` - Create property (Admin)
- `PUT /api/properties/:id` - Update property (Admin)
- `DELETE /api/properties/:id` - Delete property (Admin)

#### Buildings
- `GET /api/buildings` - Get all buildings
- `GET /api/buildings/:id` - Get building by ID
- `GET /api/buildings/property/:propertyId` - Get buildings by property
- `POST /api/buildings` - Create building (Admin)
- `PUT /api/buildings/:id` - Update building (Admin)
- `DELETE /api/buildings/:id` - Delete building (Admin)

#### Files
- `GET /api/files/building/:buildingId` - Get files by building
- `POST /api/files/upload` - Upload file (Admin)
- `GET /api/files/:id` - Get file by ID
- `DELETE /api/files/:id` - Delete file (Admin)
- `POST /api/files/process/:buildingId` - Process files (Admin)

#### Maintenance
- `GET /api/maintenance` - Get all maintenance plans
- `GET /api/maintenance/:id` - Get maintenance plan by ID
- `GET /api/maintenance/building/:buildingId` - Get plans by building
- `POST /api/maintenance/generate/:buildingId` - Generate plan (Admin)
- `GET /api/maintenance/:id/export` - Export maintenance plan
- `PUT /api/maintenance/:id/approve` - Approve plan (Admin)

## 🔐 Authentication & Authorization

### User Roles
- **Admin**: Full system access, can manage users, properties, buildings, and files
- **Standard User**: Read-only access to assigned client's data
- **Client**: No direct portal access (future enhancement)

### Azure AD Integration
Azure Active Directory integration is planned for:
- Single sign-on (SSO)
- Role-based access control
- User management
- Security compliance

## 🗄️ Database Schema

The application uses Azure Cosmos DB with the following collections:
- **Users**: User accounts and authentication data
- **Clients**: Client organizations
- **Properties**: Property assets
- **Buildings**: Building structures within properties
- **Files**: Uploaded files and documents
- **BuildingElements**: Building component data
- **MaintenancePlans**: Generated maintenance plans
- **MaintenanceRecords**: Maintenance history
- **PriceLists**: Global pricing data

## 📦 Key Features

- 🔐 **Azure AD Authentication** with role-based access control
- 🏘 **Properties & Buildings Management** with metadata and documents
- ⬆️ **Admin File Uploads** (6 CSVs + 1 IFC4 per Building)
- 📊 **Automated Maintenance Plans** with cost breakdowns
- 🖼️ **SmartPDF Viewer** with clickable floor plan hotspots
- 🌀 **360° Visualization** and interactive 3D Building models
- 📁 **Centralized file repository** using Azure Blob Storage
- 💰 **Global Price List Management** with maintenance intervals

## 🚀 Deployment

### Development
```bash
npm run dev:full
```

### Production
1. Build the application:
   ```bash
   npm run build
   npm run server:build
   ```

2. Deploy to Azure App Service:
   - Frontend: Deploy Next.js build to App Service
   - Backend: Deploy Express server to App Service
   - Database: Set up Azure Cosmos DB
   - Storage: Configure Azure Blob Storage

## 🔧 Development

### Adding New Features
1. Create feature branch from `main`
2. Implement frontend components in `src/components/`
3. Implement backend routes in `server/src/routes/`
4. Add TypeScript types in respective `types/` folders
5. Test thoroughly
6. Submit pull request

### Code Style
- Use TypeScript for all new code
- Follow ESLint configuration
- Use Tailwind CSS for styling
- Write meaningful commit messages

## 📚 Documentation

- [Project Overview](../Readme.md) - Business and technical overview
- [Database Schema](../Database/CosmosDB_Schema_Design.md) - Database design details
- [Jira Tickets](../JIRA_TICKETS.md) - Development tasks and planning

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions:
- Check the documentation
- Review existing issues
- Contact the development team

---

**Planör Portal** - Secure property asset management for the modern world.
