import { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { menuApi, variationApi } from "../../services/api";
import { Menu, MenuFormData, VariationGroup } from "../../types";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import DataTableOne, { ColumnConfig } from "../../components/tables/DataTables/TableOne/DataTableOne";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";

export default function ManageMenu() {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
    const [formData, setFormData] = useState<MenuFormData>({
        menu_name: "",
        category: "food",
        description: "",
        price: 0,
        is_available: true,
    });

    // Confirmation Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [menuToDelete, setMenuToDelete] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Variation Groups State
    const [variationGroups, setVariationGroups] = useState<VariationGroup[]>([]);
    const [selectedVariationIds, setSelectedVariationIds] = useState<number[]>([]);

    useEffect(() => {
        fetchMenus();
    }, []);

    const fetchMenus = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await menuApi.getMenus({});
            if (response.success && response.data) {
                setMenus(response.data);
            } else {
                setError(response.error || "Gagal memuat menu");
            }
        } catch (err) {
            setError("Terjadi kesalahan saat memuat data");
            console.error("Menu error:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchVariationGroups = async () => {
        try {
            const response = await variationApi.getAllGroups();
            if (response.success && response.data) {
                setVariationGroups(response.data);
            }
        } catch (err) {
            console.error("Error fetching variation groups:", err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingMenu) {
                const response = await menuApi.updateMenu(editingMenu.id.toString(), formData);
                if (response.success) {
                    // Assign variations if any selected
                    if (selectedVariationIds.length > 0) {
                        await variationApi.assignToMenu(editingMenu.id, selectedVariationIds);
                    }
                    await fetchMenus();
                    closeModal();
                }
            } else {
                const response = await menuApi.createMenu(formData);
                if (response.success && response.data) {
                    // Assign variations if any selected
                    if (selectedVariationIds.length > 0) {
                        await variationApi.assignToMenu(response.data.id, selectedVariationIds);
                    }
                    await fetchMenus();
                    closeModal();
                }
            }
        } catch (err) {
            console.error("Submit error:", err);
            setError("Gagal menyimpan menu");
        }
    };

    const confirmDelete = (id: number) => {
        setMenuToDelete(id);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!menuToDelete) return;

        try {
            setDeleting(true);
            const response = await menuApi.deleteMenu(menuToDelete.toString());
            if (response.success) {
                await fetchMenus();
                setShowDeleteModal(false);
                setMenuToDelete(null);
            } else {
                setError("Gagal menghapus menu");
            }
        } catch (err) {
            console.error("Delete error:", err);
            setError("Gagal menghapus menu");
        } finally {
            setDeleting(false);
        }
    };

    const openModal = async (menu?: Menu) => {
        // Fetch variation groups when opening modal
        await fetchVariationGroups();

        if (menu) {
            setEditingMenu(menu);
            setFormData({
                menu_name: menu.menu_name,
                category: menu.category,
                description: menu.description,
                price: menu.price,
                is_available: menu.is_available,
            });

            // Fetch menu details to get assigned variations
            try {
                const response = await menuApi.getMenuById(menu.id.toString());
                if (response.success && response.data && response.data.variation_groups) {
                    const assignedIds = response.data.variation_groups.map((g: VariationGroup) => g.id);
                    setSelectedVariationIds(assignedIds);
                }
            } catch (err) {
                console.error("Error fetching menu details:", err);
            }
        } else {
            setEditingMenu(null);
            setFormData({
                menu_name: "",
                category: "food",
                description: "",
                price: 0,
                is_available: true,
            });
            setSelectedVariationIds([]);
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingMenu(null);
        setFormData({
            menu_name: "",
            category: "food",
            description: "",
            price: 0,
            is_available: true,
        });
        setSelectedVariationIds([]);
        setError(null);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(price);
    };

    const getCategoryBadge = (category: string) => {
        const badges = {
            food: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
            drink: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
            dessert: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
        };
        return badges[category as keyof typeof badges] || badges.food;
    };

    const columns: ColumnConfig[] = useMemo(() => [
        {
            key: "id",
            label: "ID",
            sortable: true,
        },
        {
            key: "menu_name",
            label: "Menu",
            sortable: true,
            render: (_val, row) => (
                <div className="flex items-center">
                    <img
                        src={row.image_url || "/images/placeholder.jpg"}
                        alt={row.menu_name}
                        className="w-10 h-10 rounded-lg object-cover mr-3"
                    />
                    <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {row.menu_name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 max-w-[200px]">
                            {row.description}
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: "category",
            label: "Kategori",
            sortable: true,
            render: (val) => (
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full capitalize ${getCategoryBadge(val as string)}`}>
                    {val as string}
                </span>
            )
        },
        {
            key: "price",
            label: "Harga",
            sortable: true,
            render: (val) => (
                <span className="font-normal dark:text-gray-400/90 text-gray-800 text-theme-sm">
                    {formatPrice(val as number)}
                </span>
            )
        },
        {
            key: "is_available",
            label: "Status",
            sortable: true,
            render: (val) => (
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${val
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }`}>
                    {val ? "Tersedia" : "Habis"}
                </span>
            )
        },
        {
            key: "actions",
            label: "Actions",
            sortable: false,
            render: (_val, row) => (
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => openModal(row as Menu)}
                        className="inline-flex items-center justify-center p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => confirmDelete(row.id)}
                        className="inline-flex items-center justify-center p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Hapus"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ], []);

    if (loading) {
        return (
            <div className="space-y-5 sm:space-y-6">
                <PageMeta
                    title="Kelola Menu | Reservasi Ruang Dugamasa"
                    description="Kelola menu makanan dan minuman restoran"
                />
                <PageBreadcrumb pageTitle="Kelola Menu" />
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin h-12 w-12 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Memuat data...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <PageMeta
                title="Kelola Menu | Reservasi Ruang Dugamasa"
                description="Kelola menu makanan dan minuman restoran"
            />
            <PageBreadcrumb pageTitle="Kelola Menu" />

            <div className="space-y-5 sm:space-y-6">
                {/* Error Message */}
                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                        {error}
                    </div>
                )}

                {/* Data Table */}
                <DataTableOne
                    title="Daftar Menu"
                    data={menus}
                    columns={columns}
                    defaultItemsPerPage={10}
                    itemsPerPageOptions={[5, 10, 15, 20]}
                    defaultSortKey="id"
                    defaultSortOrder="asc"
                    searchable={true}
                    searchPlaceholder="Cari menu, kategori, status..."
                    actionButton={
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => openModal()}
                        >
                            <Plus className="w-4 h-4" />
                            Tambah Menu
                        </Button>
                    }
                />
            </div>

            {/* Add/Edit Modal */}
            <Modal isOpen={showModal} onClose={closeModal} className="max-w-lg p-5 lg:p-10">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <h4 className="text-lg font-medium text-gray-800 dark:text-white/90">
                        {editingMenu ? "Edit Menu" : "Tambah Menu Baru"}
                    </h4>

                    <div className="space-y-4">
                        <div>
                            <Label>
                                Nama Menu <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="text"
                                value={formData.menu_name}
                                onChange={(e) => setFormData({ ...formData, menu_name: e.target.value })}
                                placeholder="Contoh: Nasi Goreng Spesial"
                            />
                        </div>

                        <div>
                            <Label>
                                Kategori <span className="text-red-500">*</span>
                            </Label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value as "food" | "drink" | "dessert" })}
                                className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                            >
                                <option value="food">Food</option>
                                <option value="drink">Drink</option>
                                <option value="dessert">Dessert</option>
                            </select>
                        </div>

                        <div>
                            <Label>
                                Deskripsi <span className="text-red-500">*</span>
                            </Label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                placeholder="Deskripsi menu..."
                            />
                        </div>

                        <div>
                            <Label>
                                Harga (IDR) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                min="0"
                                placeholder="15000"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="is_available"
                                checked={formData.is_available}
                                onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                                className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                            />
                            <label htmlFor="is_available" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                Menu tersedia untuk dipesan
                            </label>
                        </div>

                        {/* Variation Groups Selection */}
                        <div>
                            <Label>
                                Grup Variasi (Opsional)
                            </Label>
                            <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-3 max-h-48 overflow-y-auto">
                                {variationGroups.length === 0 ? (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Belum ada grup variasi. Buat di halaman Kelola Variasi.
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {variationGroups.map((group) => (
                                            <label
                                                key={group.id}
                                                className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedVariationIds.includes(group.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedVariationIds([...selectedVariationIds, group.id]);
                                                        } else {
                                                            setSelectedVariationIds(
                                                                selectedVariationIds.filter((id) => id !== group.id)
                                                            );
                                                        }
                                                    }}
                                                    className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                                                />
                                                <div className="ml-3 flex-1">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {group.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {group.type === "single_choice" ? "Pilihan Tunggal" : "Pilihan Ganda"}
                                                        {group.is_required && " • Wajib"}
                                                        {group.options && ` • ${group.options.length} opsi`}
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {selectedVariationIds.length > 0 && (
                                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                                    {selectedVariationIds.length} grup variasi dipilih
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-end w-full gap-3 mt-6">
                        <Button
                            type="button"
                            size="sm"
                            onClick={closeModal}
                            variant="outline"
                        >
                            Batal
                        </Button>
                        <Button type="submit" size="sm" variant="primary">
                            {editingMenu ? "Simpan Perubahan" : "Tambah Menu"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Hapus Menu"
                message="Apakah Anda yakin ingin menghapus menu ini? Tindakan ini tidak dapat dibatalkan."
                variant="danger"
                isLoading={deleting}
                confirmText="Hapus"
            />
        </>
    );
}