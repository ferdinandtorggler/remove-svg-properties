# remove-svg-properties

[![npm version](https://badge.fury.io/js/remove-svg-properties.svg)](http://badge.fury.io/js/remove-svg-properties)

> Remove attributes and styles from SVGs

## Install

Install with [npm](https://npmjs.org/package/remove-svg-properties)

```
npm install remove-svg-properties --save
```

## Usage

```javascript
var rsp = require(‘remove-svg-properties’);
rsp.remove(options);
```

### Options

Values below are `defaults`

- **src**: Glob string with path to source SVGs
- **out**: Output directory for colorless SVGs
- **stylesheets**: `true` Set to false if you don't want to remove the &lt;style&gt; tags
- **attributes**: `true` Set to false if you don't want to remove attributes
- **inline**: `true` Set to false if you don't want to remove inline style properties
- **properties**: `[]` Array of properties to be removed. See Properties section below for more information.
- **namespaces**: `[]` Array of namespace names to be removed.
- **stylesToInline**: `false` When set to true, &lt;style&gt; contents will be added as inline styles, which avoids stylesheet collisions when adding multiple inline SVGs to an HTML document.

#### Properties

Using the `properties` option you can specify a list of *attributes and CSS-properties* which will be removed.
Also, the plugin defines a few common, ready-to-use property-sets:
- `PROPS_FILL`
  - fill
  - fill-opacity
  - fill-rule
- `PROPS_STROKE`
  - stroke
  - stroke-dasharray
  - stroke-dashoffset
  - stroke-linecap
  - stroke-linejoin
  - stroke-miterlimit
  - stroke-opacity
  - stroke-width
- `PROPS_FONT`
  - font-family
  - font-size
  - font-size-adjust
  - font-stretch
  - font-style
  - font-variant
  - font-weight

So, an example configuration could be: `[rsp.PROPS_FILL, 'class']`
This would remove all the properties listed in PROPS_FILL above and all the class attributes.

#### Namespaces

SVG elements can have namespaced attributes, usually added by SVG editing software like Adobe Illustrator.

If you configure the `namespaces` property to be something like `['i', 'sketch']`, the plugin
would remove every `i:something` and `sketch:something` property.

A `<path sketch:type="MSShape"></path>` would be converted to `<path></path>` only.

### Usage Example

Usage with an exapmle configuration object:
```javascript
rsp.remove({
    src: './src/*.svg',
    out: './dest',
    stylesheets: false,
    properties: [rsp.PROPS_STROKE, rsp.PROPS_FILL, 'color'],
    namespaces: ['i', 'sketch', 'inkscape']
});
```

This would take all the SVG files from `./src` and put them into `./dest` while removing all the `stroke` and `fill` related properties as well as the `color` property. Those properties are only removed from attributes and inline styles, not from `<style>` blocks.

## Usage with [Grunt](http://gruntjs.com)

This module can also be used in automated tasks using Grunt.

```javascript
module.exports = function(grunt) {

    grunt.initConfig({
        'remove-svg-properties': {
            options: {
                stylesheets: false,
                properties: [rsp.PROPS_STROKE, rsp.PROPS_FILL, 'color'],
                namespaces: ['i', 'sketch', 'inkscape']
            },
            all: {
                src: './src/*.svg',
                dest: './dest'
            }
        }
    });

    grunt.loadNpmTasks('remove-svg-properties');

    grunt.registerTask('default', ['remove-svg-properties']);
}
```

Options to use `remove-svg-properties` with [Grunt](http://gruntjs.com) are the same as for the `rsp.remove` function with the exception of `src` and `out`, which are not part of the `options` object. Also, `out` is called `dest` in Grunt.

## Usage with [Gulp](http://gulpjs.com/)

This module can also be used in automated tasks using Gulp. Make sure to require the `stream` object of the plugin as in the example below:

```javascript
var gulp = require('gulp');
var rsp = require('remove-svg-properties').stream;

gulp.task('remove-svg-properties', function () {
    gulp.src('./src/*.svg')
    .pipe(rsp.remove({
        properties: [rsp.PROPS_FILL]
    }))
    .pipe(gulp.dest('./dest'));
});

gulp.task('default', 'remove-svg-properties');

```

Options to use `remove-svg-properties` with [Gulp](http://gulpjs.com/) are the same as for the `rsp.remove` function with `src` and `out` being ignored. They are handled by `gulp.src` and `gulp.dest` using streams.