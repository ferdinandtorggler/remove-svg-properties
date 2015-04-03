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
var _ = require('lodash');

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

function noop () {
}

function writeFile (name, contents, cb) {
    mkdirp(path.dirname(name), function () {
        fs.writeFile(name, contents, cb);
    });
}

function removeInline (cssProperty, element) {
    element.css(cssProperty, '');
}

function removeAttribute (attribute, element) {
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
    var $ = cheerio.load(svgMarkup);

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
    }

    if (opt.attributes) $(attrSelector(opt.properties)).each(function (i, element) {
        removeProperties($(element));
    });

    if (opt.inline) $('[style]').each(function (i, element) {
        removeProperties($(element), true);
    });

    if (!opt.stylesToInline) {
        var styleDefs = $('style');
        _.forEach(styleDefs, function (styleDef) {

            styleDef = $(styleDef);

            var parsed = css.parse(styleDef.text());
            _.forEach(parsed.stylesheet.rules, function (ruleSet) {
                ruleSet.declarations = _.filter(ruleSet.declarations, function (rule) {
                    return !_.contains(opt.properties, rule.property);
                });
            });
            styleDef.text('\n' + css.stringify(parsed) + '\n');
        });
    };

    writeFile(path.join(path.resolve(opt.out), path.basename(file.path)), $.xml(), cb);
    this.push(file);
}

function run (options, done) {
    opt = _.assign(defaults, options);

    if (!done) {
        done = noop;
    }

    error(opt.src === null, 'source glob missing');
    error(opt.out === null, 'output dir missing');

    opt.properties = _.flatten(opt.properties);
    opt.namespaces = _.flatten(opt.namespaces);

    vfs.src(opt.src)
    .pipe(through2.obj(remove, done));
}

module.exports = _.assign({remove: run}, commonProperties);