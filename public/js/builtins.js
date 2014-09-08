//{{{1 FreeBMD Functions class
function BMD_FUNC(fname) {
    if(math[fname]) throw "Error. Function "+fname+" already defined!";
    this.eval = function() { return false; };
    this.attach = function() { math[fname] = this.eval; };
    this.detach = function() { delete math[fname]; };
}

function attachGroup(group){
    /* Attaches an array of FreeBMD functions
     * to math for execution in user environment.
     */
    for (var Func in group){
        group[Func].attach();
    }
}

//}}}
//{{{1 Test function
//{{{2 Function definitions
//{{{3 MyAddPrimitive
var MyAddPrimitive = new BMD_FUNC("my_add");
MyAddPrimitive.desc = "
    This function is a test function which adds
    n arguments together. Must have >0 args";
MyAddPrimitive.eval = function(){
    var arglist = Array.prototype.slice.call(arguments);
    if (arglist.length == 0)
        throw new Error("Wrong number of arguments in function add. Must have at least one argument.");
    sum = 0;
    for (arg in arglist) {
        sum += parseInt(arglist[arg]);
    }
    return sum;
}
//}}}
//}}}
//{{{2 Export
var test_funcs = [
    MyAddPrimitive,
]

attachGroup(test_funcs);
//}}}
//}}}
