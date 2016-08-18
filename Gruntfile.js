module.exports = function (grunt) {

    //@TODO run loop-back model sync during grunt build

    grunt.initConfig(
        {
            concat: {
                generated: {
                    files: [
                        {
                            dest: 'client/dist/all.js',
                            src: [


                                'client/bower_components/angular/angular.min.js',

                                'client/bower_components_not_installed_with_bower/Chart.js-skip-xlabels/Chart.min.js',
                                'client/bower_components_not_installed_with_bower/angular-chart.js/angular-chart.js',
                                'client/bower_components/angular-recaptcha/release/angular-recaptcha.min.js',
                                'client/bower_components_not_installed_with_bower/angular/angular-resource.js',

                                'client/app_components/loopback/loopback-services.js',

                                'client/app_components/ubermon/module.js',
                                'client/app_components/ubermon/config.js',
                                'client/app_components/ubermon/misc-todo-split-me/script.js',
                                'client/app_components/ubermon/contact-edit/contact-edit.js',
                                'client/app_components/ubermon/monitor-edit/monitor-edit.js',
                                'client/app_components/ubermon/reset-password/reset-password.js',
                                'client/app_components/ubermon/dashboard/dashboard.js',
                                'client/app_components/ubermon/home/home.js',
                                'client/app_components/ubermon/contact-us-form/contact-us-form.js',
                                'client/app_components/ubermon/reset-password/reset-password.js',
                                'client/app_components/ubermon/monitor-details-display/monitor-details-display.js',
                                'client/app_components/ubermon/edit-monitor-dialog/edit-monitor-dialog.js',

                                'client/app_components/google-analytics/google-analytics.js'
                            ]
                        }
                    ]
                }
            },
            uglify: {
                generated: {
                    options: {
                        mangle: false,
                        sourceMap: true
                    },
                    files: [
                        {
                            dest: 'client/dist/all.min.js',
                            src: ['client/dist/all.js']
                        }
                    ]
                }
            },
            watch: {
                src: {
                    files: [
                        'Gruntfile.js',
                        'client/app_components/*.js',
                        'client/app_components/*.html',
                        'client/app_components/**/*.js',
                        'client/app_components/**/*.html'
                    ],
                    tasks: ['uglify', 'concat']
                }
            },
            forever: {//@todo remove doesn't work (and uninstall package)
                server: {
                    options: {
                        index: 'server/server.js',
                        logDir: 'logs'
                    }
                }
            }
        }
    );

    grunt.loadNpmTasks('grunt-forever');//@todo remove doesn't work
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default', ['concat', 'uglify']);
};
