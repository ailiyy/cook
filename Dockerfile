# ---- Stage 1: Build frontend ----
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---- Stage 2: Build backend ----
FROM golang:1.25-alpine3.22 AS backend-build
RUN apk add --no-cache gcc musl-dev
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
COPY --from=frontend-build /app/frontend/dist ./frontend/dist
ENV CGO_ENABLED=0
RUN go build -o server ./cmd/server
RUN go build -o seed ./cmd/seed

# ---- Stage 3: Runtime ----
FROM alpine:3.22
RUN apk add --no-cache ca-certificates tzdata
WORKDIR /app
COPY --from=backend-build /app/server .
COPY --from=backend-build /app/seed .
COPY --from=backend-build /app/frontend/dist ./frontend/dist

ENV PORT=8080
ENV DATABASE_PATH=/data/cook.db
EXPOSE 8080

VOLUME ["/data"]
CMD ["./server"]
