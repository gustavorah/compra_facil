# Node.js environment for the front-end (Expo)
FROM node:latest

# Node environment
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# Default ports for Expo
ARG PORT=19006
ENV PORT=$PORT
EXPOSE $PORT 19002 19001 19000 8081

# Dependencies for Expo app
RUN mkdir /opt/compra_facil
WORKDIR /opt/compra_facil
ENV PATH=/opt/compra_facil/.bin:$PATH
COPY package.json package-lock.json .
RUN npm install

# Copy source code for the front-end
WORKDIR /opt/compra_facil/app
COPY . .

# Start Expo using tunnel for mobile access
ENTRYPOINT [ "npx", "expo"] 
#, "start", "--host", "tunnel" ]
CMD [ "start", "--host", "tunnel" ]

RUN echo "Para conectar no app, utilizar: exp://$IP"
