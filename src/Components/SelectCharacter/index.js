import React, {useEffect, useState} from "react";
import { ethers } from "ethers";
import './SelectCharacter.css';
import { CONTRACT_ADDRESS, transformCharacterData } from "../../constants";
import abi from '../../utils/NFTGame.json'

const SelectCharacter = ({ setCharacterNFT }) => {
    const [characters, setCharacters] = useState([]);
    const [gameContract, setGameContract] = useState(null);

    // Render the fetched characters
    const renderCharacters = () => 
        characters.map((character, index) => (
            <div className="character-item"key={character.name}>
                <div className="name-container">
                    <p>{character.name}</p>
                </div>
                <img src={character.imageURI} alt={character.name}/>
                <button
                    type="button"
                    className="character-mint-button"
                    onClick={mintCharacterNFTAction(index)}
                >{`Mint ${character.name}`}</button>
            </div>
        ));

    // Mint character on button click
    // Actions
    const mintCharacterNFTAction = (characterId) => async () => {
        try {
            if (gameContract) {
                console.log('Minting character in progress...');
                const mintTxn = await gameContract.mintCharacterNFT(characterId);
                await mintTxn.wait();
                console.log('mintTxn:', mintTxn);
            }
        } catch (error) {
            console.warn('MintCharacterAction Error:', error);
        }
    };

    // Set a reuseable contract object
    useEffect (() => {
        const {ethereum} = window;

        if (ethereum) {
            // "Provider" is Ethereum nodes, provided by MetaMask in the background
            // Used to send/recieve data from our deployed contract
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            // "Signer" is an abstraction of an ethereum account
            const signer = provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, abi.abi, signer);
            setGameContract(contract);
        } else {
            console.log("Ethereum object not found!");
        }
    }, []);

    // Fetch all characters from contract
    useEffect(() => {
        const getCharacters = async () => {
            try{
                console.log("Getting contract characters...");
                // Call charracter to get all mintable characters
                const charactersTxn = await gameContract.getAllDefaultCharacters();
                console.log("Character Txn : ", charactersTxn);

                // Go through all charaters and transform the data
                const character = charactersTxn.map((characterData) =>
                    transformCharacterData(characterData)
                );
                // Set mintable characters
                setCharacters(character);
            } catch (error) {
                console.log("Something went wrong while fetching characters: ",error);
            }
        };

        // Callback function that will get triggered when character is minted
        const onCharacterMint = async (sender, tokenId, characterIndex) => {
            alert(`Your NFT is all done -- see it here: https://testnets.opensea.io/assets/${gameContract}/${tokenId.toNumber()}`)
            console.log(
                `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
            );
            if (gameContract) {
                const characterNFT = await gameContract.checkIfPlayerHasNFT();
                console.log("Character NFT : ", characterNFT);
                setCharacterNFT(transformCharacterData(characterNFT));
            }
        };

        if (gameContract) {
            getCharacters();
            // Set up NFT minted listener
            gameContract.on("CharacterNFTMinted", onCharacterMint);
        }

        return () => {
            if (gameContract) {
                gameContract.off('CharacterNFTMinted', onCharacterMint);
            }
        };
    }, [gameContract]);

    return(
        <div className="select-character-container">
            <h2>Mint Your Sorcerer. Choose wisely.</h2>
            {/* Only show this when there are characters in state */}
            {characters.length > 0 && (
                <div className="character-grid">
                    {renderCharacters()}
                </div>
            )}
        </div>
    );
};

export default SelectCharacter;