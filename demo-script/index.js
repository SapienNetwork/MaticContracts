var sigUtil = require('eth-sig-util');
const Biconomy = require("@biconomy/mexa");
const Web3 = require("web3");
const {abi} = require("./abi");

<<<<<<< HEAD
=======

>>>>>>> 1663fc1345011f7de14445bf7c6c8cf746556b5c
let tokenAddress = "SapienChildERC20_contract_address";

//Initialize Biconomy
// register on biconomy dashboard to create dapp_id & api_key
<<<<<<< HEAD
const biconomy = new Biconomy(new Web3.providers.HttpProvider("https://betav2.matic.network"),
=======
const biconomy = new Biconomy(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/9fc37ecc1a874b9195668327b526a1a7"),
>>>>>>> 1663fc1345011f7de14445bf7c6c8cf746556b5c
{dappId: "dapp_id", apiKey: "api_key",debug:true});

//initialise web3 with Biconomy
web3 = new Web3(biconomy);

let contract =  new web3.eth.Contract(abi , tokenAddress);
let data = "4" //dynamic data
let toAddress = "receiver_address";
let fromAddress = "spender_address";
let privateKey = "spender_private_key";

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
      fromAddress,
      data,
      tokenAddress,
      "1", //Transferring 1 sapien token
      0
  );   

  let result = contract.methods.transferWithPurposeAndSig(
          fromAddress,
          toAddress,
          "1",
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
      chainId: 16110,
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