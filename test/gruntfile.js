module.exports = function(grunt) {

    grunt.initConfig({
        'remove-svg-properties': {
            options: {
                namespaces: ['i', 'sketch']
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