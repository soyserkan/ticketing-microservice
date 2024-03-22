FROM node:19.2-alpine As development
WORKDIR /usr/src/app
COPY --chown=node:node . .
COPY --chown=node:node package*.json ./
RUN npm config set legacy-peer-deps=true --location=project
RUN npm install
USER node

FROM node:19.2-alpine As build
WORKDIR /usr/src/app
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules
COPY --chown=node:node . .
RUN npm run build
USER node

FROM node:19.2-alpine As production
WORKDIR /usr/src/app
COPY --chown=node:node --from=build /usr/src/app/package*.json .
RUN npm config set legacy-peer-deps=true --location=project
RUN npm install --omit=dev
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
COPY --chown=node:node --from=build /usr/src/app/.env .env
ENV TZ=Europe/Istanbul
ENV NODE_ENV=production
CMD [ "npm", "run", "start:prod" ]