'use strict';

var commonProperties = require('./lib/properties');

var cheerio = require('cheerio');
var juice = require('juice');
var fs = require('graceful-fs');
var vfs = require('vinyl-fs');
var mkdirp = require('mkdirp');
var through2 = require('through2');
var path = require('path');
var css = require('css');
var consume = require('stream-consume');
var _ = require('lodash');
var colors = require('colors');

var cheerioOpts = {
    xmlMode: true,
    lowerCaseTags: false,
    lowerCaseAttributeNames: false,
    recognizeCDATA: true
};

var opt;
var defaults = {
    src: null,
    out: null,
    stylesheets: true,
    attributes: true,
    inline: true,
    properties: [],
    namespaces: [],
    stylesToInline: false
};

var counters = {
    stylesheetRules: 0,
    attributes: 0,
    inlineRules: 0,
    reset: function () {
        this.stylesheetRules = 0;
        this.attributes = 0;
        this.inlineRules = 0;
    }
};

function noop () {
}

function writeFile (name, contents, cb) {
    mkdirp(path.dirname(name), function () {
        fs.writeFile(name, contents, cb);
    });
}

function removeInline (cssProperty, element) {
    if (element.css(cssProperty)) counters.inlineRules += 1; // count
    element.css(cssProperty, '');
}

function removeAttribute (attribute, element) {
    if (element.attr(attribute)) counters.attributes += 1; //count
    element.removeAttr(attribute);
}

function attrSelector (propertiesArray) {
    var selectors = propertiesArray.map(function (item) {
        return '[' + item + ']';
    });
    return selectors.join(',');
}

function error (condition, message) {
    if (condition) {
        throw new Error(message);
    }
}


function remove (file, enc, cb) {

    var svgMarkup = opt.stylesheets && opt.stylesToInline ? juice(file.contents) : file.contents;
    var $ = cheerio.load(svgMarkup, cheerioOpts);

    _.forEach(opt.namespaces, function (namespace) {
        $('*').each(function (i, elem) {
            _.forEach(elem.attribs, function (value, attr) {
                if (attr.match(new RegExp('^' + namespace + ':'))) {
                    removeAttribute(attr, $(elem));
                }
            });
        });
    });

    var removeProperties = function (element, inline) {
        opt.properties.forEach(function (item) {
            if (inline) {
                removeInline(item, element);
            } else {
                removeAttribute(item, element);
            }
        });
    };

    if (opt.attributes) $(attrSelector(opt.properties)).each(function (i, element) {
        removeProperties($(element));
    });

    if (opt.inline) $('[style]').each(function (i, element) {
        removeProperties($(element), true);
    });

    if (opt.stylesheets && !opt.stylesToInline) {
        var styleDefs = $('style');
        _.forEach(styleDefs, function (styleDef) {

            styleDef = $(styleDef);

            var parsed = css.parse(styleDef.text());
            _.forEach(parsed.stylesheet.rules, function (ruleSet) {
                var totalDeclarations = ruleSet.declarations.length;
                ruleSet.declarations = _.filter(ruleSet.declarations, function (rule) {
                    return !_.contains(opt.properties, rule.property);
                });
                counters.stylesheetRules = totalDeclarations - ruleSet.declarations.length;
            });
            styleDef.text('\n' + css.stringify(parsed) + '\n');
        });
    };

    // In non-streaming mode: Write file to specified output directory (grunt)
    // In streaming mode: Overwrite file contents and push it furhter (gulp)
    if (opt.out) {
        writeFile(path.join(path.resolve(opt.out), path.basename(file.path)), $.xml(), cb);
    } else { 
        file.contents = new Buffer($.xml());
        cb();
    }
    this.push(file);

    var inlineCount = (counters.inlineRules + ' inline styles, ')[counters.inlineRules > 0 ? 'yellow': 'reset'];
    var attrCount = (counters.attributes + ' attributes, ')[counters.attributes > 0 ? 'yellow': 'reset'];
    var styleCount = (counters.stylesheetRules + ' stylesheet rules ')[counters.stylesheetRules > 0 ? 'yellow': 'reset'];
    console.log(path.basename(file.path).bold + ': ' +
            inlineCount + attrCount + styleCount + 'removed.');
    counters.reset();
}

// merge with defaults and flatten arrays
function prepareOptions (options) {
    var prepared = _.assign(defaults, options);
    prepared.properties = _.flatten(prepared.properties);
    prepared.namespaces = _.flatten(prepared.namespaces);
    return prepared;
}

function run (options, done) {
    opt = prepareOptions(options);

    // done function is used in grunt
    if (!done) {
        done = noop;
    }

    error(opt.src === null, 'source glob missing');
    error(opt.out === null, 'output dir missing');


    var stream = vfs.src(opt.src)
    .pipe(through2.obj(remove, undefined, done));
    consume(stream);
}

var stream = {
    remove: function (options) {
        opt = prepareOptions(options);
        return through2.obj(remove);
    }
};
stream = _.assign(stream, commonProperties);

module.exports = _.assign({remove: run, stream: stream}, commonProperties);