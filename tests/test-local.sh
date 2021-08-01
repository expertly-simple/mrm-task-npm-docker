#!/bin/bash

mkdir -p tmp

cd tmp

npm init -y

node ../index.js

cat package.json
