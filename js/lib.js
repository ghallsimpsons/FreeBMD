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
		},
	};

function isBareword( word ){
	if(word.match(/^[a-zA-Z]\w*$/)) return true; else return false;
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
	for(var i=index; i<obj.length; i++){
		console.log(blocked);
		if(blocked){
			switch(blocked)
			{
				case '[':
					if(obj[i]==']') return [start_ind, i+1];
					break;
				case '(':
					console.log("This worked!");
					if(obj[i]==')') return [start_ind, i+1];
					break;
				case '{':
					if(obj[i]=='}') return [start_ind, i+1];
					break;
			}
		}
		else if (isBareword(obj[i])) return [i,i+1];
		else {
			console.log(obj[i]+":"+(obj[i]=='('));
			if (obj[i]=='['){ blocked='['; start_ind=i; }
			else if(obj[i]=='('){ blocked='('; start_ind=i; }
			else if(obj[i]=='{'){ blocked='{'; start_ind=i; }
		}
	}
}

var binary_ops = ['+', '-', '*', '/', '^', '&', '|', '&&', '||'];
var comparison_ops = ['>','<'];
var specials = [',', '=', '[', ']', ';', '~', '(', ')'];

var all_tokens = binary_ops;
all_tokens.push(comparison_ops);
all_tokens.push(specials);
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
		else if(parsed_str[i]==escaped){
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

function exec_statement( line ){
	try{
		parsed_line=preparse(line);
		split_line = tokenize(parsed_line, all_tokens);
		for(var i in split_line){
			split_line[i]=postparse(split_line[i]);
		}
		console.log(split_line);
		if(split_line[0]=="for"){
		}
		else if (split_line.indexOf('=')>0 && split_line[split_line.indexOf('=')+1]!='='){
			//Yay! We've found an assignment!
			if( 1==1 ){
			varname=split_line.slice(0,split_line.indexOf('=')).join('');
			tmpvar={};
			tmpvar['val'] = eval_expr( split_line.slice(split_line.indexOf('=')+1).join('') );
			tmpvar['type']='scalar';
			env.vars[varname]=tmpvar;
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

function storeLocal(varname, val){
	math.eval(varname+"="+val);
}

function eval_expr( expr ){
	console.log("expr: "+expr);
	try{
		return math.eval(expr);
	}
	catch(err){ return expr };
}

