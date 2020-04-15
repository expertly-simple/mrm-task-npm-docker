const {
  // JSON files
  json,
  // package.json
  packageJson,
  // New line separated text files
  lines,
  // Install npm packages
  install
} = require("mrm-core");

function task(config) {
  configureCommonNpmPackages();
  configureNpmScripts();
}

const config = [
  ["imageRepo", "[namespace]/[repository]"],
  ["imageName", "custom_app_name"],
  ["imagePort", "3000"],
  ["internalContainerPort", "3000"]
]

const scripts = [
  ["predocker:build", "npm run build"],
  ["docker:build", "cross-conf-env docker image build . -t $npm_package_config_imageRepo:$npm_package_version"],
  ["postdocker:build", "npm run docker:tag"],
  ["docker:tag", " cross-conf-env docker image tag $npm_package_config_imageRepo:$npm_package_version $npm_package_config_imageRepo:latest"],
  ["docker:run", "run-s -c docker:stop docker:runHelper"],
  ["docker:runHelper", "cross-conf-env docker run -e NODE_ENV=local --rm --name $npm_package_config_imageName -d -p $npm_package_config_imagePort:$npm_package_config_internalContainerPort $npm_package_config_imageRepo"],
  ["predocker:publish", "echo Attention! Ensure `docker login` is correct."],
  ["docker:publish", "cross-conf-env docker image push $npm_package_config_imageRepo:$npm_package_version"],
  ["postdocker:publish", "cross-conf-env docker image push $npm_package_config_imageRepo:latest"],
  ["docker:stop", "cross-conf-env docker stop $npm_package_config_imageName || true"],
  ["docker:clean", "cross-conf-env docker rm -f $npm_package_config_imageName || true"],
  ["predocker:taillogs", "echo Web Server Logs:"],
  ["docker:taillogs", "cross-conf-env docker logs -f $npm_package_config_imageName"],
  ["docker:open:win", "echo Trying to launch on Windows && timeout 2 && start http://localhost:%npm_package_config_imagePort%"],
  ["docker:open:mac", "echo Trying to launch on MacOS && sleep 2 && URL=http://localhost:$npm_package_config_imagePort && open $URL"],
  ["docker:debugmessage", "echo Docker Debug Completed Successfully! Hit Ctrl+C to terminate log tailing."],
  ["predocker:debug", "run-s docker:build docker:run"],
  ["docker:debug", "run-s -cs docker:open:win docker:open:mac docker:debugmessage docker:taillogs"]
]


function configureNpmScripts() {
  const pkg = packageJson();

  
  scripts.forEach(e => pkg.setScript(e[0], e[1]).save())


  config.forEach(e => {
    if(!pkg.get(`config.${e[0]}`)) {
      pkg.set(`config.${e[0]}`, e[1])
    }
  })
}

function configureCommonNpmPackages() {
  const commonNpm = ["cross-conf-env", "npm-run-all", "dev-norms"];
  install(commonNpm);
}

task.description = "Configures npm Scripts for Docker";
module.exports = task;
