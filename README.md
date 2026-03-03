# Planca - Appointment Booking & Management Platform

A full-stack, multi-tenant SaaS platform for appointment scheduling and business management. Built for service-based businesses such as clinics, salons, and spas.

## Features

- **Multi-Tenant Architecture** - Isolated data per business with subdomain-based tenant resolution
- **Appointment Management** - Full lifecycle: create, confirm, cancel, reschedule with calendar view
- **Guest Booking** - Public booking page allowing customers to book without registration
- **Employee Management** - Working hours configuration, service assignments, and availability tracking
- **Customer Management** - Customer profiles with appointment history
- **Service Catalog** - Configurable services with pricing, duration, and color coding
- **WhatsApp Notifications** - Automated appointment confirmations, reminders (24h), and cancellation alerts via Twilio
- **Background Jobs** - Recurring reminder scheduling with Hangfire
- **Caching** - Multi-level caching strategy with Redis and in-memory cache
- **Role-Based Access Control** - Admin, Employee, and Customer roles with JWT authentication

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| .NET 10 / C# | Web API framework |
| Entity Framework Core | ORM with PostgreSQL |
| MediatR | CQRS & in-process messaging |
| FluentValidation | Request validation |
| Hangfire | Background job scheduling |
| Twilio SDK | WhatsApp notifications |
| Serilog | Structured logging |
| ASP.NET Identity | Authentication & authorization |

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| TypeScript | Type safety |
| Redux Toolkit (RTK Query) | State management & data fetching |
| TailwindCSS 4 | Styling |
| React Big Calendar | Appointment calendar view |
| Formik + Yup | Form handling & validation |
| Vite | Build tool |

### Infrastructure
| Technology | Purpose |
|---|---|
| PostgreSQL 15 | Primary database |
| Redis | Distributed caching |
| Docker & Docker Compose | Containerization |
| Azure Container Apps | Cloud deployment |
| GitHub Actions | CI/CD pipeline |

## Architecture

The project follows **Clean Architecture** with **CQRS** pattern:

```
Planca/
├── Planca.API/                  # Presentation Layer
│   ├── Controllers/             # REST API endpoints
│   ├── Middleware/               # Exception handling, tenant resolution
│   └── Dockerfile
├── Planca.Application/          # Application Layer
│   ├── Features/                # CQRS commands & queries
│   │   ├── Appointments/
│   │   ├── Employees/
│   │   ├── Customers/
│   │   ├── Services/
│   │   └── Auth/
│   ├── Common/
│   │   ├── Behaviors/           # MediatR pipeline (caching, validation, logging)
│   │   ├── Interfaces/          # Abstractions
│   │   └── Models/
│   └── DTOs/
├── Planca.Domain/               # Domain Layer
│   ├── Entities/                # Business models
│   └── Events/                  # Domain events
├── Planca.Infrastructure/       # Infrastructure Layer
│   ├── Persistence/             # EF Core DbContext, repositories
│   ├── Services/                # External service implementations
│   ├── BackgroundJobs/          # Hangfire job definitions
│   └── Configuration/
└── planca-client/               # React Frontend
    └── src/
        ├── features/            # Feature-based modules
        │   ├── appointments/
        │   ├── customers/
        │   ├── employees/
        │   ├── services/
        │   ├── dashboard/
        │   └── booking/         # Public guest booking
        ├── shared/              # Shared utilities & base API
        └── context/             # Auth & theme providers
```

### Key Design Patterns
- **CQRS** - Separate command/query handlers via MediatR
- **Repository + Unit of Work** - Abstracted data access layer
- **Domain Events** - Decoupled event handling (appointment created/confirmed/canceled)
- **MediatR Pipeline Behaviors** - Cross-cutting concerns (caching, validation, logging, performance monitoring)
- **Multi-Tenancy** - Connection-string-based tenant isolation with automatic resolution

## Getting Started

### Prerequisites
- .NET 10 SDK
- Node.js 18+
- PostgreSQL 15+
- Redis (optional, for distributed caching)

### Quick Start with Docker

```bash
docker-compose up --build -d
```

This starts the API, PostgreSQL, and Redis. The API will be available at `http://localhost:8080`.

### Manual Setup

**1. Database**
```sql
CREATE DATABASE planca;
```

**2. Backend**
```bash
cd Planca.API
dotnet restore
dotnet run
```
The API runs at `https://localhost:7100`. Migrations are applied automatically on startup.

**3. Frontend**
```bash
cd planca-client
cp .env.example .env.development
npm install
npm run dev
```
The client runs at `http://localhost:5173`.

## API Endpoints

| Endpoint | Description |
|---|---|
| `POST /api/Auth/login` | User authentication |
| `GET /api/Appointments` | List appointments (paginated) |
| `POST /api/Appointments` | Create appointment |
| `PUT /api/Appointments/{id}/confirm` | Confirm appointment |
| `PUT /api/Appointments/{id}/cancel` | Cancel appointment |
| `GET /api/Employees` | List employees |
| `GET /api/Services` | List services |
| `GET /api/Customers` | List customers |
| `POST /api/PublicBooking/appointment` | Guest booking |
| `GET /api/Settings` | Tenant settings |
| `GET /health` | Health check |

## License

This project is for portfolio/demonstration purposes.
