# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN corepack enable && yarn install --frozen-lockfile

# Build app
COPY . .
RUN yarn build

# Serve stage
FROM nginx:1.25-alpine

# Copy custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=build /app/docs /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
