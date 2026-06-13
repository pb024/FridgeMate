import { useState, useRef, useEffect } from 'react'
import useMeals from '../hooks/useMeals'
import useSpoonacular, { useRecipeDetails } from '../hooks/useSpoonacular'

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack']

function today() {
    return new Date().toISOString().slice(0, 10);
}

function stripHtml(html) {
    return html?.replace(/<[^>]+>/g, '') ?? '';
}

function formatDate(str) {
    return new Date(str).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric',
    });
}

// ─── MealModal ────────────────────────────────────────────────────────────────

function MealModal({ modalRef, prefillRecipeName, onSubmit, isPending }) {
    const [form, setForm] = useState({ date: today(), mealType: '', recipeName: '' });

    useEffect(() => {
        setForm({ date: today(), mealType: '', recipeName: prefillRecipeName || '' });
    }, [prefillRecipeName]);

    const set = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    return (
        <dialog ref={modalRef} className="modal">
            <div className="modal-box rounded-2xl">
                <h3 className="font-bold text-lg mb-4">Log a Meal</h3>
                <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <label className="form-control">
                            <div className="label"><span className="label-text">Date</span></div>
                            <input
                                name="date"
                                type="date"
                                className="input input-bordered rounded-xl"
                                value={form.date}
                                onChange={set}
                                required
                            />
                        </label>
                        <label className="form-control">
                            <div className="label"><span className="label-text">Meal Type</span></div>
                            <select
                                name="mealType"
                                className="select select-bordered rounded-xl"
                                value={form.mealType}
                                onChange={set}
                                required
                            >
                                <option value="">Select type</option>
                                {MEAL_TYPES.map(t => (
                                    <option key={t} value={t}>
                                        {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                    <label className="form-control w-full">
                        <div className="label"><span className="label-text">Recipe Name</span></div>
                        <input
                            name="recipeName"
                            className="input input-bordered rounded-xl w-full"
                            placeholder="Optional"
                            value={form.recipeName}
                            onChange={set}
                        />
                    </label>
                    <div className="modal-action mt-2">
                        <button
                            type="button"
                            className="btn btn-ghost rounded-xl"
                            onClick={() => modalRef.current?.close()}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary rounded-xl" disabled={isPending}>
                            {isPending ? <span className="loading loading-spinner loading-sm" /> : 'Log Meal'}
                        </button>
                    </div>
                </form>
            </div>
            <form method="dialog" className="modal-backdrop"><button>close</button></form>
        </dialog>
    );
}

// ─── RecipeDetailsModal ───────────────────────────────────────────────────────

function RecipeDetailsModal({ modalRef, recipe, isSaved, onToggleSave, onLog }) {
    const { data: details, isLoading } = useRecipeDetails(recipe?.id ?? null);

    return (
        <dialog ref={modalRef} className="modal">
            <div className="modal-box rounded-2xl max-w-2xl w-full">
                {!recipe ? null : isLoading ? (
                    <div className="flex justify-center py-16">
                        <span className="loading loading-spinner loading-lg" />
                    </div>
                ) : (
                    <>
                        {(details?.image || recipe.image) && (
                            <img
                                src={details?.image || recipe.image}
                                alt={recipe.title}
                                className="w-full h-48 object-cover rounded-xl mb-4"
                            />
                        )}
                        <h3 className="font-bold text-xl mb-1">{recipe.title}</h3>
                        {details && (
                            <div className="flex gap-4 text-sm text-base-content/60 mb-3">
                                {details.readyInMinutes && <span>{details.readyInMinutes} min</span>}
                                {details.servings && <span>{details.servings} servings</span>}
                            </div>
                        )}
                        {details?.summary && (
                            <p className="text-sm text-base-content/70 mb-4 line-clamp-4">
                                {stripHtml(details.summary)}
                            </p>
                        )}
                        {details?.extendedIngredients?.length > 0 && (
                            <div className="mb-4">
                                <h4 className="font-semibold mb-2">Ingredients</h4>
                                <ul className="grid grid-cols-2 gap-1">
                                    {details.extendedIngredients.map(ing => (
                                        <li key={ing.id} className="text-sm text-base-content/70">
                                            • {ing.original}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div className="modal-action flex gap-2 mt-2 flex-wrap">
                            <button
                                className="btn btn-ghost rounded-xl"
                                onClick={() => modalRef.current?.close()}
                            >
                                Close
                            </button>
                            <button className="btn btn-outline rounded-xl" onClick={onToggleSave}>
                                {isSaved ? 'Unsave' : 'Save Recipe'}
                            </button>
                            <button
                                className="btn btn-primary rounded-xl"
                                onClick={() => { modalRef.current?.close(); onLog(recipe.title); }}
                            >
                                Log as Meal
                            </button>
                        </div>
                    </>
                )}
            </div>
            <form method="dialog" className="modal-backdrop"><button>close</button></form>
        </dialog>
    );
}

// ─── RecipeCard ───────────────────────────────────────────────────────────────

function RecipeCard({ recipe, isSaved, onToggleSave, onDetails, onLog }) {
    return (
        <div className="card bg-base-200 rounded-xl overflow-hidden">
            {recipe.image && (
                <figure>
                    <img src={recipe.image} alt={recipe.title} className="w-full h-36 object-cover" />
                </figure>
            )}
            <div className="card-body p-3 gap-2">
                <h3 className="font-semibold text-sm leading-snug line-clamp-2">{recipe.title}</h3>
                {recipe.usedIngredientCount !== undefined && (
                    <p className="text-xs text-base-content/50">
                        {recipe.usedIngredientCount} matched · {recipe.missedIngredientCount} missing
                    </p>
                )}
                <div className="flex gap-1 flex-wrap mt-auto pt-1">
                    <button className="btn btn-xs rounded-lg flex-1" onClick={onToggleSave}>
                        {isSaved ? 'Unsave' : 'Save'}
                    </button>
                    <button className="btn btn-xs btn-ghost rounded-lg flex-1" onClick={onDetails}>
                        Details
                    </button>
                    <button className="btn btn-xs btn-primary rounded-lg w-full mt-1" onClick={onLog}>
                        Log as Meal
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── RecommendationsTab ───────────────────────────────────────────────────────

function RecommendationsTab({ onLog }) {
    const {
        searchQuery, setSearchQuery, submitSearch, clearSearch,
        isSearchMode, activeQuery, recipes, isLoading,
        savedIds, save, unsave, getSavedEntry,
    } = useSpoonacular();

    const detailsModalRef = useRef(null);
    const [selectedRecipe, setSelectedRecipe] = useState(null);

    const openDetails = (recipe) => {
        setSelectedRecipe(recipe);
        detailsModalRef.current?.showModal();
    };

    const handleToggleSave = (recipe) => {
        const entry = getSavedEntry(recipe.id);
        if (entry) {
            unsave(entry.id);
        } else {
            save({ spoonacularId: recipe.id, title: recipe.title, image: recipe.image });
        }
    };

    return (
        <div className="space-y-5">
            <form onSubmit={e => { e.preventDefault(); submitSearch(); }} className="flex gap-2">
                <input
                    className="input input-bordered rounded-xl flex-1"
                    placeholder="Search for any recipe..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="btn btn-primary rounded-xl">Search</button>
                {isSearchMode && (
                    <button type="button" className="btn btn-ghost rounded-xl" onClick={clearSearch}>
                        Clear
                    </button>
                )}
            </form>

            <p className="text-sm text-base-content/50">
                {isSearchMode
                    ? `Showing results for "${activeQuery}"`
                    : 'Suggested recipes based on your inventory'
                }
            </p>

            {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="skeleton h-52 rounded-xl" />
                    ))}
                </div>
            ) : recipes.length === 0 ? (
                <p className="text-center text-base-content/40 py-16">
                    {isSearchMode
                        ? 'No recipes found for that search.'
                        : 'Add ingredients to your inventory to get recipe suggestions.'
                    }
                </p>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {recipes.map(recipe => (
                        <RecipeCard
                            key={recipe.id}
                            recipe={recipe}
                            isSaved={savedIds.has(recipe.id)}
                            onToggleSave={() => handleToggleSave(recipe)}
                            onDetails={() => openDetails(recipe)}
                            onLog={() => onLog(recipe.title)}
                        />
                    ))}
                </div>
            )}

            <RecipeDetailsModal
                modalRef={detailsModalRef}
                recipe={selectedRecipe}
                isSaved={savedIds.has(selectedRecipe?.id)}
                onToggleSave={() => selectedRecipe && handleToggleSave(selectedRecipe)}
                onLog={(title) => onLog(title)}
            />
        </div>
    );
}

// ─── EatenMealsTab ────────────────────────────────────────────────────────────

function EatenMealsTab({ meals, isLoading, onAdd, onDelete, deletingId }) {
    const sorted = [...meals].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button className="btn btn-primary rounded-xl" onClick={() => onAdd('')}>
                    + Log Meal
                </button>
            </div>

            {isLoading ? (
                <div className="space-y-2">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="skeleton h-14 rounded-xl w-full" />
                    ))}
                </div>
            ) : sorted.length === 0 ? (
                <div className="text-center py-16 text-base-content/40">
                    <p className="text-lg font-medium">No meals logged yet.</p>
                    <p className="text-sm mt-1">Log a meal to start tracking what you eat.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl">
                    <table className="table table-zebra">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Recipe</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map(meal => (
                                <tr key={meal.id}>
                                    <td className="text-sm">{formatDate(meal.date)}</td>
                                    <td>
                                        <span className="badge badge-ghost badge-sm capitalize">
                                            {meal.mealType}
                                        </span>
                                    </td>
                                    <td className="text-sm text-base-content/70">
                                        {meal.recipeName || <span className="text-base-content/30">—</span>}
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-ghost btn-xs text-error rounded-lg"
                                            onClick={() => onDelete(meal.id)}
                                            disabled={deletingId === meal.id}
                                        >
                                            {deletingId === meal.id
                                                ? <span className="loading loading-spinner loading-xs" />
                                                : 'Delete'
                                            }
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// ─── MealsPage ────────────────────────────────────────────────────────────────

function MealsPage() {
    const [tab, setTab] = useState('recommendations');
    const mealModalRef = useRef(null);
    const [mealPrefill, setMealPrefill] = useState('');

    const { meals, isLoading: loadingMeals, create, remove, isSubmitting, deletingId } = useMeals({
        onSuccess: () => mealModalRef.current?.close(),
    });

    const openLogModal = (recipeName = '') => {
        setMealPrefill(recipeName);
        mealModalRef.current?.showModal();
    };

    const handleMealSubmit = (form) => {
        create({
            date: new Date(form.date).toISOString(),
            mealType: form.mealType,
            recipeName: form.recipeName || undefined,
        });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Meals</h1>

            <div className="tabs tabs-bordered">
                <button
                    className={`tab ${tab === 'recommendations' ? 'tab-active' : ''}`}
                    onClick={() => setTab('recommendations')}
                >
                    Recommendations
                </button>
                <button
                    className={`tab ${tab === 'eaten' ? 'tab-active' : ''}`}
                    onClick={() => setTab('eaten')}
                >
                    Eaten Meals
                </button>
            </div>

            {tab === 'recommendations' ? (
                <RecommendationsTab onLog={openLogModal} />
            ) : (
                <EatenMealsTab
                    meals={meals}
                    isLoading={loadingMeals}
                    onAdd={openLogModal}
                    onDelete={remove}
                    deletingId={deletingId}
                />
            )}

            <MealModal
                modalRef={mealModalRef}
                prefillRecipeName={mealPrefill}
                onSubmit={handleMealSubmit}
                isPending={isSubmitting}
            />
        </div>
    );
}

export default MealsPage
