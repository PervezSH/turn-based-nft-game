import React, {useEffect, useState} from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import swordLogo from './assets/sword.png';
import './App.css';
import SelectCharacter from './Components/SelectCharacter';
import Arena from './Components/Arena';
import { CONTRACT_ADDRESS , transformCharacterData} from './constants';
import abi from './utils/NFTGame.json';
import { ethers } from 'ethers';
import LoadingIndicator from './Components/LoadingIndicator';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [walletConnect, setWalletConnect] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Checkin if wallet is connected or not
  const checkIfWalletIsConnected = async() => {
    try{
      // First make sure we have access to window.ethereum
      // MetaMask automatically injects an special object named ethereum
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have metamask!");
        setIsLoading(false);
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      // Check if user is connected to rinkeby test network
      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainId);

      // String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = "0x4"; 
      if (chainId !== rinkebyChainId) {
        alert("Please connect to the Rinkeby Test Network!");
      }
      
      // Checking if we're authorized to acess the user's wallet
      const accounts = await ethereum.request({ method: 'eth_accounts'});
      if (accounts.length !== 0){
        const account = accounts[0];
        console.log("Found an authorized account: ", account);
        setWalletConnect(true);
      }else{
        console.log("No authorized account found!");
      }
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  }

  //Connects my wallet to this site
  const connectWallet = async() => {
    try{
      // Looking for ethereum object
      const {ethereum} = window;
      if (!ethereum) {
        alert("Get MetaMask");
        return;
      }
      // If we find MetaMask, ask MetaMask to give access to user's wallet
      const accounts = await ethereum.request({method: "eth_requestAccounts"});
      console.log("Connected : ",accounts[0]);
      setCurrentAccount(accounts[0]);
    }catch(error){
      console.log(error);
    }
  }

  // Render Methods
  const renderContent = () => {
    // If app is currently loading, just render laoding indicator
    if (isLoading) {
      return <LoadingIndicator />;
    }

    // If wallet is connected
    if (!currentAccount) {
      const buttonText = walletConnect ? "Play" : "Connect Wallet To Play";
      return (
        <div className="connect-wallet-container">
          <img
            src="https://i.imgur.com/d4VT4dn.gif"
            alt="Hora Hora Gif"
          />
          {/* Button that trigger wallet connect */}
          <button
            className="cta-button connect-wallet-button"
            onClick={connectWallet}
          >
            {buttonText}
          </button>
        </div>
      );
    } 
    // If wallet is connected but player has no character NFT
    else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
    }
    // If there is a connected wallet and characterNF
    else if (currentAccount && characterNFT) {
      return <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT}/>;
    }
  }

  useEffect(() => {
    setIsLoading(true);
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      console.log("Checking for character NFT on address: ",currentAccount);

      // "Provider" is Ethereum nodes, provided by MetaMask in the background
      // Used to send/recieve data from our deployed contract
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      // "Signer" is an abstraction of an ethereum account
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(CONTRACT_ADDRESS, abi.abi, signer);

      const txn = await gameContract.checkIfPlayerHasNFT();
      if (txn.name) {
        console.log("%s has character NFT", currentAccount);
        setCharacterNFT(transformCharacterData(txn));
      } else {
        console.log("No character NFT found!");
      }

      setIsLoading(false);
    }

    // Run the above function only if we have a connected wallet
    if (currentAccount) {
      console.log("Current Account : ",currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">
            <img className='sword-logo' src={swordLogo} alt="⚔️"/>
              Metaverse Sorcerers
            <img className='sword-logo' src={swordLogo} alt="⚔️"/>
            </p>
          <p className="sub-text">Team up to protect the Metaverse from Cursed Spirits!</p>
          {renderContent()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built with @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
