// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';

const GITHUB_USERNAME = 'akhilshastri';
const REPO_NAME = 'react-tanstack-handbook';
const SITE_URL = `https://${GITHUB_USERNAME}.github.io/${REPO_NAME}`;
const OG_IMAGE_URL = `${SITE_URL}/og-image.png`;

// https://astro.build/config
export default defineConfig({
	site: `https://${GITHUB_USERNAME}.github.io`,
	base: `/${REPO_NAME}`,
	integrations: [
		// must come before starlight()
		mermaid({
			theme: 'base',
			autoTheme: true,
			mermaidConfig: {
				themeVariables: {
					fontFamily: '"IBM Plex Mono", monospace',
					background: '#0d0f13',
					mainBkg: '#171a21',
					primaryColor: '#171a21',
					primaryTextColor: '#e7e5de',
					primaryBorderColor: '#e8a33d',
					lineColor: '#e8a33d',
					secondaryColor: '#24262d',
					tertiaryColor: '#0d0f13',
					textColor: '#e7e5de',
				},
			},
		}),
		starlight({
			title: 'TanStack Start Handbook',
			description: 'An intermediate-to-advanced handbook for TanStack Start: rendering, server functions, state, patterns, and deployment.',
			logo: {
				light: './src/assets/logo-light.svg',
				dark: './src/assets/logo-dark.svg',
			},
			customCss: ['./src/styles/custom.css'],
			social: [
				{ icon: 'github', label: 'GitHub', href: `https://github.com/${GITHUB_USERNAME}/${REPO_NAME}` },
			],
			head: [
				{ tag: 'meta', attrs: { property: 'og:type', content: 'website' } },
				{ tag: 'meta', attrs: { property: 'og:title', content: 'TanStack Start Handbook' } },
				{
					tag: 'meta',
					attrs: {
						property: 'og:description',
						content: 'Rendering, server functions, state, real-world patterns, and deployment — for developers who already know React.',
					},
				},
				{ tag: 'meta', attrs: { property: 'og:image', content: OG_IMAGE_URL } },
				{ tag: 'meta', attrs: { property: 'og:url', content: `${SITE_URL}/` } },
				{ tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
				{ tag: 'meta', attrs: { name: 'twitter:image', content: OG_IMAGE_URL } },
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
