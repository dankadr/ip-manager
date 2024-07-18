# Use an official Node runtime as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /ip-manager

# Copy package.json and package-lock.json for both client and backend
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies for both client and backend
RUN npm install
RUN cd client && npm install
RUN cd server && npm install

# Copy the rest of the application code
COPY . .

# Build the React client
RUN cd client && npm run build

# Move the built client to a directory the backend can serve
RUN mkdir -p server/public && mv client/build/* server/public/

# # Expose the port the app runs on
# EXPOSE $PORT

# Set working directory to server folder
WORKDIR /ip-manager/server

# Start the application
CMD ["sh", "-c", "node server.js"]