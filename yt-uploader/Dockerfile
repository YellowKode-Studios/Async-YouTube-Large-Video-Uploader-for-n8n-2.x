FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json .

# Install dependencies
RUN npm install --production

# Copy application
COPY server.js .

# Expose port
EXPOSE 3000

# Start service
CMD ["node", "server.js"]
