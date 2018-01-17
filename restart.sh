
CONTAINER_ID="$(docker ps -lq)"
docker stop ${CONTAINER_ID}
docker build -t autobounty .
sudo docker run -d -p 8080:8080 autobounty &
 
