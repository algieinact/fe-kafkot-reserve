import { Modal } from '../ui/modal';
import Button from '../ui/button/Button';
import { AlertIcon, CheckCircleIcon, InfoIcon } from '../../icons';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info' | 'success';
    isLoading?: boolean;
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Konfirmasi",
    cancelText = "Batal",
    variant = "warning",
    isLoading = false,
}: ConfirmationModalProps) {
    const getIcon = () => {
        switch (variant) {
            case 'danger':
            case 'warning':
                return <AlertIcon className="w-12 h-12 text-red-500 mb-4 mx-auto" />;
            case 'success':
                return <CheckCircleIcon className="w-12 h-12 text-green-500 mb-4 mx-auto" />;
            default:
                return <InfoIcon className="w-12 h-12 text-blue-500 mb-4 mx-auto" />;
        }
    };

    const getConfirmButtonInfo = (): { className: string, variant: "primary" | "outline" } => {
        switch (variant) {
            case 'danger':
                return { className: "bg-red-600 hover:bg-red-700 focus:bg-red-700", variant: "primary" };
            case 'warning':
                return { className: "bg-yellow-600 hover:bg-yellow-700 focus:bg-yellow-700", variant: "primary" };
            case 'success':
                return { className: "bg-green-600 hover:bg-green-700 focus:bg-green-700", variant: "primary" };
            default:
                return { className: "bg-brand-500 hover:bg-brand-600 focus:bg-brand-600", variant: "primary" };
        }
    };

    const confirmBtnInfo = getConfirmButtonInfo();

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[400px] p-6 text-center">
            <div className="flex flex-col items-center">
                {getIcon()}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 text-center">
                    {message}
                </p>
                <div className="flex gap-3 w-full">
                    <Button
                        onClick={onClose}
                        disabled={isLoading}
                        variant="outline"
                        className="flex-1 w-full justify-center"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isLoading}
                        variant={confirmBtnInfo.variant}
                        className={`flex-1 w-full justify-center ${confirmBtnInfo.className}`}
                    >
                        {isLoading ? "Memproses..." : confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
