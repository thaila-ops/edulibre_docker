FROM node:lts as builder 

WORKDIR /app  

COPY . . 

RUN npm install
RUN npm run build
EXPOSE 3001

CMD ["node", "dist/server.js"]