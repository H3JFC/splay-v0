# Build app dist
FROM node:22-alpine AS build-app
WORKDIR /app
COPY /app .
RUN npm install
RUN npm run build

# Build Go
FROM golang:1.23-alpine AS build-go
RUN apk update && apk add --no-cache git
WORKDIR /build
COPY . .
COPY --from=build-app /app/dist /build/app/dist
RUN go mod tidy
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
  go build -o /go/bin/splaysrv \
  -ldflags="-X main.Commit=$(git rev-parse --short HEAD)" \
  ./main.go

# Deploy Stage
FROM scratch AS deploy
WORKDIR /var/srv
VOLUME /var/srv/pb_data
ARG SPLAY_ENV=production
ENV SPLAY_ENV=$SPLAY_ENV
EXPOSE 8090
COPY --from=build-go /go/bin/splaysrv /splaysrv
CMD ["/splaysrv", "serve", "--http", "0.0.0.0:8090", "--dir", "/var/srv/pb_data/"]
