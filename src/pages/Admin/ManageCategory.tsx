import { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { categoryApi } from "../../services/api";
import { Category } from "../../types";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import DataTableOne, { ColumnConfig } from "../../components/tables/DataTables/TableOne/DataTableOne";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { DataTableSkeleton } from "../../components/ui/skeleton";

export default function ManageCategory() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [categoryName, setCategoryName] = useState("");

    // Confirmation Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await categoryApi.getAllCategories();
            if (response.success && response.data) {
                setCategories(response.data);
            } else {
                setError(response.error || "Gagal memuat kategori");
            }
        } catch (err) {
            setError("Terjadi kesalahan saat memuat data");
            console.error("Category error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryName.trim()) {
            setError("Nama kategori tidak boleh kosong");
            return;
        }

        try {
            setSubmitting(true);
            setError(null);
            if (editingCategory) {
                const response = await categoryApi.updateCategory(editingCategory.id, categoryName);
                if (response.success) {
                    await fetchCategories();
                    closeModal();
                } else {
                    setError(response.error || "Gagal mengupdate kategori");
                }
            } else {
                const response = await categoryApi.createCategory(categoryName);
                if (response.success) {
                    await fetchCategories();
                    closeModal();
                } else {
                    setError(response.error || "Gagal menambah kategori");
                }
            }
        } catch (err) {
            console.error("Submit error:", err);
            setError("Gagal menyimpan kategori");
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = (id: number) => {
        setCategoryToDelete(id);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!categoryToDelete) return;

        try {
            setDeleting(true);
            setError(null);
            const response = await categoryApi.deleteCategory(categoryToDelete);
            if (response.success) {
                await fetchCategories();
                setShowDeleteModal(false);
                setCategoryToDelete(null);
            } else {
                setError(response.message || "Gagal menghapus kategori");
                setShowDeleteModal(false);
            }
        } catch (err) {
            console.error("Delete error:", err);
            setError("Gagal menghapus kategori");
            setShowDeleteModal(false);
        } finally {
            setDeleting(false);
        }
    };

    const openModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setCategoryName(category.name);
        } else {
            setEditingCategory(null);
            setCategoryName("");
        }
        setShowModal(true);
        setError(null);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingCategory(null);
        setCategoryName("");
        setError(null);
    };

    const columns: ColumnConfig[] = useMemo(() => [
        {
            key: "id",
            label: "ID",
            sortable: true,
        },
        {
            key: "name",
            label: "Nama Kategori",
            sortable: true,
        },
        {
            key: "menus_count",
            label: "Jumlah Menu",
            sortable: true,
            render: (val) => (
                <span className="font-normal dark:text-gray-400/90 text-gray-800 text-theme-sm">
                    {val || 0} menu
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
                        onClick={() => openModal(row as Category)}
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
                    title="Kelola Kategori | Reservasi Ruang Dugamasa"
                    description="Kelola kategori menu"
                />
                <PageBreadcrumb pageTitle="Kelola Kategori" showHome={false} />
                <DataTableSkeleton />
            </div>
        );
    }

    return (
        <>
            <PageMeta
                title="Kelola Kategori | Reservasi Ruang Dugamasa"
                description="Kelola kategori menu"
            />
            <PageBreadcrumb pageTitle="Kelola Kategori" showHome={false} />

            <div className="space-y-5 sm:space-y-6">
                {/* Error Message */}
                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                        {error}
                    </div>
                )}

                {/* Data Table */}
                <DataTableOne
                    title="Daftar Kategori"
                    data={categories}
                    columns={columns}
                    defaultItemsPerPage={10}
                    itemsPerPageOptions={[5, 10, 15, 20]}
                    defaultSortKey="id"
                    defaultSortOrder="asc"
                    searchable={true}
                    searchPlaceholder="Cari kategori..."
                    actionButton={
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => openModal()}
                        >
                            <Plus className="w-4 h-4" />
                            Tambah Kategori
                        </Button>
                    }
                />
            </div>

            {/* Add/Edit Modal */}
            <Modal isOpen={showModal} onClose={closeModal} className="max-w-md p-5 lg:p-8">
                <form onSubmit={handleSubmit} className="flex flex-col">
                    <h4 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4">
                        {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
                    </h4>

                    <div className="space-y-4">
                        <div>
                            <Label>
                                Nama Kategori <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="text"
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                placeholder="Contoh: Coffee, Non-Coffee, Rice"
                            />
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
                            {submitting ? "Menyimpan..." : (editingCategory ? "Simpan Perubahan" : "Tambah Kategori")}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Hapus Kategori"
                message="Apakah Anda yakin ingin menghapus kategori ini? Kategori yang masih digunakan oleh menu tidak dapat dihapus."
                variant="danger"
                isLoading={deleting}
                confirmText="Hapus"
            />
        </>
    );
}
