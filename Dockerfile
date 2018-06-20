FROM jamma/node
MAINTAINER Jeff YU, jeff@jamma.cn
COPY . .
RUN npm install --production && npm cache clean --force