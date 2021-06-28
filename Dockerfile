FROM node:14

WORKDIR /usr/src/app

ARG GIT_SHA
ENV REACT_APP_GIT_SHA=$GIT_SHA

ARG BASE_PATH
ENV PUBLIC_URL=$BASE_PATH

ARG E2E
ENV REACT_APP_E2E=$E2E

ARG JEST
ENV REACT_APP_JEST=$JEST

# Setup
COPY package* ./
RUN npm ci --only=production
COPY . .

RUN npm run build

EXPOSE 8000

CMD ["npm", "run", "start:prod"]
