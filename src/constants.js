const CONTRACT_ADDRESS = '0xE529A0B954Dc6035Ab86A76e759b3496B3720124';

const transformCharacterData = (characterData) => {
    return {
        name: characterData.name,
        imageURI: characterData.imageURI,
        hp: characterData.hp.toNumber(),
        maxHp: characterData.maxHp.toNumber(),
        attackDamage: characterData.attackDamage.toNumber()
    };
};

export { CONTRACT_ADDRESS, transformCharacterData };