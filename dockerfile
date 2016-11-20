FROM node:latest
MAINTAINER Sergi Maymi
ENV CONTAINER_PATH /var/www/lwapi
WORKDIR $CONTAINER_PATH
RUN npm install supervisor -g && \
    npm install tsd -g && \
EXPOSE 6161
ENTRYPOINT ["supervisor", "./build/app.js"]

#docker build -f dockerfile -t tetio/node .
