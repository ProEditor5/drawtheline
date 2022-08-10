var currentState = "TESTING", i = -1,  scrollI = 0;
var sizes = [], result = [], colors = [], unsorted = [], prompts = [
	"RED",   "ORANGE",
	"YELLOW","GREEN",
	"CYAN",  "BLUE",
	"PURPLE","PINK"
];;

task = document.getElementsByClassName('task')[0];
indicator = document.getElementById('indicator');
scrollHint = document.getElementsByClassName('scroll-hint')[0];
resultTop = document.getElementsByClassName('rankings-top')[0];
resultBottom = document.getElementsByClassName('rankings-bottom')[0];
shareCode = document.getElementById('shareCode');
codeIn = document.getElementsByClassName('code-in')[0];

initials = prompts.map((val) => {
	return val.charAt(0).toUpperCase();
});
labels = prompts.map((val) => {
	return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
});
submitColor();

function submitColor(){
	i += 1;

	if(i != 0){ result.push(exportSliderDir()) };
	if(i < prompts.length){task.innerHTML = prompts[i]+' and '+prompts[(i+1)%prompts.length]+' ('+(i+1)+'/'+(prompts.length)+')'};
	if(i == prompts.length){
		//register results
		currentState = "RESULT";
		indicator.innerHTML = '✅';
		document.body.style.overflowY = 'scroll';

		//generate size values and render charts
		function isCloser(num){
			return num > 360 - num;
		}
		for(let i = 0; i<result.length; i++){
			let compare1, compare2, difference;
			if(i-1 == -1){
				compare1 = result[result.length-1];
			}else{
				compare1 = result[i-1];
			}
			compare2 = result[i];

			if(isCloser(compare1) && !isCloser(compare2)){
				difference = (360 - compare1) + compare2;
			}else{
				difference = compare2 - compare1;
			}

			sizes.push((difference / 360) * 100);
			colors.push(labels[i]);
		}
		unsorted = sizes.map((x) => x);
		renderChart([
			{ className: 'ct-graph1', data: unsorted }
		]);

		//codes
		shareCode.innerHTML = generateCode(unsorted);

		//stops wheel functionality
		displayResult();
		
		//sort and render rankings
		function bubbleSort (Array, Array2) {
			let len = Array.length;
			for (let i = 0; i < len; i++) {
				for (let j = 0; j < len; j++) {
					if (Array[j] < Array[j + 1]) {
						let tmp = Array[j];
						let tmp2 = Array2[j];
						Array[j] = Array[j+1];
						Array2[j] = Array2[j+1]
						Array[j + 1] = tmp;
						Array2[j+1] = tmp2;
					}
				}
			}
			return [Array, Array2];
		};
		function round(item, snap){
			return Math.round(item * snap) / snap;
		}
		function listSeg(itemNum, override=0){
			return `<br>${override===0? itemNum+1 : override}. ${colors[itemNum]} - ${round(sizes[itemNum], 10)}%.`;
		}
		bubbleSort(sizes, colors);
		resultTop.innerHTML = 'Largest Color Sections:' + listSeg(0) + listSeg(1) + listSeg(2);
		resultBottom.innerHTML = 'Smallest Color Sections:' + listSeg(colors.length-1, 1) + listSeg(colors.length-2, 2) + listSeg(colors.length-3, 3);
	};
}

//auto scroll + animation
function toggleScroll(){
	if(currentState == "TESTING"){ return };

	if (window.scrollY < window.innerHeight * 0.5){
		smoothScroll(801, 100);
	}else{
		smoothScroll(0, 100);
	}
}
function smoothScroll(factor, iterations){
	scrollI++;

	difference = factor-window.scrollY;
	if (difference > 0){
		scrollBy(0, Math.ceil(difference / 16));
	}else{
		scrollBy(0, Math.floor(difference / 16));
	}

	if(scrollI >= iterations){
		scrollI = 0;
		return;
	}
	setTimeout(smoothScroll, 5, factor, iterations);
}

//renders chart using chartistjs
function renderChart(series){
	new Chartist.Bar('.graph1-graph', {
		labels: initials,
		series: series
	},
	{
		seriesBarDistance: 10,
		axisX: {
			offset: 60,
			showGrid: false,
			showLabel: true
		},
		axisY: {
			offset: 80,
			labelInterpolationFnc: function(value) { return value + '%' },
			scaleMinSpace: 15
		},
	}).on('draw', function(data) {
		if(data.type === 'bar') {
		  	data.element.attr({ style: 'stroke-width: 10px'});
		}
	});
}

//code sharing system
function generateCode(arr){
	let out = [];
	arr.forEach((val) => {
		out.push(Math.round(val).toString(36));
	})
	return out.join('');
}
function readCode(code){
	let valid = ['0','1','2','3','4','5','6','7','8','9'];
	let out = [];
	code.split('').forEach((val) => {
		if(!valid.includes(parseInt(val, 36).toString().charAt(0))){
			out.push('error');
		}
		out.push(parseInt(val, 36));
	})
	return out;
}
function addCompare(){
	let decoded = readCode(codeIn.value);
	if(codeIn.value.length == 8 && !decoded.includes('error')){
		renderChart([
			{ className: 'ct-graph1', data: unsorted },
			{ className: 'ct-graph1-compare', data: decoded }
		]);
		console.log(decoded);
	}else{
		codeIn.value = 'Invalid Code!';
	}
}