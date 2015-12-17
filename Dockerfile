FROM ubuntu:latest

MAINTAINER prasanna.shrestha@javra.com

# Enable EPEL for Node.js
# RUN rpm -Uvh http://download.fedoraproject.org/pub/epel/6/i386/epel-release-6-8.noarch.rpm

# make sure apt is up to date
RUN apt-get update

# install nodejs and npm
RUN apt-get install -y nodejs npm git git-core

RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
RUN echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | tee /etc/apt/sources.list.d/10gen.list

RUN dpkg-divert --local --rename --add /sbin/initctl
RUN ln -s /bin/true /sbin/initctl

# RUN apt-get update
RUN apt-get install mongodb-10gen

RUN mkdir -p /data/db

EXPOSE 27017
CMD ["usr/bin/mongod", "--smallfiles"]

# Copy app to /src
COPY . /src

# Install app and dependencies into /src
RUN cd /src; npm install

EXPOSE 3030

CMD cd /src && node ./server.jscdcat server