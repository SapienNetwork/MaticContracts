var sigUtil = require('eth-sig-util');
const Biconomy = require("@biconomy/mexa");
const Web3 = require("web3");
const {abi} = require("./abi");

let tokenAddress = "0xb88b5a9Dc92d61452Cc5d8a54318623CDFC55b31";

//Initialize Biconomy
// register on biconomy dashboard to create dapp_id & api_key
const biconomy = new Biconomy(new Web3.providers.HttpProvider("https://betav2.matic.network"),
{dappId: "5e8d88bef64c16288c945067", apiKey: "U2tDfJkWj.d5142fa8-7152-4421-b27e-c0e3adb38bf7",debug:true});

//initialise web3 with Biconomy
web3 = new Web3(biconomy);

let contract =  new web3.eth.Contract(abi , tokenAddress);
let data = "5" // nonce or "salt". should be different for every transaction. random number or current timestamp + random number can be used here.
let toAddress = "0xeBc3DECeb90Ac1f5AA6B2A8Bb015544757F982e3";
let fromAddress = "0x98A94FF7F537d8A754A474A4Bc040C8eF8491df3";
let privateKey = "0x98A94FF7F537d8A754A474A4Bc040C8eF8491df3 private key";

biconomy.onEvent(biconomy.READY, () => {
  // Initialize your dapp here like getting user accounts etc
  sendSignedTransactionToSapien();
}).onEvent(biconomy.ERROR, (error, message) => {
  // Handle error while initializing mexa
  console.log("error while initialising biconomy")
  console.log(error);
});

async function sendSignedTransactionToSapien(){
  //Sign Data
  let transferSigResult =  getTransferSig(
      privateKey,
      toAddress,
      data,
      tokenAddress,
      "1000000", // Transferring 1 sapien token, in uSPN
      0
  );   

  let result = contract.methods.transferWithPurposeAndSig(
          toAddress,
          "1000000", // Transferring 1 sapien token, in uSPN  
          web3.utils.hexToBytes(web3.utils.stringToHex("0")),
          transferSigResult.sig,
          web3.utils.hexToBytes(web3.utils.stringToHex(data)),
          0
  ).encodeABI();

  let txParams = {
      "from": fromAddress,
      "gasLimit": web3.utils.toHex(210000),
      "to": tokenAddress,
      "value": "0x0",
      "data": result
  };

  // Sign Transaction
  const signedTx = await web3.eth.accounts.signTransaction(txParams, `0x${privateKey}`);
  let receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction, (error, txHash)=>{
      if(error) {
          return console.error(error);
      }
      console.log(txHash);
  });

}

function getTransferSig(
  privateKey,
  spender,
  data,
  tokenAddress,
  tokenIdOrAmount,
  expiration
) {
    const typedData = getTransferTypedData({
        tokenAddress,
        tokenIdOrAmount,
        spender,
        data,
        expiration
    });

    const sig = sigUtil.signTypedMessage(new Buffer.from(privateKey,'hex'), {
        data: typedData
    },'V3')
    return { sig };
}

function getTransferTypedData({
  tokenAddress,
  spender,
  tokenIdOrAmount,
  data,
  expiration
}) {
  return {
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "contract", type: "address" }
      ],
      TokenTransferOrder: [
        { name: "spender", type: "address" },
        { name: "tokenIdOrAmount", type: "uint256" },
        { name: "data", type: "bytes32" },
        { name: "expiration", type: "uint256" }
      ]
    },
    domain: {
      name: "Matic Network",
      version: "1",
      chainId: 15001,
      contract: tokenAddress
    },
    primaryType: "TokenTransferOrder",
    message: {
      spender,
      tokenIdOrAmount,
      data,
      expiration
    }
  }
} 
