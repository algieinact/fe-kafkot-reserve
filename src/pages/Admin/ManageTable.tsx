import { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { tableApi } from "../../services/api";
import { Table, TableFormData, TableTypeDetail } from "../../types";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import DataTableOne, { ColumnConfig } from "../../components/tables/DataTables/TableOne/DataTableOne";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { Modal } from "../../components/ui/modal";

export default function ManageTable() {
    const [tables, setTables] = useState<Table[]>([]);
    const [tableTypes, setTableTypes] = useState<TableTypeDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingTable, setEditingTable] = useState<Table | null>(null);
    const [formData, setFormData] = useState<TableFormData>({
        table_number: "",
        table_type_id: 1,
        capacity: 2,
        status: "available",
    });

    // Confirmation Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [tableToDelete, setTableToDelete] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchTables();
        fetchTableTypes();
    }, []);

    const fetchTableTypes = async () => {
        try {
            const response = await tableApi.getTableTypes();
            if (response.success && response.data) {
                setTableTypes(response.data);
                // Set default type if available
                if (response.data.length > 0) {
                    setFormData(prev => ({ ...prev, table_type_id: response.data[0].id }));
                }
            }
        } catch (err) {
            console.error("Failed to fetch table types:", err);
        }
    };

    const fetchTables = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await tableApi.getTables({});
            if (response.success && response.data) {
                setTables(response.data);
            } else {
                setError(response.error || "Gagal memuat data meja");
            }
        } catch (err) {
            setError("Terjadi kesalahan saat memuat data");
            console.error("Table error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingTable) {
                const response = await tableApi.updateTable(editingTable.id.toString(), formData);
                if (response.success) {
                    await fetchTables();
                    closeModal();
                }
            } else {
                const response = await tableApi.createTable(formData);
                if (response.success) {
                    await fetchTables();
                    closeModal();
                }
            }
        } catch (err) {
            console.error("Submit error:", err);
            setError("Gagal menyimpan data meja");
        }
    };

    const confirmDelete = (id: number) => {
        setTableToDelete(id);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!tableToDelete) return;

        try {
            setDeleting(true);
            const response = await tableApi.deleteTable(tableToDelete.toString());
            if (response.success) {
                await fetchTables();
                setShowDeleteModal(false);
                setTableToDelete(null);
            } else {
                setError("Gagal menghapus meja");
            }
        } catch (err) {
            console.error("Delete error:", err);
            setError("Gagal menghapus meja");
        } finally {
            setDeleting(false);
        }
    };

    const openModal = (table?: Table) => {
        if (table) {
            setEditingTable(table);
            setFormData({
                table_number: table.table_number,
                table_type_id: table.table_type.id,
                capacity: table.capacity,
                status: table.status,
            });
        } else {
            setEditingTable(null);
            setFormData({
                table_number: "",
                table_type_id: tableTypes.length > 0 ? tableTypes[0].id : 1,
                capacity: 2,
                status: "available",
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingTable(null);
        setFormData({
            table_number: "",
            table_type_id: tableTypes.length > 0 ? tableTypes[0].id : 1,
            capacity: 2,
            status: "available",
        });
        setError(null);
    };

    const getTypeBadge = (type: string) => {
        const badges = {
            indoor: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
            outdoor: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
            vip: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
        };
        return badges[type as keyof typeof badges] || badges.indoor;
    };

    const columns: ColumnConfig[] = useMemo(() => [
        {
            key: "id",
            label: "ID",
            sortable: true,
        },
        {
            key: "table_number",
            label: "Nomor Meja",
            sortable: true,
            render: (val) => (
                <span className="font-normal dark:text-gray-400/90 text-gray-800 text-theme-sm">
                    Meja {val}
                </span>
            )
        },
        {
            key: "table_type.type_name",
            label: "Tipe",
            sortable: true,
            render: (val) => (
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full capitalize ${getTypeBadge(String(val || "").toLowerCase())}`}>
                    {val || "-"}
                </span>
            )
        },
        {
            key: "capacity",
            label: "Kapasitas",
            sortable: true,
            render: (val) => (
                <span className="font-normal dark:text-gray-400/90 text-gray-800 text-theme-sm">
                    {val} orang
                </span>
            )
        },
        {
            key: "status",
            label: "Status",
            sortable: true,
            render: (val) => {
                const statusConfig = {
                    available: { label: "Tersedia", class: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
                    reserved: { label: "Direservasi", class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
                    inactive: { label: "Tidak Aktif", class: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
                };
                const config = statusConfig[val as keyof typeof statusConfig] || statusConfig.available;
                return (
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${config.class}`}>
                        {config.label}
                    </span>
                );
            }
        },
        {
            key: "actions",
            label: "Actions",
            sortable: false,
            render: (_val, row) => (
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => openModal(row as Table)}
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

    // Calculate statistics
    const totalTables = tables.length;
    const availableTables = tables.filter(t => t.status === "available").length;
    const unavailableTables = tables.filter(t => t.status !== "available").length;
    const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);

    if (loading) {
        return (
            <div className="space-y-5 sm:space-y-6">
                <PageMeta
                    title="Kelola Meja | Kafkot Reserve"
                    description="Kelola meja restoran dan ketersediaannya"
                />
                <PageBreadcrumb pageTitle="Kelola Meja" />
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
                title="Kelola Meja | Kafkot Reserve"
                description="Kelola meja restoran dan ketersediaannya"
            />
            <PageBreadcrumb pageTitle="Kelola Meja" />

            <div className="space-y-5 sm:space-y-6">
                {/* Error Message */}
                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                        {error}
                    </div>
                )}

                {/* Summary Statistics Cards - Dashboard Style */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Total Tables Card */}
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Total Meja
                                </p>
                                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                                    {totalTables}
                                </p>
                            </div>
                            <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
                                <svg
                                    className="h-5 w-5 text-blue-600 dark:text-blue-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Available Tables Card */}
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Tersedia
                                </p>
                                <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                                    {availableTables}
                                </p>
                            </div>
                            <div className="rounded-lg bg-green-50 p-2 dark:bg-green-900/20">
                                <svg
                                    className="h-5 w-5 text-green-600 dark:text-green-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Unavailable Tables Card */}
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Tidak Tersedia
                                </p>
                                <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
                                    {unavailableTables}
                                </p>
                            </div>
                            <div className="rounded-lg bg-red-50 p-2 dark:bg-red-900/20">
                                <svg
                                    className="h-5 w-5 text-red-600 dark:text-red-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Total Capacity Card */}
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Total Kapasitas
                                </p>
                                <p className="mt-1 text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {totalCapacity}
                                </p>
                            </div>
                            <div className="rounded-lg bg-purple-50 p-2 dark:bg-purple-900/20">
                                <svg
                                    className="h-5 w-5 text-purple-600 dark:text-purple-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <DataTableOne
                    title="Daftar Meja"
                    data={tables}
                    columns={columns}
                    defaultItemsPerPage={10}
                    itemsPerPageOptions={[5, 10, 15, 20]}
                    defaultSortKey="id"
                    defaultSortOrder="asc"
                    searchable={true}
                    searchPlaceholder="Cari nomor meja, tipe, status..."
                    actionButton={
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => openModal()}
                        >
                            <Plus className="w-4 h-4" />
                            Tambah Meja
                        </Button>
                    }
                />
            </div>

            {/* Add/Edit Modal */}
            <Modal isOpen={showModal} onClose={closeModal} className="max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {editingTable ? "Edit Meja" : "Tambah Meja Baru"}
                        </h3>
                    </div>

                    <div className="px-6 py-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Nomor Meja <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.table_number}
                                onChange={(e) => setFormData({ ...formData, table_number: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                                placeholder="Contoh: A1, B2, VIP-1"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tipe Meja <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.table_type_id}
                                onChange={(e) => setFormData({ ...formData, table_type_id: Number(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                            >
                                {tableTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.type_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Kapasitas (orang) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                                min="1"
                                max="20"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.status || "available"}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as "available" | "reserved" | "inactive" })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                            >
                                <option value="available">Tersedia</option>
                                <option value="reserved">Direservasi</option>
                                <option value="inactive">Tidak Aktif</option>
                            </select>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 flex justify-end gap-3">
                        <Button
                            type="button"
                            onClick={closeModal}
                            variant="outline"
                        >
                            Batal
                        </Button>
                        <Button type="submit" variant="primary">
                            {editingTable ? "Simpan Perubahan" : "Tambah Meja"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Hapus Meja"
                message="Apakah Anda yakin ingin menghapus meja ini? Tindakan ini tidak dapat dibatalkan."
                variant="danger"
                isLoading={deleting}
                confirmText="Hapus"
            />
        </>
    );
}