const fs = require('fs');
module.exports = {
    /**
     * Reads config files in format:
     * ~~~~
     * # comment
     * key = value
     * ~~~~
     * 
     * The file can have either LN or CRLN line endings
     * 
     * Returns a structure like
     * { 'key' : evaluatedValue }
     * 
     * Note that the value is evaluated on JS side making it
     * possible to write JS in the config file, thus making it
     * possible e.g. access environment variables without coming
     * up with an arbitrary syntax.
     */
    read: path => readConfig(path)
};
const readConfig = path => {
    const configStr = fs.readFileSync(path) + '';
    const splitter = (s, d) => {
        const i = s.indexOf(d);
        return i === -1
            ? undefined
            : [s.substr(0, i).trim(), s.substr(i + 1).trim()];
    };
    const config = {};
    configStr
        .split(/\n|\r\n/)
        .filter(line => line.trim()[0] !== '#')
        .map(line => splitter(line, '='))
        .filter(res => res !== undefined)
        .forEach(res => config[res[0]] = eval(`(${res[1]})`));
    return config;
};
