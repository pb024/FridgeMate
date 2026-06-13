import { useState, useRef, useEffect } from 'react'
import useInventory from '../hooks/useInventory'

const UNITS = ['pcs', 'g', 'kg', 'oz', 'lb', 'ml', 'L', 'cup', 'tbsp', 'tsp', 'piece', 'slice', 'bunch', 'can', 'pack']
const CATEGORIES = ['Produce', 'Dairy', 'Meat', 'Seafood', 'Grains', 'Frozen', 'Condiments', 'Beverages', 'Snacks', 'Other']
const EMPTY_FORM = { name: '', quantity: 1, unit: 'pcs', category: '', expirationDate: '' }

function daysUntil(dateStr) {
    if (!dateStr) return null;
    const diff = (new Date(dateStr) - new Date()) / 86400000;
    return diff > 0 ? Math.ceil(diff) : Math.floor(diff);
}

function formatDate(dateStr) {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function toInputDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

function IngredientModal({ modalRef, editItem, onSubmit, isPending }) {
    const [form, setForm] = useState(EMPTY_FORM);

    useEffect(() => {
        setForm(editItem ? {
            name: editItem.name,
            quantity: editItem.quantity,
            unit: editItem.unit,
            category: editItem.category || '',
            expirationDate: toInputDate(editItem.expirationDate),
        } : EMPTY_FORM);
    }, [editItem]);

    const set = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const fieldCls = "w-full h-12 rounded-xl border-2 border-base-300 bg-white px-4 text-base text-base-content placeholder:text-base-content/40 focus:outline-none focus:border-primary transition-colors";
    const labelCls = "block text-sm font-semibold text-base-content mb-2";

    return (
        <dialog ref={modalRef} className="modal">
            <div className="modal-box rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg">
                        {editItem ? 'Edit Ingredient' : 'Add Ingredient'}
                    </h3>
                    <button
                        type="button"
                        className="btn btn-sm btn-ghost btn-circle"
                        onClick={() => modalRef.current?.close()}
                    >✕</button>
                </div>
                <hr className="border-base-300 mb-5" />
                <form
                    onSubmit={e => { e.preventDefault(); onSubmit(form); }}
                    className="space-y-5"
                >
                    <div>
                        <label className={labelCls}>
                            Name <span className="text-error">*</span>
                        </label>
                        <input
                            name="name"
                            className={fieldCls}
                            placeholder="e.g. Chicken breast"
                            value={form.name}
                            onChange={set}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelCls}>
                                Quantity <span className="text-error">*</span>
                            </label>
                            <input
                                name="quantity"
                                type="number"
                                min="0"
                                className={fieldCls}
                                value={form.quantity}
                                onChange={set}
                                required
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Unit</label>
                            <select
                                name="unit"
                                className={`${fieldCls} cursor-pointer`}
                                value={form.unit}
                                onChange={set}
                                required
                            >
                                <option value="">Select unit</option>
                                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={labelCls}>Category</label>
                        <select
                            name="category"
                            className={`${fieldCls} cursor-pointer`}
                            value={form.category}
                            onChange={set}
                        >
                            <option value="">Select category</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className={labelCls}>Expiration Date</label>
                        <input
                            name="expirationDate"
                            type="date"
                            className={fieldCls}
                            value={form.expirationDate}
                            onChange={set}
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            className="btn btn-outline rounded-full flex-1"
                            onClick={() => modalRef.current?.close()}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary rounded-full flex-1" disabled={isPending}>
                            {isPending
                                ? <span className="loading loading-spinner loading-sm" />
                                : editItem ? 'Save Changes' : 'Add Item'
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
                            <tr className="text-base-content text-base">
                                <th className="font-semibold">Name</th>
                                <th className="font-semibold">Quantity</th>
                                <th className="font-semibold">Category</th>
                                <th className="font-semibold">Expires</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventory.map(item => {
                                const days = daysUntil(item.expirationDate);
                                const expired = days !== null && days < 0;
                                const expiringSoon = days !== null && days >= 0 && days <= 7;

                                return (
                                    <tr key={item.id} className="text-base">
                                        <td className="font-medium">{item.name}</td>
                                        <td>{item.quantity} {item.unit}</td>
                                        <td>
                                            {item.category
                                                ? <span>{item.category}</span>
                                                : <span className="text-base-content/30">—</span>
                                            }
                                        </td>
                                        <td>
                                            {item.expirationDate ? (
                                                <span className={expired ? 'text-error font-semibold' : expiringSoon ? 'text-warning font-semibold' : ''}>
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
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => openEdit(item)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-ghost btn-sm text-error"
                                                    onClick={() => remove(item.id)}
                                                    disabled={deletingId === item.id}
                                                >
                                                    {deletingId === item.id
                                                        ? <span className="loading loading-spinner loading-sm" />
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
