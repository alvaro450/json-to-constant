const jsonToConstantArgs = require('yargs')
.usage('Usage: $0 <command> [options]')
// require three commands --
//.demandCommand(3)
.alias('s', 'source')
.describe('s', 'Source path of files to load')
.alias('o', 'output')
.describe('o', 'Output path');

module.exports = jsonToConstantArgs;

