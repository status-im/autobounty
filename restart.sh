
CONTAINER_ID="$(docker ps -lq)"
LOG_PATH=$(readlink -f './log')
docker stop ${CONTAINER_ID}
docker build -t autobounty .
 docker run -d --mount source=$LOG_PATH,target=/usr/src/app/log -p 8080:8080 autobounty
docker run -d -v ${LOG_PATH}:/usr/src/app/log -p 8080:8080 autobounty &
