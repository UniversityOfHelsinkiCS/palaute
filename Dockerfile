FROM node:14

WORKDIR /usr/src/app

ARG GIT_SHA
ENV GIT_SHA=$GIT_SHA

ARG BASE_PATH
ENV PUBLIC_URL=$BASE_PATH

# Setup
COPY package* ./
RUN npm ci --only=production
COPY . .

RUN npm run build

EXPOSE 8000

CMD ["npm", "run", "start:prod"]
