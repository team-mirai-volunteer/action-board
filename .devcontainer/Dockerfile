FROM node:22-slim

# Supabase CLI install (latest)
RUN apt-get update && \
    apt-get install -y wget git ca-certificates && \
    wget -qO- https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar xvz -C /usr/local/bin

# Add "node" user to the sudo group and configure sudoers
RUN apt-get install -y sudo \
    && echo "node ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/node

USER node

CMD [ "bash" ]
