module.exports = {
    get: () => getRandomName()
}

const getRandomName = () => {
    const names = [
        'Fergus', 'Walter', 'Victor', 'Alastair', 'Nicolas',
        'Carter', 'Earl', 'Andreas', 'Crawford',
        'Jexica', 'Marza', 'Aeyana', 'Deabora', 'Aymee',
        'Sarina', 'Kyndle', 'Saevi', 'Aracelle', 'Aera',
        'Alexander', 'Demetrius', 'Damon', 'Dommik', 'Orsova',
        'Barnabas', 'Garth', 'Ghislaine', 'Perseus', 'Maxwell',
        'Aurelia', 'Rosalie', 'Liliana', 'SarahAnn', 'Scarlett',
        'Druilla', 'Kavita', 'Cordelia', 'Florence', 'Faline',
    ];
    return names[Math.trunc(names.length * Math.random())];
};