import { useState, useRef, useEffect } from 'react'
import useInventory from '../hooks/useInventory'

const UNITS = ['g', 'kg', 'oz', 'lb', 'ml', 'L', 'cup', 'tbsp', 'tsp', 'piece', 'slice', 'bunch', 'can', 'pack']
const CATEGORIES = ['Produce', 'Dairy', 'Meat', 'Seafood', 'Grains', 'Frozen', 'Condiments', 'Beverages', 'Snacks', 'Other']
const EMPTY_FORM = { name: '', quantity: '', unit: '', category: '', purchaseDate: '', expirationDate: '' }

function daysUntil(dateStr) {
    if (!dateStr) return null;
    return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}

function formatDate(dateStr) {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function toInputDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toISOString().slice(0, 10);
}

function IngredientModal({ modalRef, editItem, onSubmit, isPending }) {
    const [form, setForm] = useState(EMPTY_FORM);

    useEffect(() => {
        setForm(editItem ? {
            name: editItem.name,
            quantity: editItem.quantity,
            unit: editItem.unit,
            category: editItem.category || '',
            purchaseDate: toInputDate(editItem.purchaseDate),
            expirationDate: toInputDate(editItem.expirationDate),
        } : EMPTY_FORM);
    }, [editItem]);

    const set = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    return (
        <dialog ref={modalRef} className="modal">
            <div className="modal-box rounded-2xl">
                <h3 className="font-bold text-lg mb-4">
                    {editItem ? 'Edit Ingredient' : 'Add Ingredient'}
                </h3>
                <form
                    onSubmit={e => { e.preventDefault(); onSubmit(form); }}
                    className="space-y-3"
                >
                    <label className="form-control w-full">
                        <div className="label"><span className="label-text">Name</span></div>
                        <input
                            name="name"
                            className="input input-bordered rounded-xl w-full"
                            value={form.name}
                            onChange={set}
                            required
                        />
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                        <label className="form-control">
                            <div className="label"><span className="label-text">Quantity</span></div>
                            <input
                                name="quantity"
                                type="number"
                                min="0"
                                className="input input-bordered rounded-xl"
                                value={form.quantity}
                                onChange={set}
                                required
                            />
                        </label>
                        <label className="form-control">
                            <div className="label"><span className="label-text">Unit</span></div>
                            <select
                                name="unit"
                                className="select select-bordered rounded-xl"
                                value={form.unit}
                                onChange={set}
                                required
                            >
                                <option value="">Select unit</option>
                                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </label>
                    </div>

                    <label className="form-control w-full">
                        <div className="label"><span className="label-text">Category</span></div>
                        <select
                            name="category"
                            className="select select-bordered rounded-xl w-full"
                            value={form.category}
                            onChange={set}
                        >
                            <option value="">None</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                        <label className="form-control">
                            <div className="label"><span className="label-text">Purchase Date</span></div>
                            <input
                                name="purchaseDate"
                                type="date"
                                className="input input-bordered rounded-xl"
                                value={form.purchaseDate}
                                onChange={set}
                            />
                        </label>
                        <label className="form-control">
                            <div className="label"><span className="label-text">Expiration Date</span></div>
                            <input
                                name="expirationDate"
                                type="date"
                                className="input input-bordered rounded-xl"
                                value={form.expirationDate}
                                onChange={set}
                            />
                        </label>
                    </div>

                    <div className="modal-action mt-2">
                        <button
                            type="button"
                            className="btn btn-ghost rounded-xl"
                            onClick={() => modalRef.current?.close()}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary rounded-xl" disabled={isPending}>
                            {isPending
                                ? <span className="loading loading-spinner loading-sm" />
                                : editItem ? 'Save Changes' : 'Add Ingredient'
                            }
                        </button>
                    </div>
                </form>
            </div>
            <form method="dialog" className="modal-backdrop"><button>close</button></form>
        </dialog>
    );
}

function InventoryPage() {
    const modalRef = useRef(null);
    const [editItem, setEditItem] = useState(null);

    const { inventory, isLoading, create, update, remove, isSubmitting, deletingId } = useInventory({
        onSuccess: () => modalRef.current?.close(),
    });

    const openAdd = () => {
        setEditItem(null);
        modalRef.current?.showModal();
    };

    const openEdit = (item) => {
        setEditItem(item);
        modalRef.current?.showModal();
    };

    const handleSubmit = (form) => {
        const payload = {
            name: form.name,
            quantity: Number(form.quantity),
            unit: form.unit,
            category: form.category || undefined,
            purchaseDate: form.purchaseDate || undefined,
            expirationDate: form.expirationDate || undefined,
        };
        if (editItem) {
            update({ id: editItem.id, data: payload });
        } else {
            create(payload);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Inventory</h1>
                    <p className="text-base-content/60 text-sm mt-0.5">
                        {inventory.length} item{inventory.length !== 1 ? 's' : ''} in your fridge
                    </p>
                </div>
                <button className="btn btn-primary rounded-xl" onClick={openAdd}>
                    + Add Ingredient
                </button>
            </div>

            {isLoading ? (
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="skeleton h-14 w-full rounded-box" />
                    ))}
                </div>
            ) : inventory.length === 0 ? (
                <div className="text-center py-24 text-base-content/40">
                    <p className="text-lg font-medium">Your fridge is empty.</p>
                    <p className="text-sm mt-1">Add your first ingredient to get started.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl">
                    <table className="table table-zebra">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Quantity</th>
                                <th>Category</th>
                                <th>Expires</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventory.map(item => {
                                const days = daysUntil(item.expirationDate);
                                const expired = days !== null && days < 0;
                                const expiringSoon = days !== null && days >= 0 && days <= 7;

                                return (
                                    <tr key={item.id}>
                                        <td className="font-medium">{item.name}</td>
                                        <td>{item.quantity} {item.unit}</td>
                                        <td>
                                            {item.category
                                                ? <span className="badge badge-ghost badge-sm">{item.category}</span>
                                                : <span className="text-base-content/30">—</span>
                                            }
                                        </td>
                                        <td>
                                            {item.expirationDate ? (
                                                <span className={`text-sm ${expired ? 'text-error font-semibold' : expiringSoon ? 'text-warning font-semibold' : ''}`}>
                                                    {formatDate(item.expirationDate)}
                                                    {expired && <span className="ml-1 badge badge-error badge-xs">expired</span>}
                                                    {expiringSoon && <span className="ml-1 text-warning/70">{days}d left</span>}
                                                </span>
                                            ) : (
                                                <span className="text-base-content/30">—</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    className="btn btn-ghost btn-xs"
                                                    onClick={() => openEdit(item)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-ghost btn-xs text-error"
                                                    onClick={() => remove(item.id)}
                                                    disabled={deletingId === item.id}
                                                >
                                                    {deletingId === item.id
                                                        ? <span className="loading loading-spinner loading-xs" />
                                                        : 'Delete'
                                                    }
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <IngredientModal
                modalRef={modalRef}
                editItem={editItem}
                onSubmit={handleSubmit}
                isPending={isSubmitting}
            />
        </div>
    );
}

export default InventoryPage
