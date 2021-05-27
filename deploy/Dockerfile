FROM debian:buster-slim as site-builder

COPY --from=balthek/zola:0.13.0 /usr/bin/zola /usr/bin/zola
WORKDIR /build-site
COPY . /build-site
RUN /usr/bin/zola build

FROM nginx:stable-alpine

COPY --from=site-builder /build-site/public /usr/share/nginx/html
