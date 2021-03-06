#!/usr/bin/env node
const through2 = require('through2');
const fs = require('fs');
const Glob = require('glob').Glob;
const argv = require('./arguments.js').argv;

const jsonPattern = '*.json';

/**
 * @class
 * @description
 */
class JsonToConstant {
    constructor(args) {
        debugger;
        this._defaultArguments(args);
        this._checkFoldersExist(args);
        this._findJsonFiles(args.source)
            // when a file match happens then we want to create the constant file
            .on('match', jsonFile => {
                debugger;
                let newFileName = jsonFile.replace('.json', '.ts');
                newFileName = this._replaceSourceWithOutput(newFileName, args.source, args.output);

                this._createMissingFolders(newFileName);
                this._createConstantFile(jsonFile, newFileName, args.uppercase);
            });
    }

    _createMissingFolders(fullFileName) {
        // split the file path to get all the individual folders in the path
        const trimmedFileName = fullFileName.startsWith('/')
            ? fullFileName.substring(1, fullFileName.length - 1)
            : fullFileName;
        let folderStructure = trimmedFileName.split('/');

        if (folderStructure.length <= 0) {
            return;
        }

        let folderPath = '';
        // now we can check for folder existence, if not present then we should create it.
        folderStructure.forEach(function(folder, index, array) {
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
     * @returns {void} - logs to the console when the given source does not exists
     */
    _checkFoldersExist(args) {
        if (!fs.existsSync(args.source)) {
            console.log(`Source: ${args.source} does not exists in the current directory`);
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
                console.log(`Error: ${error}`);
            }
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
     * @param {string} newFileName
     * @param {boolean} flag makeConstantName upper case
     */
    _createConstantFile(file, newFileName, uppercaseConstant) {
        // localizing the filepath so it can be used
        let filePath = file;
        let fileContent = [];
        // find the position of the last path separator (windows or unix)
        let lastPathSeparatorPos = filePath.lastIndexOf('/');
        if (lastPathSeparatorPos < 0) {
            lastPathSeparatorPos = filePath.lastIndexOf('\\');
        }
        // get the name of the file without the .json extension
        const fileName = filePath.substring(lastPathSeparatorPos + 1, filePath.lastIndexOf('.'));

        const constantName = fileName.toUpperCase().replace(/-/g, '_');

        fs.createReadStream(file)
            .pipe(
                through2.obj((file, encoding, cb) => {
                    //Dealing with a buffer
                    // escape single quotes
                    let content = file.toString().replace(/'/gi, "\\'");
                    // replace all double quotes with single quotes
                    content = content.replace(/"/gi, "'");

                    // add chunk to be passed to data
                    cb(null, content);
                })
            )
            .on('data', data => {
                // add to the file content collection
                fileContent.push(data);
            })
            .on('end', () => {
                // build out entire file content
                let content = fileContent.reduce((contentAccumulator, chunk) => {
                    contentAccumulator += chunk;
                    return contentAccumulator;
                }, '');

                // Write to new TS file
                fs.writeFile(newFileName, `export const ${constantName} = ${content};\n`, error => {
                    if (error) {
                        console.log(error);
                    }
                });
            });
    }
}

module.exports = new JsonToConstant(argv);
