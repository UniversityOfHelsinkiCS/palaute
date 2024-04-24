FROM node:16

ENV TZ="Europe/Helsinki"
ARG EXPOSE_PORT=8000

WORKDIR /usr/src/app

# Setup
COPY package* ./
RUN npm config set cache /tmp --global
RUN npm i

EXPOSE $EXPOSE_PORT

CMD ["npm", "run", "start:server"]
