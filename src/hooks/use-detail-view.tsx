
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface DetailViewOptions<T> {
  modalThreshold?: number;
  detailRoute?: string;
  formatDetailRoute?: (item: T) => string;
  onCloseCallback?: () => void;
}

export function useDetailView<T extends { id: string | number }>(options: DetailViewOptions<T> = {}) {
  const {
    // For objects smaller than this size (in properties), use modal, otherwise redirect
    modalThreshold = 10,
    // Base route for detail pages
    detailRoute,
    // Custom function to generate the detail route
    formatDetailRoute,
    // Callback function when modal is closed
    onCloseCallback,
  } = options;
  
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Clean up effect when component unmounts
  useEffect(() => {
    return () => {
      setSelectedItem(null);
      setIsModalOpen(false);
    };
  }, []);

  const openDetail = (item: T) => {
    const itemSize = Object.keys(item).length;
    
    // If the item is small enough, show it in a modal
    if (itemSize <= modalThreshold) {
      setSelectedItem(item);
      setIsModalOpen(true);
      return;
    }
    
    // Otherwise, navigate to a dedicated page
    let detailUrl: string;
    
    if (formatDetailRoute) {
      detailUrl = formatDetailRoute(item);
    } else if (detailRoute) {
      detailUrl = `${detailRoute}/${item.id}`;
    } else {
      // Default pattern if no route is specified
      const baseRoute = window.location.pathname;
      detailUrl = `${baseRoute}/${item.id}`;
    }
    
    navigate(detailUrl);
  };

  const closeModal = () => {
    // First set modal to closed
    setIsModalOpen(false);
    
    // Use a small timeout to ensure the modal animation completes before clearing the selected item
    setTimeout(() => {
      setSelectedItem(null);
      
      // Execute the callback if provided
      if (onCloseCallback) {
        onCloseCallback();
      }
    }, 100);
  };

  // Add aliases for backwards compatibility
  const isOpen = isModalOpen;
  const openItem = openDetail;
  const closeItem = closeModal;

  return {
    selectedItem,
    isModalOpen,
    openDetail,
    closeModal,
    // Include aliases for backward compatibility
    isOpen,
    openItem,
    closeItem
  };
}
