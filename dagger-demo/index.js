require('dotenv').config();
var path = require('path');
var fs = require('fs');
var Web3 = require('web3');
var Tx = require('ethereumjs-tx');
const web3 = new Web3("https://betav2.matic.network")


function financialMfil(numMfil) {
    return Number.parseFloat(numMfil / 1e3).toFixed(3);
}

const main = async () => {
    console.log(`web3 version: ${web3.version}`)
    var myAddress = "0x98A94FF7F537d8A754A474A4Bc040C8eF8491df3";
    var destAddress = "0x2c29f4c04D9Acf4878A52C786B44069874878358";
    var transferAmount = 1;
    var count = await web3.eth.getTransactionCount(myAddress);
    console.log(`num transactions so far: ${count}`);
    var abiArray = JSON.parse(fs.readFileSync(path.resolve(__dirname, './abi.json'), 'utf-8'));
    var contractAddress = "0xb88b5a9dc92d61452cc5d8a54318623cdfc55b31";
    var contract = new web3.eth.Contract(abiArray, contractAddress, {
        from: myAddress
    });
    var balance = await contract.methods.balanceOf(myAddress).call();
    console.log(`Balance before send: ${financialMfil(balance)} MFIL\n------------------------`);
    // I chose gas price and gas limit based on what ethereum wallet was recommending for a similar transaction. You may need to change the gas price!
    // Use Gwei for the unit of gas price
    var gasPriceGwei = 0;
    var gasLimit = 300000;
    // Chain ID of Ropsten Test Net is 3, replace it to 1 for Main Net
    var chainId = 16110;
    var rawTransaction = {
        "from": myAddress,
        "nonce": "0x" + count.toString(16),
        "gasPrice": web3.utils.toHex(gasPriceGwei * 1e9),
        "gasLimit": web3.utils.toHex(gasLimit),
        "to": contractAddress,
        "value": "0x0",
        "data": contract.methods.transfer(destAddress, transferAmount).encodeABI(),
        "chainId": chainId
    };
    console.log(`Raw of Transaction: \n${JSON.stringify(rawTransaction, null, '\t')}\n------------------------`);
    // The private key for myAddress in .env
    var privKey = new Buffer("aaf", 'hex');
    var tx = new Tx(rawTransaction);
    tx.sign(privKey);
    var serializedTx = tx.serialize();
    // Comment out these four lines if you don't really want to send the TX right now
    console.log(`Attempting to send signed tx:  ${serializedTx.toString('hex')}\n------------------------`);
    var receipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
    // The receipt info of transaction, Uncomment for debug
    // console.log(`Receipt info: \n${JSON.stringify(receipt, null, '\t')}\n------------------------`);
    // The balance may not be updated yet, but let's check
    txid = receipt.transactionHash;
    console.log("txid:", txid);
    //balance = await contract.methods.balanceOf(myAddress).call();
    //console.log(`Balance after send: ${financialMfil(balance)} MFIL`);


var Dagger = require("@maticnetwork/eth-dagger");

// connect to Dagger 
var dagger = new Dagger("wss://betav2-dagger.matic.network"); // dagger server

// get confirmed tx event
dagger.on("confirmed:tx/" + txid + "/success", function(result) {
  console.log("tx success: ", result);
});

// get fail tx event
dagger.on("latest:tx/" + txid + "/fail", function(result) {
  console.log("tx fail: ", result);
});



}

main();



