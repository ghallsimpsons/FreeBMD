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
		e: 2.718281828459,
		pi: 3.14159265358979,
		i: math.sqrt(-1),
		//{% endif %}
		},
	
	'history': {
		'0': "init()",
		},
	};

var binary_ops = ['+', '-', '*', '/', '^', '&', '|', '&&', '||'];


function exec_statement( line ){

}

