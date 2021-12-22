const CONTRACT_ADDRESS = "0x6960aB9260bf9645F328D7623f66f9Bd9A76EA55";

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