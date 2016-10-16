module.exports = function (grunt) {
    grunt.initConfig({
        release: {
            options: {
                bump: false, //default: true
                changelog: false, //default: false
                changelogText: '<%= version %>\n', //default: '### <%= version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n'
                file: 'package.json', //default: package.json
                add: false, //default: true
                commit: false, //default: true
                tag: false, //default: true
                push: false, //default: true
                pushTags: false, //default: true
                npm: false, //default: true
                npmtag: false, //default: no tag
                indentation: '\t', //default: '  ' (two spaces)
                folder: 'folder/to/publish/to/npm', //default project root
                tagName: '<%= version %>', //default: '<%= version %>'
                commitMessage: 'check out my release <%= version %>', //default: 'release <%= version %>'
                tagMessage: 'tagging version <%= version %>', //default: 'Version <%= version %>',
                beforeBump: [], // optional grunt tasks to run before file versions are bumped
                afterBump: [], // optional grunt tasks to run after file versions are bumped
                beforeRelease: [], // optional grunt tasks to run after release version is bumped up but before release is packaged
                afterRelease: [], // optional grunt tasks to run after release is packaged
                updateVars: [], // optional grunt config objects to update (this will update/set the version property on the object specified)
                github: {
                    repo: 'sagiegurari/misc-test', //put your user/repo here
                    accessTokenVar: 'GTOKEN'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-release');

    grunt.registerTask('default', ['release']);

};
