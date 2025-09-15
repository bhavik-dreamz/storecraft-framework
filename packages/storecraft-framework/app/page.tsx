export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">StoreCraft Default Home Page</h1>
      <p className="mb-4">
        This is the default StoreCraft home page. To customize this page, create a custom theme with
        a <code>pages/page.tsx</code> file.
      </p>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <p className="text-yellow-700">
          If you're seeing this page, it means:
        </p>
        <ul className="list-disc ml-6 mt-2">
          <li>Your theme doesn't have a custom home page</li>
          <li>StoreCraft framework is working correctly</li>
          <li>Next.js is properly integrated into the framework</li>
        </ul>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="border rounded p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-3">Theme Development</h2>
          <p>Create a new theme in the <code>/themes</code> directory and set it as the active theme in your <code>storecraft.config.json</code> file.</p>
        </div>
        <div className="border rounded p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-3">Shopify Integration</h2>
          <p>Connect your Shopify store by setting your domain and access token in the <code>storecraft.config.json</code> file.</p>
        </div>
      </div>
    </div>
  );
}
