function getInput () {
    var input = document.getElementById('inText').value
    
    var isValid=true;
    input = input.replace(/\s/g, '').split(',').map(function (num) {
        var toNum = parseFloat(num)
        if (isNaN(toNum)) {
            if (isValid) alert('Invalid Input');
            isValid=false;
        } else {
            return toNum;
        }
    });
    
    if (!isValid) return false;
    
    console.log(input)
    
    return input;
}

function getFactors (num) {
    var factors = [];
    
    if (num < 0) {
        num=-num
    }
    
    for (var x=1; x<=num; x++) {
        if (num % x == 0) {
            factors.push(x)
        }
    }
    
    // but factors can also be negative!
    factors = factors.concat(factors.map(function(factor){ return -factor }))
    
    return factors
    
}

function isRoot (coeffs, num) {
    var result = 0;
    
    for (var degree = coeffs.length-1; degree>-1; degree--) {
        var val = coeffs[(coeffs.length-1)-degree]*Math.pow(num, degree);
        result += val;
    }
    if (result==0) return true;
    return false
}

function polyDivide(coeffs, root) {
    var newCoeffs=[coeffs[0]];
    for (var coeff = 1; coeff<coeffs.length-1; coeff++) { 
        newCoeffs.push(coeffs[coeff]-(newCoeffs[newCoeffs.length-1]*root))
    }
    return newCoeffs;
}

function getRoots (coeffs) {
    var allRoots=[];
    
    console.log ('Factoring ' + coeffs)
    
    b_vals = getFactors(coeffs[0])
    b_vals.push(1)
    
    console.log ('b_vals are ' + b_vals)
    
    d_vals = getFactors(coeffs[coeffs.length-1])
    d_vals.push(0) // Possible that 0 is a root...
    
    console.log ('d_vals are ' + d_vals)
    
    var root=false;
    for (var b = 0; b<b_vals.length; b++) {
        for (var d = 0; d<d_vals.length; d++) {
            var maybeRoot = -d_vals[d]/b_vals[b];
            
            if (isRoot(coeffs, maybeRoot)) {
                root = [maybeRoot, d_vals[d], b_vals[b]]
                console.log ('A Root is ' + root[0] + " (d/b = " + root[1] + "/" + root[2] + ")")
                b = d = NaN // Break the Loop
            }
        }
    }
    
    if (!root) return [undefined]
    
    var newCoeffs=polyDivide(coeffs, -root[0])
    
    console.log ('New Coeffs are: ' + newCoeffs + "\n")
    
    if (newCoeffs.length!==1) {
        allRoots = getRoots(newCoeffs);
        allRoots.unshift(root)
    } else {
        return [root];
    }
    
    return allRoots
}

var gcf = function(nums) {
    var tempNums=[];
    nums.map(function (num) {
        if (num==0) return;
        if (num<0) num=-num;
        tempNums.push(num)
    })
    
    nums = tempNums;
    
    // credit to http://www.calculatorsoup.com/calculators/math/gcf.php
    
    var a = Math.max(nums[0], nums[1])
    var b = Math.min(nums[0], nums[1])
    var c = 1
    
    var gcf;
    
    for (var i = 1; i < nums.length; i++) {
        do {
            do {
                c = a - b;
                a = c;
            } 
            while (c  >  b);

            gcf = b;

            a = b;
            b = c;
        }
        while (c != 0);

        a = Math.max(gcf, nums[i]);
        b = Math.min(gcf, nums[i]);
        c = 1;
    }
    
    if (typeof gcf === 'undefined') {
    	return nums[0]
    }
    
    return gcf;
};

function reduceCoefficients (coeffs) {
    var reducedCoeffs,
        stretch;
    
    stretch = gcf(coeffs);
    reducedCoeffs = coeffs.map(function (coeff) {
        return coeff/stretch
    });
    
    return [reducedCoeffs, stretch]
}

function main () {
    var coeffs = getInput()
    if (coeffs===false) return;
    
    // FIND STRETCH VALUE BY FINDING GREATEST COMMON FACTOR BETWEEN COEFFICIENTS
    var result = reduceCoefficients(coeffs)
    coeffs=result[0];
    var stretchValue = result[1];
    
    var roots = getRoots(coeffs);
    
    console.log(roots)
    
    var answer=(stretchValue===1)?'':stretchValue;
    
    var factorable = true;
    for (var root=0; root<roots.length; root++) {
        if(typeof roots[root] === 'undefined'){
            answer = 'Sorry, this polynomial is impossible to factor!'
            factorable=false
        };
    }
    
    if (factorable) {
        var factors = roots.map(function (root) {
            if (root[0] == 0) {
            	root = "(x)";
            } else if (root[0] % 1 === 0) { //is int
                if (root[0] >= 0) {
                    root = "(x - " + root[0] + ")";
                } else {
                    root = "(x + " + (-root[0]) + ")";
                }
            } else {
                if (root[0] >= 0) {
                    root = "(" + root[2] + "x - " + (-root[1]) + ")";
                } else {
                    root = "(" + root[2] + "x + " + root[1] + ")";
                }
            }
            
            return root
        });
        
        for (var factor = 0; factor<factors.length; factor++) {
            answer+=factors[factor]
        }
    }
    
    console.log(answer)
    
    outputAnswer(answer);
}

function outputAnswer (answer) {
    if (document.getElementsByClassName('answer').length===1) {
        document.body.removeChild(document.getElementsByClassName('answer')[0])
    }
    
    var answerDiv = document.createElement('div');
    answerDiv.className = 'answer';
    answerDiv.innerHTML = answer;
    
    document.body.appendChild(answerDiv);
}

window.onload = function () {
    if (!debug) console.log = function () {};
    
    var button = document.getElementById('go')
    button.onclick = function () {
        main()
    }
    
    var textBox = document.getElementById('inText')
    textBox.onkeydown = function (evt) {
    	var keyCode = evt ? (evt.which ? evt.which : evt.keyCode) : event.keyCode;
    	if (keyCode == 13) { //enter
    		main()
    	}
    }
}

// Utility Functons
Array.range= function(a, b, step){
    var A= [];
    if(typeof a== 'number'){
        A[0]= a;
        step= step || 1;
        while(a+step<= b){
            A[A.length]= a+= step;
        }
    }
    else{
        var s= 'abcdefghijklmnopqrstuvwxyz';
        if(a=== a.toUpperCase()){
            b=b.toUpperCase();
            s= s.toUpperCase();
        }
        s= s.substring(s.indexOf(a), s.indexOf(b)+ 1);
        A= s.split('');        
    }
    return A;
}

debug=true;
