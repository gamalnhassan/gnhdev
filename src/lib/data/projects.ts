import type { Project } from '$lib/types';
import HeapToy from '$lib/components/projects/HeapToy.svelte';
import CompilerToy from '$lib/components/projects/CompilerToy.svelte';
import RfidToy from '$lib/components/projects/RfidToy.svelte';
import GradingToy from '$lib/components/projects/GradingToy.svelte';

export const projects: Project[] = [
	{
		title: 'Dynamic Memory Allocator',
		stack: ['C'],
		description: [
			'A dynamic memory allocator written from scratch in C: my own malloc, free and realloc, managing the heap’s blocks and free space by hand.',
			'The goal was to squeeze out as much memory utilization and throughput as possible, measured against a first-fit reference implementation.'
		],
		toy: HeapToy
	},
	{
		title: 'ETH Course Platform',
		subtitle: 'built for Dept. of Arch @ ETH Zurich',
		stack: ['React', 'FastAPI', 'PostgreSQL'],
		description: [
			'A bespoke course management, grading, and learning platform for the Department of Architecture at ETH Zurich, whose design and implementation I led. First built and piloted for Studio Foundations, the 400+ student first-year course, it is now being adopted department-wide as the official course platform, serving 1,000+ students.'
		],
		toy: GradingToy
	},
	{
		title: 'Oat Compiler',
		stack: ['OCaml', 'x86lite'],
		description: [
			'A compiler for Oat, written in OCaml. Oat is a C-like language with structs, arrays and function pointers; the target is x86lite, a simplified subset of x86-64 assembly.',
			'The pipeline translates the typed AST into an LLVM-style intermediate representation in SSA form, then lowers that IR down to assembly.'
		],
		toy: CompilerToy
	},
	{
		title: 'Event Admission & PoS System',
		stack: ['Python', 'Raspberry Pi', 'RFID'],
		description: [
			'A Raspberry Pi–based admission system with an RFID reader, used at 20+ events to admit 3,000+ participants.',
			'It’s integrated with the VIS event management platform and the student ID service, so tapping your student card is all it takes to get in. The same setup powers an RFID-authenticated point-of-sale system, integrated with accounting and a payment gateway.'
		],
		toy: RfidToy,
		toyWidth: '14.5rem',
		arrowLow: true
	}
];
