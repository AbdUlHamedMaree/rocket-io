// eslint-disable-next-line @typescript-eslint/no-var-requires
const reactTsHero = require('eslint-config-react-ts-hero');

module.exports = [...reactTsHero, { ignores: ['node_modules', 'dist'] }];
