import { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { tableApi } from "../../services/api";
import { Table, TableFormData, TableTypeDetail, AreaType } from "../../types";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import DataTableOne, { ColumnConfig } from "../../components/tables/DataTables/TableOne/DataTableOne";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { Modal } from "../../components/ui/modal";
import AreaTabs from "../../components/reservation/AreaTabs";
import AdminTableLayoutViewer from "../../components/admin/AdminTableLayoutViewer";
import { getLayoutByArea } from "../../config/tableLayoutConfig";

export default function ManageTable() {
    const [tables, setTables] = useState<Table[]>([]);
    const [tableTypes, setTableTypes] = useState<TableTypeDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedArea, setSelectedArea] = useState<AreaType>('indoor');

    // Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingTable, setEditingTable] = useState<Table | null>(null);
    const [editFormData, setEditFormData] = useState<TableFormData>({
        table_number: "",
        table_type_id: 1,
        capacity: 2,
        status: "available",
    });

    // Confirmation Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [tableToDelete, setTableToDelete] = useState<Table | null>(null);
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

    // Handle assign table from layout
    const handleAssignTable = async (position: any, tableNumber: string) => {
        try {
            // Auto-fill capacity based on table number
            let capacity = 2;
            if (tableNumber.startsWith('A')) capacity = 2;
            else if (tableNumber.startsWith('B')) capacity = 4;
            else if (tableNumber.startsWith('C')) capacity = 6;
            else if (tableNumber.startsWith('D')) capacity = 8;
            else if (tableNumber.startsWith('S1') || tableNumber.startsWith('S2') || tableNumber.startsWith('S3')) capacity = 2;
            else if (tableNumber.startsWith('S4') || tableNumber.startsWith('S5') || tableNumber.startsWith('S6')) capacity = 4;
            else if (tableNumber.startsWith('S7') || tableNumber.startsWith('S8') || tableNumber.startsWith('S9')) capacity = 6;
            else if (tableNumber.startsWith('O')) capacity = 4;

            // Determine table type based on area
            let tableTypeId = 1; // default indoor
            if (selectedArea === 'semi_outdoor') tableTypeId = 2;
            else if (selectedArea === 'outdoor') tableTypeId = 3;

            const formData: TableFormData = {
                table_number: tableNumber,
                table_type_id: tableTypeId,
                capacity: capacity,
                status: "available",
            };

            const response = await tableApi.createTable(formData);
            if (response.success) {
                await fetchTables();
            } else {
                setError(response.error || "Gagal menambahkan meja");
            }
        } catch (err) {
            console.error("Assign error:", err);
            setError("Gagal menambahkan meja");
        }
    };

    // Handle edit table
    const handleEditTable = (table: Table) => {
        setEditingTable(table);
        setEditFormData({
            table_number: table.table_number,
            table_type_id: table.table_type.id,
            capacity: table.capacity,
            status: table.status,
        });
        setShowEditModal(true);
    };

    const handleUpdateTable = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTable) return;

        try {
            const response = await tableApi.updateTable(editingTable.id.toString(), editFormData);
            if (response.success) {
                await fetchTables();
                setShowEditModal(false);
                setEditingTable(null);
            } else {
                setError(response.error || "Gagal mengupdate meja");
            }
        } catch (err) {
            console.error("Update error:", err);
            setError("Gagal mengupdate meja");
        }
    };

    // Handle delete table
    const confirmDelete = (table: Table) => {
        setTableToDelete(table);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!tableToDelete) return;

        try {
            setDeleting(true);
            const response = await tableApi.deleteTable(tableToDelete.id.toString());
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

    const getTypeBadge = (type: string) => {
        const badges = {
            indoor: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
            outdoor: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
            semi_outdoor: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
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
                        onClick={() => handleEditTable(row as Table)}
                        className="inline-flex items-center justify-center p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => confirmDelete(row as Table)}
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

    // Get tables for selected area
    const tablesForArea = tables.filter(t => {
        const tableNum = t.table_number;
        if (selectedArea === 'indoor') {
            return tableNum.startsWith('A') || tableNum.startsWith('B') || 
                   tableNum.startsWith('C') || tableNum.startsWith('D');
        } else if (selectedArea === 'semi_outdoor') {
            return tableNum.startsWith('S');
        } else if (selectedArea === 'outdoor') {
            return tableNum.startsWith('O');
        }
        return false;
    });

    if (loading) {
        return (
            <div className="space-y-5 sm:space-y-6">
                <PageMeta
                    title="Kelola Meja | Reservasi Ruang Dugamasa"
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
                title="Kelola Meja | Reservasi Ruang Dugamasa"
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

                {/* Summary Statistics Cards */}
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

                {/* Visual Layout Manager */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Layout Meja
                    </h2>

                    {/* Area Tabs */}
                    <AreaTabs
                        activeArea={selectedArea}
                        onAreaChange={setSelectedArea}
                    />

                    {/* Visual Layout */}
                    <AdminTableLayoutViewer
                        layout={getLayoutByArea(selectedArea)}
                        tables={tablesForArea}
                        onAssignTable={handleAssignTable}
                        onEditTable={handleEditTable}
                        onDeleteTable={confirmDelete}
                    />
                </div>

                {/* Data Table */}
                <DataTableOne
                    title="Daftar Semua Meja"
                    data={tables}
                    columns={columns}
                    defaultItemsPerPage={10}
                    itemsPerPageOptions={[5, 10, 15, 20]}
                    defaultSortKey="id"
                    defaultSortOrder="asc"
                    searchable={true}
                    searchPlaceholder="Cari nomor meja, tipe, status..."
                />
            </div>

            {/* Edit Modal */}
            <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} className="max-w-lg">
                <form onSubmit={handleUpdateTable}>
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Edit Meja {editingTable?.table_number}
                        </h3>
                    </div>

                    <div className="px-6 py-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Nomor Meja
                            </label>
                            <input
                                type="text"
                                value={editFormData.table_number}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-800 dark:text-white cursor-not-allowed"
                            />
                            <p className="mt-1 text-xs text-gray-500">Nomor meja tidak dapat diubah</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tipe Meja <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={editFormData.table_type_id}
                                onChange={(e) => setEditFormData({ ...editFormData, table_type_id: Number(e.target.value) })}
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
                                value={editFormData.capacity}
                                onChange={(e) => setEditFormData({ ...editFormData, capacity: Number(e.target.value) })}
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
                                value={editFormData.status || "available"}
                                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as "available" | "reserved" | "inactive" })}
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
                            onClick={() => setShowEditModal(false)}
                            variant="outline"
                        >
                            Batal
                        </Button>
                        <Button type="submit" variant="primary">
                            Simpan Perubahan
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
                message={`Apakah Anda yakin ingin menghapus meja ${tableToDelete?.table_number}? Tindakan ini tidak dapat dibatalkan.`}
                variant="danger"
                isLoading={deleting}
                confirmText="Hapus"
            />
        </>
    );
}