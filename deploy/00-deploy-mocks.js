const { network } = require("hardhat");
const {
  devChains,
  DECIMALS,
  INITIALANSWER,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  if (devChains.includes(network.name)) {
    log("Local Network Detected! Deploying mocks..");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      // if you check the MockV3Aggregator in the node modules, it takes
      // two parameters. decimals and initalAnswer. decimals is intuitive.
      // intial answer is what we want to see eth price to 8 decimal places.
      args: [DECIMALS, INITIALANSWER],
    });
    log("Mocks Deployed!");
    log("--------------------------------");
  }
};

// tags are used to specify which deploy script the deploy function should
// execute. if we run yarn hardhat deploy --tags "x", we put any of the tags
// we have specified below in order to run this deploy file.

module.exports.tags = ["all", "mocks"];
