// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Boson',
  tagline: 'Bosons are cool',
  url: 'https://albireox.github.io/',
  baseUrl: '/boson/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'albireox', // Usually your GitHub org/user name.
  projectName: 'boson', // Usually your repo name.

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/'
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css')
        }
      })
    ]
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Boson',
        logo: {
          alt: 'Boson Logo',
          src: 'img/icon.png'
        },
        items: [
          {
            href: 'https://github.com/albireox/boson/',
            label: 'GitHub',
            position: 'right'
          }
        ]
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Introduction',
                to: '/'
              }
            ]
          },
          {
            title: 'Project',
            items: [{ label: 'SDSS website', href: 'https://sdss5.org' }]
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/albireox/boson/'
              },
              {
                label: 'Issue tracking',
                href: 'https://github.com/albireox/boson/issues'
              },
              {
                label: 'Releases',
                href: 'https://github.com/albireox/boson/releases/'
              }
            ]
          }
        ],
        copyright: `Copyright © ${new Date().getFullYear()} José Sánchez-Gallego. Built with Docusaurus.`
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme
      },
      colorMode: {
        defaultMode: 'dark',
        respectPrefersColorScheme: true
      }
    })
};

module.exports = config;
