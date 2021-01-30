FROM node:14-buster

ENV DOCKER=true

RUN curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt update && apt -y install yarn

WORKDIR /app

COPY package.json yarn.lock ./
RUN mkdir frontend
RUN mkdir server
COPY frontend/package.json frontend/package.json
COPY server/package.json server/package.json
RUN yarn

COPY . .

RUN yarn build

CMD [ "yarn", "start" ]
