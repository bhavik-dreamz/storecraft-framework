# testapp

A modern e-commerce store built with [StoreCraft Framework](https://storecraft-framework.com) and Next.js.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Update your Shopify credentials in `.env.local`

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view your store.

## Project Structure

- `src/app/` - Next.js app router pages
- `src/components/` - Custom React components
- `themes/` - StoreCraft themes
- `.env.local` - Environment configuration

## Available Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `myshop theme list` - List available themes
- `myshop theme switch <theme>` - Switch themes

## Learn More

- [StoreCraft Documentation](https://storecraft-framework.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Shopify Storefront API](https://shopify.dev/docs/storefront-api)