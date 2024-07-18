# Use an official Node runtime as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /ip-manager

# Copy package.json and package-lock.json for both frontend and backend
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY server/package*.json ./server/

# Install dependencies for both frontend and backend
RUN npm install
RUN cd frontend && npm install
RUN cd server && npm install

# Copy the rest of the application code
COPY . .

# Build the React frontend
RUN cd frontend && npm run build

# Move the built frontend to a directory the backend can serve
RUN mkdir -p server/public && mv frontend/build/* server/public/

# # Expose the port the app runs on
# EXPOSE $PORT

# Set working directory to server folder
WORKDIR /app/server

# Start the application
CMD ["node", "server.js"]