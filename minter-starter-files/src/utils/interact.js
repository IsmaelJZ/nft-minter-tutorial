import {pinJSONToIPFS} from './pinata.js'
import {ethers} from "ethers"

const nftContractABI = require('../nftcollectioncontract-abi.json');
const myMarketContractABI = require(`../nft212market-abi.json`);
const nftContractAddress = "0x22Bd1731d41aA8ddbaBF6ad265AB1e83D55e8Fc8";
const marketContractAddress = `0x90b56f6F0eC38331B9011EcE56A025AE7941613A`;

export const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const addressArray = 
          await window.ethereum.request({method: "eth_requestAccounts",}); //This function will open up Metamask in the browser,
        const obj = {
          status: "👆🏽 Write a message in the text-field above.",
          address: addressArray[0],
        };
        return obj;
      } catch (err) {
        return {
          address: "",
          status: "😥 " + err.message,
        };
      }
    } else {
      return {
        address: "",
        status: (
          <span>
            <p>
              {" "}
              🦊{" "}
              <a target="_blank" href={`https://metamask.io/download.html`}>
                You must install Metamask, a virtual Ethereum wallet, in your
                browser.
              </a>
            </p>
          </span>
        ),
      };
    }
  };

export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      const addressArray = 
        await window.ethereum.request({method: "eth_accounts",}); //returns an array containing the Metamask addresses currently connected to our dApp
      if (addressArray.length > 0) {
        return {
          address: addressArray[0],
          status: "👆🏽 Write a message in the text-field above.",
        };
      } else {
        return {
          address: "",
          status: "🦊 Connect to Metamask using the top right button.",
        };
      }
    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a target="_blank" href={`https://metamask.io/download.html`}>
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};

export const mintNFT = async (url, name, description) => {
  //error handling
  if (url.trim() == "" || (name.trim() == "" || description.trim() == "")) { 
    return {
     success: false,
     status: "❗Please make sure all fields are completed before minting.",
    }
  }

  //make metadata
  const metadata = new Object();
  metadata.name = name;
  metadata.image = url;
  metadata.description = description;

  //make pinata call
  const pinataResponse = await pinJSONToIPFS(metadata);
  if (!pinataResponse.success) {
      return {
          success: false,
          status: "😢 Something went wrong while uploading your tokenURI.",
      }
  } 
  
  const tokenURI = pinataResponse.pinataUrl;
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  
  const nftContract = new ethers.Contract(nftContractAddress, nftContractABI, provider.getSigner());
  nftContract.attach(provider.getSigner());
  
//  const addressArray = await window.ethereum.request({
//    method: "eth_requestAccounts",
//  });

  try{
    let nftTxn = await nftContract.createToken(tokenURI);
    await nftTxn.wait();
    return {
      success: true,
      status: "✅ " + nftTxn.hash
    };
  } catch (error) {
    return {
      success: false,
      status: "😥 Something went wrong: " + error.message
    };
  }
};

export const mintNFTWithRoyalty = async (url, name, description, fee) => {
  //error handling
  if (url.trim() == "" || (name.trim() == "" || description.trim() == "")) { 
    return {
     success: false,
     status: "❗Please make sure all fields are completed before minting.",
    }
  }

  if(fee.trim() == ""){

    return {
      success: false,
      status: "❗For this token fee is necesary.",
     }
  }
  //make metadata
  const metadata = new Object();
  metadata.name = name;
  metadata.image = url;
  metadata.description = description;

  //make pinata call
  const pinataResponse = await pinJSONToIPFS(metadata);
  if (!pinataResponse.success) {
      return {
          success: false,
          status: "😢 Something went wrong while uploading your tokenURI.",
      }
  } 
  
  const tokenURI = pinataResponse.pinataUrl;
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  
  const nftContract = new ethers.Contract(nftContractAddress, nftContractABI, provider.getSigner());
  nftContract.attach(provider.getSigner());
  
//  const addressArray = await window.ethereum.request({
//    method: "eth_requestAccounts",
//  });

  try{
    let nftTxn = await nftContract.createTokenWithRoyalty(tokenURI, fee);
    await nftTxn.wait();
    return {
      success: true,
      status: "✅ " + nftTxn.hash
    };
  }catch (error){
    return {
      success: false,
      status: "😥 Something went wrong: " + error.message
    };
  }
};

export const putOnSell = async (tokenId, price) => {
  if (tokenId.trim() == "" || price.trim() == "") { 
    return {  
     success: false,
     status: "❗tokenId and price are requiered",
    }
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const myMarketContract = new ethers.Contract(marketContractAddress, myMarketContractABI, provider.getSigner());
  //myMarketContract.attach(provider.getSigner());

  try{
    let marketTxn = await myMarketContract.createMarketItemTest(price);
    //await marketTxn.wait();
    return {
      success: true,
      status: "✅ " + marketTxn.hash
    };
  }catch (error){
    return {
      success: false,
      status: "😥 Something went wrong: " + error.message
    };
  }
};

export const infoToken = async (tokenId) => {
  //error handling
  if(tokenId.trim() == ""){
    return {
      success: false,
      status: "❗TokenId is required.",
     }
  }
  
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const nftContract = new ethers.Contract(nftContractAddress, nftContractABI, provider.getSigner());
  nftContract.attach(provider.getSigner());
  
  const marketContract = new ethers.Contract(marketContractAddress, myMarketContractABI, provider.getSigner());
  marketContract.attach(provider.getSigner());

  try{
    let ownerOfToken = await nftContract.ownerOf(tokenId);
    let tokenURI = await nftContract.tokenURI(tokenId);
    let isApproval = await nftContract.isApprovedForAll(ownerOfToken, marketContractAddress)
    let marketItem = await marketContract.getMarketItemById(tokenId);
    return {
      success: true,
      status: `owner: ${ownerOfToken} tokenURI: ${tokenURI} isApproval: ${isApproval} MarketItem: ${marketItem}`
    }
  }catch (error){
    return {
      success: false,
      status: "😥 Something went wrong: " + error.message
    }
  }
};