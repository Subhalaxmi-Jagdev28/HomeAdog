FROM nginx:1.27-alpine
# nginx renders /etc/nginx/templates/*.template -> /etc/nginx/conf.d/ at startup,
# substituting ${ANTHROPIC_API_KEY} from the container environment.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY index.html home.html /usr/share/nginx/html/
COPY css /usr/share/nginx/html/css
COPY js /usr/share/nginx/html/js
EXPOSE 80
