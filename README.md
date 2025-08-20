# Smart Detect Learning Management System

A modern, scalable Learning Management System (LMS) designed to streamline educational content delivery, user management, and smart detection features for enhanced learning experiences.

## Project Structure

```
smart-detect-learning-management-system/
├── backend/         # Backend API and services
├── client/          # Frontend application
├── database/        # Database scripts, configs, and backups
│   ├── docker-compose.yml
│   ├── init/        # SQL initialization scripts
│   └── scripts/     # Utility scripts (e.g., restore)
└── README.md        # Project documentation
```

## Features
- User authentication and role management
- Course and content management
- Smart detection for learning analytics
- Real-time chat and collaboration tools
- Scalable architecture with Docker support

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js (for client and backend)
- PostgreSQL (if running database locally)

### Setup

1. **Clone the repository:**
	```bash
	git clone https://github.com/aung-khantkyaw/smart-detect-learning-management-system.git
	cd smart-detect-learning-management-system
	```

2. **Start the database:**
	```bash
	cd database
	docker-compose up -d
	```

3. **Initialize the database (if needed):**
	- SQL scripts are in `database/init/`
	- Use `psql` or a database GUI to run them if not auto-applied.

4. **Start the backend:**
	```bash
	cd ../backend
	# Install dependencies
	npm install
	# Start the server
	npm run dev
	```

5. **Start the client:**
	```bash
	cd ../client
	# Install dependencies
	npm install
	# Start the frontend
	npm start
	```

## Database Management
- Database configuration and backups are in the `database/` folder.
- To restore the latest backup, use:
  ```bash
  ./database/scripts/restore_latest.sh
  ```

## Contributing
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to your fork and submit a pull request

## Authors
- [Aung Khant Kyaw](https://github.com/aung-khantkyaw)
- [Aung Kaung Sett](https://github.com/Kaungsett45)

---
For more details, see the `backend/README.md`, `client/README.md`, and `database/README.md` files.
