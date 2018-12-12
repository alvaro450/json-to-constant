# json-to-constant

Create constants out of json files to be use as fixtures for unit tests, or however you see fit.

The available command line options are:

-   **_--source_** (alias: **-s**, required) {string} - source folder path
-   **_--output_** (alias: **-o**, optional) {string} - output folder path
-   **_--uppercase_** (alias: **-u**, optional) {boolean} - flag to indicate if constant name should be all uppercase (ex. MY_CONSTANT vs my_constant)

    -   If no output is provided source is used as the output folder.

This is a simple node program that takes Json files and create TS files exporting a constant with the json object as the value. It uses the name of the file as the name of the constant, for example:

-   JSON file (people.json)

```
{
    "name": "John Smith",
    "age": 45,
    "gender": "male"
}
```

-   Created ts file

```typescript
    export constant people = {
        'name': 'John Smith',
        'age': 45,
        'gender': 'male'
    };
```

## Using it via npm scripts

```
{
    "scripts": {
        "fixtures": "json-to-constant -s fixtures -o converted-fixtures -u false"
    }
}
```
