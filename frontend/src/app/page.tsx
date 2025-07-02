'use client';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-gray-800 pt-20">
      

      {/* Hero */}
      <section className="bg-blue-50 py-20 px-6 text-center">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
          Find Perfect Business Partners
        </h2>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-6">
          Connect with companies, discover opportunities, and grow your business through our comprehensive tender platform.
        </p>
        <div className="flex justify-center space-x-4">
          <a href="/register" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Get Started
          </a>
          <a href="/login" className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition">
            Sign In
          </a>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-6 bg-white">
        <h3 className="text-3xl font-bold text-center mb-12">Why Choose Our Platform?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-gray-50 rounded-lg p-6 border text-center shadow-sm">
            <h4 className="text-xl font-semibold text-blue-600 mb-2">Easy Discovery</h4>
            <p className="text-gray-600">
              Find the right companies and tenders with our powerful search and filtering capabilities.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6 border text-center shadow-sm">
            <h4 className="text-xl font-semibold text-blue-600 mb-2">Streamlined Process</h4>
            <p className="text-gray-600">
              Submit and manage tender applications with our intuitive interface.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6 border text-center shadow-sm">
            <h4 className="text-xl font-semibold text-blue-600 mb-2">Trusted Network</h4>
            <p className="text-gray-600">
              Join a community of verified businesses and build lasting partnerships.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 text-white py-16 px-6 text-center">
        <h3 className="text-3xl font-bold mb-4">Ready to Grow Your Business?</h3>
        <p className="mb-6 text-lg">Join thousands of companies already using our platform to find new opportunities</p>
        <a href="/register" className="px-8 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition">
          Start Free Today
        </a>
      </section>
    </main>
  );
}
