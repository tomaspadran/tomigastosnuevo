# Use Node 20 as base
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for building)
RUN npm install

# Copy source code
COPY . .

# Build args for Vite (VITE_ vars must be available at build time)
ARG VITE_SUPABASE_URL=https://rniryefautkxwtjwduip.supabase.co
ARG VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuaXJ5ZWZhdXRreHd0andkdWlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTM5MTcsImV4cCI6MjA5Mjc4OTkxN30.ay9i-J_TFOHB8ZBqrOaSgsA9S0DAO89OYDKuQOHOHHM
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

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

# Copy .env for server runtime (if present)
COPY --from=builder /app/.env* ./

# Runtime env vars for server
ENV VITE_SUPABASE_URL=https://rniryefautkxwtjwduip.supabase.co
ENV VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuaXJ5ZWZhdXRreHd0andkdWlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTM5MTcsImV4cCI6MjA5Mjc4OTkxN30.ay9i-J_TFOHB8ZBqrOaSgsA9S0DAO89OYDKuQOHOHHM

# Expose the port
ENV PORT=80
EXPOSE 80

# Start the server
CMD ["npm", "start"]
