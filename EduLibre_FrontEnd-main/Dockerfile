
FROM node:lts AS builder
WORKDIR /app
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build


FROM alpine:latest
WORKDIR /build
COPY --from=builder /app/build .
CMD ["sh", "-c", "cp -r /build/. /usr/share/nginx/html/"]