var math=mathjs();

var parse_helper={};

var env = {
	
	'tabs': [
				{
				'name': 'tab1',
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
		'userfunc': {
			'type': 'function',
			'val': 'x=[1,2,3,4]\ny=[4,3,2,1]\nplot(x,y,\'.\')',
			'localvars': {
				'x': {
					'type': 'scalar',
					'val': '[1,2,3,4]',
					},
				},
			},
		},
	'runtime': {
		'code': {},
		'linenum': 0,
		},
	};
	
	stack = [
			/*{
				'x': {
				'type': 'scalar',
				'val': '[1,2,3,4]',
				},
			},*/
			];
		

function exitScope(){
	popvars=stack.pop();
	for (var v in popvars){
		math[popvars[v]]=getvar(popvars[v]);
	}
}

function enterScope(){
	stack.push({});
}

function getvar(varname){
	for(var i=stack.length-1; i>=0; i--){
		if (stack[i][varname]!=null){
			return stack[i][varname];
		}
	}
	return env.vars[varname];
}

function setvar(varname, val){
	if(stack.length>0){
		stack[stack.length][varname]=val;
	}
	else env.vars[varname]=val;
}

function load_locals(){
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
	if(word.match(/^[a-zA-Z]\w*$/)) return true; else return false;
}

function isScalar( word ){
	if(word.match(/^(\w|[\.\+\-\/\*\(\)])*$/)) return true; else return false;
}
	
function flatten(array) {
  var result = [], self = arguments.callee;
  array.forEach(function(item) {
    Array.prototype.push.apply(
      result,
      Array.isArray(item) ? self(item) : [item]
    );
  });
  return result;
};

function next_semantic_block( obj, index ){
	//Returns the start and end index of the next semantic block [start,end]
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
	return false;
}

function has_semantic_block( obj, type, index){//type can be (, [, {
	var n;
	for(var i=index; i<obj.length;){
		n=next_semantic_block(obj,i);
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
var specials = [',', '=', ';', '~', ' '];
var blockers = ['[', ']', '(', ')', '{', '}'];

var all_tokens = binary_ops;
all_tokens.push(comparison_ops);
all_tokens.push(specials);
all_tokens.push(blockers);
all_tokens = flatten(all_tokens);

function preparse( str ){
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

function postparse( str ){
	return str.replace(/%(\w)%/g,function(a,b){return parse_helper['%'+b+'%'];});
	}

function tokenize_str( str, token ){
	var sarr=[];
	var spl=String(str).split(token);
	for (var i=0; i<spl.length-1; i++){
		if (spl[i]!='')
		sarr.push(spl[i]);
		if(token!=' ')
		sarr.push(token);
	}
	sarr.push(spl[spl.length-1]);
	return sarr;
}

function tokenize( line, tokens ){
	var arr=tokenize_str(line, tokens[0]);
	var tmparr;
	for (var t=1; t<tokens.length; t++){
		tmparr=flatten(arr);
		arr=[];
		for (var str in tmparr){
			arr.push(tokenize_str( tmparr[str], tokens[t] ));
		}
	}
	return flatten(arr);
}

function structure_array(split_index){
	//This creates a semantic block array
	range=next_semantic_block(split_index, has_semantic_block(split_index,'[',0));
	var top=range[1]-2;
	for (var i = range[0]+1; i<top; i++){
		if (isScalar(split_index[i]) && isScalar(split_index[i+1])){
			split_index.splice(i+1,0,',');
			i++; top++;
		}
	}
	return split_index;
}

function exec_statement( line ){
	try{
		parsed_line=preparse(line);
		split_line = tokenize(parsed_line, all_tokens);
		
		for(var i in split_line){
			split_line[i]=postparse(split_line[i]);
		}
		if(split_line[0]=="for"){
			
		}
		
		//User defined functions
		else if(split_line[0]=="function"{
			if (split_line[1]=="[") { //Function with defined outputs
				endArgs=next_semantic_block(split_line, "[")[1];
				var myVarList;
				for (var i = 2; i<endArgs; i++){
					if(isBareword(split_line[i])){
						myVarList.push(split_line[i]);
					}
					else if(split_line[i]==','){
						continue;
					}
					else return "That ain't valid! Arg: " + split_line[i];
				}
				enterScope();
				while (tokenize(env.runtime.code[++env.runtime.linenum], all_tokens)[0] != 'end') {
					exec_statement(env.runtime.code[env.runtime.linenum]);
				}
				
				var myRetArgs={};
				for (var i in myVarList){
					myRetArgs[myVarList[i]]=stack[stack.length-1][myVarList[i]]; //Populate return vars from current stack frame
				}
				exitScope();
				return myRetArgs;
			}
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
				console.log("I did something");
				}
			console.log(data);
			d3_plot(data,type);
		}
		else if(split_line[0]=="plot"){
			args = next_semantic_block(split_line, has_semantic_block(split_line, '(', 0));
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
			if( 1==1 ){
			varname=split_line.slice(0,split_line.indexOf('=')).join('');
			tmpvar={};
			expr=split_line.slice(split_line.indexOf('=')+1);
			if(has_semantic_block(split_line,'[',0)){
				expr=structure_array(expr);
			}
			tmpvar['val'] = eval_expr( expr.join('') );
			tmpvar['type']='scalar';
			setvar(varname,tmpvar);
			math[varname]=tmpvar.val;
			return env.vars[varname]['val'];
			}
			//else if( /*obj_prop*/ ){
				
			//}
			//else if( /*matrix*/ ){
			
			//}

		}
		return eval_expr(line);
	
	}
	catch(err){
	return err;
	}
	//math.eval(line);
}

function eval_expr( expr ){
	try{
		return math.eval(expr);
	}
	catch(err){ return expr };
}

function run_file(tab){//tab is an int
	mycode=env.tabs[tab].code;
	env.runtime.code=mycode.split('\n');
	env.runtime.linenum=0;
	for (; env.runtime.linenum<env.runtime.code.length; env.runtime.linenum++){
		exec_statement(env.runtime.code[env.runtime.linenum]);
	}
}