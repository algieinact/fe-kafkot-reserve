import { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { userManagementApi } from "../../services/api";
import { AdminUser, AdminUserFormData } from "../../types";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import DataTableOne, { ColumnConfig } from "../../components/tables/DataTables/TableOne/DataTableOne";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { DataTableSkeleton } from "../../components/ui/skeleton";

const ROLE_OPTIONS: { value: AdminUser["role"]; label: string }[] = [
    { value: "admin", label: "Admin" },
    { value: "staff", label: "Staff" },
];

const emptyForm: AdminUserFormData = {
    username: "",
    full_name: "",
    email: "",
    password: "",
    role: "staff",
};

export default function ManageUser() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [form, setForm] = useState<AdminUserFormData>(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Delete modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await userManagementApi.getAll();
            if (response.success && response.data) {
                setUsers(response.data);
            } else {
                setError(response.error || "Gagal memuat data pengguna");
            }
        } catch (err) {
            setError("Terjadi kesalahan saat memuat data");
            console.error("User fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (user?: AdminUser) => {
        if (user) {
            setEditingUser(user);
            setForm({
                username: user.username,
                full_name: user.full_name,
                email: user.email,
                password: "",
                role: user.role,
            });
        } else {
            setEditingUser(null);
            setForm(emptyForm);
        }
        setShowModal(true);
        setError(null);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingUser(null);
        setForm(emptyForm);
        setError(null);
    };

    const handleFormChange = (field: keyof AdminUserFormData, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!form.username.trim() || !form.full_name.trim() || !form.email.trim()) {
            setError("Username, nama lengkap, dan email wajib diisi.");
            return;
        }
        if (!editingUser && !form.password?.trim()) {
            setError("Password wajib diisi saat menambah pengguna baru.");
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const payload: AdminUserFormData = {
                username: form.username.trim(),
                full_name: form.full_name.trim(),
                email: form.email.trim(),
                role: form.role,
            };

            // Only include password if provided
            if (form.password?.trim()) {
                payload.password = form.password.trim();
            }

            if (editingUser) {
                const response = await userManagementApi.update(editingUser.id, payload);
                if (response.success) {
                    await fetchUsers();
                    closeModal();
                } else {
                    setError(response.error || "Gagal memperbarui data pengguna");
                }
            } else {
                const response = await userManagementApi.create(payload);
                if (response.success) {
                    await fetchUsers();
                    closeModal();
                } else {
                    setError(response.error || "Gagal menambah pengguna");
                }
            }
        } catch (err) {
            console.error("Submit error:", err);
            setError("Terjadi kesalahan saat menyimpan data");
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = (id: number) => {
        setUserToDelete(id);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!userToDelete) return;
        try {
            setDeleting(true);
            setError(null);
            const response = await userManagementApi.delete(userToDelete);
            if (response.success) {
                await fetchUsers();
                setShowDeleteModal(false);
                setUserToDelete(null);
            } else {
                setError(response.message || "Gagal menghapus pengguna");
                setShowDeleteModal(false);
            }
        } catch (err) {
            console.error("Delete error:", err);
            setError("Terjadi kesalahan saat menghapus pengguna");
            setShowDeleteModal(false);
        } finally {
            setDeleting(false);
        }
    };

    const columns: ColumnConfig[] = useMemo(() => [
        {
            key: "id",
            label: "ID",
            sortable: true,
        },
        {
            key: "username",
            label: "Username",
            sortable: true,
            render: (val) => (
                <span className="font-medium text-gray-800 dark:text-white/90 text-theme-sm">
                    {val}
                </span>
            ),
        },
        {
            key: "full_name",
            label: "Nama Lengkap",
            sortable: true,
        },
        {
            key: "email",
            label: "Email",
            sortable: true,
            render: (val) => (
                <span className="text-gray-600 dark:text-gray-400 text-theme-sm">{val}</span>
            ),
        },
        {
            key: "role",
            label: "Role",
            sortable: true,
            render: (val) => (
                <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${val === "admin"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        }`}
                >
                    {val === "admin" ? "Admin" : "Staff"}
                </span>
            ),
        },
        {
            key: "actions",
            label: "Aksi",
            sortable: false,
            render: (_val, row) => (
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => openModal(row as AdminUser)}
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
            ),
        },
    ], []);

    if (loading) {
        return (
            <div className="space-y-5 sm:space-y-6">
                <PageMeta
                    title="Kelola Pengguna | Reservasi Ruang Dugamasa"
                    description="Kelola pengguna sistem"
                />
                <PageBreadcrumb pageTitle="Kelola Pengguna" showHome={false} />
                <DataTableSkeleton />
            </div>
        );
    }

    return (
        <>
            <PageMeta
                title="Kelola Pengguna | Reservasi Ruang Dugamasa"
                description="Kelola pengguna sistem"
            />
            <PageBreadcrumb pageTitle="Kelola Pengguna" showHome={false} />

            <div className="space-y-5 sm:space-y-6">
                {/* Error Message */}
                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                        {error}
                    </div>
                )}

                {/* Data Table */}
                <DataTableOne
                    title="Daftar Pengguna"
                    data={users}
                    columns={columns}
                    defaultItemsPerPage={10}
                    itemsPerPageOptions={[5, 10, 15, 20]}
                    defaultSortKey="id"
                    defaultSortOrder="asc"
                    searchable={true}
                    searchPlaceholder="Cari pengguna..."
                    actionButton={
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => openModal()}
                        >
                            <Plus className="w-4 h-4" />
                            Tambah Pengguna
                        </Button>
                    }
                />
            </div>

            {/* Add / Edit Modal */}
            <Modal isOpen={showModal} onClose={closeModal} className="max-w-md p-5 lg:p-8">
                <form onSubmit={handleSubmit} className="flex flex-col">
                    <h4 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4">
                        {editingUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}
                    </h4>

                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300 mb-4">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Username */}
                        <div>
                            <Label>
                                Username <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="text"
                                value={form.username}
                                onChange={(e) => handleFormChange("username", e.target.value)}
                                placeholder="Contoh: johndoe"
                            />
                        </div>

                        {/* Full Name */}
                        <div>
                            <Label>
                                Nama Lengkap <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="text"
                                value={form.full_name}
                                onChange={(e) => handleFormChange("full_name", e.target.value)}
                                placeholder="Contoh: John Doe"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <Label>
                                Email <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="email"
                                value={form.email}
                                onChange={(e) => handleFormChange("email", e.target.value)}
                                placeholder="Contoh: john@example.com"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <Label>
                                Password{" "}
                                {!editingUser && <span className="text-red-500">*</span>}
                                {editingUser && (
                                    <span className="text-xs text-gray-400 font-normal ml-1">
                                        (kosongkan jika tidak diganti)
                                    </span>
                                )}
                            </Label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={(e) => handleFormChange("password", e.target.value)}
                                    placeholder={editingUser ? "Isi untuk mengganti password" : "Min. 8 karakter"}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    tabIndex={-1}
                                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Role */}
                        <div>
                            <Label>
                                Role <span className="text-red-500">*</span>
                            </Label>
                            <select
                                value={form.role}
                                onChange={(e) => handleFormChange("role", e.target.value)}
                                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            >
                                {ROLE_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
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
                            {submitting
                                ? "Menyimpan..."
                                : editingUser
                                    ? "Simpan Perubahan"
                                    : "Tambah Pengguna"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Hapus Pengguna"
                message="Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan."
                variant="danger"
                isLoading={deleting}
                confirmText="Hapus"
            />
        </>
    );
}
