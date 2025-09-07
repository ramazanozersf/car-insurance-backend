# Car Insurance Backend System

A comprehensive, production-ready car insurance backend system built with NestJS, featuring microservices architecture, JWT authentication, and complete insurance lifecycle management.

## 🚀 Features

### Core Services
- **Authentication & Authorization** - JWT-based auth with refresh tokens and RBAC
- **User Management** - Customer, agent, and admin user management
- **Vehicle Management** - VIN validation and vehicle tracking
- **Quote Engine** - Dynamic premium calculation with risk assessment
- **Policy Management** - Complete policy lifecycle management
- **Claims Processing** - End-to-end claims workflow
- **Payment Processing** - Stripe integration with recurring payments
- **Communication** - Email/SMS notifications
- **Document Management** - PDF generation and storage
- **Reporting & Analytics** - Business intelligence dashboards

### Technical Features
- **Microservices Architecture** - Modular, scalable design
- **PostgreSQL Database** - Robust relational data storage
- **Redis Caching** - High-performance caching and queues
- **Swagger Documentation** - Complete API documentation
- **Docker Support** - Containerized deployment
- **Comprehensive Testing** - Unit and integration tests
- **Security** - Helmet, CORS, rate limiting, input validation
- **Monitoring** - Health checks and logging

## 🛠️ Technology Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Cache/Queue**: Redis with Bull
- **Authentication**: JWT with Passport
- **Validation**: Class-validator & Joi
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Containerization**: Docker & Docker Compose
- **Payment**: Stripe
- **Email**: Nodemailer

## 📋 Prerequisites

- Node.js 18+ 
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

## 🚀 Quick Start

### 1. Clone and Setup
```bash
git clone <repository-url>
cd car-insurance-backend
npm install
```

### 2. Environment Configuration
```bash
cp env.example .env
# Edit .env with your configuration
```

### 3. Start with Docker (Recommended)
```bash
# Start all services (app, database, redis)
npm run docker:up

# Start with pgAdmin for development
npm run docker:dev

# View logs
npm run docker:logs
```

### 4. Manual Setup (Alternative)
```bash
# Start PostgreSQL and Redis manually
# Update .env with your database credentials

# Install dependencies
npm install

# Start in development mode
npm run start:dev
```

## 📚 API Documentation

Once the application is running, access the Swagger documentation at:
- **Swagger UI**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/health

## 🔐 Authentication

The API uses JWT Bearer tokens for authentication:

1. **Register**: `POST /api/v1/auth/register`
2. **Login**: `POST /api/v1/auth/login`
3. **Refresh Token**: `POST /api/v1/auth/refresh`

Include the token in requests:
```
Authorization: Bearer <your-jwt-token>
```

## 🏗️ Project Structure

```
src/
├── config/              # Configuration files
├── common/              # Shared utilities
│   ├── decorators/      # Custom decorators
│   ├── filters/         # Exception filters
│   ├── guards/          # Auth & role guards
│   ├── interceptors/    # Request/response interceptors
│   └── pipes/           # Validation pipes
├── modules/             # Feature modules
│   ├── auth/            # Authentication
│   ├── users/           # User management
│   ├── vehicles/        # Vehicle management
│   ├── quotes/          # Quote engine
│   ├── policies/        # Policy management
│   ├── claims/          # Claims processing
│   ├── payments/        # Payment processing
│   ├── communications/  # Notifications
│   ├── documents/       # Document management
│   ├── reporting/       # Analytics
│   └── integrations/    # External APIs
└── shared/              # Shared entities & types
    ├── entities/        # Database entities
    ├── enums/           # Type enums
    ├── interfaces/      # TypeScript interfaces
    └── types/           # Custom types
```

## 🔧 Development

### Available Scripts
```bash
# Development
npm run start:dev        # Start with hot reload
npm run start:debug      # Start with debugger

# Building
npm run build           # Build for production
npm run start:prod      # Start production build

# Testing
npm run test            # Run unit tests
npm run test:watch      # Run tests in watch mode
npm run test:cov        # Run with coverage
npm run test:e2e        # Run e2e tests

# Code Quality
npm run lint            # Lint and fix code
npm run format          # Format code with Prettier

# Database
npm run migration:generate  # Generate migration
npm run migration:run      # Run migrations
npm run migration:revert   # Revert migration

# Docker
npm run docker:build    # Build Docker image
npm run docker:up       # Start containers
npm run docker:down     # Stop containers
npm run docker:logs     # View app logs
```

### Environment Variables

Key environment variables (see `env.example`):

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=car_insurance_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# External Services
STRIPE_SECRET_KEY=sk_test_...
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## 🧪 Testing

The project includes comprehensive testing:

```bash
# Run all tests
npm test

# Run with coverage
npm run test:cov

# Run specific test file
npm test -- auth.service.spec.ts

# Run e2e tests
npm run test:e2e
```

## 🐳 Docker Deployment

### Development
```bash
# Start all services with pgAdmin
npm run docker:dev
```

### Production
```bash
# Build and start
npm run docker:build
npm run docker:up
```

### Services
- **App**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **pgAdmin**: http://localhost:5050 (dev profile only)

## 📊 Database Schema

The system includes comprehensive entities:

- **Users** - Customer, agent, admin management
- **Vehicles** - Vehicle information and tracking
- **Quotes** - Insurance quotes with calculations
- **Policies** - Active insurance policies
- **Claims** - Insurance claims processing
- **Payments** - Payment transactions
- **Documents** - File management
- **Audit Logs** - System activity tracking

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Role-Based Access Control** (RBAC)
- **Input Validation** with class-validator
- **Rate Limiting** to prevent abuse
- **Helmet** for security headers
- **CORS** configuration
- **Password Hashing** with bcrypt
- **SQL Injection** prevention with TypeORM

## 📈 Monitoring & Health Checks

- **Health Endpoint**: `/health`
- **Application Metrics**: Uptime, environment, status
- **Docker Health Checks**: Automatic container monitoring
- **Logging**: Comprehensive request/response logging

## 🚀 Production Deployment

1. **Environment Setup**
   ```bash
   # Set production environment variables
   export NODE_ENV=production
   export DATABASE_URL=postgresql://...
   export REDIS_URL=redis://...
   ```

2. **Build and Deploy**
   ```bash
   npm run build
   npm run start:prod
   ```

3. **Database Migration**
   ```bash
   npm run migration:run
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📝 API Examples

### Authentication
```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","firstName":"John","lastName":"Doe"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Protected Endpoints
```bash
# Get user profile (requires auth)
curl -X GET http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer <your-jwt-token>"
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check database credentials in `.env`

2. **Redis Connection Error**
   - Ensure Redis is running
   - Check Redis configuration

3. **Port Already in Use**
   - Change PORT in `.env`
   - Or stop the conflicting service

### Logs
```bash
# View application logs
npm run docker:logs

# View specific service logs
docker-compose logs postgres
docker-compose logs redis
```

## 📄 License

This project is licensed under the MIT License.

## 🙋‍♂️ Support

For questions and support:
- Create an issue in the repository
- Check the API documentation at `/api/docs`
- Review the test files for usage examples