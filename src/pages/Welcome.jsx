import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // React Router
import { Building } from 'lucide-react';

export default function Welcome({ auth }) {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch('/api/auth-status', { credentials: 'include' }) // fetch JSON endpoint
            .then(res => res.json())
            .then(setData);
    }, []);

   // if (!data) return <p>Loading...</p>;

    const { appIcon, appname, user } = auth || data?.auth || {};

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
            {/* Header */}
            <header className="px-6 py-6 md:px-12">
                <div className="flex justify-between items-center max-w-7xl mx-auto">
                    <div className="flex items-center space-x-3">
                        {appIcon ? (
                            <img
                                src={appIcon}
                                alt="Company logo"
                                className="h-20 w-20 object-contain rounded-md border"
                            />
                        ) : (
                            <div className="h-16 w-16 rounded-md bg-gray-100 flex items-center justify-center">
                                <Building className="h-8 w-8 text-gray-900" />
                            </div>
                        )}
                        <h1 className="text-2xl font-bold text-gray-800">{appname}</h1>
                    </div>

                    <nav>
                        {user ? (
                            <Link
                                to="/dashboard"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <div className="flex space-x-3">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium"
                                >
                                    Log in
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 -mt-10">
                <div className="max-w-4xl text-center">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
                        Streamline Your <span className="text-blue-600">Intern Management</span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
                        Track, evaluate, and collaborate with your interns in one centralized, secure dashboard.
                    </p>

                    {user ? (
                        <Link
                            to="/dashboard"
                            className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-lg"
                        >
                            Go to Dashboard
                        </Link>
                    ) : (
                        <Link
                            to="/register"
                            className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-lg"
                        >
                            Create Your Account
                        </Link>
                    )}
                </div>

                <div className="mt-16 max-w-3xl w-full">
                    <div className="bg-white rounded-2xl shadow-xl p-1">
                        <img
                            src="/interns.png"
                            alt="Intern Management Dashboard Preview"
                            className="w-full rounded-2xl"
                            onError={(e) => {
                                e.target.src = "https://placehold.co/800x400?text=Intern+Dashboard+Preview";
                            }}
                        />
                    </div>
                </div>
            </main>

            {/* Features */}
            <section className="py-16 px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Powerful Features for Teams
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Track Internships",
                                desc: "Monitor start/end dates, departments, supervisors, and progress in real time."
                            },
                            {
                                title: "Evaluate Performance",
                                desc: "Rate interns, add notes, and mark top performers for future hiring."
                            },
                            {
                                title: "Manage Projects",
                                desc: "Assign and review intern-led projects with impact metrics and feedback."
                            }
                        ].map((feature, i) => (
                            <div key={i} className="p-6 border border-gray-200 rounded-2xl hover:shadow-md transition">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <h4 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h4>
                                <p className="text-gray-600">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 text-center text-gray-500 text-sm border-t">
                © {new Date().getFullYear()} InternTrack. All rights reserved.
            </footer>
        </div>
    );
}
