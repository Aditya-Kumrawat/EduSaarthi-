import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FontTest = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Font Test Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Space Grotesk */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-purple-600">Space Grotesk (Headings Default)</h2>
              <h1 className="text-4xl font-bold">H1 Heading - Space Grotesk</h1>
              <h2 className="text-3xl font-semibold">H2 Heading - Space Grotesk</h2>
              <h3 className="text-2xl font-medium">H3 Heading - Space Grotesk</h3>
              <p className="font-heading text-lg">This text uses font-heading class (Space Grotesk)</p>
            </div>

            {/* Poppins */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-blue-600">Poppins (Body Default)</h2>
              <p className="text-lg">This is default body text using Poppins font.</p>
              <p className="font-body text-lg">This text uses font-body class (Poppins)</p>
              <p className="font-sans text-lg">This text uses font-sans class (Poppins)</p>
              <p className="text-base font-light">Poppins Light (300)</p>
              <p className="text-base font-normal">Poppins Regular (400)</p>
              <p className="text-base font-medium">Poppins Medium (500)</p>
              <p className="text-base font-semibold">Poppins Semi-Bold (600)</p>
              <p className="text-base font-bold">Poppins Bold (700)</p>
            </div>

            {/* Montserrat */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-green-600">Montserrat (Display)</h2>
              <p className="font-display text-lg">This text uses font-display class (Montserrat)</p>
              <h1 className="font-display text-4xl font-bold">Display Heading - Montserrat</h1>
              <p className="font-display text-base font-light">Montserrat Light (300)</p>
              <p className="font-display text-base font-normal">Montserrat Regular (400)</p>
              <p className="font-display text-base font-medium">Montserrat Medium (500)</p>
              <p className="font-display text-base font-semibold">Montserrat Semi-Bold (600)</p>
              <p className="font-display text-base font-bold">Montserrat Bold (700)</p>
              <p className="font-display text-base font-extrabold">Montserrat Extra-Bold (800)</p>
              <p className="font-display text-base font-black">Montserrat Black (900)</p>
            </div>

            {/* Mixed Usage */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-pink-600">Mixed Usage Example</h2>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="text-xl font-bold mb-2">Card Title (Space Grotesk)</h3>
                <p className="mb-2">This is body text in Poppins. It's clean and readable.</p>
                <p className="font-display text-sm text-gray-600">Footer text in Montserrat</p>
              </div>
            </div>

            {/* Dashboard Specific */}
            <div className="space-y-2 dashboard-page">
              <h2 className="text-2xl font-bold text-orange-600">Dashboard Styles</h2>
              <h3 className="dashboard-title text-xl">Dashboard Title (Montserrat)</h3>
              <p className="dashboard-text">Dashboard text content (Poppins)</p>
            </div>

            {/* Font Loading Check */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-red-600">Font Loading Status</h2>
              <div className="p-4 bg-gray-100 rounded-lg font-mono text-sm">
                <p>Check browser DevTools → Network tab → Filter by "font"</p>
                <p>You should see: Space+Grotesk, Poppins, Montserrat loading</p>
                <p className="mt-2">Or check Computed styles in Elements tab</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FontTest;
