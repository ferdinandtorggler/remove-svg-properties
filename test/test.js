var removeColors = require('../index.js');

removeColors.remove({
    src: './src/*.svg',
    out: './dest',
    properties: [removeColors.PROPS_STROKE, removeColors.PROPS_FILL],
    namespaces: ['i', 'sketch']
});