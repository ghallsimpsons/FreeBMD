function unit_tests(){
	var err=[];
	test_functions='function [x] = mysum[a,b,c]\nx=a+b+c\n  end\nfunction [x] = dsum[a,b,c]\n	x=2*(a+b+c)\n  end\n  \nfunction [x] = tsum[a,b,c]\n	m=mysum(a,b,c)\n    n=dsum(a,b,c)\n    x=m+n\n  end\n  \nfunction [x,y] = momentOfTruth[a,b,c,d]\n	x=a+b\n    y=c+d\n  end';
	//Test basic math
	try{
		a=execStatement("2+2");
		if(a!=4)
			throw("Error 0. Could not add 2+2; returned "+a);
	}
	catch(e){
		err.push(e);
	}

	//Test Assignment and scoping
	try{
		execStatement("a=3");
		if(math.a!=3)
			throw("Error 1. Assigned a to 3 but was "+math.a);
		enterScope();
		if(math.a!=3)	
			throw("Error 2. Assigned a to 3 but was "+math.a);
		execStatement("a=2");
		if(math.a!=2)
			throw("Error 3. Assigned a to 2 but was "+math.a);
		a=execStatement("a");
		if(a!=2)
			throw("Error 3a. Could not recall variable. Returned "+a);
		exitScope();
		if(math.a!=3)
			throw("Error 4. a should be 3, but was "+math.a);
		a=execStatement("a");
		if(a!=3)
			throw("Error 5. Could not recall variable. Returned "+a);
	}
	catch(e){
		err.push(e);
	} 

	//Try function assignment and execution
	try{
		env.tabs[0].code=test_functions;
		runFile(0);
		if(!math.mysum||!math.dsum||!math.momentOfTruth)
			throw("Error 6. Could not attach user defined function");
		a=execStatement("dsum(1,2,3)");
		if (a!=12)
			throw("Error 7. Could not eval user func. Should have been 12, returned "+a);
		execStatement("a=dsum(2,3,4)");
		if (math.a!=18)
			throw("Error 8. User func could not define. a should be 18, was "+a);
	}
	catch(e){
		err.push(e);
	}	
	if(err.length>0)
		return err;
	else return "Unit tests passed!";
}
