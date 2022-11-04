import { useEffect, useState } from "react";
import { connectWallet, getCurrentWalletConnected, mintNFT, mintNFTWithRoyalty, putOnSell, infoToken } from "./utils/interact.js";

const Minter = (props) => {

  //State variables
  const [walletAddress, setWallet] = useState(""); //string that stores the user's wallet address
  const [status, setStatus] = useState(""); //string that contains a message to display at the bottom of the UI
  const [name, setName] = useState(""); //string that stores the NFT's name
  const [description, setDescription] = useState(""); //string that stores the NFT's description
  const [url, setURL] = useState(""); //string that is a link to the NFT's digital asset
  const [fee, setFee] = useState(""); //integer that store amout fee, when NFT is minted
  const [tokenId, setTokenId] = useState(""); //integer that contain the token id to push to sell or buy
  const [price, setPrice] = useState("");//integer that contain the price for NFT when send to sell

  useEffect(async () => {
    const {address, status} = await getCurrentWalletConnected();
    setWallet(address)
    setStatus(status);

    addWalletListener();  
  }, []);

  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet();
    setStatus(walletResponse.status);
    setWallet(walletResponse.address);
  };

  const onMintPressed = async () => { //TODO: implement
    const { status } = await mintNFT(url, name, description);
    setStatus(status);
  };

  const onMintRoyaltyPressed = async () => { //TODO: implement
    const { status } = await mintNFTWithRoyalty(url, name, description,fee);
    setStatus(status);
  };

  const onPutOnSellPressed = async () => {
    const { status } = await putOnSell(tokenId, price);
    setStatus(status);
  };

  const onInfoTokenPressed = async () => {
    const {status} = await infoToken(tokenId);
    setStatus(status);
  }

  function addWalletListener() {
    if (window.ethereum) {
      // listens for state changes in the Metamask wallet, which include when the user 
      // connects an additional account to the dApp, switches accounts, or disconnects an account
      window.ethereum.on("accountsChanged", (accounts) => { 
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setStatus("👆🏽 Write a message in the text-field above.");
        } else {
          setWallet("");
          setStatus("🦊 Connect to Metamask using the top right button.");
        }
      });
    } else {
      setStatus(
        <p>
          {" "}
          🦊{" "}
          <a target="_blank" href={`https://metamask.io/download.html`}>
            You must install Metamask, a virtual Ethereum wallet, in your
            browser.
          </a>
        </p>
      );
    }
  }

  return (
    <div className="Minter">
      <button id="walletButton" onClick={connectWalletPressed}>
        {walletAddress.length > 0 ? (
          "Connected: " +
          String(walletAddress).substring(0, 6) +
          "..." +
          String(walletAddress).substring(38)
        ) : (
          <span>Connect Wallet</span>
        )}
      </button>

      <br></br>
      <h1 id="title">🧙‍♂️ Alchemy NFT Minter</h1>
      <p>
        Simply add your asset's link, name, and description, then press "Mint."
      </p>
      <form>
        <h2>🖼 Link to asset: </h2>
        <input
          type="text"
          placeholder="e.g. https://gateway.pinata.cloud/ipfs/<hash>"
          onChange={(event) => setURL(event.target.value)}
        />
        <h2>🤔 Name: </h2>
        <input
          type="text"
          placeholder="e.g. My first NFT!"
          onChange={(event) => setName(event.target.value)}
        />
        <h2>✍️ Description: </h2>
        <input
          type="text"
          placeholder="e.g. Even cooler than cryptokitties ;)"
          onChange={(event) => setDescription(event.target.value)}
        />
        <h2>Fee</h2>
        <input
          type="text"
          placeholder="set Fee"
          onChange={(event) => setFee(event.target.value)}
        />
        <h2>TokenId</h2>
        <input
          type="text"
          placeholder="tokenId"
          onChange={(event) => setTokenId(event.target.value)}
        />
        <h2>price</h2>
        <input
          type="text"
          placeholder="price"
          onChange={(event) => setPrice(event.target.value)}
        />
      </form>
      <button id="mintButton" onClick={onMintPressed}>
        Mint NFT
      </button>
      <button id="mintRoyaltyButton" onClick={onMintRoyaltyPressed}>
        Mint NFT with Royalty
      </button>
      <button id="putOnSellButton" onClick={onPutOnSellPressed}>
        Put on Sale
      </button>
      <button id="infoTokenButton" onClick={onInfoTokenPressed}>
        Info Token
      </button>
      <p id="status">
        {status}
      </p>
    </div>
  );
};

export default Minter;
