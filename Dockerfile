FROM node:22-alpine
WORKDIR /app
COPY . .
RUN mkdir -p /app/data && chown node:node /app/data
ENV HOST=0.0.0.0 PORT=8765
EXPOSE 8765
USER node
CMD ["node", "server.mjs"]
