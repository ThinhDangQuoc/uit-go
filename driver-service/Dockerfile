# Base image
FROM node:20-alpine

# Working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src ./src

# Expose port
EXPOSE 8082

# Run app
CMD ["npm", "start"]
