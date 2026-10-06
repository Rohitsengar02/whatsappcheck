import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Send,
  DollarSign,
  QrCode,
  Check,
  Receipt,
  Sparkles,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { CatalogProduct, ContactItem } from '../../types/dashboard';

interface CatalogPaymentsViewProps {
  products: CatalogProduct[];
  contacts: ContactItem[];
  onSendProductInvoice: (params: {
    recipientPhone: string;
    product: CatalogProduct;
    customerName: string;
  }) => void;
  onAddProduct: (product: Omit<CatalogProduct, 'id'>) => void;
}

export const CatalogPaymentsView: React.FC<CatalogPaymentsViewProps> = ({
  products,
  contacts,
  onSendProductInvoice,
  onAddProduct,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [recipientPhone, setRecipientPhone] = useState(contacts[0]?.phone || '');
  const [customerName, setCustomerName] = useState(contacts[0]?.name || '');

  // Add Product Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('15.00');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600');
  const [category, setCategory] = useState('Food & Gourmet');

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddProduct({
      name,
      description: desc || 'Premium catalog item',
      price: parseFloat(price) || 10,
      currency: '$',
      category,
      imageUrl,
      inStock: true,
    });

    setName('');
    setDesc('');
    setShowAddModal(false);
  };

  const handleSendInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !recipientPhone.trim()) return;

    onSendProductInvoice({
      recipientPhone,
      product: selectedProduct,
      customerName: customerName || 'Customer',
    });

    setSelectedProduct(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            WhatsApp Catalog & Instant Checkout Invoicing
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Send product cards, digital payment requests, and instant tax invoices directly to your customer WhatsApp chats.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto shadow-xs active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Catalog Item</span>
        </button>
      </div>

      {/* Product Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-emerald-300 hover:shadow-sm transition flex flex-col justify-between group"
          >
            <div>
              <div className="h-40 bg-slate-100 overflow-hidden relative">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute top-2.5 right-2.5 bg-white/95 px-2.5 py-0.5 rounded-full text-xs font-black text-slate-900 shadow-xs">
                  {item.currency}{item.price.toFixed(2)}
                </div>
              </div>

              <div className="p-4 space-y-1.5">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                  {item.category}
                </span>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.name}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>

            <div className="p-4 pt-0">
              <button
                type="button"
                onClick={() => setSelectedProduct(item)}
                className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-200/60 active:scale-95"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Send WhatsApp Invoice</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Invoice Dispatch Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-900">Send WhatsApp Order Invoice</h4>
              </div>
              <span className="text-xs font-black text-emerald-700 font-mono">
                {selectedProduct.currency}{selectedProduct.price.toFixed(2)}
              </span>
            </div>

            <form onSubmit={handleSendInvoice} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Recipient WhatsApp Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aarav Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              {/* Message Payload Preview */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 space-y-1 font-sans">
                <div className="font-bold text-[11px] text-slate-500 uppercase">
                  Formatted WhatsApp Message:
                </div>
                <div className="text-[11px] leading-relaxed text-slate-700">
                  🧾 *Order Invoice & Payment Link*<br />
                  Item: *{selectedProduct.name}*<br />
                  Amount: *{selectedProduct.currency}{selectedProduct.price.toFixed(2)}*<br />
                  Payment Status: ⏳ *Awaiting Settlement*<br />
                  👉 Complete your payment here: https://pay.sengarhub.com/inv-8492
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 cursor-pointer flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send to WhatsApp</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl">
            <h4 className="text-base font-bold text-slate-900 mb-1">Add Catalog Product</h4>
            <p className="text-xs text-slate-500 mb-4">Enter product pricing and description for WhatsApp catalog.</p>

            <form onSubmit={handleCreateProduct} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Truffle Smash Burger"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Key features, ingredients, or bundle details..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 cursor-pointer"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
