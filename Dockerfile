FROM node:7-onbuild

ENV PORT 8080
EXPOSE 8080

# Set this variable to the name of your production config file (without the extension)
ENV NODE_ENV development

# Set this variable to the folder where the logs should be place (must exist)
ENV LOG_PATH './log'

# Set this variable to the value of the secret field of the Github webhook
ENV WEBHOOK_SECRET ''
