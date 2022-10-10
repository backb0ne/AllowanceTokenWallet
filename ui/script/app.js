window.ethereum.on('connect', (info) => {
    var _chainId = info.chainId;
    if(_chainId != '0xA86A')
    {
        window.ethereum
        .request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0xA86A',
            chainName: 'Avalanche Mainnet C-Chain',
            nativeCurrency: {
              name: 'Avalanche',
              symbol: 'AVAX',
              decimals: 18
            },
            rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
            blockExplorerUrls: ['https://snowtrace.io/']
          }]
        });
    }
});

window.ethereum.on('chainChanged', () => window.location.reload());
window.ethereum.on('accountsChanged', (accounts) => {
    // If user has locked/logout from MetaMask, this resets the accounts array to empty
    if (!accounts.length) {
        main();
    }
});
const provider = new ethers.providers.Web3Provider(window.ethereum, "any");

provider.on("network", (newNetwork, oldNetwork) => {
    // When a Provider makes its initial connection, it emits a "network"
    // event with a null oldNetwork along with the newNetwork. So, if the
    // oldNetwork exists, it represents a changing network
    if (oldNetwork) {
        window.location.reload();
    }
});

const allowanceWallet = {
    address: "CONTRACT_ADDR",
    abi: [
        "function addAllowance(address addr, uint256 allowanceAmount, uint256 allowancePeriodInDays)",
        "function removeAllowance(address addr)",
        "function getPaidAllowance()",
        "function getAddrPaidableAmount(address addr) external view returns(uint)",
        "function withdrawFromWalletBalance(address pToken, uint amount)",
        "function withdrawAllFromWalletBalance(address pToken)",
        "function pause()",
        "function paused() view returns(bool)",
        "function unpause()",
        "function owner() view returns(address)",
        "function isAllowanceExist(address _addr) view returns(bool)"
    ]
}
async function setPauseUnpause(status) {
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    const allowanceWalletContract = new ethers.Contract(allowanceWallet.address, allowanceWallet.abi, signer);

    try {
        document.getElementById("txRespAdminPanel").style.display = "block";
        var tx;
        if (status == 1) {
            tx = await allowanceWalletContract.pause();
        }
        else {
            tx = await allowanceWalletContract.unpause();
        }
        console.log(`Transaction hash: ${tx.hash}`);
        document.getElementById("txRespAdminPanel").innerText += `\r\nTransaction hash: ${tx.hash}`;

        const receipt = await tx.wait();
        console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
        document.getElementById("txRespAdminPanel").innerText += `\r\nTransaction confirmed in block ${receipt.blockNumber}`;
    } catch (ex) {
        console.log(ex.error.message);
        document.getElementById("txRespAdminPanel").innerText += `\r\n${ex.error.message}`;
    }
}
async function getPaidAllowance() {

    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    const allowanceWalletContract = new ethers.Contract(allowanceWallet.address, allowanceWallet.abi, signer);

    try {
        document.getElementById("txRespGetPaid").style.display = "block";

        const tx = await allowanceWalletContract.getPaidAllowance();
        console.log(`Transaction hash: ${tx.hash}`);
        document.getElementById(
            "txRespGetPaid"
        ).innerText += `\r\nTransaction hash: ${tx.hash}`;

        const receipt = await tx.wait();
        console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
        document.getElementById(
            "txRespGetPaid"
        ).innerText += `\r\nTransaction confirmed in block ${receipt.blockNumber}`;
    } catch (ex) {
        console.log(ex.data.message);
        document.getElementById(
            "txRespGetPaid"
        ).innerText += `\r\n${ex.data.message}`;
    }

}
async function addAllowance() {
    var _addr = document.getElementById("tbxAllowanceAddr").value;
    var _period = document.getElementById("tbxAllowancePeriod").value;
    //var _token = document.getElementById("tbxAllowanceToken").value;

    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    const allowanceWalletContract = new ethers.Contract(allowanceWallet.address, allowanceWallet.abi, signer);
    try {
        var _amount = ethers.utils.parseUnits(document.getElementById("tbxAllowanceAmount").value);
        ethers.utils.getAddress(_addr);
        //ethers.utils.getAddress(_token);

        document.getElementById("txRespAdminPanel").style.display = "block";
        const tx = await allowanceWalletContract.addAllowance(_addr, _amount, _period);

        console.log(`Transaction hash: ${tx.hash}`);
        document.getElementById("txRespAdminPanel").innerText += `\r\nTransaction hash: ${tx.hash}`;

        const receipt = await tx.wait();
        console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
        document.getElementById("txRespAdminPanel").innerText += `\r\nTransaction confirmed in block ${receipt.blockNumber}`;
    } catch (ex) {
        console.log(ex.data.message);
        document.getElementById("txRespAdminPanel").innerText += `\r\n${ex.data.message}`;
    }
} async function removeAllowance() {
    var _addr = document.getElementById("tbxRemoveAllowanceAddr").value;

    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    const allowanceWalletContract = new ethers.Contract(allowanceWallet.address, allowanceWallet.abi, signer);
    try {
        ethers.utils.getAddress(_addr);

        document.getElementById("txRespAdminPanel").style.display = "block";
        const tx = await allowanceWalletContract.removeAllowance(_addr);

        console.log(`Transaction hash: ${tx.hash}`);
        document.getElementById("txRespAdminPanel").innerText += `\r\nTransaction hash: ${tx.hash}`;

        const receipt = await tx.wait();
        console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
        document.getElementById("txRespAdminPanel").innerText += `\r\nTransaction confirmed in block ${receipt.blockNumber}`;
    } catch (ex) {
        console.log(ex.data.message);
        document.getElementById("txRespAdminPanel").innerText += `\r\nError in tx ${ex.data.message}`;
    }
}
async function withdrawBalance() {
    var _token = document.getElementById("tbxWithdrawalToken").value;

    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    const allowanceWalletContract = new ethers.Contract(allowanceWallet.address, allowanceWallet.abi, signer);
    try {
        var _amount = ethers.utils.parseUnits(document.getElementById("tbxWithdrawalAmount").value);
        ethers.utils.getAddress(_token);

        document.getElementById("txRespAdminPanel").style.display = "block";
        var tx;
        if (_amount.isZero()) {
            tx = await allowanceWalletContract.withdrawAllFromWalletBalance(_token);
        }
        else {
            tx = await allowanceWalletContract.withdrawFromWalletBalance(_token, _amount);
        }
        console.log(`Transaction hash: ${tx.hash}`);
        document.getElementById("txRespAdminPanel").innerText += `\r\nTransaction hash: ${tx.hash}`;

        const receipt = await tx.wait();
        console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
        document.getElementById("txRespAdminPanel").innerText += `\r\nTransaction confirmed in block ${receipt.blockNumber}`;
    } catch (ex) {
        console.log(ex.data.message);
        document.getElementById("txRespAdminPanel").innerText += `\r\nError in tx ${ex.error.message}`;
    }
}
async function main() {
    /*=======
      CONNECT TO METAMASK
      =======*/

    if (document.getElementById("btnConnectWallet").innerText == "Disconnect") {

        document.getElementById("btnConnectWallet").innerText = "Connect Wallet";
        document.getElementById("divAdmin").style.display = "none";
        document.getElementById("divGetPaid").style.display = "none";
        document.getElementById("txRespAdminPanel").style.display = "none";
        document.getElementById("txRespGetPaid").style.display = "none";

        return;
    }
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    let userAddress = await signer.getAddress();
    document.getElementById("userAddress").innerText = userAddress;

    /*======
      INITIALIZING CONTRACT
      ======*/
    const allowanceWalletContract = new ethers.Contract(allowanceWallet.address, allowanceWallet.abi, signer);

    let _paidable = await allowanceWalletContract.getAddrPaidableAmount(userAddress);
    let _owner = await allowanceWalletContract.owner();

    if (_owner == userAddress) {
        let _isPaused = await allowanceWalletContract.paused();

        document.getElementById("lblPauseStatus").innerText = "Status : " + (_isPaused ? "Paused" : "Unpaused");

        document.getElementById("divAdmin").style.display = "block";
        document.getElementById("divGetPaid").style.display = "none";
    }
    else {
        if (_paidable.isZero()) {
            document.getElementById("btnGetPaid").disabled = true;
        }
        else {
            document.getElementById("btnGetPaid").disabled = false;
            document.getElementById("lblPaidableAmount").innerText = ethers.utils.formatUnits(_paidable.toString(), 18) + " USDT";
        }
        document.getElementById("divGetPaid").style.display = "block";
    }
    document.getElementById("btnConnectWallet").innerText = "Disconnect";
}