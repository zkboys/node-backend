module.exports = function (dbType) {
    if (!dbType) return;

    let typeStr = dbType.toString();

    if (!typeStr) return;

    typeStr = typeStr.toLocaleLowerCase();

    if (
        typeStr.startsWith('char') ||
        typeStr.startsWith('varchar') ||
        typeStr.startsWith('text')
    ) return 'string';

    if (!typeStr.includes('(') && !typeStr.includes(' ')) return typeStr;
};
