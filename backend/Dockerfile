FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
#ci means clean installation so install from package-lock 
#--only=production is for installing of dependencies not dev dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose the port
EXPOSE 5000

# Start the application
CMD ["node", "server.js"]
