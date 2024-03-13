FROM node:16

ENV TZ="Europe/Helsinki"

WORKDIR /usr/src/app

# Setup
COPY package* ./
RUN npm config set cache /tmp --global
RUN npm i

EXPOSE 3000

CMD ["npm", "run", "start:server"]
