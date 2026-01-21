# Step 1: Base image
FROM node:18-alpine

# Step 2: Set working directory
WORKDIR /app

# Step 3: Copy dependency files first (layer caching)
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install --only=production

# Step 5: Copy application code
COPY . .

# Step 6: Expose application port
EXPOSE 3000

# Step 7: Start the app
CMD ["node", "server.js"]
