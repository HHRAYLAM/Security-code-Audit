const AuditContract = artifacts.require("AuditContract");

module.exports = async function (deployer) {
  await deployer.deploy(AuditContract);
  console.log("AuditContract deployed");

  // 添加延迟
  await new Promise((resolve) => setTimeout(resolve, 10000)); // 延迟 10 秒
};
