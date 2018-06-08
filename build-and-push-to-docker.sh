#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

# Lines added to get the script running in the script path shell context
# reference: http://www.ostricher.com/2014/10/the-right-way-to-get-the-directory-of-a-bash-script/
cd $(dirname $0)

./build-w-docker.sh
docker build -t dopplerdev/doppler-for-shopify .
docker build -t dopplerdev/doppler-for-shopify-nginx ./nginx/
docker push dopplerdev/doppler-for-shopify
docker push dopplerdev/doppler-for-shopify-nginx

