import { useState, useMemo, useEffect } from "react";
import { Plus, Edit, Trash2, Star, ToggleLeft, ToggleRight, CreditCard } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import DataTableOne, { ColumnConfig } from "../../components/tables/DataTables/TableOne/DataTableOne";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { BankAccount, BankAccountFormData } from "../../types";
import { bankAccountApi } from "../../services/api";
import { DataTableSkeleton } from "../../components/ui/skeleton";

const DEFAULT_FORM: BankAccountFormData = {
    bank_name: "",
    account_number: "",
    account_holder_name: "",
    is_active: true,
    is_primary: false,
    notes: "",
};

export default function ManageBankAccount() {
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
    const [formData, setFormData] = useState<BankAccountFormData>(DEFAULT_FORM);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState<BankAccount | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await bankAccountApi.getAll();
            if (response.success && response.data) {
                setAccounts(response.data);
            } else {
                setError(response.error || "Gagal memuat data rekening");
            }
        } catch {
            setError("Terjadi kesalahan saat memuat data");
        } finally {
            setLoading(false);
        }
    };

    const openModal = (account?: BankAccount) => {
        if (account) {
            setEditingAccount(account);
            setFormData({
                bank_name: account.bank_name,
                account_number: account.account_number,
                account_holder_name: account.account_holder_name,
                is_active: account.is_active,
                is_primary: account.is_primary,
                notes: account.notes ?? "",
            });
        } else {
            setEditingAccount(null);
            setFormData(DEFAULT_FORM);
        }
        setError(null);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingAccount(null);
        setFormData(DEFAULT_FORM);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            setError(null);
            if (editingAccount) {
                await bankAccountApi.update(editingAccount.id, formData);
            } else {
                await bankAccountApi.create(formData);
            }
            await fetchAccounts();
            closeModal();
        } catch {
            setError("Gagal menyimpan data rekening");
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = (account: BankAccount) => {
        setAccountToDelete(account);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!accountToDelete) return;
        try {
            setDeleting(true);
            await bankAccountApi.delete(accountToDelete.id);
            await fetchAccounts();
            setShowDeleteModal(false);
            setAccountToDelete(null);
        } catch {
            setError("Gagal menghapus rekening");
        } finally {
            setDeleting(false);
        }
    };

    const handleToggleActive = async (account: BankAccount) => {
        try {
            await bankAccountApi.toggleActive(account.id);
            await fetchAccounts();
        } catch {
            setError("Gagal mengubah status rekening");
        }
    };

    const handleSetPrimary = async (account: BankAccount) => {
        try {
            await bankAccountApi.setPrimary(account.id);
            await fetchAccounts();
        } catch {
            setError("Gagal mengatur rekening utama");
        }
    };

    const columns: ColumnConfig[] = useMemo(() => [
        {
            key: "bank_name",
            label: "Bank",
            sortable: true,
            render: (_val, row: BankAccount) => (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
                        <CreditCard className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div>
                        <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                            {row.bank_name}
                            {row.is_primary && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-[10px] rounded-full font-medium">
                                    <Star className="w-2.5 h-2.5" /> Utama
                                </span>
                            )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">a.n. {row.account_holder_name}</div>
                    </div>
                </div>
            )
        },
        {
            key: "account_number",
            label: "Nomor Rekening",
            sortable: true,
            render: (val) => (
                <span className="font-mono text-sm text-gray-800 dark:text-gray-200">{val as string}</span>
            )
        },
        {
            key: "notes",
            label: "Catatan",
            sortable: false,
            render: (val) => (
                <span className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 max-w-[200px]">
                    {(val as string) || <span className="italic text-gray-400">—</span>}
                </span>
            )
        },
        {
            key: "is_active",
            label: "Status",
            sortable: true,
            render: (val) => (
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${val
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}>
                    {val ? "Aktif" : "Nonaktif"}
                </span>
            )
        },
        {
            key: "actions",
            label: "Aksi",
            sortable: false,
            render: (_val, row: BankAccount) => (
                <div className="flex items-center gap-1">
                    {/* Set Primary */}
                    {!row.is_primary && (
                        <button
                            onClick={() => handleSetPrimary(row)}
                            className="inline-flex items-center justify-center p-1.5 text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                            title="Jadikan Rekening Utama"
                        >
                            <Star className="w-4 h-4" />
                        </button>
                    )}
                    {/* Toggle Active */}
                    <button
                        onClick={() => handleToggleActive(row)}
                        className="inline-flex items-center justify-center p-1.5 text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
                        title={row.is_active ? "Nonaktifkan" : "Aktifkan"}
                    >
                        {row.is_active
                            ? <ToggleRight className="w-4 h-4 text-green-500" />
                            : <ToggleLeft className="w-4 h-4" />
                        }
                    </button>
                    {/* Edit */}
                    <button
                        onClick={() => openModal(row)}
                        className="inline-flex items-center justify-center p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    {/* Delete */}
                    <button
                        onClick={() => confirmDelete(row)}
                        className="inline-flex items-center justify-center p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Hapus"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ], [accounts]);

    const activeCount = accounts.filter(a => a.is_active).length;
    const primaryAccount = accounts.find(a => a.is_primary);

    if (loading) {
        return (
            <div className="space-y-5 sm:space-y-6">
                <PageMeta title="Kelola Rekening Bank" description="Manajemen data rekening bank untuk pembayaran" />
                <PageBreadcrumb pageTitle="Kelola Rekening Bank" showHome={false} />
                <DataTableSkeleton />
            </div>
        );
    }

    return (
        <>
            <PageMeta title="Kelola Rekening Bank" description="Manajemen data rekening bank untuk pembayaran" />
            <PageBreadcrumb pageTitle="Kelola Rekening Bank" showHome={false} />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="text-gray-500 text-sm">Total Rekening</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{accounts.length}</div>
                </div>
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="text-gray-500 text-sm">Rekening Aktif</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{activeCount}</div>
                </div>
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="text-gray-500 text-sm">Rekening Utama</div>
                    <div className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 mt-1 truncate">
                        {primaryAccount ? `${primaryAccount.bank_name} - ${primaryAccount.account_number}` : "Belum ada"}
                    </div>
                </div>
            </div>

            <div className="space-y-5 sm:space-y-6">
                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                        {error}
                    </div>
                )}

                <DataTableOne
                    title="Daftar Rekening Bank"
                    data={accounts}
                    columns={columns}
                    searchable={true}
                    searchPlaceholder="Cari nama bank atau nomor rekening..."
                    defaultItemsPerPage={10}
                    actionButton={
                        <Button variant="primary" size="sm" onClick={() => openModal()}>
                            <Plus className="w-4 h-4" />
                            Tambah Rekening
                        </Button>
                    }
                />
            </div>

            {/* Add / Edit Modal */}
            <Modal isOpen={showModal} onClose={closeModal} className="max-w-lg p-5 lg:p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <h4 className="text-lg font-medium text-gray-800 dark:text-white/90">
                        {editingAccount ? "Edit Rekening Bank" : "Tambah Rekening Bank"}
                    </h4>

                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <Label>Nama Bank <span className="text-red-500">*</span></Label>
                            <Input
                                type="text"
                                value={formData.bank_name}
                                onChange={e => setFormData({ ...formData, bank_name: e.target.value })}
                                placeholder="Contoh: BCA, Mandiri, BNI"
                            />
                        </div>

                        <div>
                            <Label>Nomor Rekening <span className="text-red-500">*</span></Label>
                            <Input
                                type="text"
                                value={formData.account_number}
                                onChange={e => setFormData({ ...formData, account_number: e.target.value })}
                                placeholder="Contoh: 1234567890"
                            />
                        </div>

                        <div>
                            <Label>Nama Pemilik Rekening <span className="text-red-500">*</span></Label>
                            <Input
                                type="text"
                                value={formData.account_holder_name}
                                onChange={e => setFormData({ ...formData, account_holder_name: e.target.value })}
                                placeholder="Nama sesuai rekening"
                            />
                        </div>

                        <div>
                            <Label>Catatan</Label>
                            <textarea
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Catatan tambahan (opsional)"
                                rows={2}
                                className="w-full rounded-lg border px-4 py-2.5 text-sm bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 resize-none"
                            />
                        </div>

                        <div className="flex flex-col gap-3 pt-1">
                            <label className="flex items-center gap-2.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Rekening aktif</span>
                            </label>

                            <label className="flex items-center gap-2.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_primary}
                                    onChange={e => setFormData({ ...formData, is_primary: e.target.checked })}
                                    className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Jadikan rekening utama
                                    <span className="text-xs text-gray-400 ml-1">(rekening utama saat ini akan diganti)</span>
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <Button type="button" size="sm" variant="outline" onClick={closeModal} disabled={submitting}>
                            Batal
                        </Button>
                        <Button type="submit" size="sm" variant="primary" disabled={submitting}>
                            {submitting ? "Menyimpan..." : (editingAccount ? "Simpan Perubahan" : "Tambah Rekening")}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Hapus Rekening Bank"
                message={`Yakin ingin menghapus rekening ${accountToDelete?.bank_name} (${accountToDelete?.account_number})? Tindakan ini tidak dapat dibatalkan.`}
                variant="danger"
                isLoading={deleting}
                confirmText="Hapus"
            />
        </>
    );
}
