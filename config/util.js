module.exports = class Util {
    static getIp() {
        const interfaces = require('os').networkInterfaces();
        let IPAddress = '';
        for (const devName in interfaces) {
            const iface = interfaces[devName];
            for (let i = 0; i < iface.length; i++) {
                const alias = iface[i];
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                    IPAddress = alias.address;
                }
            }
        }
        return IPAddress;
    }

};
