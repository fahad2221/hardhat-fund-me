//import
const { network, deployments } = require("hardhat");
const { networkConfig, devChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
// This is another way to get chainId()
// const { getChainId } = hre;
// const chainId = await getChainId();

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  log("Starting Program");
  const chainId = network.config.chainId;

  // now if we run yarn hardhat deploy --network "x"
  // whatever x is, either rinkeby, polygon, etc it will pull that
  // from the helper-hardhat-config.js, specificly the netWorkConfig dict we made.
  //const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  let ethUsdPriceFeedAddress;
  if (devChains.includes(network.name)) {
    // if the newtork we are running on is a dev network, deploy mocks.
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }

  // In the case that we are working with local chains, we need to use mocks.
  const args = [ethUsdPriceFeedAddress];
  const fundMe = await deploy("FundMe", {
    // deployer is one of the named accounts we created in
    // the hardhat.config file
    from: deployer,
    // ethUsdPriceFeedAddress depends on code above
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log(`FundMe deployed at ${fundMe.address}`);

  // // If we are definetly not on a devChain, lets verify the contract
  if (!devChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(fundMe.address, args);
  }
  log("-----------------------------------");
};

module.exports.tags = ["all", "fundme"];
