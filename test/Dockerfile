FROM node:14

# Install dockerize (https://github.com/jwilder/dockerize)
# Is needed to wait for the api to successfully start (e.g. in docker-compose setup)
ENV DOCKERIZE_VERSION v0.6.1
RUN apt-get update && apt-get install -y wget \
 && wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
 && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
 && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

COPY package.json .
COPY package-lock.json .
RUN npm install --production

COPY . .

EXPOSE 8080
CMD [ "npm", "test" ]
