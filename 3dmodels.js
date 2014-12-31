'use strict';

var models = (function () {

function m3(a,b,c)
{
	if (a > b) a = [b, b = a][0];
	if (b > c) b = [c, c = b][0];
	if (a > b) return a;
	return b;
}

function random_colour()
{
	return 'hsla('+Math.random()*360+',100%,50%,0.95)';
}

function random_colour_list(n)
{
	var a = [];
	for (var i = 0; i < n; i++) a[i] = random_colour();
	return a;
}

function heat_colour(x)
{
	x = Math.sign(x)*Math.pow(Math.abs(x),0.5); // looks nicer with some compression
	var r = 0, g = 0, b = 0;
	if (x < 0) r = -255*x;
	if (x > 0) b = 255*x;
	if (x < -1) g = 255*(1-x);
	if (x > 1) g = 255*(x-1);
	r = m3(r,0,255);
	g = m3(g,0,255);
	b = m3(b,0,255);
	return 'rgb('+[r,g,b].map(Math.round).join(',')+')';
}

function append_invert(polygons)
{
	var n = polygons.length;
	for (var i = n; i < 2*n; i++)
	{
		polygons[i] = polygons[2*n-1-i].map(function (v) {return [-v[0],-v[1],-v[2]];});
		polygons[i].reverse();
	}
}

var testcube = [ [[-1,-1, 1],[ 1,-1, 1],[ 1, 1, 1],[-1, 1, 1]] // top
               , [[-1,-1,-1],[-1, 1,-1],[ 1, 1,-1],[ 1,-1,-1]] // bottom
               , [[-1,-1,-1],[ 1,-1,-1],[ 1,-1, 1],[-1,-1, 1]] // front
               , [[ 1,-1,-1],[ 1, 1,-1],[ 1, 1, 1],[ 1,-1, 1]] // right
               , [[-1, 1,-1],[-1, 1, 1],[ 1, 1, 1],[ 1, 1,-1]] // back
               , [[-1,-1,-1],[-1,-1, 1],[-1, 1, 1],[-1, 1,-1]] // left
               ];
var testcube_colours = ['rgba(0,0,0,0.95)','rgba(255,255,0,0.9)','rgba(0,204,0,0.9)','rgba(255,0,0,0.9)','rgba(0,0,255,0.9)','rgba(255,153,0,0.9)'];

var rhombicdodeca = [ [[0,0,2],[1,1,1],[0,2,0],[-1,1,1]]
                    , [[0,0,2],[1,-1,1],[2,0,0],[1,1,1]]
                    , [[0,0,2],[-1,-1,1],[0,-2,0],[1,-1,1]]
                    , [[0,0,2],[-1,1,1],[-2,0,0],[-1,-1,1]]
                    , [[2,0,0],[1,1,-1],[0,2,0],[1,1,1]]
                    , [[2,0,0],[1,-1,1],[0,-2,0],[1,-1,-1]]
                    ];
append_invert(rhombicdodeca);

var f = 1/2 + Math.sqrt(5/4);
var dodeca = [ [[-1,-1,1],[0,-f,1/f],[1,-1,1],[1/f,0,f],[-1/f,0,f]]
             , [[1,1,1],[0,f,1/f],[-1,1,1],[-1/f,0,f],[1/f,0,f]]
             , [[1,1,1],[1/f,0,f],[1,-1,1],[f,-1/f,0],[f,1/f,0]]
             , [[1,-1,-1],[f,-1/f,0],[1,-1,1],[0,-f,1/f],[0,-f,-1/f]]
             , [[-1,-1,1],[-f,-1/f,0],[-1,-1,-1],[0,-f,-1/f],[0,-f,1/f]]
             , [[-1,-1,1],[-1/f,0,f],[-1,1,1],[-f,1/f,0],[-f,-1/f,0]]
             ];
append_invert(dodeca);

var random_colours_12 = random_colour_list(12);

var dodeca_eigcolours = [
[-3.31703321e-03,-3.52951071e-01,1.27935652e-01,1.51313910e-01,-3.67399629e-01,4.48518250e-01,-4.48518250e-01,3.67399629e-01,-1.51313910e-01,-1.27935652e-01,3.52951071e-01,3.31703321e-03],
[-3.50939720e-03,2.74289084e-01,-4.27388725e-01,4.22918724e-01,-2.51229820e-01,-1.07420113e-02,1.07420113e-02,2.51229820e-01,-4.22918724e-01,4.27388725e-01,-2.74289084e-01,3.50939720e-03],
[4.99976681e-01,-2.24033568e-01,-2.25768347e-01,-2.19644835e-01,-2.27818107e-01,-2.20716988e-01,2.20716988e-01,2.27818107e-01,2.19644835e-01,2.25768347e-01,2.24033568e-01,-4.99976681e-01],
[-2.58743508e-03,-4.55719533e-01,3.53187933e-01,-8.11319541e-02,3.61121937e-01,-1.74870949e-01,-1.74870949e-01,3.61121937e-01,-8.11319541e-02,3.53187933e-01,-4.55719533e-01,-2.58743508e-03],
[-4.79236558e-02,3.51527932e-02,-4.80693215e-01,-3.59002784e-02,5.13679664e-01,1.56846919e-02,1.56846919e-02,5.13679664e-01,-3.59002784e-02,-4.80693215e-01,3.51527932e-02,-4.79236558e-02],
[0.00000000e+00,-3.69994801e-01,-1.82744075e-01,5.52498207e-01,-1.10455777e-01,1.10696445e-01,1.10696445e-01,-1.10455777e-01,5.52498207e-01,-1.82744075e-01,-3.69994801e-01,0.00000000e+00],
[6.16403992e-01,-5.60651139e-02,-1.49672240e-01,-4.23316160e-02,-7.26468126e-02,-2.95688210e-01,-2.95688210e-01,-7.26468126e-02,-4.23316160e-02,-1.49672240e-01,-5.60651139e-02,6.16403992e-01],
[-1.85497746e-01,2.60213769e-01,7.11463779e-02,3.18981517e-01,7.00912077e-02,-5.34935125e-01,-5.34935125e-01,7.00912077e-02,3.18981517e-01,7.11463779e-02,2.60213769e-01,-1.85497746e-01],
[5.00000000e-01,2.23606798e-01,2.23606798e-01,2.23606798e-01,2.23606798e-01,2.23606798e-01,-2.23606798e-01,-2.23606798e-01,-2.23606798e-01,-2.23606798e-01,-2.23606798e-01,-5.00000000e-01],
[4.56717820e-17,4.44567446e-01,1.83578965e-01,-3.31109406e-01,-3.88215832e-01,9.11788273e-02,-9.11788273e-02,3.88215832e-01,3.31109406e-01,-1.83578965e-01,-4.44567446e-01,-2.77555756e-16],
[-6.47377312e-18,4.85776270e-02,-4.07797454e-01,-3.00610314e-01,2.22010063e-01,4.37820079e-01,-4.37820079e-01,-2.22010063e-01,3.00610314e-01,4.07797454e-01,-4.85776270e-02,-5.55111512e-17],
[-2.88675135e-01,-2.88675135e-01,-2.88675135e-01,-2.88675135e-01,-2.88675135e-01,-2.88675135e-01,-2.88675135e-01,-2.88675135e-01,-2.88675135e-01,-2.88675135e-01,-2.88675135e-01,-2.88675135e-01]
].map(function (a) {return a.map(heat_colour);});

var rhombicdodeca_eigcolours = [
[-1.91027850e-03,-5.88608467e-03,-2.18473426e-01,3.19260662e-01,7.79636317e-03,2.24359511e-01,-3.17350383e-01,-1.00787236e-01,2.51367499e-01,-2.59163863e-01,5.76514246e-01,-4.75727010e-01],
[5.89671666e-01,-4.89193152e-01,4.17018058e-01,-3.24913386e-01,-1.00478514e-01,7.21750939e-02,-2.64758281e-01,-9.21046725e-02,-1.19226272e-02,1.12401142e-01,1.52357139e-01,-6.02524667e-02],
[1.79568450e-02,-2.54430638e-01,-2.69310164e-01,-2.33614789e-01,2.36473793e-01,5.23740802e-01,2.15657944e-01,5.02924953e-01,-1.97330344e-01,-3.91434486e-02,-1.76514496e-01,-3.26410458e-01],
[2.58497643e-01,3.04401730e-01,-3.14645127e-01,1.84088094e-02,-5.62899372e-01,1.02433977e-02,-2.76906452e-01,2.96236318e-01,1.13661239e-01,4.49238134e-01,-1.72331681e-01,-1.23904637e-01],
[-4.25072217e-02,-1.41162028e-01,-1.53305080e-01,3.92754165e-01,1.83669250e-01,2.94467108e-01,-3.50246944e-01,-2.39449086e-01,-5.49072633e-01,3.65403383e-01,-1.51564391e-02,2.54605525e-01],
[-3.97532782e-03,2.00387285e-02,3.97532782e-03,-2.00387285e-02,4.99582472e-01,-4.99582472e-01,-4.99582472e-01,4.99582472e-01,-2.00387285e-02,3.97532782e-03,2.00387285e-02,-3.97532782e-03],
[-4.94851602e-01,7.12440512e-02,4.94851602e-01,-7.12440512e-02,-6.79534959e-03,6.79534959e-03,6.79534959e-03,-6.79534959e-03,-7.12440512e-02,4.94851602e-01,7.12440512e-02,-4.94851602e-01],
[-7.14568988e-02,-4.94492401e-01,7.14568988e-02,4.94492401e-01,1.92659569e-02,-1.92659569e-02,-1.92659569e-02,1.92659569e-02,4.94492401e-01,7.14568988e-02,-4.94492401e-01,-7.14568988e-02],
[-4.97360902e-01,-2.66431994e-01,2.65668247e-02,-2.04362083e-01,-2.92998819e-01,2.30928908e-01,-2.30928908e-01,2.92998819e-01,2.04362083e-01,-2.65668247e-02,2.66431994e-01,4.97360902e-01],
[-1.99487176e-34,-3.96951081e-01,-4.27742305e-01,-3.07912239e-02,3.07912239e-02,-3.96951081e-01,3.96951081e-01,-3.07912239e-02,3.07912239e-02,4.27742305e-01,3.96951081e-01,-1.38777878e-16],
[5.13043184e-02,-1.46437126e-01,2.57547519e-01,4.55288963e-01,-4.03984644e-01,-1.97741444e-01,1.97741444e-01,4.03984644e-01,-4.55288963e-01,-2.57547519e-01,1.46437126e-01,-5.13043184e-02],
[-2.88675135e-01,-2.88675135e-01,-2.88675135e-01,-2.88675135e-01,-2.88675135e-01,-2.88675135e-01,-2.88675135e-01,-2.88675135e-01,-2.88675135e-01,-2.88675135e-01,-2.88675135e-01,-2.88675135e-01]
].map(function (a) {return a.map(heat_colour);});

// these are the eigenvectors of the adjacency matrices of the icosahedron and
// cuboctahedron graphs, respectively.

var models = [];
models.push({name:'test cube', polygons:testcube, colours:testcube_colours});
models.push({name:'rhombic dodecahedron (random colours)', polygons:rhombicdodeca, colours:random_colours_12});
models.push({name:'dodecahedron (random colours)', polygons:dodeca, colours:random_colours_12});

models.push({name:'dodecahedron \u03b1 1', polygons:dodeca, colours:dodeca_eigcolours[0]});
models.push({name:'dodecahedron \u03b1 2', polygons:dodeca, colours:dodeca_eigcolours[1]});
models.push({name:'dodecahedron \u03b1 3', polygons:dodeca, colours:dodeca_eigcolours[2]});
models.push({name:'dodecahedron \u03b2 1', polygons:dodeca, colours:dodeca_eigcolours[3]});
models.push({name:'dodecahedron \u03b2 2', polygons:dodeca, colours:dodeca_eigcolours[4]});
models.push({name:'dodecahedron \u03b2 3', polygons:dodeca, colours:dodeca_eigcolours[5]});
models.push({name:'dodecahedron \u03b2 4', polygons:dodeca, colours:dodeca_eigcolours[6]});
models.push({name:'dodecahedron \u03b2 5', polygons:dodeca, colours:dodeca_eigcolours[7]});
models.push({name:'dodecahedron \u03b3 1', polygons:dodeca, colours:dodeca_eigcolours[8]});
models.push({name:'dodecahedron \u03b3 2', polygons:dodeca, colours:dodeca_eigcolours[9]});
models.push({name:'dodecahedron \u03b3 3', polygons:dodeca, colours:dodeca_eigcolours[10]});

models.push({name:'rhombic dodecahedron \u03b1 1', polygons:rhombicdodeca, colours:rhombicdodeca_eigcolours[0]});
models.push({name:'rhombic dodecahedron \u03b1 2', polygons:rhombicdodeca, colours:rhombicdodeca_eigcolours[1]});
models.push({name:'rhombic dodecahedron \u03b1 3', polygons:rhombicdodeca, colours:rhombicdodeca_eigcolours[2]});
models.push({name:'rhombic dodecahedron \u03b1 4', polygons:rhombicdodeca, colours:rhombicdodeca_eigcolours[3]});
models.push({name:'rhombic dodecahedron \u03b1 5', polygons:rhombicdodeca, colours:rhombicdodeca_eigcolours[4]});
models.push({name:'rhombic dodecahedron \u03b2 1', polygons:rhombicdodeca, colours:rhombicdodeca_eigcolours[5]});
models.push({name:'rhombic dodecahedron \u03b2 2', polygons:rhombicdodeca, colours:rhombicdodeca_eigcolours[6]});
models.push({name:'rhombic dodecahedron \u03b2 3', polygons:rhombicdodeca, colours:rhombicdodeca_eigcolours[7]});
models.push({name:'rhombic dodecahedron \u03b3 1', polygons:rhombicdodeca, colours:rhombicdodeca_eigcolours[8]});
models.push({name:'rhombic dodecahedron \u03b3 2', polygons:rhombicdodeca, colours:rhombicdodeca_eigcolours[9]});
models.push({name:'rhombic dodecahedron \u03b3 3', polygons:rhombicdodeca, colours:rhombicdodeca_eigcolours[10]});



// this should probably be moved to the main file
var selectel = document.querySelector('#modelselect');
for (var i = 0; i < models.length; i++)
{
	var optionel = document.createElement('option');
	optionel.value = i;
	optionel.textContent = models[i].name;
	selectel.appendChild(optionel);
}

function choose_model(i)
{
	window.polygons = models[i].polygons;
	window.colours = models[i].colours;
	window.redraw && window.redraw();
}

selectel.addEventListener('change',function () {choose_model(selectel.value);},false);

selectel.value = 2;
choose_model(selectel.value);

return models;
})();
