FROM node:20-alpine

WORKDIR /app

# Install deps first (cached layer)
COPY package.json ./
RUN npm install --production

# Copy source
COPY . .

# Expose port
EXPOSE 10000

ENV NODE_ENV=production
ENV PORT=10000

CMD ["node", "server.js"]
