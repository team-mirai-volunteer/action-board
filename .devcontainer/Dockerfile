FROM node:22-slim

RUN apt-get update && \
    apt-get install -y wget git ca-certificates vim postgresql-client locales && \
    sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && \
    locale-gen

ENV LANG=en_US.UTF-8 \
    LANGUAGE=en_US:en \
    LC_ALL=en_US.UTF-8

# Add "node" user to the sudo group and configure sudoers
RUN apt-get install -y sudo \
    && echo "node ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/node
RUN npm install -g pnpm

USER node
CMD [ "bash" ]
