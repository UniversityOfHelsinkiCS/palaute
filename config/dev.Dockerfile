FROM node:14

WORKDIR /usr/src/app

# Setup
COPY package* ./
RUN npm ci

EXPOSE 3000

CMD ["npm", "run", "start:dev"]