FROM node:14

COPY package.json .
COPY package-lock.json .
RUN npm install --production

COPY . .

EXPOSE 8080
CMD [ "npm", "start" ]
