FROM node:18

WORKDIR /app

ENV ENV=production

CMD echo $ENV
