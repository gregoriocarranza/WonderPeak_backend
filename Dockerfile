FROM node:18-alpine
WORKDIR /usr/src/app

RUN apk add --no-cache netcat-openbsd

RUN npm install -g ts-node typescript

COPY package*.json ./
RUN npm install

COPY . .

COPY start.sh .
RUN chmod +x start.sh

EXPOSE 3030

CMD ["./start.sh"]
