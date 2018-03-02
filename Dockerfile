FROM node:9

ENV DEBIAN_FRONTEND noninteractive
RUN apt-get -yq update \
  && apt-get install -yq --no-install-suggests --no-install-recommends \
  libasound2-dev \
  && rm -rf /var/lib/apt/lists/*
RUN npm i -g npm@5.7.1

ENV \
  NODE_ENV=production \
  PORT=3000 \
  TABIDISCO_GUI_DIR=/opt/tabidisco/gui \
  TABIDISCO_DB_DIR=/data
EXPOSE 3000
VOLUME ["/data"]
CMD ["npm", "start"]

RUN mkdir -p /opt/tabidisco /data
WORKDIR /opt/tabidisco

COPY server/package* ./
RUN npm ci --production

COPY server/ ./
COPY gui/dist/ ./gui/
