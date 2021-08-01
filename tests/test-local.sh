#!/bin/bash

mkdir -p node_modules/mrm-task-58f5f082-ee83-4be4-9212-b3be82d3b592

cp index.js node_modules/mrm-task-58f5f082-ee83-4be4-9212-b3be82d3b592/index.js

mkdir -p tmp

cd tmp

npm init -y

npx mrm mrm-task-58f5f082-ee83-4be4-9212-b3be82d3b592

cat package.json
