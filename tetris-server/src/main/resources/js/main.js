require.config({
    baseUrl: 'js/',
    paths : {
        "jquery" : ["https://cdn.bootcss.com/jquery/3.3.1/jquery.min"]
    }
});

require(['script'], function (script){
    script.run();
});