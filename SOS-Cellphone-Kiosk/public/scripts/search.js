$(function(){
    if(typeof(category) != undefined)
        $("#category").val("default");
    else
        $("#category").val(category);

    $("#title").val(search);
});