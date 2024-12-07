import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [depositAmount, setDepositAmount] = useState(""); // Separate state for deposit amount
  const [withdrawAmount, setWithdrawAmount] = useState(""); // Separate state for withdraw amount

  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // Get contract reference
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      const balanceInWei = await atm.getBalance();
      const balanceInEth = ethers.utils.formatEther(balanceInWei);
      setBalance(Number(balanceInEth).toFixed(2));
    }
  };

  const deposit = async () => {
    if (atm) {
      const depositAmountWei = ethers.utils.parseEther(depositAmount); // Convert to Wei
      let tx = await atm.deposit(depositAmountWei);
      await tx.wait();
      getBalance();
      
      // Clear the deposit input field after transaction is completed
      setDepositAmount("");
    }
  };

  const withdraw = async () => {
    if (atm) {
      const withdrawAmountWei = ethers.utils.parseEther(withdrawAmount); // Convert to Wei
      let tx = await atm.withdraw(withdrawAmountWei);
      await tx.wait();
      getBalance();
      
      // Clear the withdraw input field after transaction is completed
      setWithdrawAmount("");
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install MetaMask to use this application.</p>;
    }

    if (!account) {
      return <button onClick={connectAccount}>Connect MetaMask</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance} ETH</p>

        <div>
          <h3>Deposit</h3>
          <input
            type="text"
            placeholder="Amount in ETH"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
          />
          <button onClick={deposit}>Deposit</button>
        </div>

        <div>
          <h3>Withdraw</h3>
          <input
            type="text"
            placeholder="Amount in ETH"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />
          <button onClick={withdraw}>Withdraw</button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the MetaMask ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}
