# json-to-constant

Create constants out of json files to be use as fixtures for unit tests, or however you see fit.

The available command line options are:
* ***--source*** (alias: **-s**, required) {string} - source folder path
* ***--output*** (alias: **-o**, optional) {string} - output folder path
    * If no output is provided source is used as the output folder.

This is a simple node program that takes Json files and create TS files exporting a constant with the json object as the value. It uses the name of the file as the name of the constant, for example:

* JSON file (people.json) 
```
{
    "name": "John Smith",
    "age": 45,
    "gender": "male"
}
```
* Created ts file
``` typescript
    export constant people = {
        'name': 'John Smith',
        'age': 45,
        'gender': 'male'
    };
```


## Using it via npm scripts ##
```
{
    "scripts": {
        "fixtures": "node_modules/json-to-constant -s fixtures"
    }
}
```