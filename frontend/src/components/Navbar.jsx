import { SignedIn, SignedOut, SignInButton, SignOutButton, useUser } from '@clerk/clerk-react'
import { NavLink } from 'react-router'

function Navbar() {
    const { user } = useUser()

    const navLinkClass = ({ isActive }) =>
        `px-3 py-1 rounded-md font-medium transition-colors ${isActive
            ? 'bg-primary text-primary-content'
            : 'hover:bg-base-200'
        }`

    return (
        <nav className="navbar bg-base-200 border-b border-base-200 px-4 sticky top-0 z-50">
            <div className="navbar-start">
                <NavLink to="/" className="text-xl font-bold text-primary">
                    FridgeMate
                </NavLink>
            </div>

            <div className="navbar-center flex gap-1">
                <NavLink to="/" end className={navLinkClass}>
                    Home
                </NavLink>
                <NavLink
                    to={user ? `/inventory/${user.id}` : '/inventory'}
                    className={navLinkClass}
                >
                    Inventory
                </NavLink>
                <NavLink to="/Meals" className={navLinkClass}>
                    Meals
                </NavLink>
            </div>

            <div className="navbar-end">
                <SignedOut>
                    <SignInButton mode="modal">
                        <button className="btn btn-primary btn-sm">Sign In</button>
                    </SignInButton>
                </SignedOut>
                <SignedIn>
                    <SignOutButton>
                        <button className="btn btn-outline btn-sm">Sign Out</button>
                    </SignOutButton>
                </SignedIn>
            </div>
        </nav>
    )
}

export default Navbar
