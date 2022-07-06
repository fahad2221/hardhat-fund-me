const { run } = require("hardhat");

async function verify(contractAddress, args) {
  console.log("Verifying Contract...");
  console.log(args);
  // This could potentially throw an error if the contract
  // is already verified, so we use a try catch statement
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified");
    } else {
      console.log(e);
    }
  }
}

module.exports = { verify };
