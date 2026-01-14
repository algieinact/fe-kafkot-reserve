import { useState, useMemo, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import DataTableOne, { ColumnConfig } from "../../components/tables/DataTables/TableOne/DataTableOne";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import BannerDropZone from "../../components/form/form-elements/BannerDropZone";
import { Banner } from "../../types";
import { bannerApi } from "../../services/api";
import { DataTableSkeleton } from "../../components/ui/skeleton";

interface BannerFormData {
  title: string;
  subtitle: string;
  image_file: File | null;
  order: number;
  is_active: boolean;
}

export default function ManageBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState<BannerFormData>({
    title: "",
    subtitle: "",
    image_file: null,
    order: 1,
    is_active: true,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Confirmation Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false); // Add submitting state

  // Fetch banners from API
  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bannerApi.getAllBanners();

      if (response.success && response.data) {
        setBanners(response.data);
      } else {
        setError(response.error || "Failed to fetch banners");
      }
    } catch (err) {
      console.error("Error fetching banners:", err);
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate image for new banner
    if (!editingBanner && !formData.image_file) {
      setError("Image is required for new banner");
      return;
    }

    try {
      setSubmitting(true);
      const apiFormData = new FormData();
      apiFormData.append("title", formData.title);
      apiFormData.append("subtitle", formData.subtitle);
      apiFormData.append("order", formData.order.toString());
      apiFormData.append("is_active", formData.is_active ? "1" : "0");

      // Add image file if exists
      if (formData.image_file) {
        apiFormData.append("image", formData.image_file);
      }

      if (editingBanner) {
        await bannerApi.updateBanner(editingBanner.id, apiFormData);
      } else {
        await bannerApi.createBanner(apiFormData);
      }

      await fetchBanners();
      closeModal();
    } catch (err) {
      console.error("Error saving banner:", err);
      setError("Failed to save banner");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (id: number) => {
    setBannerToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!bannerToDelete) return;

    try {
      setDeleting(true);
      setError(null);

      const response = await bannerApi.deleteBanner(bannerToDelete);

      if (response.success) {
        setBanners(banners.filter(b => b.id !== bannerToDelete));
        setShowDeleteModal(false);
        setBannerToDelete(null);
      } else {
        setError(response.error || "Failed to delete banner");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setError("Gagal menghapus banner");
    } finally {
      setDeleting(false);
    }
  };

  const openModal = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title,
        subtitle: banner.subtitle,
        image_file: null, // We don't have the original File object, so set to null
        order: banner.order,
        is_active: banner.is_active,
      });
      setImagePreview(banner.image_url); // Display existing image URL as preview
    } else {
      setEditingBanner(null);
      setFormData({
        title: "",
        subtitle: "",
        image_file: null, // For new banner, no file yet
        order: banners.length + 1,
        is_active: true,
      });
      setImagePreview(null);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBanner(null);
    setFormData({
      title: "",
      subtitle: "",
      image_file: null, // Reset image_file
      order: 1,
      is_active: true,
    });
    setImagePreview(null);
    setError(null);
  };

  const handleImageChange = (file: File | null) => {
    if (file) {
      setFormData({ ...formData, image_file: file });
      // Create preview URL for display
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setFormData({ ...formData, image_file: null });
      setImagePreview(null);
    }
  };

  const columns: ColumnConfig[] = useMemo(() => [
    {
      key: "id",
      label: "ID",
      sortable: true,
    },
    {
      key: "order",
      label: "Urutan",
      sortable: true,
      render: (val) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {val as number}
        </span>
      )
    },
    {
      key: "title",
      label: "Banner",
      sortable: true,
      render: (_val, row) => (
        <div className="flex items-center">
          <img
            src={row.image_url || "/images/placeholder.jpg"}
            alt={row.title}
            className="w-20 h-12 rounded-lg object-cover mr-3"
          />
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {row.title}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 max-w-[300px]">
              {row.subtitle}
            </div>
          </div>
        </div>
      )
    },
    {
      key: "is_active",
      label: "Status",
      sortable: true,
      render: (val) => (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${val
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
          : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
          }`}>
          {val ? "Aktif" : "Nonaktif"}
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
            onClick={() => openModal(row as Banner)}
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
          title="Kelola Banner | Reservasi Ruang Dugamasa"
          description="Kelola banner carousel halaman menu"
        />
        <PageBreadcrumb pageTitle="Kelola Banner" />
        <DataTableSkeleton />
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Kelola Banner | Reservasi Ruang Dugamasa"
        description="Kelola banner carousel halaman menu"
      />
      <PageBreadcrumb pageTitle="Kelola Banner" />

      <div className="space-y-5 sm:space-y-6">
        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Data Table */}
        <DataTableOne
          title="Daftar Banner"
          data={banners}
          columns={columns}
          defaultItemsPerPage={10}
          itemsPerPageOptions={[5, 10, 15, 20]}
          defaultSortKey="order"
          defaultSortOrder="asc"
          searchable={true}
          searchPlaceholder="Cari banner..."
          actionButton={
            <Button
              variant="primary"
              size="sm"
              onClick={() => openModal()}
            >
              <Plus className="w-4 h-4" />
              Tambah Banner
            </Button>
          }
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={closeModal} className="max-w-2xl p-5 lg:p-8">
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[85vh]">
          <h4 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4">
            {editingBanner ? "Edit Banner" : "Tambah Banner Baru"}
          </h4>

          {/* Scrollable Content */}
          <div className="space-y-4 overflow-y-auto pr-2 flex-1">
            {/* Banner Image */}
            <div>
              <Label htmlFor="banner-image">
                Gambar Banner <span className="text-red-500">*</span>
              </Label>
              <BannerDropZone
                onDrop={(files) => {
                  if (files.length > 0) {
                    handleImageChange(files[0]);
                  }
                }}
                preview={imagePreview}
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Rekomendasi ukuran: 1200x400 pixels (rasio 3:1)
              </p>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title">
                Judul Banner <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Contoh: Selamat Datang di Ruang Dugamasa"
              />
            </div>

            {/* Subtitle */}
            <div>
              <Label htmlFor="subtitle">
                Subjudul Banner <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Contoh: Nikmati kopi terbaik dengan suasana nyaman"
              />
            </div>

            {/* Order */}
            <div>
              <Label htmlFor="order">
                Urutan Tampilan <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                id="order"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                min="1"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Urutan tampilan banner di carousel (1 = pertama)
              </p>
            </div>

            {/* Is Active */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Banner aktif dan ditampilkan
              </label>
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
              {submitting ? "Menyimpan..." : (editingBanner ? "Simpan Perubahan" : "Tambah Banner")}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Hapus Banner"
        message="Apakah Anda yakin ingin menghapus banner ini? Tindakan ini tidak dapat dibatalkan."
        variant="danger"
        isLoading={deleting}
        confirmText="Hapus"
      />
    </>
  );
}
