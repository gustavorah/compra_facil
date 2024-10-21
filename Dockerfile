# Base image for the backend (Elysia with Bun)
FROM oven/bun:1 as base
WORKDIR /opt/compra-facil-api

# Instala as dependências
COPY ./compra-facil-api/package.json ./compra-facil-api/bun.lockb ./
RUN bun install --frozen-lockfile

# Copia o código fonte
COPY ./compra-facil-api ./

# Expondo a porta 3000 para o Elysia
EXPOSE 3000

# Executa o servidor no diretório correto
CMD ["bun", "dev", "--cwd", "/opt/compra-facil-api"]

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
COPY ./compra_facil/package.json ./compra_facil/package-lock.json ./
RUN npm install

# Copy source code for the front-end
WORKDIR /opt/compra_facil/app
COPY ./compra_facil ./

# Start Expo using tunnel for mobile access
ENTRYPOINT [ "npx", "expo" ]
CMD [ "start", "--host", "tunnel" ]

RUN echo "Para conectar no app, utilizar: exp://$IP"
