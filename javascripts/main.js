jQuery.noConflict();


jQuery(document).ready(function($){

    glitter.autoInit = glitter.autoInit || {};
    for (var key in glitter.autoInit) {
        if (glitter.autoInit.hasOwnProperty(key)) {
            glitter.autoInit[key] = new glitter.autoInit[key]();
            glitter.autoInit[key].init();        
        }
    }
    
});