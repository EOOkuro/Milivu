// Single source of truth. The Stripe function reads prices from here,
// so nobody can change a price from the browser. Price is whole dollars.
export const SIZES = ["YS", "YM", "YL", "S", "M", "L", "XL"];

export const PRODUCTS = [
  { id: "gold-navy", name: "Gold & Navy Kit", price: 35, body: "#E8B923", trim: "#14213D", accent: "#14213D", blurb: "Jersey, shorts and socks. Our standard league design." },
  { id: "purple-cream", name: "Purple Kit", price: 35, body: "#8C52FF", trim: "#F1EEE6", accent: "#F1EEE6", blurb: "Jersey, shorts and socks. Standard design." },
  { id: "black-white", name: "Black & White Kit", price: 35, body: "#16130F", trim: "#FFFFFF", accent: "#FFFFFF", blurb: "Jersey, shorts and socks. Standard design." },
  { id: "red-black", name: "Red Kit", price: 35, body: "#D7263D", trim: "#16130F", accent: "#16130F", blurb: "Jersey, shorts and socks. Standard design." },
  { id: "custom", name: "Custom Kit", price: 55, body: "#2A9D8F", trim: "#FFFFFF", accent: "#FFFFFF", custom: true, blurb: "Your design, your name and number. Ordered with player registration." },
];
