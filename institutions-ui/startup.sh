#!/bin/bash

# Create and tail httpd logs for k8s logging
ERR_LOG=/var/log/httpd/local_default_ssl_error_ssl.log
ACCESS_LOG=/var/log/httpd/local_default_ssl_access_ssl.log
touch $ERR_LOG && tail -f $ERR_LOG &
touch $ACCESS_LOG && tail -f $ACCESS_LOG &

uvicorn institutions_api.app:app --host 0.0.0.0 --port 8089 &
httpd -D FOREGROUND
