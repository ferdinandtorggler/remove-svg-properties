var removeColors = require('../index.js');

removeColors.remove({
    src: './test/src/*.svg',
    out: './test/dest',
    properties: [removeColors.PROPS_STROKE, removeColors.PROPS_FILL],
    namespaces: ['i', 'sketch']
});