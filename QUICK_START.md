# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 18+
- PostgreSQL (or Docker for easy setup)
- Redis (or Docker for easy setup)

### Option 1: Docker Setup (Easiest)

```bash
# 1. Install Docker and Docker Compose on your system

# 2. Clone and setup
cd car-insurance-backend
npm install

# 3. Start all services
docker compose up -d

# 4. Check if everything is running
docker compose ps

# 5. View logs
docker compose logs -f app
```

**Access Points:**
- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/health
- **pgAdmin**: http://localhost:5050 (admin@carinsurance.com / admin)

### Option 2: Local Development

```bash
# 1. Setup environment
cp env.example .env
# Edit .env with your database credentials

# 2. Install dependencies
npm install

# 3. Start PostgreSQL and Redis locally

# 4. Start the application
npm run start:dev
```

## 🧪 Test the API

### 1. Health Check
```bash
curl http://localhost:3000/health
```

### 2. Register a User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

### 4. Use the Token
```bash
# Copy the accessToken from login response
curl -X GET http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

## 📚 Explore the API

Visit **http://localhost:3000/api/docs** for interactive API documentation with Swagger UI.

### Pre-configured Test Users

The system comes with test users (if using Docker):

1. **Admin User**
   - Email: `admin@carinsurance.com`
   - Password: `Admin123!`
   - Role: `admin`

2. **Agent User**
   - Email: `agent@carinsurance.com`
   - Password: `Agent123!`
   - Role: `agent`

3. **Customer User**
   - Email: `customer@carinsurance.com`
   - Password: `Customer123!`
   - Role: `customer`

## 🛠️ Development Commands

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

# Code Quality
npm run lint            # Lint and fix code
npm run format          # Format code

# Docker
npm run docker:up       # Start containers
npm run docker:down     # Stop containers
npm run docker:logs     # View app logs
```

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Change PORT in .env file or stop conflicting service
lsof -ti:3000 | xargs kill -9
```

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker compose ps
# Or check local PostgreSQL
pg_isready -h localhost -p 5432
```

### Redis Connection Issues
```bash
# Check if Redis is running
docker compose ps
# Or test local Redis
redis-cli ping
```

### View Application Logs
```bash
# Docker logs
docker compose logs -f app

# Local development
# Logs appear in terminal where you ran npm run start:dev
```

## 🎯 What's Next?

1. **Explore the API** with Swagger UI
2. **Test Authentication** with different user roles
3. **Check the Database** with pgAdmin (Docker setup)
4. **Review the Code** structure in your IDE
5. **Start Building** additional services (see PROJECT_SUMMARY.md)

## 📞 Need Help?

- Check the **README.md** for detailed documentation
- Review **PROJECT_SUMMARY.md** for architecture overview
- Examine the **test files** for usage examples
- Use **Swagger UI** for API exploration

---

**You're ready to build a comprehensive car insurance system! 🚗💼**
