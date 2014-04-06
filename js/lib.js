var math=mathjs();

var env = {
	'uid': false/*{{ uid }}*/ ,
	
	'secret': false/*{{ secret }}*/,	

	'token': false/*{{ token }}*/,
	
	'tabs': [
				{
				'name': 'tab1',
				'code': '',
				}
		],
	
	'vars': {
		/*{% if vars %}
		{{ vars }}
		{% else %}*/
		e: math.e,
		pi: math.pi,
		i: math.sqrt(-1),
		inf: Infinity,
		//{% endif %}
		},
	
	'history': {
		'0': "init()",
		},
	};

var binary_ops = ['+', '-', '*', '/', '^', '&', '|', '&&', '||'];
var comparison_ops = ['>','<','<=','>=','==','~=',];


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

function tokenize_str( str, token ){
	console.log("str:"+typeof(str));
	var sarr=[];
	var spl=String(str).split(token);
	for (var i=0; i<spl.length-1; i++){
		if (spl[i]!='')
		sarr.push(spl[i]);
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
		console.log(tokens[t] + "  :  "+tmparr[str]);
			arr.push(tokenize_str( tmparr[str], tokens[t] ));
			//alert(tmparr+'\n'+tokens[t]+" : "+arr);
		}
	}
	return flatten(arr);
}

function exec_statement( line ){
	return math.eval(line);
}

