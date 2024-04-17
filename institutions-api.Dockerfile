FROM almalinux:9

RUN yum update -y && \
    yum install -y python3-pip httpd mod_auth_openidc mod_ssl python3-mod_wsgi && \
    yum clean all && rm -rf /var/cache/yum/*

# Add the apache VirtualHost, to setup the WSGI module for the app
COPY apache.conf /etc/httpd/conf.d/

# Install FastAPI and the WSGIMiddleware
COPY requirements.txt /srv/requirements.txt
RUN pip install -r /srv/requirements.txt

# Add the FastAPI application
COPY startup.sh /bin/
COPY institutions-api/ /srv/app/
RUN chown -R apache:apache /srv/
WORKDIR /srv/app/

CMD [ "/bin/startup.sh" ]
