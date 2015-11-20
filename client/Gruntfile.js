'use strict';

module.exports = function (grunt) {
    grunt.initConfig(
        {
            concat: {
                generated: {
                    files: [
                        {
                            //dest: '.tmp/concat/js/app.js',
                            dest: 'dist/bower_components.js',
                            src: [
                                'bower_components_not_bower/Chart.js-skip-xlabels/Chart.min.js',
                                'bower_components/angular/angular.min.js',
                                'bower_components/angular-chart.js/dist/angular-chart.min.js',
                                'bower_components_not_bower/angular/angular-resource.js',
                                //'bower_components_not_bower/angular/angular-route.js',
                                'js/lb-services.js'
                            ]
                        }
                    ]
                }
            }//,
            //uglify: {
            //    generated: {
            //        files: [
            //            {
            //                dest: 'dist/js/app.js',
            //                src: ['.tmp/concat/js/app.js']
            //            }
            //        ]
            //    }
            //}
        }
    );

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.registerTask('default', ['concat']);
};
