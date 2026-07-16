// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';

const GITHUB_USERNAME = 'akhilshastri';
const REPO_NAME = 'react-tanstack-handbook';

// https://astro.build/config
export default defineConfig({
	site: `https://${GITHUB_USERNAME}.github.io`,
	base: `/${REPO_NAME}`,
	integrations: [
		// must come before starlight()
		mermaid({ theme: 'forest' }),
		starlight({
			title: 'TanStack Start Handbook',
			description: 'An intermediate-to-advanced handbook for TanStack Start: rendering, server functions, state, patterns, and deployment.',
			social: [
				{ icon: 'github', label: 'GitHub', href: `https://github.com/${GITHUB_USERNAME}/${REPO_NAME}` },
			],
			sidebar: [
				{
					label: 'Part 0 — Orientation',
					items: [{ autogenerate: { directory: '00-orientation' } }],
				},
				{
					label: 'Part 1 — Setup & Architecture',
					items: [{ autogenerate: { directory: '01-setup-and-architecture' } }],
				},
				{
					label: 'Part 2 — Rendering Model',
					items: [{ autogenerate: { directory: '02-rendering-model' } }],
				},
				{
					label: 'Part 3 — Server Functions, Forms & Security',
					items: [{ autogenerate: { directory: '03-server-functions-forms-security' } }],
				},
				{
					label: 'Part 4 — State & Data',
					items: [{ autogenerate: { directory: '04-state-and-data' } }],
				},
				{
					label: 'Part 5 — Advanced Configuration',
					items: [{ autogenerate: { directory: '05-advanced-config' } }],
				},
				{
					label: 'Part 6 — Patterns by App Shape',
					items: [{ autogenerate: { directory: '06-patterns' } }],
				},
				{
					label: 'Part 7 — Testing & Performance',
					items: [{ autogenerate: { directory: '07-testing-and-performance' } }],
				},
				{
					label: 'Part 8 — Deployment',
					items: [{ autogenerate: { directory: '08-deployment' } }],
				},
				{
					label: 'Part 9 — Appendices',
					items: [{ autogenerate: { directory: '09-appendices' } }],
				},
			],
		}),
	],
});
