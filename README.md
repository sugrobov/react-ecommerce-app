# React E-commerce App

Monorepo for an e-commerce store with a React client and Node.js/Express server.

## Project Description

This project is a fully functional e-commerce store with features such as product browsing, adding items to cart, placing orders, and user account management.

## Project Structure

```
.
├── client/          # React client-side application
├── server/          # Node.js/Express server-side application
├── package.json     # Root file with common scripts
└── README.md        # Project documentation
```

## Technologies

### Client-side (client/)
- React 19
- React Router 7
- Redux Toolkit
- TanStack Query
- Tailwind CSS
- Vite

### Server-side (server/)
- Node.js
- Express
- PostgreSQL/MySQL/SQLite
- JWT for authentication
- Bcrypt for password hashing

## Installation and Setup

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installing Dependencies

To install all dependencies at once:
```bash
npm run install:all
```

Or install separately:
```bash
# Install root dependencies
npm install

# Install client dependencies
npm run install:client

# Install server dependencies
npm run install:server
```

### Running in Development Mode

```bash
# Start client
npm run dev:client

# Start server
npm run dev:server
```

### Building the Project

```bash
# Build client-side application
npm run build:client
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/forgot-password` - Password recovery

### Products
- `GET /api/products` - Get list of products
- `GET /api/products/:id` - Get detailed product information
- `GET /api/categories` - Get product categories
- `GET /api/product-images` - Get product images
- `GET /api/product-variations` - Get product variations

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `POST /api/orders/sync` - Sync orders
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id/status` - Update order status

## Environment Variables

### Server (server/.env)
```env
# Server port
PORT=3001

# JWT secret keys
ACCESS_TOKEN_SECRET=your-secret-key
REFRESH_TOKEN_SECRET=refresh-secret-key

# Database (choose one option)
# PostgreSQL
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecommerce
DB_USER=your_user
DB_PASSWORD=your_password

# MySQL
# DB_TYPE=mysql
# DB_HOST=localhost
# DB_PORT=3306
# DB_NAME=ecommerce
# DB_USER=your_user
# DB_PASSWORD=your_password

# SQLite
# DB_TYPE=sqlite
# DB_PATH=./database.sqlite
```

### Client (client/.env)
```env
# API server URL
VITE_API_URL=http://localhost:3001

# Use mock data (true/false)
VITE_USE_MOCK_DATA=false
```

## Development

### Client Structure
```
client/
├── src/
│   ├── components/    # UI components
│   ├── containers/     # Containers with logic
│   ├── services/      # API services and data
│   ├── store/         # Redux store
│   └── routes/        # Application routes
├── public/            # Static files
└── package.json       # Client dependencies
```

### Server Structure
```
server/
├── src/
│   ├── controllers/    # Controllers
│   ├── services/      # Services
│   ├── config/        # Configurations
│   └── index.js       # Main server file
├── database/          # Migration files
└── package.json       # Server dependencies
```

## License

MIT

## Contact

For questions and support, please contact the developer.
