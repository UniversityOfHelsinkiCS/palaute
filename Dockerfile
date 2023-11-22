FROM registry.access.redhat.com/ubi8/nodejs-16

ENV TZ="Europe/Helsinki"

WORKDIR /opt/app-root/src

# Build time env variables

ARG NODE_CONFIG_ENV
ENV NODE_CONFIG_ENV=$NODE_CONFIG_ENV

ENV NODE_OPTIONS=--max-old-space-size=4096

ARG GIT_SHA
ENV REACT_APP_GIT_SHA=$GIT_SHA

ARG BASE_PATH
ENV PUBLIC_URL=$BASE_PATH

ARG E2E
ENV REACT_APP_E2E=$E2E

ARG STAGING
ENV REACT_APP_STAGING=$STAGING

# Setup
COPY package* ./
RUN npm ci -f --omit-dev --ignore-scripts
COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
