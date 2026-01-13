import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { VariationGroup, VariationOption } from "../../types";
import { variationApi } from "../../services/api";
import Button from "../../components/ui/button/Button";

export default function ManageVariations() {
    const [groups, setGroups] = useState<VariationGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
            }
        } catch (err) {
            setError("Failed to fetch variation groups");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Group CRUD operations
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
            if (editingGroup) {
                await variationApi.updateGroup(editingGroup.id, groupFormData);
            } else {
                await variationApi.createGroup(groupFormData);
            }
            setShowGroupModal(false);
            fetchGroups();
        } catch (err) {
            alert("Failed to save variation group");
            console.error(err);
        }
    };

    const handleDeleteGroup = async (id: number) => {
        if (!confirm("Are you sure you want to delete this variation group?")) return;

        try {
            await variationApi.deleteGroup(id);
            fetchGroups();
        } catch (err) {
            alert("Failed to delete variation group");
            console.error(err);
        }
    };

    // Option CRUD operations
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
            if (editingOption) {
                await variationApi.updateOption(editingOption.id, optionFormData);
            } else {
                await variationApi.createOption({
                    variation_group_id: selectedGroupForOption,
                    ...optionFormData,
                });
            }
            setShowOptionModal(false);
            fetchGroups();
        } catch (err) {
            alert("Failed to save option");
            console.error(err);
        }
    };

    const handleDeleteOption = async (optionId: number) => {
        if (!confirm("Are you sure you want to delete this option?")) return;

        try {
            await variationApi.deleteOption(optionId);
            fetchGroups();
        } catch (err) {
            alert("Failed to delete option");
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kelola Variasi</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Atur grup variasi dan opsi untuk menu
                    </p>
                </div>
                <Button onClick={handleCreateGroup}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Grup Variasi
                </Button>
            </div>

            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                </div>
            )}

            {/* Variation Groups List */}
            <div className="space-y-4">
                {groups.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400">
                            Belum ada grup variasi. Klik "Tambah Grup Variasi" untuk membuat yang pertama.
                        </p>
                    </div>
                ) : (
                    groups.map((group) => (
                        <div
                            key={group.id}
                            className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-dark"
                        >
                            {/* Group Header */}
                            <div className="mb-4 flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {group.name}
                                    </h3>
                                    <div className="mt-1 flex gap-2">
                                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                            {group.type === "single_choice" ? "Pilihan Tunggal" : "Pilihan Ganda"}
                                        </span>
                                        {group.is_required && (
                                            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                                Wajib
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEditGroup(group)}
                                        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteGroup(group.id)}
                                        className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Options List */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Opsi:</h4>
                                    <button
                                        onClick={() => handleAddOption(group.id)}
                                        className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400"
                                    >
                                        + Tambah Opsi
                                    </button>
                                </div>

                                {group.options && group.options.length > 0 ? (
                                    <div className="space-y-2">
                                        {group.options.map((option) => (
                                            <div
                                                key={option.id}
                                                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm text-gray-900 dark:text-white">{option.name}</span>
                                                    {option.price_adjustment !== 0 && (
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            {option.price_adjustment > 0 ? "+" : ""}
                                                            Rp {option.price_adjustment.toLocaleString("id-ID")}
                                                        </span>
                                                    )}
                                                    {option.is_default && (
                                                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditOption(group.id, option)}
                                                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteOption(option.id)}
                                                        className="text-red-600 hover:text-red-700 dark:text-red-400"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada opsi</p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Group Modal */}
            {showGroupModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-dark">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                            {editingGroup ? "Edit Grup Variasi" : "Tambah Grup Variasi"}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nama Grup
                                </label>
                                <input
                                    type="text"
                                    value={groupFormData.name}
                                    onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    placeholder="Contoh: Sugar Level, Ice Level"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Tipe
                                </label>
                                <select
                                    value={groupFormData.type}
                                    onChange={(e) =>
                                        setGroupFormData({
                                            ...groupFormData,
                                            type: e.target.value as "single_choice" | "multiple_choice",
                                        })
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                >
                                    <option value="single_choice">Pilihan Tunggal (Radio)</option>
                                    <option value="multiple_choice">Pilihan Ganda (Checkbox)</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_required"
                                    checked={groupFormData.is_required}
                                    onChange={(e) =>
                                        setGroupFormData({ ...groupFormData, is_required: e.target.checked })
                                    }
                                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                                />
                                <label htmlFor="is_required" className="text-sm text-gray-700 dark:text-gray-300">
                                    Wajib dipilih
                                </label>
                            </div>

                            {groupFormData.type === "multiple_choice" && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Min. Pilihan
                                        </label>
                                        <input
                                            type="number"
                                            value={groupFormData.min_selections}
                                            onChange={(e) =>
                                                setGroupFormData({
                                                    ...groupFormData,
                                                    min_selections: parseInt(e.target.value) || 0,
                                                })
                                            }
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Max. Pilihan
                                        </label>
                                        <input
                                            type="number"
                                            value={groupFormData.max_selections || ""}
                                            onChange={(e) =>
                                                setGroupFormData({
                                                    ...groupFormData,
                                                    max_selections: e.target.value ? parseInt(e.target.value) : null,
                                                })
                                            }
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                            min="1"
                                            placeholder="Unlimited"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowGroupModal(false)}>
                                <X className="mr-2 h-4 w-4" />
                                Batal
                            </Button>
                            <Button onClick={handleSaveGroup}>
                                <Save className="mr-2 h-4 w-4" />
                                Simpan
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Option Modal */}
            {showOptionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-dark">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                            {editingOption ? "Edit Opsi" : "Tambah Opsi"}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nama Opsi
                                </label>
                                <input
                                    type="text"
                                    value={optionFormData.name}
                                    onChange={(e) => setOptionFormData({ ...optionFormData, name: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    placeholder="Contoh: Less Sugar, Normal, Extra Sugar"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Penyesuaian Harga (Rp)
                                </label>
                                <input
                                    type="number"
                                    value={optionFormData.price_adjustment}
                                    onChange={(e) =>
                                        setOptionFormData({
                                            ...optionFormData,
                                            price_adjustment: parseFloat(e.target.value) || 0,
                                        })
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    placeholder="0 untuk tidak ada tambahan"
                                />
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Gunakan angka positif untuk tambahan harga, negatif untuk diskon
                                </p>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Urutan
                                </label>
                                <input
                                    type="number"
                                    value={optionFormData.order}
                                    onChange={(e) =>
                                        setOptionFormData({ ...optionFormData, order: parseInt(e.target.value) || 0 })
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    min="0"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_default"
                                    checked={optionFormData.is_default}
                                    onChange={(e) =>
                                        setOptionFormData({ ...optionFormData, is_default: e.target.checked })
                                    }
                                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                                />
                                <label htmlFor="is_default" className="text-sm text-gray-700 dark:text-gray-300">
                                    Jadikan opsi default
                                </label>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowOptionModal(false)}>
                                <X className="mr-2 h-4 w-4" />
                                Batal
                            </Button>
                            <Button onClick={handleSaveOption}>
                                <Save className="mr-2 h-4 w-4" />
                                Simpan
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
