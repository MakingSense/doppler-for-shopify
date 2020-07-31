#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

# Lines added to get the script running in the script path shell context
# reference: http://www.ostricher.com/2014/10/the-right-way-to-get-the-directory-of-a-bash-script/
cd "$(dirname "$0")"

if [ "$#" -eq 0 ] || { [ "$1" != "dev" ] && [ "$1" != "qa" ] && [ "$1" != "prod" ]; } ; then
    echo "Invalid or missing environment. Usage: $0 dev|qa|prod [dest_dir] [dest_systemd_dir]"
    echo "Example: $0 qa /root/doppler-for-shopify-qa /etc/systemd/system"
    exit 1;
fi

COLOR='\033[1;34m'
NC='\033[0m' # No Color

export DOLLAR='$'
export SSL_CERT_PATH=$SSL_CERT_PATH # Define this as an environment variable in Docker in host
DEST_DIR=$(pwd)
export DEST_DIR
export DEST_SYSTEMD_DIR='/etc/systemd/system'

if [ "$#" -gt 1 ] #if the dest_dir parameter is present
  then
    DEST_DIR=$2
fi

if [ "$#" -gt 2 ] #if the dest_systemd_dir parameter is present
  then
    DEST_SYSTEMD_DIR=$3
fi

echo -e " 🚀   ${COLOR}Deploying Doppler for Shopify to [$1] environment. Deployment dir: $DEST_DIR${NC}"

# DEV ENVIRONMENT
if [ "$1" = "dev" ]
  then
    export ENV_SUFFIX='-dev'
    export ENV_PORT='4444'
    export SHOPIFY_APP_HOST='https://sfy.fromdoppler.com:4444'
    export SHOPIFY_APP_KEY='480cde0c506309c5f6960d49dc6e4d7e'
    export SHOPIFY_APP_SECRET=$SHOPIFY_APP_SECRET_DEV
fi

# QA ENVIRONMENT
if [ "$1" = "qa" ]
  then
    export ENV_SUFFIX='-qa'
    export ENV_PORT='4433'
    export SHOPIFY_APP_HOST='https://sfy.fromdoppler.com:4433'
    export SHOPIFY_APP_KEY='db82af6aa301fb2221ee70570227f14e'
    export SHOPIFY_APP_SECRET=$SHOPIFY_APP_SECRET_QA
fi

# PROD ENVIRONMENT
if [ "$1" = "prod" ]
  then
    export ENV_SUFFIX=''
    export ENV_PORT='443'
    export SHOPIFY_APP_HOST='https://sfy.fromdoppler.com'
    export SHOPIFY_APP_KEY='b6d3e331e9de8a250fa07b1248efca35'
    export SHOPIFY_APP_SECRET=$SHOPIFY_APP_SECRET
fi

export APP_HOST_NAME=app${ENV_SUFFIX}

echo -e " ☁  ${COLOR}Pulling latest Docker dopplerdev/doppler-for-shopify$ENV_SUFFIX image...${NC}"
docker pull dopplerdev/doppler-for-shopify$ENV_SUFFIX

echo -e " 🙉   ${COLOR}Generating file $DEST_DIR/docker-compose.yml from template...${NC}"
/bin/sh -c "envsubst < ../docker-compose.yml.template > $DEST_DIR/docker-compose.yml"

echo -e " 🙊   ${COLOR}Generating file $DEST_DIR/nginx.conf from template...${NC}"
/bin/sh -c "envsubst < ../nginx/nginx.conf.template > $DEST_DIR/nginx.conf"

echo -e " 🙈   ${COLOR}Generating file $DEST_SYSTEMD_DIR/doppler-for-shopify$ENV_SUFFIX.service from template...${NC}"
/bin/sh -c "envsubst < ../doppler-for-shopify.service.template > $DEST_SYSTEMD_DIR/doppler-for-shopify$ENV_SUFFIX.service"