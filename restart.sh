CONTAINER_ID="$(docker ps -lq)"
LOG_PATH=$(pwd)/log
docker stop ${CONTAINER_ID}
docker build -t autobounty .
docker run -d -v ${LOG_PATH}:/usr/src/app/log -p 8080:8080 autobounty &
