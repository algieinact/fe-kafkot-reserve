import { useState, useEffect } from "react";
import { Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import { variationApi } from "../../services/api";
import { VariationGroup, VariationOption } from "../../types";
import { Modal } from "../../components/ui/modal";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { CardSkeleton } from "../../components/ui/skeleton";


export default function ManageVariations() {
    const [groups, setGroups] = useState<VariationGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

    // Group modal state
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [editingGroup, setEditingGroup] = useState<VariationGroup | null>(null);
    const [groupFormData, setGroupFormData] = useState({
        name: "",
        type: "single_choice" as "single_choice" | "multiple_choice",
        is_required: false,
        min_selections: 0,
        max_selections: null as number | null,
    });

    // Option modal state
    const [showOptionModal, setShowOptionModal] = useState(false);
    const [selectedGroupForOption, setSelectedGroupForOption] = useState<number | null>(null);
    const [editingOption, setEditingOption] = useState<VariationOption | null>(null);
    const [optionFormData, setOptionFormData] = useState({
        name: "",
        price_adjustment: 0,
        is_default: false,
        order: 0,
    });

    // Delete confirmation state
    const [showDeleteGroupModal, setShowDeleteGroupModal] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState<number | null>(null);
    const [showDeleteOptionModal, setShowDeleteOptionModal] = useState(false);
    const [optionToDelete, setOptionToDelete] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await variationApi.getAllGroups();
            if (response.success && response.data) {
                setGroups(response.data);
                setExpandedGroups(new Set(response.data.map(g => g.id)));
            } else {
                setError(response.error || "Gagal memuat grup variasi");
            }
        } catch (err) {
            setError("Terjadi kesalahan saat memuat data");
            console.error("Variation groups error:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleGroupExpand = (groupId: number) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(groupId)) {
                next.delete(groupId);
            } else {
                next.add(groupId);
            }
            return next;
        });
    };

    const handleCreateGroup = () => {
        setEditingGroup(null);
        setGroupFormData({
            name: "",
            type: "single_choice",
            is_required: false,
            min_selections: 0,
            max_selections: null,
        });
        setShowGroupModal(true);
    };

    const handleEditGroup = (group: VariationGroup) => {
        setEditingGroup(group);
        setGroupFormData({
            name: group.name,
            type: group.type,
            is_required: group.is_required,
            min_selections: group.min_selections,
            max_selections: group.max_selections,
        });
        setShowGroupModal(true);
    };

    const handleSaveGroup = async () => {
        try {
            setSubmitting(true);
            setError(null);

            if (editingGroup) {
                const response = await variationApi.updateGroup(editingGroup.id, groupFormData);
                if (response.success) {
                    await fetchGroups();
                    setShowGroupModal(false);
                }
            } else {
                const response = await variationApi.createGroup(groupFormData);
                if (response.success) {
                    await fetchGroups();
                    setShowGroupModal(false);
                }
            }
        } catch (err) {
            console.error("Save group error:", err);
            setError("Gagal menyimpan grup variasi");
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDeleteGroup = (id: number) => {
        setGroupToDelete(id);
        setShowDeleteGroupModal(true);
    };

    const handleDeleteGroup = async () => {
        if (!groupToDelete) return;

        try {
            setDeleting(true);
            setError(null);
            const response = await variationApi.deleteGroup(groupToDelete);
            if (response.success) {
                await fetchGroups();
                setShowDeleteGroupModal(false);
                setGroupToDelete(null);
            }
        } catch (err) {
            console.error("Delete group error:", err);
            setError("Gagal menghapus grup variasi");
        } finally {
            setDeleting(false);
        }
    };

    const handleAddOption = (groupId: number) => {
        setSelectedGroupForOption(groupId);
        setEditingOption(null);
        setOptionFormData({
            name: "",
            price_adjustment: 0,
            is_default: false,
            order: 0,
        });
        setShowOptionModal(true);
    };

    const handleEditOption = (groupId: number, option: VariationOption) => {
        setSelectedGroupForOption(groupId);
        setEditingOption(option);
        setOptionFormData({
            name: option.name,
            price_adjustment: option.price_adjustment,
            is_default: option.is_default,
            order: option.order,
        });
        setShowOptionModal(true);
    };

    const handleSaveOption = async () => {
        if (!selectedGroupForOption) return;

        try {
            setSubmitting(true);
            setError(null);

            if (editingOption) {
                const response = await variationApi.updateOption(editingOption.id, optionFormData);
                if (response.success) {
                    await fetchGroups();
                    setShowOptionModal(false);
                }
            } else {
                const response = await variationApi.createOption({
                    ...optionFormData,
                    variation_group_id: selectedGroupForOption,
                });
                if (response.success) {
                    await fetchGroups();
                    setShowOptionModal(false);
                }
            }
        } catch (err) {
            console.error("Save option error:", err);
            setError("Gagal menyimpan opsi");
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDeleteOption = (optionId: number) => {
        setOptionToDelete(optionId);
        setShowDeleteOptionModal(true);
    };

    const handleDeleteOption = async () => {
        if (!optionToDelete) return;

        try {
            setDeleting(true);
            setError(null);
            const response = await variationApi.deleteOption(optionToDelete);
            if (response.success) {
                await fetchGroups();
                setShowDeleteOptionModal(false);
                setOptionToDelete(null);
            }
        } catch (err) {
            console.error("Delete option error:", err);
            setError("Gagal menghapus opsi");
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-5 sm:space-y-6">
                <PageMeta
                    title="Kelola Variasi | Reservasi Ruang Dugamasa"
                    description="Kelola grup variasi dan opsi untuk menu"
                />
                <PageBreadcrumb pageTitle="Kelola Variasi" showHome={false} />
                <CardSkeleton count={3} />
            </div>
        );
    }

    return (
        <>
            <PageMeta
                title="Kelola Variasi | Reservasi Ruang Dugamasa"
                description="Kelola grup variasi dan opsi untuk menu"
            />
            <PageBreadcrumb pageTitle="Kelola Variasi" showHome={false} />

            <div className="space-y-5 sm:space-y-6">

                {/* Error Message */}
                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                        {error}
                    </div>
                )}

                {/* Variation Groups List */}
                <div className="overflow-hidden bg-white dark:bg-white/[0.03] rounded-xl">
                    {/* Title Section */}
                    <div className="flex items-center justify-between px-4 py-4 border border-b-0 border-gray-100 dark:border-white/[0.05] rounded-t-xl">
                        <h3 className="font-semibold text-gray-800 dark:text-white">Daftar Grup Variasi</h3>
                        <Button variant="primary" size="sm" onClick={handleCreateGroup}>
                            + Tambah Grup Variasi
                        </Button>
                    </div>

                    {/* Content Section */}
                    <div className="px-4 py-4 border border-b-0 border-gray-100 dark:border-white/[0.05]">
                        <div className="space-y-2">
                            {groups.length === 0 ? (
                                <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Belum ada grup variasi. Klik "Tambah Grup Variasi" untuk membuat yang pertama.
                                    </p>
                                </div>
                            ) : (
                                groups.map((group) => (
                                    <div key={group.id} className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-dark overflow-hidden">
                                        {/* Group Header */}
                                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => toggleGroupExpand(group.id)}
                                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                                >
                                                    {expandedGroups.has(group.id) ? (
                                                        <ChevronUp className="h-5 w-5" />
                                                    ) : (
                                                        <ChevronDown className="h-5 w-5" />
                                                    )}
                                                </button>
                                                <div>
                                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{group.name}</h3>
                                                    <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                        <span>{group.type === "single_choice" ? "Pilihan Tunggal" : "Pilihan Ganda"}</span>
                                                        {group.is_required && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="text-red-600 dark:text-red-400 font-medium">Wajib</span>
                                                            </>
                                                        )}
                                                        {group.options && (
                                                            <>
                                                                <span>•</span>
                                                                <span>{group.options.length} opsi</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleEditGroup(group)}
                                                    className="inline-flex items-center justify-center p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => confirmDeleteGroup(group.id)}
                                                    className="inline-flex items-center justify-center p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Options List (Expanded) */}
                                        {expandedGroups.has(group.id) && (
                                            <div className="px-4 py-3">
                                                {group.options && group.options.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {group.options.map((option) => (
                                                            <div
                                                                key={option.id}
                                                                className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{option.name}</span>
                                                                    {option.price_adjustment !== 0 && (
                                                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                                                            {option.price_adjustment > 0 ? "+" : ""}
                                                                            Rp {option.price_adjustment.toLocaleString("id-ID")}
                                                                        </span>
                                                                    )}
                                                                    {option.is_default && (
                                                                        <span className="rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-medium text-green-800 dark:text-green-400">
                                                                            Default
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <button
                                                                        onClick={() => handleEditOption(group.id, option)}
                                                                        className="inline-flex items-center justify-center p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                                    >
                                                                        <Edit className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => confirmDeleteOption(option.id)}
                                                                        className="inline-flex items-center justify-center p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                                        Belum ada opsi
                                                    </p>
                                                )}

                                                <button
                                                    onClick={() => handleAddOption(group.id)}
                                                    className="mt-3 text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                                                >
                                                    + Tambah Opsi
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Bottom Section - for consistent styling */}
                    <div className="border border-t-0 rounded-b-xl border-gray-100 py-4 px-4 dark:border-white/[0.05]">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Total: {groups.length} grup variasi
                        </p>
                    </div>
                </div>

                {/* Group Modal */}
                <Modal isOpen={showGroupModal} onClose={() => setShowGroupModal(false)} className="max-w-2xl p-5 lg:p-8">
                    <div className="flex flex-col max-h-[85vh]">
                        <h4 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4">
                            {editingGroup ? "Edit Grup Variasi" : "Tambah Grup Variasi Baru"}
                        </h4>

                        <div className="space-y-4 overflow-y-auto pr-2 flex-1">
                            <div>
                                <Label htmlFor="group-name">
                                    Nama Grup <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    type="text"
                                    id="group-name"
                                    value={groupFormData.name}
                                    onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                                    placeholder="Contoh: Sugar Level, Ice Level"
                                />
                            </div>

                            <div>
                                <Label htmlFor="group-type">
                                    Tipe <span className="text-red-500">*</span>
                                </Label>
                                <select
                                    id="group-type"
                                    value={groupFormData.type}
                                    onChange={(e) => setGroupFormData({ ...groupFormData, type: e.target.value as "single_choice" | "multiple_choice" })}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
                                >
                                    <option value="single_choice">Pilihan Tunggal (Radio)</option>
                                    <option value="multiple_choice">Pilihan Ganda (Checkbox)</option>
                                </select>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_required"
                                    checked={groupFormData.is_required}
                                    onChange={(e) => setGroupFormData({ ...groupFormData, is_required: e.target.checked })}
                                    className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                                />
                                <label htmlFor="is_required" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                    Wajib dipilih
                                </label>
                            </div>

                            {groupFormData.type === "multiple_choice" && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="min-selections">Min. Pilihan</Label>
                                        <Input
                                            type="number"
                                            id="min-selections"
                                            value={groupFormData.min_selections}
                                            onChange={(e) => setGroupFormData({ ...groupFormData, min_selections: parseInt(e.target.value) || 0 })}
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="max-selections">Max. Pilihan</Label>
                                        <Input
                                            type="number"
                                            id="max-selections"
                                            value={groupFormData.max_selections || ""}
                                            onChange={(e) => setGroupFormData({ ...groupFormData, max_selections: e.target.value ? parseInt(e.target.value) : null })}
                                            min="1"
                                            placeholder="Unlimited"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end w-full gap-3 mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button size="sm" onClick={() => setShowGroupModal(false)} variant="outline" disabled={submitting}>
                                Batal
                            </Button>
                            <Button size="sm" variant="primary" onClick={handleSaveGroup} disabled={submitting}>
                                {submitting ? "Menyimpan..." : (editingGroup ? "Simpan Perubahan" : "Tambah Grup")}
                            </Button>
                        </div>
                    </div>
                </Modal>

                {/* Option Modal */}
                <Modal isOpen={showOptionModal} onClose={() => setShowOptionModal(false)} className="max-w-2xl p-5 lg:p-8">
                    <div className="flex flex-col max-h-[85vh]">
                        <h4 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4">
                            {editingOption ? "Edit Opsi" : "Tambah Opsi Baru"}
                        </h4>

                        <div className="space-y-4 overflow-y-auto pr-2 flex-1">
                            <div>
                                <Label htmlFor="option-name">
                                    Nama Opsi <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    type="text"
                                    id="option-name"
                                    value={optionFormData.name}
                                    onChange={(e) => setOptionFormData({ ...optionFormData, name: e.target.value })}
                                    placeholder="Contoh: Less Sugar, Normal, Extra Sugar"
                                />
                            </div>

                            <div>
                                <Label htmlFor="price-adjustment">Penyesuaian Harga (Rp)</Label>
                                <Input
                                    type="number"
                                    id="price-adjustment"
                                    value={optionFormData.price_adjustment}
                                    onChange={(e) => setOptionFormData({ ...optionFormData, price_adjustment: parseFloat(e.target.value) || 0 })}
                                    placeholder="0 untuk tidak ada tambahan"
                                />
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Gunakan angka positif untuk tambahan harga, negatif untuk diskon
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="option-order">Urutan</Label>
                                <Input
                                    type="number"
                                    id="option-order"
                                    value={optionFormData.order}
                                    onChange={(e) => setOptionFormData({ ...optionFormData, order: parseInt(e.target.value) || 0 })}
                                    min="0"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_default"
                                    checked={optionFormData.is_default}
                                    onChange={(e) => setOptionFormData({ ...optionFormData, is_default: e.target.checked })}
                                    className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                                />
                                <label htmlFor="is_default" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                    Jadikan opsi default
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center justify-end w-full gap-3 mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button size="sm" onClick={() => setShowOptionModal(false)} variant="outline" disabled={submitting}>
                                Batal
                            </Button>
                            <Button size="sm" variant="primary" onClick={handleSaveOption} disabled={submitting}>
                                {submitting ? "Menyimpan..." : (editingOption ? "Simpan Perubahan" : "Tambah Opsi")}
                            </Button>
                        </div>
                    </div>
                </Modal>

                {/* Delete Group Confirmation */}
                <ConfirmationModal
                    isOpen={showDeleteGroupModal}
                    onClose={() => setShowDeleteGroupModal(false)}
                    onConfirm={handleDeleteGroup}
                    title="Hapus Grup Variasi"
                    message="Apakah Anda yakin ingin menghapus grup variasi ini? Semua opsi di dalamnya akan ikut terhapus. Tindakan ini tidak dapat dibatalkan."
                    variant="danger"
                    confirmText="Hapus"
                    isLoading={deleting}
                />

                {/* Delete Option Confirmation */}
                <ConfirmationModal
                    isOpen={showDeleteOptionModal}
                    onClose={() => setShowDeleteOptionModal(false)}
                    onConfirm={handleDeleteOption}
                    title="Hapus Opsi"
                    message="Apakah Anda yakin ingin menghapus opsi ini? Tindakan ini tidak dapat dibatalkan."
                    variant="danger"
                    confirmText="Hapus"
                    isLoading={deleting}
                />
            </div>
        </>
    );
}
