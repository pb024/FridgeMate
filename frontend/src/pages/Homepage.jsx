import { useAuth, useUser, SignInButton } from '@clerk/clerk-react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { getInventory, searchRecipesByInventory } from '../lib/api'

function isExpiringSoon(dateStr, days = 7) {
    if (!dateStr) return false;
    const exp = new Date(dateStr);
    const now = new Date();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);
    return exp >= now && exp <= cutoff;
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function Dashboard() {
    const { user } = useUser();

    const { data: inventory = [], isLoading: loadingInventory } = useQuery({
        queryKey: ['inventory'],
        queryFn: getInventory,
    });

    const { data: recipes = [], isLoading: loadingRecipes } = useQuery({
        queryKey: ['spoonacular', 'inventory'],
        queryFn: searchRecipesByInventory,
        enabled: inventory.length > 0,
    });

    const expiringSoon = inventory.filter(item => isExpiringSoon(item.expirationDate));
    const inventoryLink = user ? `/inventory/${user.id}` : '/inventory';
    const previewRecipes = recipes.slice(0, 4);

    return (
        <div className="space-y-8">

            {/* Hero Banner */}
            <div className="bg-primary text-primary-content rounded-2xl p-8">
                <h1 className="text-3xl font-bold mb-2">Welcome to FridgeMate 🥦</h1>
                <p className="text-primary-content/80 mb-6">
                    Plan meals using what's already in your fridge — reduce waste, save money.
                </p>
                <div className="flex gap-4 flex-wrap">
                    <div className="bg-white/20 rounded-xl px-5 py-3 min-w-36">
                        <p className="text-2xl font-bold">{inventory.length}</p>
                        <p className="text-sm text-primary-content/80">Items in inventory</p>
                    </div>
                    <div className="bg-white/20 rounded-xl px-5 py-3 min-w-36">
                        <p className="text-2xl font-bold">{expiringSoon.length}</p>
                        <p className="text-sm text-primary-content/80">Expiring this week</p>
                    </div>
                </div>
            </div>

            {/* Expiring Soon */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Expiring Soon</h2>
                    <Link to={inventoryLink} className="text-primary text-sm font-medium hover:underline">
                        Manage inventory →
                    </Link>
                </div>

                {loadingInventory ? (
                    <div className="flex gap-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="skeleton h-24 w-40 rounded-xl" />
                        ))}
                    </div>
                ) : expiringSoon.length === 0 ? (
                    <div className="border-2 border-dashed border-base-300 rounded-xl py-10 text-center">
                        <p className="text-base-content/50 mb-2">No items expiring in the next 7 days.</p>
                        <Link to={inventoryLink} className="text-primary text-sm font-medium hover:underline">
                            Add items to your inventory →
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {expiringSoon.map(item => (
                            <div key={item.id} className="card bg-base-200">
                                <div className="card-body p-4 gap-1">
                                    <h3 className="font-semibold">{item.name}</h3>
                                    <p className="text-sm text-base-content/60">
                                        {item.quantity} {item.unit}
                                    </p>
                                    <div className="badge badge-warning badge-sm mt-1">
                                        Expires {formatDate(item.expirationDate)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Suggested Recipes */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Suggested Recipes</h2>
                    <Link to="/meals" className="text-primary text-sm font-medium hover:underline">
                        Browse all recipes →
                    </Link>
                </div>

                {loadingRecipes ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="skeleton h-44 rounded-xl" />
                        ))}
                    </div>
                ) : inventory.length === 0 ? (
                    <div className="border-2 border-dashed border-base-300 rounded-xl py-10 text-center">
                        <p className="text-base-content/50 mb-2">
                            Add items to your inventory to get recipe suggestions.
                        </p>
                        <Link to={inventoryLink} className="text-primary text-sm font-medium hover:underline">
                            Add ingredients →
                        </Link>
                    </div>
                ) : previewRecipes.length === 0 ? (
                    <div className="border-2 border-dashed border-base-300 rounded-xl py-10 text-center">
                        <p className="text-base-content/50">No recipe suggestions available right now.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {previewRecipes.map(recipe => (
                            <Link
                                key={recipe.id}
                                to="/meals"
                                className="card bg-base-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                            >
                                {recipe.image && (
                                    <figure>
                                        <img
                                            src={recipe.image}
                                            alt={recipe.title}
                                            className="w-full h-36 object-cover"
                                        />
                                    </figure>
                                )}
                                <div className="card-body p-3">
                                    <h3 className="font-semibold text-sm leading-snug line-clamp-2">
                                        {recipe.title}
                                    </h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

        </div>
    );
}

function LandingPage() {
    return (
        <div className="flex flex-col items-center text-center py-16 gap-12">
            <div className="space-y-4 max-w-2xl">
                <h1 className="text-5xl font-extrabold text-primary">FridgeMate</h1>
                <p className="text-xl text-base-content/70">
                    Stop wasting food. Track your ingredients, catch what's expiring,
                    and plan meals you'll actually cook.
                </p>
                <SignInButton mode="modal">
                    <button className="btn btn-primary btn-lg mt-2">Get Started</button>
                </SignInButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
                {[
                    {
                        title: 'Track Your Inventory',
                        desc: 'Log ingredients with quantities and expiration dates so nothing gets forgotten.',
                    },
                    {
                        title: 'Expiry Alerts',
                        desc: 'See at a glance what needs to be used up before it goes bad.',
                    },
                    {
                        title: 'Plan Your Meals',
                        desc: 'Schedule breakfast, lunch, and dinner and stay organised for the week.',
                    },
                ].map(feature => (
                    <div key={feature.title} className="card bg-base-200">
                        <div className="card-body items-center text-center">
                            <h3 className="card-title text-base">{feature.title}</h3>
                            <p className="text-sm text-base-content/60">{feature.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Homepage() {
    const { isSignedIn } = useAuth();
    return isSignedIn ? <Dashboard /> : <LandingPage />;
}

export default Homepage
