//const pkg = require('./package.json');
const through2 = require('through2');
const fs = require('fs');
var Glob = require("glob").Glob
const argv = require('yargs')
    .usage('Usage: $0 <command> [options]')
    // require three commands --
    //.demandCommand(3)
    .alias('s', 'source')
    .describe('s', 'Source path of files to load')
    .alias('o', 'output')
    .describe('o', 'Output path')
    .argv;

const jsonPattern = '*.json';

/**
 * @class
 * @description 
 */
class JsonToConstant {
    constructor(args) {
        let foundJsonFiles;

        this._defaultArguments(args);
        this._checkFoldersExist(args);
        this._findJsonFiles(args.source)
            // when a file match happens then we want to create the constant file
            .on('match', (jsonFile) => {
                let newFileName = jsonFile.replace('.json', '.ts');
                newFileName = this._replaceSourceWithOutput(newFileName, args.source, args.output);
              
                this._createMissingFolders(newFileName);

                this._createConstantStream(jsonFile)
                    .pipe(fs.createWriteStream(newFileName));
            });
    }

    _createMissingFolders(fullFileName) {
        // split the file path to get all the individual folders in the path
        let folderStructure = fullFileName.split('/');

        if (folderStructure.length <= 0) {
            return;
        }

        let folderPath = '';
        // now we can check for folder existence, if not present then we should create it.
        folderStructure.forEach(function (folder, index, array) {
            // if we are on the last item, the item would be the fileName which we should not be creating here
            if (index + 1 === array.length) {
                return;
            }
            // start making up the folder path (ie. previous value: 'home', current value: 'parts', concat value: 'home/parts')
            folderPath += index > 0 ? `/${folder}` : folder;
            // create the folder if it does not exists.
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath);
            }
        });
    }

    /**
     * @description make sure the specified folders exists on disk
     * @param {Object} args - arguments pass to the function
     * @throws {Error} - throws when a source/output do not exists
     */
    _checkFoldersExist(args) {
        if (!fs.existsSync(args.source)) {
            throw new Error(`Source: ${args.source} does not exists in the current directory`);
        }
    }

    /**
     * @description check if source is different than source
     * @param {string} source 
     * @param {string} output 
     * @returns {boolean}
     */
    _isOutputDifferentThanSource(source, output) {
        return source !== output;
    }

    /**
    * @description default argument values when some are not provied
    * @param {Object} args - arguments pass to the function
    * @returns {void}
    */
    _defaultArguments(args) {
        // if there is no output specified, default to the source
        if (!args.output) {
            args.output = args.source;
        }
    }

    /**
     * @description 
     * @param {string} source
     * @param {string} output
     * @returns {EventEmitter}
     */
    _findJsonFiles(source, ouput) {
        let pattern = `${source}/**/${jsonPattern}`;
        let options = {};

        // look for the files constructed by the pattern 'sourceFolder/*.json'
        return new Glob(pattern, options, (error, matches) => {
            if (error) {
                console.log(`Error: ${error}`)
            };
        });
    }

    /**
     * @description replace the source folder name with the output folder name only when they are different
     * @param {string} fullFileName 
     * @param {string} source 
     * @param {string} output 
     * @returns {string}
     */
    _replaceSourceWithOutput(fullFileName, source, output) {
        if (this._isOutputDifferentThanSource(source, output)) {
            fullFileName = fullFileName.replace(source, output);
        }

        return fullFileName;
    }

    /**
     * @description generate const file stream
     * @param {string} file
     * @returns {Stream}
     */
    _createConstantStream(file) {
        // localizing the filepath so it can be used
        let filePath = file;

        return fs.createReadStream(file)
            .pipe(through2.obj((file, encoding, cb) => {
                //Dealing with a buffer
                // take content
                let fileName, fileContent, exportStmt, lastPathSeparatorPos;

                // find the position of the last path separator (windows or unix)
                lastPathSeparatorPos = filePath.lastIndexOf('/');
                if (lastPathSeparatorPos < 0) {
                    lastPathSeparatorPos = filePath.lastIndexOf('\\');
                }

                // escape single quotes
                fileContent = file.toString().replace(/'/gi, '\\\'');
                // replace all double quotes with single quotes
                fileContent = fileContent.replace(/"/gi, '\'');
                // get the name of the file without the .json extension
                fileName = filePath.substring(lastPathSeparatorPos + 1, filePath.lastIndexOf('.'));
                // build const to be written to new TS file
                exportStmt = `export const ${fileName} = ${fileContent};\n`;

                cb(null, exportStmt);
            }));
    }
}

module.exports = new JsonToConstant(argv);