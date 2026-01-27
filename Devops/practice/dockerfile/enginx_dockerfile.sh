FROM nginx

WORKDIR /usr/share/nginx/html

COPY index.html .

RUN nginx 

CMD foreground
