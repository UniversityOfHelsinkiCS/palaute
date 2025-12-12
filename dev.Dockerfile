FROM node:20

ENV TZ="Europe/Helsinki"
ARG EXPOSE_PORT=8000

WORKDIR /usr/src/app

ENV VERSION=development
ENV VITE_VERSION=development

# Setup
COPY package* ./
RUN npm config set cache /tmp --global
RUN npm ci

EXPOSE $EXPOSE_PORT

CMD ["npm", "run", "start:dev"]
