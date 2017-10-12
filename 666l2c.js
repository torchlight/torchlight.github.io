/* 666l2c.js - 666 last two centres solver
version 0.3 (2017-10-12)
Copyright 2017; you may do anything (anything!) not covered by copyright law (because this is not an
EULA, duh?). You may also copy, modify, publish, distribute, sublicense or sell copies of this code,
subject to the inclusion of this copyright notice in all copies or substantial portions of the code.

(basically the MIT licence but with cruft removed, because who reads that crap)
*/

'use strict';

function counter(A)
{
	let counts = [];
	for (let a of A) counts[a] = (counts[a] || 0) + 1;
	return counts;
}

/* Combinatoric functions */

function C(n, k)
{
	if (k < 0 || k > n) return 0;
	if (k === 0 || k === n) return 1;
	let c = 1;
	for (let i = 0; i < k; i++)
	{
		c = (c * (n-i) / (i+1)) | 0;
	}
	return c;
}

function comb_to_index(l)
{
	let bits = l.length;
	let ones = 0;
	for (let i = 0; i < bits; i++) ones += +(l[i] === 1);
	let zeros = bits - ones;
	if (zeros === 0 || ones === 0 || bits === 1) return 0;
	let b = C(bits-1, ones);
	let ind = 0;
	for (let i = 0; zeros > 0 && ones > 0 && bits > 1; i++)
	{
		bits--;
		if (l[i] === 0)
		{
			b = b * --zeros / bits;
		}
		else // l[i] === 1
		{
			ind += b;
			b = b * ones-- / bits;
		}
	}
	return ind;
}

function index_to_comb(ind, ones, bits)
{
	let zeros = bits - ones;
	let b = C(bits-1 , ones);
	let l = [];
	let n = bits-1;
	for (let i = 0; i < n; i++)
	{
		bits--;
		if (ind < b)
		{
			l.push(0);
			b = b * --zeros / bits;
		}
		else
		{
			l.push(1);
			ind -= b;
			b = b * ones-- / bits;
		}
	}
	l.push(ones);
	return l;
}

function compose(A, B)
{
	let C = [];
	for (let i = 0; i < B.length; i++) C[i] = A[B[i]];
	return C;
}

function permutation_from_cycle(cycle, n)
{
	let perm = [];
	for (let i = 0; i < n; i++) perm[i] = i;
	for (let i = 0; i < cycle.length; i++)
	{
		perm[cycle[i]] = cycle[(i + 1) % cycle.length];
	}
	return perm;
}

function permutation_from_cycles(cycles, n)
{
	let perm = [];
	for (let i = 0; i < n; i++) perm[i] = i;
	for (let cycle of cycles)
	{
		for (let i = 0; i < cycle.length; i++)
		{
			perm[cycle[i]] = cycle[(i + 1) % cycle.length];
		}
	}
	return perm;
}

function unsparsify_list(d, n)
{
	let l = Array(n).fill(0);
	for (let k in d) l[k] = d[k];
	return l;
}

function compose_move(move0, move1)
{
	let move = [];
	for (let i = 0; i < 4; i++) move[i] = compose(move0[i], move1[i]);
	move[4] = move0[4] ^ move1[4];
	return move;
}

/* The basic moves */

/*

e 0 0   1 1 e
e 0 0   1 1 e
      U
e 3 3   2 2 e
e 3 3   2 2 e

e 4 4   5 5 e
e 4 4   5 5 e
      F
e 7 7   6 6 e
e 7 7   6 6 e

Speffz ordering on the pieces. We use the following order of the orbits:
0: inner X (six pieces)
1: left oblique (U-3L-2B orbit; six pieces)
2: right oblique (U-3R-2B orbit; six pieces)
3: outer X (six pieces)

We also include a 4-bit bitfield to indicate how the alignment changes.
*/

let move_U = [
	[3, 0, 1, 2, 4, 5, 6, 7],
	[3, 0, 1, 2, 4, 5, 6, 7],
	[3, 0, 1, 2, 4, 5, 6, 7],
	[3, 0, 1, 2, 4, 5, 6, 7],
	0
];
let move_2R = [
	permutation_from_cycles([], 8),
	permutation_from_cycles([[1, 5]], 8),
	permutation_from_cycles([[2, 6]], 8),
	permutation_from_cycles([[1, 5], [2, 6]], 8),
	1
];
let move_3R = [
	permutation_from_cycles([[1, 5], [2, 6]], 8),
	permutation_from_cycles([[2, 6]], 8),
	permutation_from_cycles([[1, 5]], 8),
	permutation_from_cycles([], 8),
	2
];
let move_4R = [
	permutation_from_cycles([[0, 4], [3, 7]], 8),
	permutation_from_cycles([[0, 4]], 8),
	permutation_from_cycles([[3, 7]], 8),
	permutation_from_cycles([], 8),
	4
];
let move_5R = [
	permutation_from_cycles([], 8),
	permutation_from_cycles([[3, 7]], 8),
	permutation_from_cycles([[0, 4]], 8),
	permutation_from_cycles([[0, 4], [3, 7]], 8),
	8
];


let move_2r = move_2R;
let move_3r = compose_move(move_2r, move_3R);
let move_4r = compose_move(move_3r, move_4R);
let move_5r = compose_move(move_4r, move_5R);

let moves = [move_U, move_2R, move_3R, move_4R, move_5R];
let move_names = ['U', '2R', '3R', '4R', '5R'];

let id = compose_move(move_2R, move_2R);

let moves_full = [];
for (let i = 0; i < moves.length; i++)
{
	moves_full[i] = [id];
	for (let j = 1; j < 4; j++) moves_full[i][j] = compose_move(moves_full[i][j-1], moves[i]);
}

function generate_random_state()
{
	let state = [];
	for (let i = 0; i < 4; i++) state[i] = index_to_comb(Math.floor(Math.random()*C(8, 4)), 4, 8);
	state[4] = Math.floor(Math.random()*16);
	return state;
}

let solved_state = [[0,0,0,0,1,1,1,1],[0,0,0,0,1,1,1,1],[0,0,0,0,1,1,1,1],[0,0,0,0,1,1,1,1],0];

/* Human interface stuff */

function normalise_move_sequence(move_sequence)
{
	let new_move_sequence = [];
	let alignment = 0;
	for (let [m, r] of move_sequence)
	{
		if (m === 0)
		{
			new_move_sequence.push([m, r]);
		}
		else
		{
			let parity = ((alignment >> (m-1)) & 1);
			new_move_sequence.push([m, r - 2*parity]);
			alignment ^= (1 << (m-1));
		}
	}
	return new_move_sequence;
}

function stringify_move_sequence(move_sequence)
{
	let suffixes = ["0", "", "2", "'"];
	let s = [];
	for (let [m, r] of normalise_move_sequence(move_sequence))
	{
		r = (r + 4) % 4;
		s.push(move_names[m] + suffixes[r]);
	}
	return s.join(' ');
}

function print_move_sequence(move_sequence)
{
	console.log(stringify_move_sequence(move_sequence));
}

function print_state_ansi(state)
{
	let colours = ['\x1b[42m  \x1b[0m', '\x1b[48;5;208m  \x1b[0m', '  '];
	let u = [
		state[3][0], state[1][0], state[2][1], state[3][1],
		state[2][0], state[0][0], state[0][1], state[1][1],
		state[1][3], state[0][3], state[0][2], state[2][2],
		state[3][3], state[2][3], state[1][2], state[3][2],
	];
	let f = [
		state[3][4], state[1][4], state[2][5], state[3][5],
		state[2][4], state[0][4], state[0][5], state[1][5],
		state[1][7], state[0][7], state[0][6], state[2][6],
		state[3][7], state[2][7], state[1][6], state[3][6],
	];
	for (let i = 0; i < 4; i++)
	{
		for (let j = 0; j < 4; j++)
		{
			putstr(colours[u[i*4+j]]);
		}
		print('');
	}
	print('==========');
	for (let i = 0; i < 4; i++)
	{
		for (let j = 0; j < 4; j++)
		{
			putstr(colours[f[i*4+j]]);
		}
		print('');
	}
}

function print_state(state)
{
	let colours = ['. ', '# ', '  '];
	let u = [
		state[3][0], state[1][0], state[2][1], state[3][1],
		state[2][0], state[0][0], state[0][1], state[1][1],
		state[1][3], state[0][3], state[0][2], state[2][2],
		state[3][3], state[2][3], state[1][2], state[3][2],
	];
	let f = [
		state[3][4], state[1][4], state[2][5], state[3][5],
		state[2][4], state[0][4], state[0][5], state[1][5],
		state[1][7], state[0][7], state[0][6], state[2][6],
		state[3][7], state[2][7], state[1][6], state[3][6],
	];
	for (let i = 0; i < 4; i++)
	{
		for (let j = 0; j < 4; j++)
		{
			putstr(colours[u[i*4+j]]);
		}
		print('');
	}
	print('=======');
	for (let i = 0; i < 4; i++)
	{
		for (let j = 0; j < 4; j++)
		{
			putstr(colours[f[i*4+j]]);
		}
		print('');
	}
}

function arrayify_state(state)
{
	let u = [
		[state[3][0], state[1][0], state[2][1], state[3][1]],
		[state[2][0], state[0][0], state[0][1], state[1][1]],
		[state[1][3], state[0][3], state[0][2], state[2][2]],
		[state[3][3], state[2][3], state[1][2], state[3][2]],
	];
	let f = [
		[state[3][4], state[1][4], state[2][5], state[3][5]],
		[state[2][4], state[0][4], state[0][5], state[1][5]],
		[state[1][7], state[0][7], state[0][6], state[2][6]],
		[state[3][7], state[2][7], state[1][6], state[3][6]],
	];
	return [u, f];
}

function apply_move_sequence(state, move_sequence)
{
	for (let [m, r] of move_sequence)
	{
		for (let i = 0; i < r; i++) state = compose_move(state, moves[m]);
	}
	return state;
}

function generate_random_state_scramble(slice)
{
	let S = generate_random_state();
	if (!slice) S[4] = 0;
	return invert_move_sequence(solve(S));
}

function invert_move_sequence(move_sequence)
{
	let out = [];
	for (let [m, r] of move_sequence)
	{
		out.unshift([m, m === 0 ? (4-r) % 4 : r]);
	}
	return out;
}

function generate_state_from_template(template)
{
	// 0 = U, 1 = F, 2 = unspecified
	let S = [, , , , 0];
	for (let orbit_ind = 0; orbit_ind < 4; orbit_ind++)
	{
		let orbit_template = template[orbit_ind];
		let u = orbit_template.filter(x => x === 0).length;
		let f = orbit_template.filter(x => x === 1).length;
		if (u > 4 || f > 4)
		{
			// invalid template, so do whatever
			S[orbit_ind] = index_to_comb(Math.floor(Math.random() * 70), 4, 8);
			continue;
		}
		let remaining = index_to_comb(Math.floor(Math.random() * C(8-u-f,4-f)), 4-f, 8-u-f);
		S[orbit_ind] = orbit_template.slice();
		for (let i = 0, j = 0; i < 8; i++)
		{
			if (S[orbit_ind][i] < 2) continue;
			S[orbit_ind][i] = remaining[j];
			j++;
		}
	}
	return S;
}

function generate_scramble_sequence_from_template(template)
{
	let S = generate_state_from_template(template);
	//console.log(arrayify_state(S));
	return stringify_sign(invert_move_sequence(solve_big(S)));
}

/* Alg scoring

The move sequence is converted to block turns first, with penalties applied to some moves.

Base value: 10
Half turn: +2
Non-outer block turn: +5
*/

function convert_move_sequence(move_sequence)
{
	let ms = normalise_move_sequence(move_sequence);
	let obtm_ms = [];
	let i = 0;
	while (i < ms.length)
	{
		let [m, r] = ms[i];
		// U moves never need changing
		if (m === 0)
		{
			obtm_ms.push([m, r]);
			i++;
			continue;
		}
		let layers = [0, 0, 0, 0];
		while (i < ms.length && ms[i][0] !== 0)
		{
			[m, r] = ms[i];
			layers[m-1] += r;
			i++;
		}
		if (layers[3] !== 0) obtm_ms.push([4, layers[3]]);
		if (layers[2] !== layers[3]) obtm_ms.push([3, layers[2]-layers[3]]);
		if (layers[1] !== layers[2]) obtm_ms.push([2, layers[1]-layers[2]]);
		if (layers[0] !== layers[1]) obtm_ms.push([1, layers[0]-layers[1]]);
	}
	return obtm_ms;
}

function stringify_sign(move_sequence)
{
	let ms = normalise_move_sequence(move_sequence);
	let s = [];
	let i = 0;
	let suffixes = {'-2': "2'", '-1': "'", '0': '0', '1': '', '2': '2'};
	while (i < ms.length)
	{
		let [m, r] = ms[i];
		if (m === 0)
		{
			s.push('U' + ['0', '', '2', "'"][r]);
			i++;
			continue;
		}
		let layers = [0, 0, 0, 0];
		while (i < ms.length && ms[i][0] !== 0)
		{
			[m, r] = ms[i];
			layers[m-1] += r;
			i++;
		}
		let nonzero = layers.map(x => !!x);
		let first = nonzero.indexOf(true), last = nonzero.lastIndexOf(true);
		// no-op
		if (first === -1) continue;
		// single layer
		if (first === last)
		{
			r = layers[first];
			switch (first)
			{
				case 0: s.push('r' + suffixes[r]); break;
				case 1: s.push('3R' + suffixes[r]); break;
				case 2: s.push('3L' + suffixes[-r]); break;
				case 3: s.push('l' + suffixes[-r]); break;
			}
			continue;
		}
		// single block
		if (layers.slice(first, last+1).every(x => (x === layers[first])))
		{
			r = layers[first];
			// every layer
			if (first === 0 && last === 3)
			{
				s.push('x' + suffixes[r]);
				continue;
			}
			// right outer block
			if (first === 0)
			{
				s.push((last+2) + 'r' + suffixes[r]);
				continue;
			}
			// left outer block
			if (last === 3)
			{
				s.push((5-first) + 'l' + suffixes[-r]);
				continue;
			}
			// not an outer block (i.e. 3-4r)
			s.push(`${first+2}-${last+2}r` + suffixes[r]);
			continue;
		}
		if (layers[3] !== layers[2]) s.push('l' + suffixes[layers[2]-layers[3]]);
		if (layers[2] !== 0) s.push('3l' + suffixes[-layers[2]]);
		if (layers[1] !== 0) s.push('3r' + suffixes[layers[1]]);
		if (layers[0] !== layers[1]) s.push('r' + suffixes[layers[0]-layers[1]]);
	}
	return s.join(' ');
}

function stringify_obtm_move_sequence(move_sequence)
{
	let s = [];
	let move_names = ['U', 'r', '3r', '4r', 'x'];
	for (let [m, r] of move_sequence)
	{
		let suffix = '';
		if (m === 0) suffix = ['0', '', '2', "'"][r];
		else
		{
			if (r > 1) suffix = r + '';
			else if (r === -1) suffix = "'";
			else if (r < -1) suffix = (-r) + "'";
		}
		s.push(move_names[m] + suffix);
	}
	return s.join(' ');
}

function score_move_sequence(move_sequence)
{
	let ms = convert_move_sequence(move_sequence);
	if (ms.length > 0 && ms[0][0] === 0) return ms.length-1;
	return ms.length;
}

function score_move_sequence2(move_sequence)
{
	let score = 0;
	let sign = stringify_sign(move_sequence).replace(/2'/g, '2').split(' ');
	let first = true;
	for (let move of sign)
	{
		let move_score = 10;
		let r = 1;
		switch (move[move.length-1])
		{
			case "'": r = -1; move = move.substring(0, move.length-1); break;
			case '2': r = 2; move = move.substring(0, move.length-1); move_score += 2; break;
		}
		switch (move)
		{
			case 'U': if (first) move_score = 0; break;
			case '3R':
			case '3L':
			case '3-4r': move_score += 5; break;
			case 'x': move_score = 0; break;
			//default: move_score = 1000000; break;
		}
		score += move_score;
		first = false;
	}
	return score;
}

function choose_nice_algs(generator)
{
	let optimal_sstm;
	let lowest = 999999;
	const THRESHOLD = 18;
	let list = [];
	while (true)
	{
		let {value: sol, done} = generator.next();
		if (optimal_sstm === undefined) optimal_sstm = sol.length;
		if (sol.length > optimal_sstm + 6) break;
		let score = score_move_sequence2(sol);
		if (score < lowest)
		{
			lowest = score;
			list = list.filter(x => (x[1] - lowest < THRESHOLD));
		}
		if (score - lowest < THRESHOLD)
		{
			list.push([sol, score]);
		}
	}
	list.sort((x, y) => (x[1] - y[1]));
	return list.map(x => x[0]);
}

/* Solver logic

We generate move tables for the four orbits of centres separately, then mash them together.

Pruning tables used:
- inner X + outer X + all parity
  (78400 states)
- left oblique + right oblique + all parity
  (78400 states)
- inner X + left oblique + right oblique
  (343000 states)
- outer X + right oblique + left oblique
  (343000 states; exactly the same as the previous table)
*/

function index_full(state)
{
	let index0 = (comb_to_index(state[0]) +
	              70 * comb_to_index(state[3]) + 
	              4900 * state[4]);
	let index1 = (comb_to_index(state[1]) +
	              70 * comb_to_index(state[2]) + 
	              4900 * state[4]);
	return [index0, index1];
}

function index_big(state)
{
	let index0 = (comb_to_index(state[0]) +
	              70 * comb_to_index(state[3]) + 
	              4900 * state[4]);
	let index1 = (comb_to_index(state[1]) +
	              70 * comb_to_index(state[2]) + 
	              4900 * state[4]);
	let index2 = (comb_to_index(state[0]) +
	              70 * comb_to_index(state[1]) + 
	              4900 * comb_to_index(state[2]));
	let index3 = (comb_to_index(state[3]) +
	              70 * comb_to_index(state[2]) + 
	              4900 * comb_to_index(state[1]));
	return [index0, index1, index2, index3];
}

function solve(state)
{
	let mtables = [generate_xparity_mtable(), generate_obparity_mtable()];
	let ptables = [generate_xparity_ptable(), generate_obparity_ptable()];
	return ida_solve(index_full(state), mtables, ptables);
}

function solve_gen(state)
{
	let mtables = [generate_xparity_mtable(), generate_obparity_mtable()];
	let ptables = [generate_xparity_ptable(), generate_obparity_ptable()];
	return ida_solve_gen(index_full(state), mtables, ptables);
}

function solve_big(state)
{
	let mtables = [generate_xparity_mtable(), generate_obparity_mtable()];
	mtables = mtables.concat(generate_xoo_mtables());
	let ptables = [generate_xparity_ptable(), generate_obparity_ptable()];
	ptables[2] = ptables[3] = generate_xoo_ptable();
	return ida_solve(index_big(state), mtables, ptables);
}

function solve_gen_big(state)
{
	let mtables = [generate_xparity_mtable(), generate_obparity_mtable()];
	mtables = mtables.concat(generate_xoo_mtables());
	let ptables = [generate_xparity_ptable(), generate_obparity_ptable()];
	ptables[2] = ptables[3] = generate_xoo_ptable();
	return ida_solve_gen(index_big(state), mtables, ptables);
}

let tables = {};

function generate_orbit_mtables()
{
	if (tables.orbit_mtables) return tables.orbit_mtables;
	let mtables = [];
	let C8_4 = C(8, 4);
	for (let i = 0; i < 4; i++)
	{
		mtables[i] = Array(C8_4);
		for (let j = 0; j < C8_4; j++)
		{
			mtables[i][j] = Array(moves.length);
		}
	}
	for (let ind = 0; ind < C8_4; ind++)
	{
		let comb = index_to_comb(ind, 4, 8);
		for (let i = 0; i < 4; i++)
		{
			for (let m = 0; m < moves.length; m++)
			{
				let new_comb = compose(comb, moves[m][i]);
				mtables[i][ind][m] = comb_to_index(new_comb);
			}
		}
	}
	return tables.orbit_mtables = mtables;
}

function generate_xparity_mtable()
{
	if (tables.xparity_mtable) return tables.xparity_mtable;
	// inner X, outer X, parity
	let mtable = [];
	let orbit_mtables = generate_orbit_mtables();
	for (let i = 0; i < 70; i++)
	{
		for (let j = 0; j < 70; j++)
		{
			for (let p = 0; p < 16; p++)
			{
				let ind = i + 70*j + 4900*p;
				mtable[ind] = [];
				for (let m = 0; m < moves.length; m++)
				{
					let I = orbit_mtables[0][i][m];
					let J = orbit_mtables[3][j][m];
					let P = p ^ moves[m][4];
					mtable[ind][m] = I + 70*J + 4900*P;
				}
			}
		}
	}
	return tables.xparity_mtable = mtable;
}

function generate_obparity_mtable()
{
	if (tables.obparity_mtable) return tables.obparity_mtable;
	// left oblique, right oblique, parity
	let mtable = [];
	let orbit_mtables = generate_orbit_mtables();
	for (let i = 0; i < 70; i++)
	{
		for (let j = 0; j < 70; j++)
		{
			for (let p = 0; p < 16; p++)
			{
				let ind = i + 70*j + 4900*p;
				mtable[ind] = [];
				for (let m = 0; m < moves.length; m++)
				{
					let I = orbit_mtables[1][i][m];
					let J = orbit_mtables[2][j][m];
					let P = p ^ moves[m][4];
					mtable[ind][m] = I + 70*J + 4900*P;
				}
			}
		}
	}
	return tables.obparity_mtable = mtable;
}

function generate_xoo_mtables()
{
	if (tables.xoo_mtables) return tables.xoo_mtables;
	// two tables!
	// 0: inner x, left oblique, right oblique
	// 1: outer x, right oblique, left oblique
	// (we use the opposite order in the second table because then we can use automorphism magic
	// to generate only one pruning table)
	let mtable0 = [], mtable1 = [];
	let orbit_mtables = generate_orbit_mtables();
	for (let i = 0; i < 70; i++)
	{
		for (let j = 0; j < 70; j++)
		{
			for (let k = 0; k < 70; k++)
			{
				let ind = i + 70*j + 4900*k;
				mtable0[ind] = [];
				mtable1[ind] = [];
				for (let m = 0; m < moves.length; m++)
				{
					let I = orbit_mtables[0][i][m];
					let J = orbit_mtables[1][j][m];
					let K = orbit_mtables[2][k][m];
					let m1 = m !== 0 ? ((m-1)^1)+1 : 0;
					mtable0[ind][m] = mtable1[ind][m1] = I + 70*J + 4900*K;
				}
			}
		}
	}
	return tables.xoo_mtables = [mtable0, mtable1];
}

function generate_xparity_ptable()
{
	if (tables.xparity_ptable) return tables.xparity_ptable;
	let mtable = generate_xparity_mtable();
	let goal_states = [0];
	return tables.xparity_ptable = bfs(mtable, goal_states);
}

function generate_partialxparity_ptable()
{
	if (tables.partialxparity_ptable) return tables.partialxparity_ptable;
	let mtable = generate_xparity_mtable();
	let goal_states = [];
	for (let i = 0; i < 70; i++) goal_states[i] = 70*i;
	return tables.partialxparity_ptable = bfs(mtable, goal_states);
}

function generate_obparity_ptable()
{
	if (tables.obparity_ptable) return tables.obparity_ptable;
	let mtable = generate_obparity_mtable();
	let goal_states = [0];
	return tables.obparity_ptable = bfs(mtable, goal_states);
}

function generate_partialobparity_ptable()
{
	if (tables.partialobparity_ptable) return tables.partialobparity_ptable;
	let mtable = generate_obparity_mtable();
	let goal_states = [];
	for (let i = 0; i < 70; i++)
	{
		let c = index_to_comb(i, 4, 8);
		let j = comb_to_index([c[3], c[0], c[1], c[2], c[7], c[4], c[5], c[6]]);
		goal_states[i] = i + 70*j;
	}
	return tables.partialobparity_ptable = bfs(mtable, goal_states);
}

function generate_xoo_ptable()
{
	if (tables.xoo_ptable) return tables.xoo_ptable;
	let mtable = generate_xoo_mtables()[0];
	return tables.xoo_ptable = bfs(mtable, [0]);
}


function binary_search(A, x)
{
	let lo = 0, hi = A.length-1;
	while (hi - lo > 1)
	{
		// invariants: hi - lo >= 2; x > A[lo-1]; x < A[hi+1]
		let mid = (lo + hi) >> 1; // lo < mid < hi
		if (x > A[mid]) lo = mid + 1;
		else hi = mid;
	}
	return x === A[lo] || x === A[hi];
}

function bfs(mtable, goal_states)
{
	let N = mtable.length;
	let nmoves = mtable[0].length;
	let ptable = Array(N).fill(-1);
	let queue = goal_states.slice(), new_queue = [];
	let depth = 0;
	while (queue.length > 0)
	{
		new_queue.length = 0;
		for (let state of queue)
		{
			if (ptable[state] !== -1) continue;
			ptable[state] = depth;
			for (let move_index = 0; move_index < nmoves; move_index++)
			{
				let new_state = mtable[state][move_index];
				while (new_state != state)
				{
					new_queue.push(new_state);
					new_state = mtable[new_state][move_index];
				}
			}
		}
		[queue, new_queue] = [new_queue, queue];
		depth += 1;
	}
	return ptable;
}

function ida_solve(indices, mtables, ptables)
{
	let ncoords = indices.length;
	let bound = 0;
	for (let i = 0; i < ncoords; i++) bound = Math.max(bound, ptables[i][indices[i]]);
	while (true)
	{
		let path = ida_search(indices, mtables, ptables, bound, -1);
		if (path !== undefined) return path;
		bound++;
	}
}

function ida_search(indices, mtables, ptables, bound, last)
{
	let ncoords = indices.length;
	let nmoves = mtables[0][0].length;
	let heuristic = 0;
	for (let i = 0; i < ncoords; i++) heuristic = Math.max(heuristic, ptables[i][indices[i]]);
	if (heuristic > bound) return;
	if (bound === 0 || heuristic === 0) return [];
	for (let m = 0; m < nmoves; m++)
	{
		if (m === last) continue;
		let new_indices = indices.slice();
		for (let c = 0; c < ncoords; c++) new_indices[c] = mtables[c][indices[c]][m];
		let r = 1;
		while (indices.some((_, i) => indices[i] != new_indices[i]))
		{
			let subpath = ida_search(new_indices, mtables, ptables, bound-1, m);
			if (subpath !== undefined) return [[m, r]].concat(subpath);
			for (let c = 0; c < ncoords; c++)
			{
				new_indices[c] = mtables[c][new_indices[c]][m];
			}
			r++;
		}
	}
	return;
}

function* ida_solve_gen(indices, mtables, ptables)
{
	let ncoords = indices.length;
	let bound = 0;
	for (let i = 0; i < ncoords; i++) bound = Math.max(bound, ptables[i][indices[i]]);
	while (true)
	{
		yield* ida_search_gen(indices, mtables, ptables, bound, -1);
		bound++;
	}
}

function* ida_search_gen(indices, mtables, ptables, bound, last)
{
	let ncoords = indices.length;
	let nmoves = mtables[0][0].length;
	let heuristic = 0;
	for (let i = 0; i < ncoords; i++) heuristic = Math.max(heuristic, ptables[i][indices[i]]);
	if (heuristic > bound) return;
	if (bound === 0)
	{
		yield [];
		return;
	}
	if (heuristic === 0) return;
	for (let m = 0; m < nmoves; m++)
	{
		if (m === last) continue;
		if (m > 0 && last > 0 && m < last) continue; // enforce order on commuting moves
		let new_indices = indices.slice();
		for (let c = 0; c < ncoords; c++) new_indices[c] = mtables[c][indices[c]][m];
		let r = 1;
		while (indices.some((_, i) => indices[i] != new_indices[i]))
		{
			let subpath_gen = ida_search_gen(new_indices, mtables, ptables, bound-1, m);
			while (true)
			{
				let {value: subpath, done} = subpath_gen.next();
				if (done) break;
				yield [[m, r]].concat(subpath);
			}
			for (let c = 0; c < ncoords; c++)
			{
				new_indices[c] = mtables[c][new_indices[c]][m];
			}
			r++;
		}
	}
	return;
}
