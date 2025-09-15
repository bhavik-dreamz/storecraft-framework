import withStorecraft from 'storecraft-framework/next-plugin';

/** @type {import('next').NextConfig} */
const baseConfig = {
  reactStrictMode: true,
};

export default withStorecraft({
  themesPath: './themes',
})(baseConfig);
