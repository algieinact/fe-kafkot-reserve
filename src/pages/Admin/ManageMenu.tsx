import { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { menuApi, variationApi, categoryApi } from "../../services/api";
import { Menu, MenuFormData, VariationGroup, Category } from "../../types";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import DataTableOne, { ColumnConfig } from "../../components/tables/DataTables/TableOne/DataTableOne";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { DataTableSkeleton } from "../../components/ui/skeleton";

export default function ManageMenu() {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
    const [formData, setFormData] = useState<MenuFormData>({
        menu_name: "",
        category_id: 1,
        description: "",
        price: 0,
        is_available: true,
    });

    // Confirmation Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [menuToDelete, setMenuToDelete] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Variation Groups State
    const [variationGroups, setVariationGroups] = useState<VariationGroup[]>([]);
    const [selectedVariationIds, setSelectedVariationIds] = useState<number[]>([]);

    // Image Preview State
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        fetchMenus();
        fetchCategories();
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

    const fetchCategories = async () => {
        try {
            const response = await categoryApi.getAllCategories();
            if (response.success && response.data) {
                setCategories(response.data);
            }
        } catch (err) {
            console.error("Error fetching categories:", err);
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
            setSubmitting(true);
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
        } finally {
            setSubmitting(false);
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
                category_id: menu.category_id,
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
                category_id: categories.length > 0 ? categories[0].id : 1,
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
            category_id: categories.length > 0 ? categories[0].id : 1,
            description: "",
            price: 0,
            is_available: true,
        });
        setSelectedVariationIds([]);
        setImagePreview(null);
        setError(null);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setError("File harus berupa gambar (JPG, PNG, WEBP)");
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError("Ukuran file maksimal 5MB");
            return;
        }

        // Clear any previous errors
        setError(null);

        // Update form data with the file
        setFormData({ ...formData, image: file });

        // Generate preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setFormData({ ...formData, image: undefined });
        setImagePreview(null);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(price);
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
            render: (_val, row) => (
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400`}>
                    {row.category?.name || "Uncategorized"}
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
                <PageBreadcrumb pageTitle="Kelola Menu" showHome={false} />
                <DataTableSkeleton />
            </div>
        );
    }

    return (
        <>
            <PageMeta
                title="Kelola Menu | Reservasi Ruang Dugamasa"
                description="Kelola menu makanan dan minuman restoran"
            />
            <PageBreadcrumb pageTitle="Kelola Menu" showHome={false} />

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
            <Modal isOpen={showModal} onClose={closeModal} className="max-w-2xl p-5 lg:p-8">
                <form onSubmit={handleSubmit} className="flex flex-col max-h-[85vh]">
                    <h4 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4">
                        {editingMenu ? "Edit Menu" : "Tambah Menu Baru"}
                    </h4>

                    {/* Scrollable Content */}
                    <div className="space-y-4 overflow-y-auto pr-2 flex-1">
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

                        {/* Image Upload Section */}
                        <div>
                            <Label>
                                Foto Menu (Opsional)
                            </Label>
                            <div className="space-y-3">
                                {/* Image Preview */}
                                {(imagePreview || editingMenu?.image_url) && (
                                    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                                        <img
                                            src={imagePreview || editingMenu?.image_url}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                            title="Hapus gambar"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                )}

                                {/* File Input */}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-900/20 dark:file:text-brand-400 dark:hover:file:bg-brand-900/30"
                                />

                                {/* Help Text */}
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Format: JPG, PNG, WEBP. Maksimal 5MB
                                </p>
                            </div>
                        </div>

                        <div>
                            <Label>
                                Kategori <span className="text-red-500">*</span>
                            </Label>
                            <select
                                value={formData.category_id}
                                onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                                className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                            >
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
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

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end w-full gap-3 mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            type="button"
                            size="sm"
                            onClick={closeModal}
                            variant="outline"
                            disabled={submitting}
                        >
                            Batal
                        </Button>
                        <Button type="submit" size="sm" variant="primary" disabled={submitting}>
                            {submitting ? "Menyimpan..." : (editingMenu ? "Simpan Perubahan" : "Tambah Menu")}
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