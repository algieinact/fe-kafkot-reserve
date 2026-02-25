import { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, LayoutGrid, List } from "lucide-react";
import { tableApi } from "../../services/api";
import { Table, TableFormData, TableTypeDetail } from "../../types";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import DataTableOne, { ColumnConfig } from "../../components/tables/DataTables/TableOne/DataTableOne";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { Modal } from "../../components/ui/modal";
import TableLayoutEditor from "../../components/tables/TableLayoutEditor";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { DataTableSkeleton, StatsCardSkeleton } from "../../components/ui/skeleton";

export default function ManageTable() {
    const [tables, setTables] = useState<Table[]>([]);
    const [tableTypes, setTableTypes] = useState<TableTypeDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // View State
    const [activeTab, setActiveTab] = useState<'list' | 'layout'>('list');
    const [selectedFloor, setSelectedFloor] = useState<number>(1);

    // Edit Modal State (Generic for List & Layout)
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingTable, setEditingTable] = useState<Table | null>(null);
    const [editFormData, setEditFormData] = useState<TableFormData>({
        table_number: "",
        table_type_id: 1,
        capacity: 2,
        status: "available",
        floor: 1,
        position_x: -1,
        position_y: -1,
        orientation: "horizontal"
    });

    // Assign/Create Modal for Layout
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ x: number, y: number } | null>(null);
    const [assignTab, setAssignTab] = useState<'new' | 'existing'>('new');
    const [selectedExistingTableId, setSelectedExistingTableId] = useState<string>('');

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

    // Filtered tables for current floor
    const floorTables = useMemo(() => {
        return tables.filter(t => t.floor === selectedFloor && t.position_x !== -1 && t.position_x !== null && t.position_x !== undefined);
    }, [tables, selectedFloor]);

    // Unassigned tables (position -1)
    const unassignedTables = useMemo(() => {
        return tables.filter(t => t.position_x === -1 || t.position_x === null || t.position_x === undefined);
    }, [tables]);

    // HANDLERS

    const handleSlotClick = (x: number, y: number, currentTable?: Table, spanX?: number, spanY?: number) => {
        if (currentTable) {
            // Edit existing table at this position
            handleEditTable(currentTable);
        } else {
            // Assign new or existing table to empty slot
            setSelectedSlot({ x, y });
            // Default select first available type
            setEditFormData({
                table_number: "",
                table_type_id: tableTypes[0]?.id || 1,
                capacity: 2,
                status: "available",
                floor: selectedFloor,
                position_x: x,
                position_y: y,
                orientation: "horizontal",
                span_x: spanX || 1,
                span_y: spanY || 1
            });
            setShowAssignModal(true);
        }
    };

    const handleEditTable = (table: Table) => {
        setEditingTable(table);
        setEditFormData({
            table_number: table.table_number,
            table_type_id: table.table_type.id,
            capacity: table.capacity,
            status: table.status,
            floor: table.floor,
            position_x: table.position_x,
            position_y: table.position_y,
            orientation: table.orientation
        });
        setShowEditModal(true);
    };

    const handleCreateOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingTable) {
                const response = await tableApi.updateTable(editingTable.id.toString(), editFormData);
                if (response.success) {
                    await fetchTables();
                    setShowEditModal(false);
                    setEditingTable(null);
                }
            } else {
                const response = await tableApi.createTable(editFormData);
                if (response.success) {
                    await fetchTables();
                    setShowEditModal(false); // Used for List View Create
                }
            }
        } catch (err) {
            console.error("Submit error:", err);
            setError("Gagal menyimpan data meja");
        }
    };

    const handleAssignSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSlot) return;

        try {
            if (assignTab === 'new') {
                const response = await tableApi.createTable({
                    ...editFormData,
                    floor: selectedFloor,
                    position_x: selectedSlot.x,
                    position_y: selectedSlot.y
                });
                if (response.success) await fetchTables();
            } else {
                if (!selectedExistingTableId) return;
                const response = await tableApi.updateTablePosition(
                    selectedExistingTableId,
                    selectedFloor,
                    selectedSlot.x,
                    selectedSlot.y,
                    "horizontal",
                    editFormData.span_x,
                    editFormData.span_y
                );
                if (response.success) await fetchTables();
            }
            setShowAssignModal(false);
            setEditFormData(prev => ({ ...prev, table_number: "" })); // Reset form
        } catch (err) {
            console.error("Assign error:", err);
            setError("Gagal menempatkan meja");
        }
    };

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
            }
        } catch (err) {
            setError("Gagal menghapus meja");
        } finally {
            setDeleting(false);
        }
    };

    const handleUnassignPosition = async () => {
        if (!editingTable) return;
        try {
            const response = await tableApi.updateTablePosition(
                editingTable.id.toString(),
                editingTable.floor,
                -1,
                -1
            );
            if (response.success) {
                await fetchTables();
                setShowEditModal(false);
            }
        } catch (err) {
            setError("Gagal melepaskan posisi meja");
        }
    };

    // Columns for List View
    const columns: ColumnConfig[] = useMemo(() => [
        {
            key: "table_number",
            label: "Nomor Meja",
            sortable: true,
            render: (val) => (
                <span className="font-normal dark:text-gray-400/90 text-gray-800 text-theme-sm">
                    {val as string}
                </span>
            )
        },
        {
            key: "floor",
            label: "Lokasi",
            sortable: true,
            render: (_val, row: Table) => (
                <span className="font-normal dark:text-gray-400/90 text-gray-800 text-theme-sm">
                    {row.position_x !== -1 ? `Lantai ${row.floor} (${row.position_x},${row.position_y})` : "Belum ditempatkan"}
                </span>
            )
        },
        {
            key: "capacity",
            label: "Kapasitas",
            sortable: true,
            render: (val) => (
                <span className="font-normal dark:text-gray-400/90 text-gray-800 text-theme-sm">
                    {val} Orang
                </span>
            )
        },
        {
            key: "status",
            label: "Status",
            sortable: true,
            render: (val) => (
                <span className={`px-2.5 py-1 text-xs rounded-full ${val === 'available'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                    {val === 'available' ? 'Tersedia' : 'Tidak Aktif'}
                </span>
            )
        },
        {
            key: "actions",
            label: "Aksi",
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

    if (loading) {
        return (
            <div className="space-y-5 sm:space-y-6">
                <PageMeta title="Kelola Meja" description="Manajemen layout dan data meja restoran" />
                <PageBreadcrumb pageTitle="Kelola Meja" showHome={false} />
                <StatsCardSkeleton count={3} />
                <DataTableSkeleton />
            </div>
        );
    }

    // Statistics
    const totalTables = tables.length;
    const availableTables = tables.filter(t => t.status === "available").length;
    const inactiveTables = tables.filter(t => t.status === "inactive").length;

    return (
        <>
            <PageMeta title="Kelola Meja" description="Manajemen layout dan data meja restoran" />
            <PageBreadcrumb pageTitle="Kelola Meja" showHome={false} />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="text-gray-500 text-sm">Total Meja</div>
                    <div className="text-2xl font-bold">{totalTables}</div>
                </div>
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="text-gray-500 text-sm">Tersedia</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{availableTables}</div>
                </div>
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="text-gray-500 text-sm">Tidak Aktif</div>
                    <div className="text-2xl font-bold text-gray-500 dark:text-gray-400">{inactiveTables}</div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex gap-6">
                    <button
                        onClick={() => setActiveTab('list')}
                        className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'list'
                            ? 'border-brand-500 text-brand-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <List size={18} />
                        Data Meja
                    </button>
                    <button
                        onClick={() => setActiveTab('layout')}
                        className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'layout'
                            ? 'border-brand-500 text-brand-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <LayoutGrid size={18} />
                        Kelola Posisi
                    </button>
                </nav>
            </div>

            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

            {activeTab === 'list' ? (
                <div className="space-y-6">
                    <DataTableOne
                        title="Daftar Semua Meja"
                        data={tables}
                        columns={columns}
                        searchable={true}
                        defaultItemsPerPage={10}
                        actionButton={
                            <Button size="sm" onClick={() => {
                                setEditingTable(null);
                                setEditFormData({
                                    table_number: "", table_type_id: 1, capacity: 2, status: "available",
                                    floor: 1, position_x: -1, position_y: -1, orientation: "horizontal"
                                });
                                setShowEditModal(true);
                            }}>
                                <Plus className="w-4 h-4 mr-2" /> Tambah Meja
                            </Button>
                        }
                    />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Floor Selector */}
                    <div className="flex gap-2 mb-4">
                        {[1, 2, 3].map(floor => (
                            <button
                                key={floor}
                                onClick={() => setSelectedFloor(floor)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedFloor === floor
                                    ? 'bg-brand-600 text-white shadow-md'
                                    : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
                                    }`}
                            >
                                Lantai {floor}
                            </button>
                        ))}
                    </div>

                    <TableLayoutEditor
                        floor={selectedFloor}
                        tables={floorTables}
                        onSlotClick={handleSlotClick}
                    />

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-yellow-800 dark:text-yellow-200 text-sm">
                        * Terdapat {unassignedTables.length} meja yang belum ditempatkan pada layout. Anda dapat memilihnya saat mengklik grid kosong.
                    </div>
                </div>
            )}

            {/* Modal Create/Edit General */}
            <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} className="max-w-lg p-5 lg:p-10">
                <form onSubmit={handleCreateOrUpdate} className="space-y-5">
                    <h4 className="text-lg font-medium text-gray-800 dark:text-white/90">
                        {editingTable ? `Edit Meja ${editingTable.table_number}` : "Tambah Meja Baru"}
                    </h4>

                    <div className="space-y-4">
                        <div>
                            <Label>Nomor Meja</Label>
                            <Input type="text" value={editFormData.table_number}
                                onChange={e => setEditFormData({ ...editFormData, table_number: e.target.value })}
                                disabled={!!editingTable}
                            />
                        </div>
                        <div>
                            <Label>Tipe</Label>
                            <select
                                value={editFormData.table_type_id}
                                onChange={e => setEditFormData({ ...editFormData, table_type_id: Number(e.target.value) })}
                                className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                            >
                                {tableTypes.map(t => <option key={t.id} value={t.id}>{t.type_name}</option>)}
                            </select>
                        </div>
                        <div>
                            <Label>Kapasitas</Label>
                            <Input type="number" min="1" value={editFormData.capacity}
                                onChange={e => setEditFormData({ ...editFormData, capacity: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <Label>Status</Label>
                            <select
                                value={editFormData.status}
                                onChange={e => setEditFormData({ ...editFormData, status: e.target.value as any })}
                                className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                            >
                                <option value="available">Tersedia</option>
                                <option value="inactive">Tidak Aktif</option>
                            </select>
                        </div>

                        {/* Position Info & Unassign Button */}
                        {editingTable && editingTable.position_x !== -1 && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex justify-between items-center text-sm">
                                <span className="text-blue-800 dark:text-blue-200">
                                    <b>Lokasi Saat Ini:</b> Lantai {editingTable.floor} (Posisi {editingTable.position_x}, {editingTable.position_y})
                                    {(editingTable.span_x && editingTable.span_x > 1 || editingTable.span_y && editingTable.span_y > 1) && (
                                        <div className="mt-1 flex items-center gap-2">
                                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded border border-blue-200">
                                                Merged: {editingTable.span_x || 1}x{editingTable.span_y || 1}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (confirm("Apakah Anda yakin ingin memisahkan meja ini kembali menjadi 1x1?")) {
                                                        // Update table to 1x1 span
                                                        setEditFormData({ ...editFormData, span_x: 1, span_y: 1 });
                                                        // Note: Actual saving happens when form is submitted
                                                    }
                                                }}
                                                className="text-xs text-red-600 hover:underline"
                                            >
                                                Unmerge
                                            </button>
                                        </div>
                                    )}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleUnassignPosition}
                                    className="text-red-600 hover:text-red-800 text-xs font-bold underline px-2"
                                >
                                    Lepaskan dari Layout
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end w-full gap-3 mt-6">
                        <Button type="button" size="sm" variant="outline" onClick={() => setShowEditModal(false)}>Batal</Button>
                        <Button type="submit" size="sm">Simpan</Button>
                    </div>
                </form>
            </Modal>

            {/* Modal Assign to Slot */}
            <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} className="max-w-lg p-5 lg:p-10">
                <div className="space-y-5">
                    <h4 className="text-lg font-medium text-gray-800 dark:text-white/90">
                        Atur Meja di Lantai {selectedFloor} (Posisi {selectedSlot?.x ?? '-'}, {selectedSlot?.y ?? '-'})
                    </h4>

                    {(editFormData.span_x && editFormData.span_x > 1 || editFormData.span_y && editFormData.span_y > 1) && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium flex items-center gap-2">
                                <span className="text-lg">📐</span>
                                Area Terpilih: {editFormData.span_x} baris x {editFormData.span_y} kolom
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                                Meja ini akan menempati area yang digabungkan.
                            </p>
                        </div>
                    )}

                    {/* Internal Tabs for Assign Modal */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <button onClick={() => setAssignTab('new')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${assignTab === 'new' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Buat Meja Baru</button>
                        <button onClick={() => setAssignTab('existing')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${assignTab === 'existing' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Pilih dari Daftar</button>
                    </div>

                    <form onSubmit={handleAssignSubmit} className="space-y-5">
                        <div className="space-y-4">
                            {assignTab === 'new' ? (
                                <>
                                    <div>
                                        <Label>Nomor Meja</Label>
                                        <Input type="text" value={editFormData.table_number}
                                            onChange={e => setEditFormData({ ...editFormData, table_number: e.target.value })}
                                            placeholder="Contoh: A01"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Tipe</Label>
                                            <select
                                                value={editFormData.table_type_id}
                                                onChange={e => setEditFormData({ ...editFormData, table_type_id: Number(e.target.value) })}
                                                className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                                            >
                                                {tableTypes.map(t => <option key={t.id} value={t.id}>{t.type_name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <Label>Kapasitas</Label>
                                            <Input type="number" min="1" value={editFormData.capacity}
                                                onChange={e => setEditFormData({ ...editFormData, capacity: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <Label>Pilih Meja yang Belum Ditempatkan</Label>
                                    <select
                                        value={selectedExistingTableId}
                                        onChange={e => setSelectedExistingTableId(e.target.value)}
                                        className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                                    >
                                        <option value="">-- Pilih Meja --</option>
                                        {unassignedTables.map(t => (
                                            <option key={t.id} value={t.id}>{t.table_number} (Kap: {t.capacity})</option>
                                        ))}
                                    </select>
                                    {unassignedTables.length === 0 && <p className="text-sm text-yellow-600 mt-2">Tidak ada meja yang belum ditempatkan.</p>}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end w-full gap-3 mt-6">
                            <Button type="button" size="sm" variant="outline" onClick={() => setShowAssignModal(false)}>Batal</Button>
                            <Button type="submit" size="sm">Tempatkan Meja</Button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Hapus Meja"
                message="Yakin ingin menghapus meja ini?"
                variant="danger"
                isLoading={deleting}
            />
        </>
    );
}