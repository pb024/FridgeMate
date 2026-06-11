import { useAuth, useUser, SignInButton } from '@clerk/clerk-react'
import { useQuery } from '@tanstack/react-query'
import { getInventory, getMeals } from '../lib/api'

function isExpiringSoon(dateStr, days = 7) {
    if (!dateStr) return false;
    const exp = new Date(dateStr);
    const now = new Date();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);
    return exp >= now && exp <= cutoff;
}

function isUpcoming(dateStr, days = 7) {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);
    return d >= today && d <= cutoff;
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

    const { data: meals = [], isLoading: loadingMeals } = useQuery({
        queryKey: ['meals'],
        queryFn: getMeals,
    });

    const expiringSoon = inventory.filter(item => isExpiringSoon(item.expirationDate));
    const upcomingMeals = meals
        .filter(meal => isUpcoming(meal.date))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">
                    Welcome back, {user?.firstName || user?.name}!
                </h1>
                <p className="text-base-content/60 mt-1">Here's what's going on in your kitchen.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="stat bg-base-200 rounded-box">
                    <div className="stat-title">Total Items</div>
                    <div className="stat-value">{inventory.length}</div>
                    <div className="stat-desc">in your fridge</div>
                </div>
                <div className="stat bg-base-200 rounded-box">
                    <div className="stat-title">Expiring Soon</div>
                    <div className={`stat-value ${expiringSoon.length > 0 ? 'text-warning' : ''}`}>
                        {expiringSoon.length}
                    </div>
                    <div className="stat-desc">within 7 days</div>
                </div>
                <div className="stat bg-base-200 rounded-box">
                    <div className="stat-title">Upcoming Meals</div>
                    <div className="stat-value">{upcomingMeals.length}</div>
                    <div className="stat-desc">next 7 days</div>
                </div>
            </div>

            <section>
                <h2 className="text-xl font-semibold mb-3">Expiring Soon</h2>
                {loadingInventory ? (
                    <div className="flex gap-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="skeleton h-24 w-40 rounded-box" />
                        ))}
                    </div>
                ) : expiringSoon.length === 0 ? (
                    <p className="text-base-content/50">Nothing expiring in the next 7 days.</p>
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

            <section>
                <h2 className="text-xl font-semibold mb-3">Upcoming Meals</h2>
                {loadingMeals ? (
                    <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="skeleton h-12 w-full rounded-box" />
                        ))}
                    </div>
                ) : upcomingMeals.length === 0 ? (
                    <p className="text-base-content/50">No meals planned for the next 7 days.</p>
                ) : (
                    <div className="space-y-2">
                        {upcomingMeals.map(meal => (
                            <div
                                key={meal.id}
                                className="flex items-center gap-3 p-3 bg-base-200 rounded-box"
                            >
                                <div className="badge badge-primary badge-sm shrink-0">
                                    {formatDate(meal.date)}
                                </div>
                                <span className="capitalize font-medium">{meal.mealType}</span>
                                {meal.recipeName && (
                                    <span className="text-base-content/60 text-sm truncate">
                                        — {meal.recipeName}
                                    </span>
                                )}
                            </div>
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
