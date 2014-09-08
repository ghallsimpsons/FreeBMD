function BMD_FUNC(fname) {
    if(math[fname]) throw "Error. Function "+fname+" already defined!";
    this.eval = function() { return false; };
    this.attach = function() { math[fname] = this.eval; };
    this.detach = function() { delete math[fname]; };
}

var MyAddPrimitive = new BMD_FUNC("my_add");
MyAddPrimitive.eval = function(){
    var arglist = Array.prototype.slice.call(arguments);
    console.log(arguments);
    sum = 0;
    console.log(arglist);
    for (arg in arglist) {
        console.log(arg);
        sum += parseInt(arglist[arg]);
    }
    return sum;
}

var test_funcs = [
    MyAddPrimitive,
]

function attachGroup(group){
    for (var Func in group){
        group[Func].attach();
    }
}

attachGroup(test_funcs);
