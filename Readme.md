# IP Manager Application

## Overview

This application is a full-stack solution for managing static IP addresses. It consists of a React frontend and a Node.js/Express backend, with SQLite as the database.

## Architecture

- Frontend: React
- Backend: Node.js with Express
- Database: SQLite
- Authentication: JWT (JSON Web Tokens)
- Containerization: Docker

## Prerequisites

- Docker
- Node.js and npm (for local development)

## Project Structure
```
ip-manager/
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── server/
│   ├── server.js
│   ├── userUtils.js
│   └── package.json
├── Dockerfile
├── package.json
└── README.md
```
## Setup and Running

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ip-manager.git
cd ip-manager
```

2. Build the Docker image:
```bash
docker build -t ip-manager .
```

3. Run the container:
```bash 
docker run -d -p 8080:8080 -e PORT=8080 -v <volume_name_or_path>:/ip-manager/server/ipmanager.db --name ip-manager ip-manager
```

This command:
- Runs the container in detached mode
- Maps port 8080 on the host to port 8080 in the container
- Sets the PORT environment variable to 8080
- Creates a volume for data persistence
- Names the container 'ip-manager-container'

4. The application should now be running at `http://localhost:8080`

## Setting up the Admin User

To set up the initial admin user:
``` bash
docker exec -it ip-manager-container server/addUser.js
```
