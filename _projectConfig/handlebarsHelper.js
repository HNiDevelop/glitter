module.exports.register = function (Handlebars, options)  { 
    Handlebars.registerHelper("checkContentType", function (dataContentName, contentType, options) {
        /* check if current contentName is of contentType */
        if(dataContentName === contentType) {
            return options.fn(this);
        } else {
            if(dataContentName.indexOf('-') !== -1) {
                dataContentName = dataContentName.split('-')[0];

                if(dataContentName === contentType) {
                    return options.fn(this);
                }
            }
        }
        return options.inverse(this);
    });

    Handlebars.registerHelper('appendContext', function(dataObject, dataKey) {
        console.log('######################');
        console.log(dataObject);

        var context = {},
            mergeContext = function(obj) {
                for(var k in obj)context[k]=obj[k];
            };
        mergeContext(this);
        //mergeContext(options.hash);
        
        context['appendedContext'] = dataObject[dataKey];

        return options.fn(context);
    });

    Handlebars.registerHelper("getTranslatedText", function (jsonString, language, dataKey) {
        /*
            EXAMPLE
            "translatedTexts": {                    
                "de": {
                    "description": "Max Mustermann besitzt umfangreiche M&A-Erfahrung, sowohl bei mittelständischen wie auch bei konzerngeprägten Transaktionen. In seiner langjährigen Tätigkeit für die Infineon AG hat er den weltweit führenden Geschäftsbereich Sicherheit und Chipkarten mit einem Umsatzvolumen von über 500 Mio. Euro mit aufgebaut und geleitet. Seine Expertise im Bereich Corporate Finance gibt er unter anderem in Form eines Lehrauftrages an der Hochschule St. Gallen weiter. Im Vorstand der Aquin & Cie. AG übt er die Funktion des Sprechers aus und führt das Büro Lindau."
                },
                "en": {
                    "description": "Max Mustermann ENGLISH"
                }
            }

            getTranslatedText({translatedTexts}, 'de', 'description')
        */
        if(typeof jsonString !== 'undefined' && jsonString !== '') {
            var dataObject = jsonString;
                        
            if(dataObject.hasOwnProperty(language)) {
                return dataObject[language][dataKey];
            }
        }
        return "--";
    });



    var hbsEachCounter = -1;
    Handlebars.registerHelper("eachCounterIncrement", function() {
        hbsEachCounter++;
    });

    Handlebars.registerHelper("eachCounterIndex", function() {
        return hbsEachCounter += 1;
    });    

    Handlebars.registerHelper("eachCounterReset", function() {
        hbsEachCounter = -1;
    });


    Handlebars.registerHelper("eachEvenOdd", function() {
        console.log(hbsEachCounter);
        return (hbsEachCounter % 2 == 0 ? "even" : "odd");
    });

/*
    Handlebars.registerHelper("eachEvenOdd", function (dataObject, even, odd, fn, elseFn) {
        if (array && array.length > 0) {
            var buffer = "";
            for (var i = 0, j = array.length; i < j; i++) {
                var item = array[i];
     
                //we'll just put the appropriate stripe class name onto the item for now
                item.rowTypeClass = (i % 2 == 0 ? even : odd);
     
                //show the inside of the block
                buffer += fn(item);
            }
     
            //return the finished buffer
            return buffer;
        } else {
            return elseFn();
        }
    });  */  

    Handlebars.registerHelper("renderPartial", function (partialName, context) {
        //this function renders a specified partial by its *.hbs name
        //context, the current context in loop
        //dataset, include dataset for dynamic template rendering
        var partial,
            template = Handlebars.partials[partialName];

        //use default partial if no valid partialName is provided
        if(typeof template === 'undefined') { 
            //write error (or define default partial here)
            //partialName = 'default';
            //template = Handlebars.partials[partialName]; 
            template = '!no partial!'; 
        } 

        //compile partical if necessary
        if (typeof template !== 'Function') {
            //not compiled, so we can compile it safely
            partial = Handlebars.compile(template);
        } else {
            //already compiled, just reuse it
            partial = template;
        }
        
        //return rendered partial
        var output = partial(context).replace(/^\s+/, '');
        return new Handlebars.SafeString(output);
    });
    
    Handlebars.registerHelper("renderDataset", function (partialName, partialConfig, dataset, dataId) {
        var context = {};
        var datasetObject = [];

        //--- prepare dataset ---
        if(typeof dataset[dataId] !== 'undefined') {
            datasetObject = dataset[dataId];
        } else {
            dataId = null;
            datasetObject = dataset;
        }
        context['pageDataset'] = datasetObject;
        
        //--- render dataset with given partial ---
        var partial,
            template = Handlebars.partials[partialName];

        //use default partial if no valid partialName is provided
        if(typeof template === 'undefined') { 
            //write error (or define default partial here)
            //partialName = 'default';
            //template = Handlebars.partials[partialName]; 
            template = '!no partial!'; 
        } 

        //compile partical if necessary
        if (typeof template !== 'Function') {
            //not compiled, so we can compile it safely
            partial = Handlebars.compile(template);
        } else {
            //already compiled, just reuse it
            partial = template;
        }        
        context['moduleConfig'] = partialConfig;
        context['moduleDataSet'] = dataId;

        //return rendered partial
        var output = partial(context).replace(/^\s+/, '');
        return new Handlebars.SafeString(output);
    });

    Handlebars.registerHelper('calculateCol', function (index, numberOfCols)  { 
        //numberOfCols / (index+1)
        var gridCols = 12/numberOfCols;

        return 'col'+ gridCols + '-'+ ((index * gridCols)+1);
    });
    Handlebars.registerHelper('makeJson', function (jsonObj)  { 
        return JSON.stringify(jsonObj);
    });
    Handlebars.registerHelper("equal", function(conditional, options) {
		if (options.hash.desired === options.hash.type) {
			options.fn(this);
		} else {
			options.inverse(this);
		}
	});
    Handlebars.registerHelper("debug", function(optionalValue) {
        console.log("Current Context");
        console.log("====================");
        console.log(optionalValue);

        /*if (optionalValue) {
            console.log("\n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n Value");
            console.log("====================");
            console.log(optionalValue);
            console.log("====================");
            console.log("\n \n \n");
        } else {
            console.log("\n \n \n");
            console.log("no data");
            console.log("\n \n \n");
        }*/
    });
    Handlebars.registerHelper("stripes", function(index) {
        return (index % 2 == 0 ? "odd" : "even");
    });
    Handlebars.registerHelper("math", function(lvalue, operator, rvalue, options) {
        lvalue = parseFloat(lvalue);
        rvalue = parseFloat(rvalue);
            
        return {
            "+": lvalue + rvalue,
            "-": lvalue - rvalue,
            "*": lvalue * rvalue,
            "/": lvalue / rvalue,
            "%": lvalue % rvalue
        }[operator];
    });
    Handlebars.registerHelper('include', function(options) {
        console.log('-----------------');
        console.log(options);

        var context = {},
            mergeContext = function(obj) {
                for(var k in obj)context[k]=obj[k];
            };
        mergeContext(this);
        mergeContext(options.hash);
        return options.fn(context);
    });
    Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {

        switch (operator) {
            case '==':
                return (v1 == v2) ? options.fn(this) : options.inverse(this);
            case '===':
                return (v1 === v2) ? options.fn(this) : options.inverse(this);
            case '==':
                return (v1 !== v2) ? options.fn(this) : options.inverse(this);                
            case '<':
                return (v1 < v2) ? options.fn(this) : options.inverse(this);
            case '<=':
                return (v1 <= v2) ? options.fn(this) : options.inverse(this);
            case '>':
                return (v1 > v2) ? options.fn(this) : options.inverse(this);
            case '>=':
                return (v1 >= v2) ? options.fn(this) : options.inverse(this);
            case '&&':
                return (v1 && v2) ? options.fn(this) : options.inverse(this);
            case '||':
                return (v1 || v2) ? options.fn(this) : options.inverse(this);
            default:
                return options.inverse(this);
        }
    });
    Handlebars.registerHelper('readReadme', function () {
        var fs = require('fs');
        var marked = require('marked');

        return marked(fs.readFileSync('README.md').toString());
    });
};