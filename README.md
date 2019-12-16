# mrm-task-npm-docker
MRM task to configure your npm project with scripts to build, debug, and publish Docker containers

These are generic npm scripts that you can copy & paste into your `package.json` file as-is and get access to convinience scripts to manage your Docker images all in one place.

> Looking for _npm scripts for AWS ECS_? Go [here](https://gist.github.com/duluca/2b67eb6c2c85f3d75be8c183ab15266e#file-npm-scripts-for-aws-ecs-md)!

**Watch the video**: [Do More With Less JavaScript](https://youtu.be/Sd1aM8181kc?list=PLtevgo7IoQizTQdXtRKEXGguTQbL0F01_)

**Get the book**: These scripts are referenced in my book _Angular for Enterprise-Ready Web Applications_. You can get it on https://AngularForEnterprise.com.

## Evergreen Docker Containers for Static or Angular/React/Vue/etc SPA Websites
> These containers are always up-to-date with the base images from latest `lts` channel for `node` and `alpine`.
* `docker pull duluca/minimal-nginx-web-server`
  * **Documentation:** https://hub.docker.com/r/duluca/minimal-nginx-web-server/
* `docker pull duluca/minimal-node-web-server`
  * **Documentation:** https://hub.docker.com/r/duluca/minimal-node-web-server/

## Features
* **Cross-Platform:** Works on Windows 10 and macOS.
* **`docker:build`:** Builds your Docker image, using the root `Dockerfile` and tags the image as `latest` and whatever version is specificed in `package.json` like `1.0.0`.
* **`docker:run`:** Run the image you built on your local Docker instance. When you run `docker ps` your image will identified by the `imageName` you specify in `package.json`.
* **`docker:debug`:** Builds and runs image; tails console logs, so you can see what's happening inside the container; launches target app URL `http://localhost:imagePort` in a browser; all in one command.
> Note that on the very first run `docker:debug` may fail. In this case, simple re-run the command.
* **`docker:publish`:** Publishes the image to the `imageRepo` specified. This can be on Docker Hub, AWS ECS or any other Docker repository you may create.

## Pre-Requisites
- Install Docker for [Mac](https://www.docker.com/docker-mac) or [Windows](https://www.docker.com/docker-windows)
- `npm i --save-dev cross-conf-env npm-run-all`: Needed to ensure cross platform functionality for scripts.

## Configuring Package.json in 2-steps
### Step 1
In your `package.json` file add a new config property with three sub-properties using your own values, as shown below:
```json
  "config": {
    "imageRepo": "[namespace]/[repository]",
    "imageName": "custom_app_name",
    "imagePort": "3000",
    "internalContainerPort": "3000"
  },
```
### Step 2
Copy & paste these new scripts under the `scripts` property in `package.json`:
> Note that `docker:runHelper` assumes that your code is listening to port 3000 as reflected by `internalContainerPort`. If this is not the case, update the value in the scripts.
```json
  "scripts": {
    "predocker:build": "npm run build",
    "docker:build": "cross-conf-env docker image build . -t $npm_package_config_imageRepo:$npm_package_version",
    "postdocker:build": "npm run docker:tag",
    "docker:tag": " cross-conf-env docker image tag $npm_package_config_imageRepo:$npm_package_version $npm_package_config_imageRepo:latest",
    "docker:run": "run-s -c docker:clean docker:runHelper",
    "docker:runHelper": "cross-conf-env docker run -e NODE_ENV=local --name $npm_package_config_imageName -d -p $npm_package_config_imagePort:$npm_package_config_internalContainerPort $npm_package_config_imageRepo",
    "predocker:publish": "echo Attention! Ensure `docker login` is correct.",
    "docker:publish": "cross-conf-env docker image push $npm_package_config_imageRepo:$npm_package_version",
    "postdocker:publish": "cross-conf-env docker image push $npm_package_config_imageRepo:latest",
    "docker:clean": "cross-conf-env docker rm -f $npm_package_config_imageName",
    "predocker:taillogs": "echo Web Server Logs:",
    "docker:taillogs": "cross-conf-env docker logs -f $npm_package_config_imageName",
    "docker:open:win": "echo Trying to launch on Windows && timeout 2 && start http://localhost:%npm_package_config_imagePort%",
    "docker:open:mac": "echo Trying to launch on MacOS && sleep 2 && URL=http://localhost:$npm_package_config_imagePort && open $URL",
    "docker:debugmessage": "echo Docker Debug Completed Successfully! Hit Ctrl+C to terminate log tailing.",
    "predocker:debug": "run-s docker:build docker:run",
    "docker:debug": "run-s -cs docker:open:win docker:open:mac docker:debugmessage docker:taillogs"
  },
```
You can customize the build command to run your tests before building the image like:
```json
    "predocker:build": "npm run build -- --prod && npm test",
```

## Running
You're done. Now run your scripts. To build and publish an image you only need to use two of the commands frequently.
0. **`npm run docker:build`:** Builds and Tags the image. After first run, you can just use `npm run docker:debug`.
1. **`npm run docker:debug`:** Test (optional), Build, Tag, Run, Tail and launch your app in a browser to test.
2. **`npm run docker:publish`:** Voila, your results are published on the repository you've defined.

## Publish on the Internet
You've two options, easy-ish and hard.
1. **Easy-ish:** Use [Cloud Run](https://cloud.google.com/run/)
Install the CLI:
```bash
$ brew cask install google-cloud-sdk
> choco install gcloudsdk
```
Deploy your image using the command below, replacing $IMAGE_NAME with the name of your Docker image, i.e. `duluca/minimal-node-web-server`:
```bash
$ gcloud beta run deploy --image $IMAGE_NAME
```
Follow the prompts to login, add billing information and you're good to go!

2. **Hard:** Use [AWS ECS](https://aws.amazon.com/ecs/)
This is Amazon's Elastic Container Service and it's pretty excellent to use with Docker. However, it is complicated to setup. But worry not; for step-by-step instructions head over to [npm scripts for AWS ECS](https://gist.github.com/duluca/2b67eb6c2c85f3d75be8c183ab15266e#file-npm-scripts-for-aws-ecs-md).
