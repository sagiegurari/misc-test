module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-markdownlint');

    grunt.initConfig({
        markdownlint: {
            example1: {
                options: {
                    config: {
                        'default': true,
                        'line-length': false,
                        'blanks-around-headers': false,
                        'no-duplicate-header': false,
                        'no-inline-html': false
                    }
                },
                src: [
                    'README.md'
                ]
            }
        }
    });

    grunt.registerTask('default', ['markdownlint:example1']);
};