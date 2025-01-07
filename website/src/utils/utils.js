const parseLineColorCode = (line) => {
    const colorMap = {
        '§0': '#000000', // black
        '§1': '#0000AA', // dark blue
        '§2': '#00AA00', // dark green
        '§3': '#00AAAA', // dark aqua
        '§4': '#AA0000', // dark red
        '§5': '#AA00AA', // dark purple
        '§6': '#FFAA00', // gold
        '§7': '#AAAAAA', // gray
        '§8': '#555555', // dark gray
        '§9': '#5555FF', // blue
        '§a': '#55FF55', // green
        '§b': '#55FFFF', // aqua
        '§c': '#FF5555', // red
        '§d': '#FF55FF', // light Purple
        '§e': '#FFFF55', // yellow
        '§f': '#FFFFFF', // white
    };

    const styleMap = {
        '§l': 'font-weight: bold;',
        '§n': 'text-decoration: underline;',
        '§o': 'font-style: italic;',
        '§k': 'text-transform: uppercase;',
    };

    const resetCode = '§r';

    let result = '';
    let currentStyles = [];
    const tokens = line.split(/(§[0-9a-flnokmr])/g);
    tokens.forEach(token => {
        if (token.startsWith('§')) {
            if (colorMap[token]) {
                currentStyles.push(`color: ${colorMap[token]}`);
            } else if (styleMap[token]) {
                currentStyles.push(styleMap[token]);
            } else if (token === resetCode) {
                currentStyles = [];
            }
        } else {
            if (currentStyles.length > 0) {
                result += `<span style="${currentStyles.join(';')}">${token}</span>`;
            } else {
                result += token;
            }
        }
    });
    return result;
}

const parseLinesColorCode = (lines) => {
    return lines.map(line => parseLineColorCode(line));
}

export {
    parseLineColorCode,
    parseLinesColorCode,
}