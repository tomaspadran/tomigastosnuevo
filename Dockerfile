# Use Node 20 as base
FROM node:20-slim as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for building)
RUN npm install

# Copy source code
COPY . .

# Build the frontend (creates /dist)
RUN npm run build

# Production image
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the built dist folder from builder
COPY --from=builder /app/dist ./dist

# Copy the server code
COPY --from=builder /app/server ./server

# Expose the port (we'll use 80 for Easypanel but the code handles process.env.PORT)
ENV PORT=80
EXPOSE 80

# Start the server
CMD ["npm", "start"]
