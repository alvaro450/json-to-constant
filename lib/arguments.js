const jsonToConstantArgs = require('yargs')
    .usage('Usage: $0 <command> [options]')
    // require three commands --
    //.demandCommand(3)
    .alias('s', 'source')
    .describe('s', 'Source path of files to load')
    .alias('o', 'output')
    .describe('o', 'Output path')
    .alias('u', 'uppercase')
    .default('u', true)
    .describe('u', 'Flag to indicate if constant name should be all uppercase (ex. MY_CONSTANT vs my_constant)');

module.exports = jsonToConstantArgs;
