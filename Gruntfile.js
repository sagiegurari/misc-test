module.exports = function (grunt) {
    var url = require('./package.json').repository.url;
    var prefix = 'github.com/';
    var repo = url.substring(url.indexOf(prefix) + prefix.length, url.lastIndexOf('.git'));
    var userName = repo.split('/')[0];
    console.log(repo);

    grunt.initConfig({
        'github-release': {
            full: {
                options: {
                    repository: repo,
                    auth: {
                        user: userName,
                        password: process.env.GHTOKEN
                    }
                }
            }
        },
        release: {
            options: {
                bump: false,
                changelog: false,
                file: 'package.json',
                add: false,
                commit: false,
                tag: false,
                push: false,
                pushTags: false,
                npm: false,
                npmtag: false,
                tagName: '<%= version %>',
                tagMessage: '<%= version %>',
                github: {
                    repo: repo,
                    accessTokenVar: 'GHTOKEN'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-release');
    grunt.loadNpmTasks('grunt-github-releaser');

    grunt.registerTask('default', ['github-release']);

};
