FROM registry.access.redhat.com/ubi9/nodejs-20-minimal

ENV TZ="Europe/Helsinki"

WORKDIR /opt/app-root/src

# Build time env variables
ARG EXPOSE_PORT=8000

ARG NODE_CONFIG_ENV
ENV NODE_CONFIG_ENV=$NODE_CONFIG_ENV

ARG GIT_SHA
ENV REACT_APP_GIT_SHA=$GIT_SHA

ARG VERSION
ENV VERSION=$VERSION
ENV VITE_VERSION=$VERSION

ARG BASE_PATH
ENV BASE_PATH=$BASE_PATH

ARG E2E
ENV REACT_APP_E2E=$E2E

ARG STAGING
ENV REACT_APP_STAGING=$STAGING

# Setup
COPY package* ./
RUN npm ci -f --omit-dev --ignore-scripts
COPY . .

RUN npm run build

EXPOSE $EXPOSE_PORT

CMD ["npm", "run", "start:prod"]
