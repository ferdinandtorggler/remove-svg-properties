# remove-svg-properties

> Remove attributes and styles from SVGs

## Install

Install with [npm](https://npmjs.org/package/remove-svg-properties)

```
npm install remove-svg-properties --save
```

## Usage

```
var removeSvgProps = require(‘remove-svg-properties’);
removeSvgProps(options);
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

So, an example configuration could be: `[removeSvgProps.PROPS_FILL, 'class']`
This would remove all the properties listed in PROPS_FILL above and all the class attributes.

#### Namespaces

SVG elements can have namespaced attributes, usually added by SVG editing software like Adobe Illustrator.

If you configure the `namespaces` property to be something like `['i', 'sketch']`, the plugin
would remove every `i:something` and `sketch:something` property.

A `<path sketch:type="MSShape"></path>` would be converted to `<path></path>` only.

### Usage Example

Usage with an exapmle configuration object:
```
removeSvgProps({
    src: './src/*.svg',
    out: './dest',
    stylesheets: false,
    properties: [removeColors.PROPS_STROKE, removeColors.PROPS_FILL, 'color'],
    namespaces: ['i', 'sketch', 'inkscape']
});
```

This would take all the SVG files from `./src` and put them into `./dest` while removing all the `stroke` and `fill` related properties as well as the `color` property. Those properties are only removed from attributes and inline styles, not from `<style>` blocks.

## Usage with [Grunt](http://gruntjs.com)

This module can also be used in automated tasks using Grunt.

```
module.exports = function(grunt) {

    grunt.initConfig({
        'remove-svg-properties': {
            options: {
                stylesheets: false,
                properties: [removeColors.PROPS_STROKE, removeColors.PROPS_FILL, 'color'],
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

Options to use `remove-svg-properties` with [Gulp](http://gulpjs.com) are the same as for the `removeSvgProps` function with the exception of `src` and `out`, which are not part of the `options` object. Also, `out` is called `dest` in Grunt.