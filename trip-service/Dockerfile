# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src ./src

# Copy environment file if needed
COPY .env ./

# Expose port (match your app)
EXPOSE 8083

# Start app
CMD ["npm", "start"]
