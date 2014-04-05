env = {
	uid: /*{{ uid }}*/ ,
	
	secret: /*{{ secret }}*/,	

	token: /*{{ token }}*/,
	
	tabs: {
			/*{{ tabs }}*/
		},
	
	vars: {
		/*{% if vars %}
		{{ vars }}
		{% else %}*/
		e: 2.718281828459,
		pi: 3.14159265358979,
		i: math.sqrt(-1),
		//{% endif %}
		},
	
	history: {
		
		},
	}

binary_ops = ['+', '-', '*', '/', '^', '&', '|', '&&', '||']


function exec_statement( line ){

}
