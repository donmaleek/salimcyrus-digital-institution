FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
# npm ci runs the postinstall Prisma generator, so the schema must exist first.
COPY prisma/schema.prisma ./prisma/schema.prisma
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
