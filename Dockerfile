FROM node:7-onbuild

ENV PORT 8080
EXPOSE 8080

# Set this variable to the name of your production config file (without the extension)
ENV NODE_ENV development
