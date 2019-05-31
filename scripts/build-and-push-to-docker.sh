#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

# Lines added to get the script running in the script path shell context
# reference: http://www.ostricher.com/2014/10/the-right-way-to-get-the-directory-of-a-bash-script/
cd $(dirname $0)

if [ "$#" -eq 0 ] || ( [ "$1" != "dev" ] && [ "$1" != "qa" ] && [ "$1" != "prod" ] ) ; then
    echo "Invalid or missing environment. Usage: $0 [dev|qa|prod]"
    exit 1;
fi

ENV_SUFFIX=""
if [ $1 != "prod" ]
  then
    ENV_SUFFIX="-$1"
fi

sh ./build-w-docker.sh

docker build -t doppler-for-shopify$ENV_SUFFIX ../