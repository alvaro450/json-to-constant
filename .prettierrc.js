module.exports = {
    singleQuote: true,
    bracketSpacing: true,
    printWidth: 120,
    semi: true,
    tabWidth: 4,
    trailingComma: 'none',
    overrides: [
      {
        files: '*.json',
        options: {
          parser: 'json',
          singleQuote: false
        }
      }
    ]
  };
  