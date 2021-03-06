EX3D = {

	data: {
		lV : 0,
		rV : 0,
	},
	knob : null,
	mapKnob : null,
	size : 120

};

window.addEventListener("load",function(){

	EX3D.init(180);

});

EX3D.init = function(size){
	EX3D.knob = document.getElementById("EX3DShow_knob");
	EX3D.mapKnob = document.getElementById("EX3DShow_map");
	var range =  document.getElementById("EX3DShow_range");

	if(size){
		EX3D.size = size;
	}

	range.style.height = size*2 + "px";
	range.style.width = size*2 + "px";
}

EX3D.calcuDrive = function(roll,pitch){

		deltaX = ((roll/512) - 1 );
		
		deltaY = ((pitch/512) - 1 );


		EX3D.knob.style.transform = "translateX(" + deltaX * EX3D.size  +"px) translateY(" + deltaY * EX3D.size +"px)";


		var arcTanValue = Math.atan(deltaY/deltaX);

		//console.log( arcTanValue / Math.PI * 360 );

		var ratio = null;
		var map = {};

		//ratio = Math.sin(arcTanValue);

		if( Math.abs(deltaY/deltaX) > 1 ){
			ratio = Math.sin(arcTanValue);
			map = getMapVal();

			if( deltaY < 0 ){
				map.x = -map.x;
				map.y = -map.y;
			}

		}
		else{
			ratio = Math.cos(arcTanValue);
			map = getMapVal();
			
			if( deltaX < 0 ){
				map.x = -map.x;
				map.y = -map.y;
			}

		}

		//console.log(ratio);

		function getMapVal(){
			var map = {};
			var disDelta = ( Math.sqrt(Math.pow(deltaX * EX3D.size,2) + Math.pow(deltaY * EX3D.size,2)) );
			map.r = disDelta * ratio;
			map.x = Math.cos(arcTanValue) * map.r;
			map.y = Math.sin(arcTanValue) * map.r;

			return map
		}


		//console.log( deltaY/deltaX );

		EX3D.mapKnob.style.transform = "translateX(" + map.x  +"px) translateY(" + map.y +"px)";

		var power = Math.abs((map.r/EX3D.size).toPrecision(3));
		var dir = ( arcTanValue / Math.PI * 180 );
			if(dir < 0){
				dir += 180; 
			}
		dir = Number(dir.toPrecision(3));

		if(deltaY < 0 ){

			var map = getMapVal();


			EX3D.data.lV =  parseInt((dir/45 - 1) * power * power * 50);
			EX3D.data.rV =  parseInt((3 - dir/45) * power * power * 50);

			if(EX3D.data.lV > 50 ){
				EX3D.data.lV = 50;
			}
			if(EX3D.data.rV > 50 ){
				EX3D.data.rV = 50;
			}

		}
		else{

			EX3D.data.lV =  parseInt((dir/45 - 1) * power * power * -50);
			EX3D.data.rV =  parseInt((3 - dir/45) * power * power * -50);

			if(EX3D.data.lV < -50 ){
				EX3D.data.lV = -50;
			}
			else if(EX3D.data.lV == -0){
				EX3D.data.lV = 0;
			}
			if(EX3D.data.rV < -50 ){
				EX3D.data.rV = -50;
			}
			else if(EX3D.data.rV == -0){
				EX3D.data.rV = 0;
			}
		}

		if( isNaN(EX3D.data.rV ) || isNaN(EX3D.data.lV) ){
			EX3D.data = {
				lV : 0,
				rV : 0
			}
		}

		EX3D.data.type = "DR";

		console.log(EX3D.data);

}

