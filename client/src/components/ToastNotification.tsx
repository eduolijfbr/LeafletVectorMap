import { AlertCircle, Check, X } from 'lucide-react';

interface ToastNotificationProps {
  type?: 'success' | 'error' | 'warning';
  title: string;
  message: string;
  onClose: () => void;
}

export default function ToastNotification({ 
  type = 'success', 
  title, 
  message, 
  onClose 
}: ToastNotificationProps) {
  const getBgColor = () => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-amber-500';
      default: return 'bg-green-500';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return <Check className="mr-2" size={18} />;
      case 'error': return <AlertCircle className="mr-2" size={18} />;
      case 'warning': return <AlertCircle className="mr-2" size={18} />;
      default: return <Check className="mr-2" size={18} />;
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-md w-full">
      <div className={`px-4 py-3 ${getBgColor()} text-white flex justify-between items-center`}>
        <div className="flex items-center">
          {getIcon()}
          <span className="font-medium">{title}</span>
        </div>
        <button className="text-white hover:text-gray-200" onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <div className="px-4 py-3">
        <p className="text-gray-700">{message}</p>
      </div>
    </div>
  );
}
