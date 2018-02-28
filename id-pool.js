module.exports = {
    /**
     * The purpose of creating ID pools is to ensure that all the IDs are unique,
     * *not* to give any context for the IDs.
     * 
     * The idea of creating different pools is that this is still a generic module
     * in which the different IDs are not dependent on unrelated changes.
     */
    create: () => createPool()
}
let poolCounter = 0;
const createPool = () => {
    const poolId = ++poolCounter;
    let counter = 0;
    return {
        nextId: () => `${poolId}#${++counter}`
    }
};
