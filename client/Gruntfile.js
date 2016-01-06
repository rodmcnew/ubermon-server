'use strict';

module.exports = function (grunt) {
    grunt.initConfig(
        {
            concat: {
                generated: {
                    files: [
                        {
                            dest: 'dist/bower_components.js',
                            src: [
                                'bower_components_not_bower/Chart.js-skip-xlabels/Chart.min.js',
                                'bower_components/angular/angular.min.js',
                                'bower_components/angular-chart.js/dist/angular-chart.min.js',
                                'bower_components/angular-recaptcha/release/angular-recaptcha.min.js',
                                'bower_components_not_bower/angular/angular-resource.js',
                                'js/lb-services.js'
                            ]
                        }
                    ]
                }
            },
            uglify: {
                generated: {
                    files: [
                        {
                            dest: 'dist/bower_components.min.js',
                            src: ['dist/bower_components.js']
                        }
                    ]
                }
            }
        }
    );

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.registerTask('default', ['concat', 'uglify']);
};
