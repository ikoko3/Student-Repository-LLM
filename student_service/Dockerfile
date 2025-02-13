FROM node
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app

# Expose both the app port and the Node.js debugger port
EXPOSE 3000 9229  

# This is for debugging, we need to configure it to run without it as well
CMD ["node", "--inspect=0.0.0.0:9229", "server.js"]