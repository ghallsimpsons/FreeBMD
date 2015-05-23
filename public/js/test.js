function unit_tests(){
	var err=[];
	test_functions='function x = mysum(a,b,c)\nx=a+b+c\n  end\nfunction [x] = dsum(a,b,c)\n	x=2*(a+b+c)\n  end\n  \nfunction [x] = tsum(a,b,c)\n	m=mysum(a,b,c)\n    n=dsum(a,b,c)\n    x=m+n\n  end\n  \nfunction [x,y] = momentOfTruth(a,b,c,d)\n	x=a+b\n    y=c+d\n  end';
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
			throw("Error 4. Could not recall variable. Returned "+a);
		exitScope();
		if(math.a!=3)
			throw("Error 5. a should be 3, but was "+math.a);
		a=execStatement("a");
		if(a!=3)
			throw("Error 6. Could not recall variable. Returned "+a);
		a=execLine("a=1;");
		if(a!="")
		    throw("Error 7. Output not properly suppressed. Returned "+a);
		a=execLine("a=5;b=6");
		if(a!=6)
		    throw("Error 8. Compound assignment should have returned 6, but was "+a);
		a=execLine("a");
		if(a!=5)
		    throw("Error 9. Compound assignment failed. a should be 5, but is "+a);
	}
	catch(e){
		err.push(e);
	} 

	//Try function assignment and execution
	try{
		env.tabs[0].code=test_functions;
		runFile(0);
		if(!math.mysum||!math.dsum||!math.momentOfTruth)
			throw("Error 11. Could not attach user defined function");
		a=execStatement("dsum(1,2,3)");
		if (a!=12)
			throw("Error 12. Could not eval user func. Should have been 12, returned "+a);
		execStatement("a=dsum(2,3,4)");
		if (math.a!=18)
			throw("Error 13. User func could not define. a should be 18, was "+a);
	}
	catch(e){
		err.push(e);
	}	
	
	//Test loops, continue, break, etc
	try{
		// Calculate factorial using while loops
		var whileTest='function x = whileTest(a)\nx=1\nn=a\nwhile(n>0)\nx=n*x\nn=n-1\nend\nend';
		env.tabs[0].code=whileTest;
		runFile(0);
		a=execStatement("whileTest(4)");
		if(a!=24){
			throw("Error 21: While loops failed. a should be 24, but was "+a);
		}
		// Break factorial at n=2
		var breakTest='function x = breakTest(a)\nx=1\nn=a\nwhile(n>0)\nif n==2\nbreak\nend\nx=n*x\nn=n-1\nend\nend';
		env.tabs[0].code=breakTest;
		runFile(0);
		a=execStatement("breakTest(4)");
		if(a!=12){
			throw("Error 22: Breaking loops failed. a should be 12, but was "+a);
		}
		//Calculate factorial using for loops
		var forTest='function x = forTest(a)\nx=1\nfor n=1:a\nx=n*x\nend\nend';
		env.tabs[0].code=forTest;
		runFile(0);
		a=execStatement("forTest(4)");
		if(a!=24){
			throw("Error 23: For loops failed. a should be 24, but was "+a);
		}
		//Calculate even factorial using continue statement
		var continueTest='function x = continueTest(a)\nx=1\nfor n=1:a\nif mod(n,2)==1\ncontinue\nend\nx=n*x\nend\nend';
		env.tabs[0].code=continueTest;
		runFile(0);
		a=execStatement("continueTest(6)");
		if(a!=48){
			throw("Error 24: continue statement failed. a should be 48, but was "+a);
		}
	}
	catch(e){
		err.push(e);
	}

	// Matrices and things
    try{
        // Initialize a zeros array
        a=execLine("a=zeros(3,3);a(2,2)");
        if(a!=0)
            throw("Error 31. Zeros initialization failed. a(2,2) is "+a);
        a=execLine("a(1,2)=3; a(1,2)");
        if(a!=3)
            throw("Error 32. Failed to retrieve matrix element. Should be 3, but was "+a);
    }
	catch(e){
		err.push(e);
	}

	if(err.length>0)
		return err;
	else return "Unit tests passed!";
}
