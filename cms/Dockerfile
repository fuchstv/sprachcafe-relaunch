# Headless CMS Dockerfile (Node.js + Embedded SQLite 3)
FROM node:20-alpine

WORKDIR /app

# Install build dependencies for better-sqlite3 native compilation
RUN apk add --no-python3 make g++ sqlite

# Copy package descriptors
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy application source code
COPY . .

# Environment Defaults (Port 3000, SQLite database path in /opt/sprachcafe/cms-data)
ENV PORT=3000
ENV NODE_ENV=production
ENV DB_DIR=/opt/sprachcafe/cms-data
ENV DB_FILENAME=/opt/sprachcafe-cms-data/cms.db

# Create volume mount point for persisted SQLite database
VOLUME ["/opt/sprachcafe/cms-data"]

EXPOSE 3000

CMD ["node", "server.js"]
