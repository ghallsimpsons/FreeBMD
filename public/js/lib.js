var math=mathjs();
var varnamestack=[];//TODO: GET RID OF THIS!
var parse_helper={};

var env = {
	'currentTab': 0,
	'tabs': [
				{
				'name': 'tab0',
				'code': '',
				}
		],
	
	'vars': {
		'e': {
			'type': "scalar",
			'val': math.e,
			},
		'pi': {
			'type': 'scalar',
			'val': math.pi,
			},
		'i': {
			'type': 'scalar',
			'val': math.i,
			},
		'inf': {
			'type': 'scalar',
			'val': math.Infinity,
			},
/*		'userfunc': {		Sample user-defined function
			'type': 'function',
			'val': '[x=[1,2,3,4], y=[4,3,2,1], plot(x,y,\'.\')]',
			'varin': ['arg1', 'arg2'],
			'varout': ['x', 'y'],
			},*/
		},
	'runtime': {
		'code': [],
		'linenum': 0,
		},
	};
	
	stack = [
			/*{ 	Structure same as defined above
				'x': {
				'type': 'scalar',
				'val': '[1,2,3,4]',
				},
			},*/
			];
		
function attachFunc(split_line){
	/* Attaches a user defined function to the
	 * math object for execution with math.eval().
	 * Expects: tokenized line of the format
	 *	["function","[","varOut","]","=","funcName","[","inArg","]"]
	 * Returns: N/A
	 */
	if (split_line[1]=="[") { //Function with defined outputs
		endArgs=nextSemanticBlock(split_line, 1)[1];

		var func=split_line[endArgs+1];
		env.vars[func]={'type':'function', 'val':[]};
		for (var line = env.runtime.linenum+1; line<env.runtime.code.length; line++){
			token_line=tokenize(env.runtime.code[line],all_tokens);
			if (token_line[0]=="end"){
				env.runtime.linenum=line;
				break;
			}
			else{
				env.vars[func].val.push(env.runtime.code[line]);
			}
		}
		var outVar=[];
		for (var i = 2; i<endArgs-1; i++){
			if(isBareword(split_line[i])){
				outVar.push(split_line[i]);
			}
			else if(split_line[i]==','){
				continue;
			}
		}
		inArgs=nextSemanticBlock(split_line, endArgs+2);
		var inVar=[];
		for (var i = inArgs[0]; i<inArgs[1]; i++){
			if(isBareword(split_line[i])){
				inVar.push(split_line[i]);
			}
			else if(split_line[i]==','){
				continue;
			}
		}
		math[func]=function(args){ return evalUserFunc(func, Array.slice(arguments)); }

		env.vars[func].varin=inVar;

		env.vars[func].varout=outVar;
	}
}

function evalUserFunc(func, args){
	/* Evaluates a user defined function with the given arguments.
	 * When attached as a lambda math.f=>function(args), it is
	 * called with math.f(args)
	 * Expects: Function name and the arguments to be passed.
	 * Returns: List of values returned by f(args)
	 */
		enterScope();
			// Push input vars into local scope.
			for (var vin in env.vars[func].varin){
				setvar(env.vars[func].varin[vin], {'type': 'scalar', 'val': args[vin]} );
			}
			// Execute function line-by-line
			for (var line in env.vars[func].val) {
				execStatement(env.vars[func].val[line]);
			}
			// Populate return vars from current stack frame 
			var myRetVals=[];
			for (var i in env.vars[func].varout){
				myRetVals.push(getvar(env.vars[func].varout[i]).val);
			}
		exitScope();

		return myRetVals;
}
		
function exitScope(){
	/* Pops the top stack frame and sets the
	 * values of the math object variables with
	 * their new values, if any.
	 * Expects: N/A
	 * Returns: N/A
	 */
	popvars=stack.pop();
	for (var v in popvars){
		if (getvar(v)!=null){
			if(getvar(v).type!='function'){
			math[v]=getvar(v).val;
			}
		}
		else math[v]=undefined;
	}
}

function enterScope(){
	/* Pushes a new frame to the stack.
	 * Expects: N/A
	 * Returns: N/A
	 */
	stack.push({});
}

function getvar(varname){
	/* Returns the unmasked value of the defined variable.
	 * Ideas: Check that variable, if exists, is properly formatted
	 * with a nonempty type, else emit warning?
	 * Expects: Variable name
	 * Returns: Unmasked variable value
	 */
	for(var i=stack.length-1; i>=0; i--){
		if (stack[i][varname]!=null){
			return stack[i][varname];
		}
	}
	return env.vars[varname];
}

function setvar(varname, val){
	/* Sets varialbe at the top of the stack, or
	 * in the environment if not in a local scope.
	 * TODO: setGlobal(varname, val) for definine 
	 * globals while in a local scope.
	 * Expects: Variable name, value to assign.
	 * Returns: N/A
	 */
	if(stack.length>0){
		stack[stack.length-1][varname]=val;
	}
	else env.vars[varname]=val;
	math[varname]=val.val;
}

function loadLocals(){
	/* TODO: Forgot what this does...
	 * Expects: N/A
	 * Returns: N/A
	 */
	for (var localvar in env.vars){
		try{
		if(env.vars[localvar].val.hasOwnProperty('_data')){
			var m = math.matrix(env.vars[localvar].val._data);
			env.vars[localvar].val = m;
		}} catch(e){}
		math[localvar]=env.vars[localvar].val;
	}
}
	
function isBareword( word ){
	/* Checks if word is a valid variable name. TODO: Can MatLab vars start with '_'?
	 * Expects: string
	 * Returns: Bool, whether of not word is a bareword.
	 */
	if(word.match(/^[a-zA-Z]\w*$/)) return true; else return false;
}

function isScalar( word ){
	/* Whether the return value (might be) scalar:
	 * e.g. funcThatReturnsNum() or scalarMatrix[2] 
	 * TODO: More foolproof method for checking return type.
	 * Expects: string
	 * Returns: Bool, whether return val could be scalar
	 */
	if(word.match(/^(\w|[\.\+\-\/\*\(\)])*$/)) return true; else return false;
}
	
function flatten(array) {
	/* Flattens arrays, because I'm lazy.
	 * Depending on how many times this is
	 * called, this might become a bottleneck.
	 * In that case, I'll figure out how to do
	 * things right.
	 * Expects: n-d array
	 * Returns: 1-d array
	 */
	 var result = [], self = arguments.callee;
	 array.forEach(function(item) {
		 Array.prototype.push.apply(
			 result,
			 Array.isArray(item) ? self(item) : [item]
		 );
	 });
	  return result;
};

function nextSemanticBlock( obj, index ){
	/* Returns the start and end index of the next semantic block [start,end]
	 * Semantic blocks are deliminated by the special characters list, and
	 * are blocked with blocking characters [, { and (.
	 * Expects: tokenified object and an index to start searching
	 * Returns: The bounds of the first block after 'index'
	 * Note: index should be the 'end' of a previous call, since starting
	 * 	a search in the middle of a block will produce unexpected results.
	 * TODO: I could make this start at begining regardles of specified index,
	 * and only returning the first block with start>index (see above).
	 */
	var start_ind;
	var blocked='';
	var depth=0;
	for(var i=index; i<obj.length; i++){
		if(blocked){
			switch(blocked)
			{
				case '[':
					if(obj[i]==']') if(--depth==0) return [start_ind, i+1];
					break;
				case '(':
					if(obj[i]==')') if(--depth==0) return [start_ind, i+1];
					break;
				case '{':
					if(obj[i]=='}') if(--depth==0) return [start_ind, i+1];
					break;
			}
		}
		else if (isBareword(obj[i])) return [i,i+1];
		//Check for blocking every pass and dive in!
		if (obj[i]=='['){ blocked='['; if(depth++==0) start_ind=i;}
		else if(obj[i]=='('){ blocked='('; if(depth++==0) start_ind=i;}
		else if(obj[i]=='{'){ blocked='{'; if(depth++==0) start_ind=i;}
		
	}
	if(blocked){
		throw("ERROR: Unbalanced token `"+blocked+"` in line: `"+obj.join('')+'`');
	}
	return false;
}

function hasSemanticBlock( obj, type, index){
	/* Determines whether the object contans a properly formatted
	 * syntactic block.
	 * Expects: obj=>tokenized line; type=> [ or { or (; index=> int
	 * Returns: Bool, whether properly formatted block of given type exists.
	 */
	var n;
	for(var i=index; i<obj.length;){
		n=nextSemanticBlock(obj,i);
		if(n){
			if(obj[n[0]] == type){
				return n[0];
			}
			else i=n[1];
		}
		else i++;
	}
	return false;
}

var binary_ops = ['+', '-', '*', '/', '^', '&', '|', '&&', '||'];
var comparison_ops = ['>','<'];
var specials = [',', '=', ';', '~', ' ', '\t'];
var blockers = ['[', ']', '(', ')', '{', '}'];

var all_tokens = binary_ops;
all_tokens.push(comparison_ops);
all_tokens.push(specials);
all_tokens.push(blockers);
all_tokens = flatten(all_tokens);

function preparse( str ){
	/* The first step of the tokenization process is removing
	 * comments from the line and then replacing strings with
	 * a placeholder. This makes parsing easier, since we don't
	 * need to worry about tokens contained in strings.
	 * Expects: A single line of code
	 * Returns: The line with comments removed and strings replaced
	 */
	var i=0;
	var saved=0;
	var escaped_index;
	var parsed_str=str;
	var escaped='f';
	while (i<parsed_str.length){
		if (escaped=='f'){
			if(parsed_str[i]=='"'){
				escaped='"';
				escaped_index=i;
			}
			else if(parsed_str[i]=="'"){
				escaped="'";
				escaped_index=i;
			}
			else if(parsed_str[i]=='%'){
				parsed_str=parsed_str.slice(0,i);
				break;
			}
			i++;
		}
		else if(parsed_str[i]==escaped && parsed_str[i-1]!='\\'){
			parse_helper['%'+saved+'%']=parsed_str.slice(escaped_index,i+1);
			parsed_str=parsed_str.slice(0,escaped_index)+"%"+saved+"%"+parsed_str.slice(i+1,parsed_str.length);
			i=escaped_index+("%"+saved+"%").length;
			saved++;
			escaped='f';
		}
		else i++;
		}
	return parsed_str;
}

function postParse( str ){
	/* Returns the strings removed during preparse
	 * with their initial values.
	 * Expects: a string with %n% variables
	 * Returns: The string with original values
	 */
	return str.replace(/%(\w)%/g,function(a,b){return parse_helper['%'+b+'%'];});
	}

function tokenizeStr( str, token ){
	/* The second step in tokenization is breaking the
	 * string into lists with elements deliminated by
	 * the given token. See also: tokenize.
	 * Expects: line as a string or list and a token at which
	 * 	to split the line.
	 * Returns: list with members split at the given token
	 */
	var sarr=[];
	var spl=String(str).split(token);
	for (var i=0; i<spl.length-1; i++){
		if (spl[i]!='')
		sarr.push(spl[i]);
		if(token!=' ' && token!='\t')
		sarr.push(token);
	}
	sarr.push(spl[spl.length-1]);
	return sarr;
}

function tokenize( line, tokens ){
	/* This subroutine is the main functions for tokenizing
	 * input strings. It calles tokenizeStr once for every
	 * token in tokens.
	 * Expects: line as a string and a list of tokens to split
	 * Returns: list containing original line, split at tokens
	 */
	var arr=tokenizeStr(line, tokens[0]);
	var tmparr;
	for (var t=1; t<tokens.length; t++){
		tmparr=flatten(arr); // TODO: What is the perfomance hit of repeated flattening?
		arr=[];
		// Take the previously tokenized string and again tokenize each element
		// with the new token, preserving the old splits.
		for (var str in tmparr){
			arr.push(tokenizeStr( tmparr[str], tokens[t] ));
		}
	}
	arr=flatten(arr);
	while(arr.indexOf('')>-1){
		arr.splice(arr.indexOf(''),1);
	}
	return arr;
}

function structureArray(split_index){
	/* This function separates array elements in a tokenized list
	 * by comma tokens for easier parsing.
	 * Expects: a tokenized line of form ['arr','[','scalar1','scalar2',']']
	 * Returns: ['arr','[','scalar1',',','scalar2',']']
	 */
	range=nextSemanticBlock(split_index, hasSemanticBlock(split_index,'[',0));
	var topp=range[1]-2;
	for (var i = range[0]+1; i<topp; i++){
		if (isScalar(split_index[i]) && isScalar(split_index[i+1])){
			split_index.splice(i+1,0,',');
			i++; topp++;
		}
	}
	return split_index;
}

function mergeToArray(split_array){
	/* Trivial helper function to take an array processed by
	 * structureArray and return a javascript array for use
	 * by mathjs. TODO: This seems silly in retrospect. Is there a reason I did this?
	 * Expects: list of form ['el1',',','el2']
	 * Returns: ['el1','el2']
	 */
	return split_array.join('').split(',');
}

function execStatement( line ){
	/* Heart of FreeBMD. This function takes a line of BMD code
	 * and returns the processed value. This may be called recursively
	 * if, for instance, the input line contains another function call.
	 * Expects: Line of valid FreeBMD code.
	 * Returns: value of executed code.
	 */
	try{
		parsed_line=preparse(line);
		split_line = tokenize(parsed_line, all_tokens);
		
		for(var i in split_line){
			split_line[i]=postParse(split_line[i]);
		}
		if(split_line[0]=="for"){
			
		}
		
		//User defined functions
		else if(split_line[0]=="function"){
			attachFunc(split_line);
				
		}
		
		//Temporary plotting function for demo
		else if(split_line[0]=="plot"){
			$('#chart-modal').modal('toggle');
			var i=1;
			var data={};
			var type='line';
			for(;i<split_line.length; i++){
				if (split_line[i]=='(') break;
			}
			for(;i<split_line.length; i++){
				if (isBareword(split_line[i])){
					data['x']=math[split_line[i]]._data;
					i++;
					break;}
			}
			for(;i<split_line.length; i++){
				if(isBareword(split_line[i])){
				data['y']=math[split_line[i]]._data;
					break;}
			}
			for(;i<split_line.length; i++){
				if(typeof split_line[i] == 'string'){
					if (split_line[i]=='.') type='scatter';
				}
			}
			if(data['x'].hasOwnProperty('_data')){
				data['x'] = data['x']._data;
				}
			if(data['y'].hasOwnProperty('_data')){
				data['y'] = data['y']._data;

				}

			d3_plot(data,type);
		}
		else if(split_line[0]=="plot"){
			args = nextSemanticBlock(split_line, hasSemanticBlock(split_line, '(', 0));
			datas=[]; styles=[];
			data_num=0;
			for( var i=args[0]; i<args[1]-1; i++){
				if (datas[0]){
					if (datas['x']){
						if(datas['y']){}}}}
			chart = d3_plot(data,style);
			setTimeout(10000, chart.update());
		}

		else if (split_line.indexOf('=')>0 && split_line[split_line.indexOf('=')+1]!='=' && split_line[split_line.indexOf('=')-1]!='<' && split_line[split_line.indexOf('=')-1]!='>' && split_line[split_line.indexOf('=')-1]!='~'){
			//Yay! We've found an assignment!
			if( 1==1 ){ //If scalar assignment. Probably something like isScalar(split_line[0])
			varname=split_line.slice(0,split_line.indexOf('=')).join(''); //This may or may not be necessary
			tmpvar={};
			expr=split_line.slice(split_line.indexOf('=')+1);
			if(hasSemanticBlock(split_line,'[',0)){
				expr=structureArray(expr);
			}

			varnamestack.push(varname);// Workaround for overwritten varname. TODO: Think of better solution.
			tmpvar['val'] = evalExpr( expr.join('') );
			tmpvar['type']='scalar';
			varname=varnamestack.pop();
			setvar(varname,tmpvar);
			math[varname]=tmpvar.val;

			return getvar(varname)['val'];
			}
			//else if( /*obj_prop*/ ){
				
			//}
			//else if( /*matrix*/ ){
			
			//}

		}
		return evalExpr(line);
	
	}
	catch(err){
	return err;
	}
	//math.eval(line);
}

function evalExpr( expr ){
	/* Attemps to evaluate the expression using mathjs.
	 * If mathjs is unable to evaluate the expression,
	 * We just return the initial expression.
	 * Expects: Expression string.
	 * Returns: evaluated expression if possible, or expression
	 */
	try{
		return math.eval(expr);
	}
	catch(err){ return expr; };
}

function set_tab(tab){
	/* Function for switching between bulk-code tabs.
	 * Expects: integer representing tab num.
	 * Returns: TODO: true if success, else false
	 */
	env.currentTab=tab;
}

function runFile(tab){
	/* Runs the code currently in the specified tab.
	 * If no tab is specified, current tab is used.
	 * Expects: integer representation of tab, or no arg
	 * Returns: N/A
	 */
	if(!tab){tab=env.currentTab;}
	else if(tab>=env.tabs.length || tab<0){
		throw("Error: Invalid tab.");
	}
	mycode=env.tabs[tab].code;
	env.runtime.code=mycode.split('\n');
	env.runtime.linenum=0;
	for (; env.runtime.linenum<env.runtime.code.length; env.runtime.linenum++){
		execStatement(env.runtime.code[env.runtime.linenum]);
	}
}
