FROM node:22-slim

RUN apt-get update && \
    apt-get install -y wget git ca-certificates

# Add "node" user to the sudo group and configure sudoers
RUN apt-get install -y sudo \
    && echo "node ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/node
RUN npm install -g pnpm

USER node
CMD [ "bash" ]
