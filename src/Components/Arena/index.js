import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants';
import abi from '../../utils/NFTGame.json';
import './Arena.css';
import LoadingIndicator from '../../Components/LoadingIndicator';

const Arena = ({ characterNFT, setCharacterNFT}) => {
    // State
    const [gameContract, setGameContract] = useState(null);
    const [boss, setBoss] = useState(null);
    const [attackState, setAttackState] = useState('');
    const [showToast, setShowToast] = useState(false);

    const runAttackAction = async () => {
        try {
            if (gameContract) {
                setAttackState('attacking');
                console.log('Attacking boss...');
                const attackTxn = await gameContract.attackBoss();
                await attackTxn.wait();
                console.log('attackTxn:', attackTxn);
                setAttackState('hit');

                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                }, 5000);
            }
          } catch (error) {
                console.error('Error attacking boss:', error);
                setAttackState('');
            }
    };

    // UseEffects
    useEffect(() => {
        const { ethereum } = window;
        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                abi.abi,
                signer
        );

        setGameContract(contract);
        } else {
            console.log('Ethereum object not found');
        }
    }, []);

    useEffect(() => {
        // Setup async function that will get the boss from our contract and sets in state
        const fetchBoss = async () => {
            const bossTxn = await gameContract.getBigBoss();
            console.log('Boss:', bossTxn);
            setBoss(transformCharacterData(bossTxn));
        };

        const onAttackComplete = (newBossHp, newPlayerHp) => {
            const bossHp = newBossHp.toNumber();
            const playerHp = newPlayerHp.toNumber();

            console.log(`AttackComplete: Boss Hp: ${bossHp} Player Hp: ${playerHp}`);

            /*
            * Update both player and boss Hp
            */
            setBoss((prevState) => {
                return { ...prevState, hp: bossHp };
            });

            setCharacterNFT((prevState) => {
                return { ...prevState, hp: playerHp };
            });
        };
      
        if (gameContract) {
            // gameContract is ready to go! Let's fetch our boss
            fetchBoss();
            gameContract.on('AttackComplete', onAttackComplete);
        }

        return () => {
            if (gameContract) {
                gameContract.off('AttackComplete', onAttackComplete);
            }
        }
        // eslint-disable-next-line
    }, [gameContract]);

    return (
        <div className="arena-container">
            {boss && characterNFT && (
            <div id="toast" className={showToast ? 'show' : ''}>
                <div id="desc">{`💥 ${boss.name} was hit for ${characterNFT.attackDamage}!`}</div>
            </div>
            )}
            {/* Boss */}
            {boss && (
                <div className="boss-container">
                    <div className={`boss-content ${attackState}`}>
                    <h2>🔥 {boss.name} 🔥</h2>
                    <div className="image-content">
                        <img src={boss.imageURI} alt={`Boss ${boss.name}`} />
                        <div className="health-bar">
                        <progress value={boss.hp} max={boss.maxHp} />
                        <p>{`${boss.hp} / ${boss.maxHp} HP`}</p>
                        </div>
                    </div>
                    </div>
                    {(attackState === 'attacking') ? (
                    <div className="loading-indicator">
                        <LoadingIndicator />
                        <p>Attacking ⚔️</p>
                    </div>) : (
                        <div className="attack-container">
                            <button className="cta-button" onClick={runAttackAction}>
                                {`💥 Attack ${boss.name}`}
                            </button>
                        </div>
                    )
                    }
                </div>
                )}

            {/* Character NFT */}
            {characterNFT && (
                <div className="players-container">
                    <div className="player-container">
                    <h2>Your Character</h2>
                    <div className="player">
                        <div className="image-content">
                        <h2>{characterNFT.name}</h2>
                        <img
                            src={characterNFT.imageURI}
                            alt={`Character ${characterNFT.name}`}
                        />
                        <div className="health-bar">
                            <progress value={characterNFT.hp} max={characterNFT.maxHp} />
                            <p>{`${characterNFT.hp} / ${characterNFT.maxHp} HP`}</p>
                        </div>
                        </div>
                        <div className="stats">
                        <h4>{`⚔️ Attack Damage: ${characterNFT.attackDamage}`}</h4>
                        </div>
                    </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Arena;