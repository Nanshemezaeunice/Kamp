import React from 'react';
import { X, AlertTriangle, CheckCircle, Info, Trash2, Ban, PauseCircle } from 'lucide-react';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel", 
  type = "info", // info, success, warning, danger, success-action
  isLoading = false,
  showReasonInput = false,
  reasonValue = "",
  onReasonChange = () => {}
}) => {
  if (!isOpen) return null;

  const icons = {
    info: <Info className="w-6 h-6 text-blue-600" />,
    success: <CheckCircle className="w-6 h-6 text-green-600" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-600" />,
    danger: <Trash2 className="w-6 h-6 text-red-600" />,
    ban: <Ban className="w-6 h-6 text-red-600" />,
    suspend: <PauseCircle className="w-6 h-6 text-orange-600" />,
    'success-action': <CheckCircle className="w-6 h-6 text-green-600" />
  };

  const colors = {
    info: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    success: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
    warning: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500",
    danger: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    ban: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    suspend: "bg-orange-600 hover:bg-orange-700 focus:ring-orange-500",
    'success-action': "bg-green-600 hover:bg-green-700 focus:ring-green-500"
  };

  const bgColors = {
    info: "bg-blue-100",
    success: "bg-green-100",
    warning: "bg-amber-100",
    danger: "bg-red-100",
    ban: "bg-red-100",
    suspend: "bg-orange-100",
    'success-action': "bg-green-100"
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={!isLoading ? onClose : undefined}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${bgColors[type] || bgColors.info}`}>
              {icons[type] || icons.info}
            </div>
            <button 
              onClick={onClose}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {message}
            </p>
          </div>

          {showReasonInput && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (Optional)
              </label>
              <textarea
                value={reasonValue}
                onChange={(e) => onReasonChange(e.target.value)}
                placeholder="Provide a brief explanation..."
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none h-24"
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row-reverse gap-3">
            <button
              onClick={onConfirm}
              disabled={isLoading || (showReasonInput && !reasonValue.trim() && type !== 'success-action')}
              className={`w-full sm:w-auto px-6 py-2.5 text-white font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${colors[type] || colors.info}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </div>
              ) : confirmText}
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-2.5 text-gray-700 font-semibold bg-gray-100 hover:bg-gray-200 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
