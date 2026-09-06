# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/web
COPY web/package*.json ./
RUN npm ci || npm install
COPY web/ ./
RUN npm run build

# Stage 2: Build Go Backend
FROM golang:1.26-alpine AS backend-builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
# Timpa folder web/dist kosong dengan hasil kompilasi dari stage 1
COPY --from=frontend-builder /app/web/dist ./web/dist
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/nawasena ./cmd/server

# Stage 3: Minimal Runtime Image
FROM alpine:latest
WORKDIR /root/
# Salin file .env.example sebagai .env (opsional jika butuh env file)
COPY .env.example .env
COPY --from=backend-builder /app/nawasena .
RUN chmod +x ./nawasena

EXPOSE 8080
CMD ["./nawasena"]
