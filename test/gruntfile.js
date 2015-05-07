module.exports = function(grunt) {

    grunt.initConfig({
        'remove-svg-properties': {
            options: {
                stylesheets: false,
                namespaces: ['i', 'sketch'],
                properties: ['fill', 'stroke']
            },
            all: {
                src: './src/*.svg',
                dest: './dest'
            }
        }
    });

    grunt.loadTasks('../tasks');

    grunt.registerTask('default', ['remove-svg-properties']);
}