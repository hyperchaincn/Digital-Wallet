var Web3 = require('hpc-web3');
var SolidityFunction = require('hpc-web3/lib/web3/function');
var ethereumUtil = require('ethereumjs-util');
var _ = require("lodash");
var request = require('request');
var coder = require('hpc-web3/lib/solidity/coder');
const secp256k1 = require('secp256k1');
const TOKEN_ABI = '[{"constant":false,"inputs":[{"name":"account","type":"address"},{"name":"amount","type":"uint256"}],"name":"issue","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"amount","type":"uint256"}],"name":"transfer","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"account","type":"address"}],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"inputs":[],"payable":false,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"account","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Issue","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"from","type":"address"},{"indexed":false,"name":"to","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Transfer","type":"event"}]'
const TOKEN_SOURCE = 'contract Token {     address issuer;     mapping (address => uint) balances;      event Issue(address account, uint amount);     event Transfer(address from, address to, uint amount);      function Token() {         issuer = msg.sender;     }      function issue(address account, uint amount) {         if (msg.sender != issuer) throw;         balances[account] += amount;     }      function transfer(address to, uint amount) {         if (balances[msg.sender] < amount) throw;          balances[msg.sender] -= amount;         balances[to] += amount;          Transfer(msg.sender, to, amount);     }      function getBalance(address account) constant returns (uint) {         return balances[account];     } }';
const TOKEN_BIN = '0x6060604052341561000c57fe5b5b60008054600160a060020a03191633600160a060020a03161790555b5b6101ca806100396000396000f300606060405263ffffffff60e060020a600035041663867904b48114610037578063a9059cbb14610058578063f8b2cb4f14610079575bfe5b341561003f57fe5b610056600160a060020a03600435166024356100a7565b005b341561006057fe5b610056600160a060020a03600435166024356100e6565b005b341561008157fe5b610095600160a060020a036004351661017f565b60408051918252519081900360200190f35b60005433600160a060020a039081169116146100c35760006000fd5b600160a060020a03821660009081526001602052604090208054820190555b5050565b600160a060020a0333166000908152600160205260409020548190101561010d5760006000fd5b600160a060020a0333811660008181526001602090815260408083208054879003905593861680835291849020805486019055835192835282015280820183905290517fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9181900360600190a15b5050565b600160a060020a0381166000908152600160205260409020545b9190505600a165627a7a72305820299e9bb6a492d60cb690d97c76ac26d821ff6bba1b863ce1b8720e449789692c0029'

var newAsset = function (from, privkey, cb) {

    console.log(from)
    console.log("----------------")
    var account = from;

    var requestData = {
        "Bin": TOKEN_BIN,
        "From": account
    }

     var options = { method: 'POST',
       url: 'https://api.hyperchain.cn/v1/token/gtoken',
       formData:
        { client_id: 'dd7314bb-e48f-43bd-a0cc-11ebcb977d49',
          client_secret: '1108M45t16X2F399706f9p12cv10Pq3H',
          username: '17612156863',
          password: 'tajnzh10' } };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        var obj = JSON.parse(body)
        var accessToken = obj['access_token'];

        console.log(accessToken)
        request({
            url: "https://api.hyperchain.cn" + "/v1/dev/contract/deploy",
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
                "Accept": "application/json",
                "Authorization": accessToken
            }
            , body: requestData
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body)
                console.log(body.TxHash)
                var hash = body.TxHash;
                console.log(hash)
                cb && checkForContractAddress(hash, cb);
            } else {
                console.error(error);
            }
        });
    });
    // cb && checkForContractAddress(hash, cb);
}

//invoke
var encodeMethodParams = function (theAbi, params, cb) {
    var types = theAbi.inputs.map(function (input) {
        return input.type;
    });
    for (var i = 0; i < types.length; i++) {
        switch (types[i]) {
            case "bytes32[]":
                try {
                    params[i] = JSON.parse(params[i]);
                } catch (e) {
                    if (typeof cb == 'function') {
                        cb(new Error("param " + param[i] + " not match the format of type bytes32[]"))
                    }
                }
                if (params[i] instanceof Array) {
                    for (var j = 0; j < params[i].length; j++) {
                        params[i][j] += ""
                    }
                }
            //add others case to here
        }
    }
    return coder.encodeParams(types, params);
};

var issueAsset = function (from, privkey, address, amount, cb) {
    console.log("from:" + from + "address" + address)
    var theAbi = {
        "constant": false,
        "inputs": [{"name": "account", "type": "address"}, {"name": "amount", "type": "uint256"}],
        "name": "issue",
        "outputs": [],
        "payable": false,
        "type": "function"
    };
    var methodParams = [from, amount];
    var encodedparams = encodeMethodParams(theAbi, methodParams);
    var fun = new SolidityFunction('', theAbi, '');
    var payloadData = '0x' + fun.signature() + encodedparams;

    console.log(payloadData)
    var hash = "";
    var requestData = {
        "Const": true,
        "From": from,
        "Payload": payloadData,
        "To": address
    }
     var options = { method: 'POST',
       url: 'https://api.hyperchain.cn/v1/token/gtoken',
       formData:
        { client_id: 'dd7314bb-e48f-43bd-a0cc-11ebcb977d49',
          client_secret: '1108M45t16X2F399706f9p12cv10Pq3H',
          username: '17612156863',
          password: 'tajnzh10' } };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        var obj = JSON.parse(body)
        var accessToken = obj['access_token'];

        console.log(accessToken)
        request({
            url: "https://api.hyperchain.cn" + "/v1/dev/contract/invoke",
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
                "Accept": "application/json",
                "Authorization": accessToken
            }
            , body: requestData
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body)
                console.log(body.TxHash)
                hash = body.TxHash;
                cb && checkForContractTransaction(hash, cb)
            } else {

                console.log(response.statusCode);

            }
        });
    });


}

var random_16bits = function () {
    var num = Math.random().toString();
    if (num.substr(num.length - 16, 1) === '0' || num.length <= 17) {
        return random_16bits();
    }
    return num.substring(num.length - 16);
}

var getTimestamp = function (time) {
    if (_.isUndefined(time) || _.isNull(time)) {
        return Math.round(new Date().getTime() / 1000);
    } else {
        return Math.round(new Date(time).getTime() / 1000);
    }
};

var checkForContractTransaction = function (hash, callback) {
    // wait for receipt
    var flag = false;
    var startTime = new Date().getTime();
    var getResp = function () {
        if (!flag) {
            if ((new Date().getTime() - startTime) < 8000) {
                 var options = { method: 'POST',
                   url: 'https://api.hyperchain.cn/v1/token/gtoken',
                   formData:
                    { client_id: 'dd7314bb-e48f-43bd-a0cc-11ebcb977d49',
                      client_secret: '1108M45t16X2F399706f9p12cv10Pq3H',
                      username: '17612156863',
                      password: 'tajnzh10' } };
                request(options, function (error, response, body) {
                    if (error) throw new Error(error);

                    var obj = JSON.parse(body)
                    var accessToken =  obj['access_token'];

                    console.log(accessToken)
                    var receipt = request({
                            url: "https://api.hyperchain.cn" + "/v1/dev/transaction/txreceipt" + "?txhash=" + hash,
                            method: "GET",
                            json: true,
                            headers: {
                                "Accept": "Accept: text/html",
                                "Authorization": accessToken
                            }
                        },
                        function (err, receipt) {
                            if (receipt && receipt.body.TxHash) {
                                console.log("----" + receipt.body.TxHash)
                                console.log(receipt.body)
                                var temp = {
                                    status: receipt.body.Status,
                                    txHash: receipt.body.TxHash,
                                    postState: receipt.body.PostState,
                                    contractAddress: receipt.body.ContractAddress,
                                    ret: receipt.body.Ret
                                }

                                callback(null, temp);
                            } else {
                                setTimeout(getResp, 400);
                            }
                        });
                });
            } else {
                callback(new Error("getTransactionReceipt timeout..."));
            }
        }
    };
    setTimeout(getResp, 400);
};

var checkForContractAddress = function (hash, callback) {
    // wait for receipt
    var flag = false;
    var startTime = new Date().getTime();
    var getResp = function () {
        if (!flag) {
            if ((new Date().getTime() - startTime) < 8000) {
                var t1 = getTimestamp();

               var options = { method: 'POST',
                 url: 'https://api.hyperchain.cn/v1/token/gtoken',
                 formData:
                  { client_id: 'dd7314bb-e48f-43bd-a0cc-11ebcb977d49',
                    client_secret: '1108M45t16X2F399706f9p12cv10Pq3H',
                    username: '17612156863',
                    password: 'tajnzh10' } };
                request(options, function (error, response, body) {
                    if (error) throw new Error(error);

                    var obj = JSON.parse(body)
                    var accessToken = obj['access_token'];

                    console.log(accessToken)
                    request({

                            url: "https://api.hyperchain.cn" + "/v1/dev/transaction/txreceipt" + "?txhash=" + hash,
                            method: "GET",
                            json: true,
                            headers: {
                                "Accept": "Accept: text/html",
                                "Authorization": accessToken
                            }
                        },
                        function (err, receipt) {
                            // if (receipt && receipt != undefined) {
                            if (receipt.body.ContractAddress != undefined && receipt.body.ContractAddress != "") {
                                flag = true;
                                console.log(receipt.body)
                                console.log(receipt.body.ContractAddress)

                                callback && callback(null, receipt.body.ContractAddress);
                            } else {
                                console.log("resend after 50");
                                setTimeout(getResp, 50)
                            }
                        });
                });
                var t2 = getTimestamp();

            } else {
                callback(new Error("getTransactionReceipt timeout..."));
            }
        }
    };
    getResp()
};

var newTransaction = function (from, to, amount, privKey, contractAddr, cb) {

    var theAbi = {
        "constant": false,
        "inputs": [{"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}],
        "name": "transfer",
        "outputs": [],
        "payable": false,
        "type": "function"
    };

    var methodParams = [to, amount];
    var encodedparams = encodeMethodParams(theAbi, methodParams);
    var fun = new SolidityFunction('', theAbi, '');
    var payloadData = '0x' + fun.signature() + encodedparams;

    console.log(payloadData)
    var hash = "";
    var requestData = {
        "Const": true,
        "From": from,
        "Payload": payloadData,
        "To": to
    }
    var options = { method: 'POST',
      url: 'https://api.hyperchain.cn/v1/token/gtoken',
      formData:
       { client_id: 'dd7314bb-e48f-43bd-a0cc-11ebcb977d49',
         client_secret: '1108M45t16X2F399706f9p12cv10Pq3H',
         username: '17612156863',
         password: 'tajnzh10' } };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        var obj = JSON.parse(body)
        var accessToken = obj['access_token'];

        console.log(accessToken)
        request({
            url: "https://api.hyperchain.cn" + "/v1/dev/contract/invoke",
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
                "Accept": "application/json",
                "Authorization": accessToken
            }
            , body: requestData
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body)
                console.log(body.TxHash)
                hash = body.TxHash;
                cb && checkForContractTransaction(hash, cb)
            } else {

                console.log(response.statusCode);

            }
        });
    });

}

module.exports = {
    checkForContractAddress: checkForContractAddress,
    newAsset: newAsset,
    getTimestamp: getTimestamp,
    random_16bits: random_16bits,
    checkForContractTransaction: checkForContractTransaction,
    issueAsset: issueAsset,
    newTransaction: newTransaction
}