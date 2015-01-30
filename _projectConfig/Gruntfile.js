/*global module:false*/
module.exports = function(grunt) {
   
    // --- Load Tasks ~ Start --- //
    require('load-grunt-tasks')(grunt,{pattern: ['grunt-*', 'assemble']});
    // --- Load Tasks ~ End --- //

    // --- Init "time-grunt" to display the execution time for grunt tasks --- //
    require('time-grunt')(grunt);

    // Variables for text replacement
    var redDotTemplateCssVars = []
        , redDotTemplateJsVars = [];
    
    // Load SRC-Config
    var pkg = grunt.file.readJSON("package.json")
        , srcConfig = grunt.file.readJSON('srcConfig.json');

    // Modify path for correct include based on this subfolder
    for(var i in srcConfig) {
        var childConfigObject = srcConfig[i];

        if (childConfigObject instanceof Array) {
            for(var j = 0; j < childConfigObject.length; j++) {
                childConfigObject[j] = '../'+childConfigObject[j];
            }
        } else {
            srcConfig[i] = '../'+srcConfig[i];
        }
    }
    
    // Project configuration.
    grunt.initConfig({        
        concatJsPath:       "../build/javascripts/main.concat.js",
        minJsPath:          "../build/javascripts/main.min.js",
        concatCssPath:      "../build/stylesheets/main.concat.css",
        minCssPath:         "../build/stylesheets/main.min.css",

        pkg: pkg,
        compass: {
            dev: {
                config: 'config.rb',
                bundleExec: 'true'
            }
        },
        watch: {
            css: {
                files: [
                    "../sass/**/*"
                ],
                tasks: ["compass"],
                options: {
                    atBegin: true,
                    event: ['added', 'deleted', 'changed']
                }
            },
            html: {
                files: [
                    "../templates/**/*",
                    "../data-content/**/*",
                    "srcConfig.json"
                ],
                tasks: ["clean:sites", "assemble"],
                options: {
                    atBegin: true,
                    event: ['added', 'deleted', 'changed']
                }
            }
        },
        copy: {
          build: {
            files: [
                {expand: true, src: ['../images/**'], dest: '../build/images/'},
                {expand: true, src: ['../fonts/**'], dest: '../build/fonts/'},
                {expand: true, src: ['../assets/**'], dest: '../build/assets/'},
                {expand: true, src: ['../data-demo/**'], dest: '../build/data-demo/'},
                {expand: true, src: ['../data-js/**'], dest: '../build/data-js/'},
                {expand: false, src: ['../stylesheets/ie8.css'], dest: '../build/stylesheets/ie8.css'},
                {expand: false, src: ['../javascripts/ie/respond.js'], dest: '../build/javascripts/respond.js'},
                {expand: false, src: ['../javascripts/ie/html5shiv.js'], dest: '../build/javascripts/html5shiv.js'},
                {expand: true, src: ['../sites/**'], dest: '../build/sites/'},
                {expand: true, src: ['../index.html'], dest: '../build/index.html'},
            ]
          },
          reddot: {
            files: [
                {expand: true, cwd: '../build/', src: '**/*', dest: '../reddot/'}
            ]
          }
        },
        concat: {
            css: {
                src: [
                    srcConfig.cssFiles
                ],
                dest: '<%= concatCssPath %>'
            },
            js: {
                src: [
                    srcConfig.jsModuleFiles,
                    srcConfig.jsMainFile
                ],
                dest: '<%= concatJsPath %>'
            }
        },
        uglify: {
            options: {
                sourceMap: true
            },
            build: {
                files: {
                    '<%= minJsPath %>': [
                        '<%= concatJsPath %>'
                    ]
                }
            }
        },
        removelogging: {        
            dist: {
                src: '<%= concatJsPath %>'
            }, 
            options: {
                methods: ['log', 'info', 'warn', 'error', 'assert', 'count', 'clear', 'group', 'groupEnd', 'groupCollapsed', 'trace', 'debug', 'dir', 'dirxml', 'profile', 'profileEnd', 'time', 'timeEnd', 'timeStamp', 'table', 'exception']
            }
        },
        cssmin: {
            build: {
                options: {
                    banner: '/* === Minified css files - original data can be found in the SVN Repo ===  */'
                },
                files: {
                    '<%= minCssPath %>': ['<%= concatCssPath %>']
                }
            }
        },
        clean: {
            options: {
                force: true
            },
            build: ['../build', '../sites', '../stylesheets', '../index.html'],
            svn: ['../build/**/*.svn'],
            sites: ['../sites'],
            reddot: ['../reddot'],
            reddotAbundance: ['../reddot/data-demo', '../reddot/data-js'],
            cleanEverything: ['../build', '../reddot', '../sites', '../stylesheets', '../index.html', '../**/.DS_Store', '../**/Thumbs.db', '../**/.svn', '.sass-cache', 'node_modules', 'Gemfile.lock'],
            setup: [
                '../javascripts/modules/projectModule.js',
                '../sass/modules/_moduleName.scss',
                '../images/zo_logo.png'
            ],
            deployment: ['../**/.DS_Store', '../**/Thumbs.db']
        },
        assemble: {
            options: {
                flatten: true,
                layout: 'default.hbs',
                layoutdir: '../templates/layouts/',
                partials: [
                    '../templates/partials/*.hbs'
                ],
                data: [
                    '../data-content/**/*.json',
                    'srcConfig.json'
                ],
                helpers: ['handlebarsHelper.js']
            },
            pages: {
                files: {
                    '../index.html': [
                        '../templates/pages/index.hbs'
                    ],
                    '../sites/pages/de/': [
                        '../templates/pages/de/{,**/}*.hbs'
                    ],
                    '../sites/pages/en/': [
                        '../templates/pages/en/{,**/}*.hbs'
                    ]
                }
            }
        },
        replace: {
            stylesheets: {
                src: "../reddot/stylesheets/*.css",
                overwrite: true,
                options: {
                    processTemplates: false
                },
                replacements: [{
                    from: /url\([^)]*\)/gi,
                    to: function(matched, index, fullText, regexMatches) {
                      
                        var originalMatched = '' + matched;
                      
                        matched = matched.replace(/url\(['|"]?\.\.\//, '')
                                         .replace(/['|"]?\)/, '')
                                         .replace(/\?[0-9]*/, '');

                        var extension = matched.split('.')[1],
                            extras = extension.split('#')[1] || '';

                        if (extras !== '') {
                            extras = '#' + extras;
                        }

                        matched = matched.split('.')[0];
                        
                        if (matched.match(/^fonts\//)) {
                            matched = matched.replace(/fonts\//, 'media_') + '_' + extension.split('#')[0];
                        } else if (matched.match(/^assets\//)) {
                            if(matched.indexOf('/')!==-1) {
                                matched = matched.substring(matched.lastIndexOf('/')+1);
                            }
                            matched = 'img_' + matched;
                        }

                        matched = matched.replace(/[-| ]/gi, '_');
                        if (redDotTemplateCssVars.indexOf(matched) === -1) {
                            redDotTemplateCssVars.push(matched);
                        }

                        return 'url(<!IoRangePreExecute><%=' + matched + '%><!/IoRangePreExecute>' + extras + ')';
                    }
                }]
            },
            media_queries: {
                src: "../reddot/stylesheets/*.css",
                overwrite: true,
                options: {
                    processTemplates: false
                },
                replacements: [{
                    from: /@media[\s]\((min|max)-width:[\s]*([\d.]+[\w]+)\)/gi,
                    to: function (matched, index, fullText, regexMatches) {

                        var minOrMax = regexMatches[0]
                            , minOrMaxFunctionName = minOrMax.charAt(0).toUpperCase() + minOrMax.slice(1)
                            , value = regexMatches[1]
                            , numberValue = value.replace('em', '')
                            , newValue = 'mq'+minOrMaxFunctionName+'(' + numberValue + ')';

                        if(value.indexOf('px') != -1) {
                            console.log( '\n\nDon\'t use PX for MediaQueries: '+matched);
                            throw new Error();
                        }

                        // @media (min-width: <!IoRangePreExecute><%=mqMin60_875%><!/IoRangePreExecute>)
                        var replaceTo = '@media ('+ minOrMax +'-width: <!IoRangePreExecute><%=' + newValue + '%><!/IoRangePreExecute>)';

                        return replaceTo;
                    }
                }]
            },  
            js_rdph_variables: {
                
                src: "../reddot/javascripts/**/*.js",
                overwrite: true,
                options: {
                    processTemplates: false
                },
                replacements: [{
                    from: /\/\*rdph:(.*)\*\/(.*)\/\*\*\//g,
                    to: function (matched, index, fullText, regexMatches) {

                        // std_navigation_Overview -> navigation_Overview
                        var fullName = regexMatches[0];
                        var splitedName = fullName.split('_');
                        var pureName = splitedName.length ? splitedName.splice(1).join('_') : fullName;

                        var varValue = regexMatches[1].trim();
                        var stringValue = /^('|")(.*)('|")$/.exec(varValue);
                        var finalValue;
                        
                        if (stringValue && stringValue.length === 4) {

                            // if string
                            finalValue = stringValue[1] + '<!IoRangePreExecute><%=' + pureName + '%><!/IoRangePreExecute>' + stringValue[3];
                        } else {

                            // if not string
                            finalValue = '<!IoRangePreExecute><%=' + pureName + '%><!/IoRangePreExecute>';
                        }

                        // for variables.txt
                        var newVariable = pureName + '="<%' + fullName + '%>"';
                        
                        if (redDotTemplateJsVars.indexOf(newVariable) === -1) {
                            redDotTemplateJsVars.push(newVariable);
                        }

                        return finalValue;
                    }
                }]
            },
            setup: {
                src: [
                    "../sass/modules.scss",
                    "../templates/**/*.hbs"
                ],
                overwrite: true,
                options: {
                    processTemplates: false
                },
                replacements: [{
                    from: /((<!--|\/\*).*removeForSetup.*(-->|\*\/))([\s\S]*?)(.*(<!--|\/\*).*removeForSetup-end.*(-->|\*\/))/gm,
                    to: function (matched, index, fullText, regexMatches) {
                        return "";
                    }
                }]
            },
            setupSrcConfig: {
                src: [
                    "srcConfig.json"
                ],
                overwrite: true,
                options: {
                    processTemplates: false
                },
                replacements: [{
                    from: /("(jsModuleFiles)")([\s\S]*?)(],)/gm,
                    to: function (matched, index, fullText, regexMatches) {
                        return matched.replace(/\[([\s\S]*?)\]/gm, '[]');
                    }
                }]
            },
            usemin: {
                src: [
                    "../build/**/*.html"
                ],
                overwrite: true,
                replacements: [{
                    from: /(<!--.*build:(([^\s]+) (.*)).*-->)([\s\S]*?)(.*<!--.*endbuild.*-->)/gm,
                    to: function (matched, index, fullText, regexMatches) {

                        var type = regexMatches[2]
                            , src = regexMatches[3]
                            , replacement = '';
                        
                        if(type == 'css') {
                            replacement = '<link rel="stylesheet" href="'+ src + '">';
                        } else if(type == 'js') {
                            replacement = '<script src="'+ src +'"></script>'
                        }

                        return replacement;
                    }
                }]
            }
        },
        log: {
            reddot: []
        },
        sftp: {
            deploy: {
                files: {
                    "./": "../build/**/*"
                },
                options: {
                    host:                   '<%= deploymentConfig.host %>',
                    username:               '<%= deploymentConfig.username %>',
                    privateKey:             '<%= grunt.file.read(deploymentConfig.ppkPath) %>',
                    passphrase:             '<%= deploymentConfig.ppkPassword %>',
                    path:                   '<%= deploymentConfig.serverTargetPath %><%= deploymentConfig.devServerFolderName %><%= deploymentConfig.svnRepositoryName %>',
                    srcBasePath:            "../build/",
                    showProgress:           true,
                    directoryPermissions:   parseInt(777, 8),
                    createDirectories:      true,
                    readyTimeout:           99999
                }
            }
        },
        sshexec: {
            cleanFolder: {
                command:                    'rm -rf <%= deploymentConfig.serverTargetPath %><%= deploymentConfig.devServerFolderName %><%= deploymentConfig.svnRepositoryName %>',
                options: {
                    host:                   '<%= deploymentConfig.host %>',
                    username:               '<%= deploymentConfig.username %>',
                    privateKey:             '<%= grunt.file.read(deploymentConfig.ppkPath) %>',
                    passphrase:             '<%= deploymentConfig.ppkPassword %>',
                    readyTimeout:           99999
                }
            },
            uptime: {
                command:                    'uptime',
                options: {
                    host:                   '<%= deploymentConfig.host %>',
                    username:               '<%= deploymentConfig.username %>',
                    privateKey:             '<%= grunt.file.read(deploymentConfig.ppkPath) %>',
                    passphrase:             '<%= deploymentConfig.ppkPassword %>',
                    readyTimeout:           99999
                }
            }
        },
        shell: {
            svnCheckout: {
                command: ""
            },
            svnAddFolder: {
                command: "svn add -N ../*"
            },
            svnIgnore: {
                command: "svn propset svn:ignore -R -F .svnignore ../*"
            },
            svnAdd: {
                command: "svn add --force ../* --auto-props --parents --depth infinity -q"
            },
            svnCommit: {
                command: [
                    "cd ../",
                    "svn commit -m \"Inital project commit\" --username \"<%= deploymentConfig.svnUsername %>\" --password \"<%= deploymentConfig.svnPassword %>\""
                ].join('&&')
            }
        },
        yuidoc: {
            compile: {
                name:           '<%= pkg.name %>',
                description:    '<%= pkg.description %>',
                version:        '<%= pkg.version %>',
                options: {
                    paths:      '../',
                    outdir:     '../docs/',
                    tabtospace: 4,
                    exclude:    '../_projectConfig/',
                    themedir:   'docuTheme/',
                    helpers:    ["docuTheme/helpers/helpers.js"]
                }
            }
        }
    });

    // 


    // write variables for reddot task
    grunt.registerMultiTask('log', 'Log stuff.', function() {
          
        /*
        * add vars (css+)
        */
        var fileContents = [];
        var data = redDotTemplateCssVars;

        data.sort();
        var isFirstStyleElement = true;

        fileContents.push('\'CSS VARIABLES');
        data.forEach(function (element, index) {
            fileContents.push(element + '="<%' + element + '%>"');
        });

        /*
        * add vars (js)
        */
        fileContents.push('\'JS VARIABLES');

        // use var because of (Warning: An error occurred while processing a template)
        data = redDotTemplateJsVars;

        data.sort();
        data.forEach(function (element, index) {
            fileContents.push(element);
        });

        grunt.file.write('../reddot/variables.txt', fileContents.join("\n")); 
    });

    /* === Default watch task - updates CSS and HTML while development === */
    grunt.registerTask('default', ['watch:css', 'watch:html']);

    /* === Build task generates a static version of your project === */
    grunt.registerTask('build', ['clean:build', 'assemble', 'compass', 'copy:build', 'concat:js', 'removelogging', 'uglify:build', 'concat:css', 'cssmin:build', 'clean:svn', 'replace:usemin']);

    /* === Prepares the reddot integration === */
    grunt.registerTask('reddot', function() {
        grunt.task.run(['clean:reddot', 'build', 'copy:reddot', 'clean:reddotAbundance', 'replace:stylesheets', 'replace:media_queries', 'replace:js_rdph_variables', 'log:reddot']);    
    });

    /* === Cleans the project (removes .svn/.sass-cache etc. folder) === */
    grunt.registerTask('cleanEverything', ['clean:cleanEverything']);


    /* === Generates a documentation for your js-Files === */
    grunt.registerTask('docu', ['yuidoc:compile']);


};