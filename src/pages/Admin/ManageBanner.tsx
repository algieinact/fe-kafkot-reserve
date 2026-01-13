import { useState, useMemo } from "react";
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

// Banner interface (temporary - will be replaced with API types later)
interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image_url: string;
  order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface BannerFormData {
  title: string;
  subtitle: string;
  image_url: string;
  order: number;
  is_active: boolean;
}

export default function ManageBanner() {
  // Mock data - will be replaced with API call later
  const [banners, setBanners] = useState<Banner[]>([
    {
      id: 1,
      title: "Selamat Datang di Ruang Dugamasa",
      subtitle: "Nikmati kopi terbaik dengan suasana nyaman",
      image_url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&h=400&fit=crop",
      order: 1,
      is_active: true,
    },
    {
      id: 2,
      title: "Promo Spesial Hari Ini",
      subtitle: "Diskon 20% untuk semua menu kopi",
      image_url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&h=400&fit=crop",
      order: 2,
      is_active: true,
    },
    {
      id: 3,
      title: "Reservasi Mudah & Cepat",
      subtitle: "Pesan meja Anda sekarang juga",
      image_url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&h=400&fit=crop",
      order: 3,
      is_active: true,
    },
  ]);

  const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState<BannerFormData>({
    title: "",
    subtitle: "",
    image_url: "",
    order: 1,
    is_active: true,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Confirmation Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Replace with actual API call
      if (editingBanner) {
        // Update existing banner
        setBanners(banners.map(b => 
          b.id === editingBanner.id 
            ? { ...b, ...formData, updated_at: new Date().toISOString() }
            : b
        ));
      } else {
        // Create new banner
        const newBanner: Banner = {
          id: Math.max(...banners.map(b => b.id), 0) + 1,
          ...formData,
          created_at: new Date().toISOString(),
        };
        setBanners([...banners, newBanner]);
      }
      closeModal();
    } catch (err) {
      console.error("Submit error:", err);
      setError("Gagal menyimpan banner");
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
      // TODO: Replace with actual API call
      setBanners(banners.filter(b => b.id !== bannerToDelete));
      setShowDeleteModal(false);
      setBannerToDelete(null);
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
        image_url: banner.image_url,
        order: banner.order,
        is_active: banner.is_active,
      });
      setImagePreview(banner.image_url);
    } else {
      setEditingBanner(null);
      setFormData({
        title: "",
        subtitle: "",
        image_url: "",
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
      image_url: "",
      order: 1,
      is_active: true,
    });
    setImagePreview(null);
    setError(null);
  };

  const handleImageDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // TODO: Upload to server and get URL
      // For now, just use the preview URL
      setFormData({ ...formData, image_url: previewUrl });
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
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
          val
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
      <Modal isOpen={showModal} onClose={closeModal} className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {editingBanner ? "Edit Banner" : "Tambah Banner Baru"}
            </h3>
          </div>

          <div className="px-6 py-4 space-y-4">
            {/* Banner Image */}
            <div>
              <Label htmlFor="banner-image">
                Gambar Banner <span className="text-red-500">*</span>
              </Label>
              <BannerDropZone 
                onDrop={handleImageDrop}
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

          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 flex justify-end gap-3">
            <Button
              type="button"
              onClick={closeModal}
              variant="outline"
            >
              Batal
            </Button>
            <Button type="submit" variant="primary">
              {editingBanner ? "Simpan Perubahan" : "Tambah Banner"}
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
