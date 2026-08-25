export interface ShopProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
}

export const MOCK_SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: 'prod_album_1',
    name: 'Premium Leather Layflat Album',
    category: 'Printed Albums',
    price: 15000,
    description: '30-page flush mount album with a luxury leather cover and thick archival pages.',
    image: 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?q=80&w=2000&auto=format&fit=crop'
  },
  {
    id: 'prod_album_2',
    name: 'Classic Linen Photobook',
    category: 'Printed Albums',
    price: 8000,
    description: 'Minimalist 50-page linen cover photobook perfect for lifestyle shoots.',
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=2000&auto=format&fit=crop'
  },
  {
    id: 'prod_frame_1',
    name: 'A2 Solid Oak Wall Frame',
    category: 'Wall Frames',
    price: 4500,
    description: 'Handcrafted solid oak wood frame with museum-quality glass.',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2000&auto=format&fit=crop'
  },
  {
    id: 'prod_frame_2',
    name: 'A3 Matte Black Frame',
    category: 'Wall Frames',
    price: 2500,
    description: 'Sleek, modern black frame perfect for monochromatic prints.',
    image: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=2000&auto=format&fit=crop'
  },
  {
    id: 'prod_acc_1',
    name: 'Custom Wooden USB Drive',
    category: 'Accessories',
    price: 1200,
    description: 'Engraved 64GB wooden USB drive containing your high-res gallery.',
    image: 'https://images.unsplash.com/photo-1618424263721-e00f91dbf83c?q=80&w=2000&auto=format&fit=crop'
  }
];
