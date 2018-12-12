const fs = require('fs-extra');
const path = require('path');

// setup a temp folder to run the tests on

describe('Json to Constant', () => {
    const tempFolder = 'test-folder';
    const fixturesFolder = 'fixtures';
    let testFixturesFolder;
    let testFolderPath;
    let cwd;

    beforeAll(() => {
        cwd = process.cwd();
        testFolderPath = path.join(cwd, tempFolder);

        // prepare a tmp folder
        if (!fs.existsSync(testFolderPath)) {
            // create directory
            fs.mkdirSync(testFolderPath);
        }

        // change to created directory
        process.chdir(testFolderPath);

        testFixturesFolder = path.join(testFolderPath, fixturesFolder);

        // copy the fixtures folder into it
        fs.copySync(path.join(cwd, fixturesFolder), testFixturesFolder);
    });

    afterAll(() => {
        // delete the temp folder
        fs.removeSync(testFolderPath);
    });

    describe('file creation', () => {
        beforeAll(() => {
            process.argv = [...process.argv, '-s', fixturesFolder, '-u', 'false'];
            require('./json-to-constant');
        });

        it('should create .ts file', done => {
            setTimeout(() => {
                // check to make sure files were created
                expect(fs.existsSync(path.join(testFixturesFolder, 'many-people.ts'))).toBeTruthy();
                expect(fs.existsSync(path.join(testFixturesFolder, 'people.ts'))).toBeTruthy();
                expect(fs.existsSync(path.join(testFixturesFolder, 'nested', 'people2.ts'))).toBeTruthy();
                expect(fs.existsSync(path.join(testFixturesFolder, 'nested', 'deep', 'people3.ts'))).toBeTruthy();
                done();
            }, 2000);
        });
    });
});
