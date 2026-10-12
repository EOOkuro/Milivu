import React, { createContext, useContext, useEffect, useState } from "react";
import { Link, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { BRAND } from "./config.js";
import { PRODUCTS, SIZES } from "./data/products.js";

const Cart = createContext();
const useCart = () => useContext(Cart);
const money = (n) => `$${n}`;

function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cart") || "[]"); } catch { return []; }
  });
  useEffect(() => { try { localStorage.setItem("cart", JSON.stringify(items)); } catch {} }, [items]);
  const key = (i) => `${i.id}|${i.size}|${i.custom?.name}|${i.custom?.number}`;
  const add = (item) => setItems((c) => {
    const hit = c.find((x) => key(x) === key(item));
    return hit ? c.map((x) => (key(x) === key(item) ? { ...x, qty: x.qty + item.qty } : x)) : [...c, item];
  });
  const setQty = (item, qty) => setItems((c) => c.map((x) => (key(x) === key(item) ? { ...x, qty } : x)).filter((x) => x.qty > 0));
  const clear = () => setItems([]);
  const total = items.reduce((n, i) => n + PRODUCTS.find((p) => p.id === i.id).price * i.qty, 0);
  const count = items.reduce((n, i) => n + i.qty, 0);
  return <Cart.Provider value={{ items, add, setQty, clear, total, count }}>{children}</Cart.Provider>;
}

function Jersey({ p, number }) {
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={`${p.name} jersey`}>
      <path d="M70 20 L40 35 L8 82 L36 98 L50 82 L50 182 H150 V82 L164 98 L192 82 L160 35 L130 20 Q100 48 70 20Z" fill={p.body} />
      <path d="M70 20 Q100 48 130 20" fill="none" stroke={p.trim} strokeWidth="7" />
      <rect x="50" y="120" width="100" height="10" fill={p.accent} opacity=".9" />
      <path d="M8 82 L36 98 M192 82 L164 98" stroke={p.trim} strokeWidth="7" />
      <text x="100" y="105" textAnchor="middle" fontSize="38" fontWeight="800" fill={p.trim} fontFamily="Archivo">{number ?? ""}</text>
    </svg>
  );
}

function Header() {
  const { count } = useCart();
  return (
    <header className="bar">
      <Link to="/" className="logo">{BRAND.name}</Link>
      <Link to="/cart" className="cartlink">Cart <span className="badge">{count}</span></Link>
    </header>
  );
}

function Shop() {
  return (
    <>
      <section className="hero">
        <h1>{BRAND.tagline}</h1>
        <p>Full kits from $35. Custom kits from $55.</p>
      </section>
      <div className="grid">
        {PRODUCTS.map((p) => (
          <Link key={p.id} to={`/product/${p.id}`} className="card">
            <div className="art"><Jersey p={p} /></div>
            <h2>{p.name}</h2>
            <span className="price">{money(p.price)}</span>
          </Link>
        ))}
      </div>
    </>
  );
}

function Product() {
  const { id } = useParams();
  const p = PRODUCTS.find((x) => x.id === id);
  const { add } = useCart();
  const nav = useNavigate();
  const [size, setSize] = useState("YM");
  const [qty, setQty] = useState(1);
  const [name, setName] = useState("");
  const [num, setNum] = useState("");
  if (!p) return <p className="page">Product not found. <Link to="/">Back to shop</Link></p>;

  const submit = (e) => {
    e.preventDefault();
    add({ id: p.id, size, qty, custom: p.custom ? { name: name.toUpperCase(), number: num } : undefined });
    nav("/cart");
  };
  return (
    <div className="page product">
      <div className="art big"><Jersey p={p} number={p.custom ? num : undefined} /></div>
      <form onSubmit={submit}>
        <h1>{p.name}</h1>
        <p className="price lg">{money(p.price)}</p>
        <p>{p.blurb}</p>
        <label>Size
          <select value={size} onChange={(e) => setSize(e.target.value)}>{SIZES.map((s) => <option key={s}>{s}</option>)}</select>
        </label>
        {p.custom && (
          <>
            <label>Name on back<input required maxLength="14" value={name} onChange={(e) => setName(e.target.value)} /></label>
            <label>Number<input required inputMode="numeric" maxLength="2" value={num} onChange={(e) => setNum(e.target.value.replace(/\D/g, ""))} /></label>
          </>
        )}
        <label>Quantity
          <input type="number" min="1" max="50" value={qty} onChange={(e) => setQty(Math.max(1, +e.target.value || 1))} />
        </label>
        <button className="btn">Add to cart</button>
      </form>
    </div>
  );
}

function CartPage() {
  const { items, setQty, total } = useCart();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const checkout = async () => {
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items }) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Checkout failed");
      window.location.href = data.url;
    } catch (e) {
      setErr(e.message + " (checkout runs on Vercel, or use `vercel dev` locally)");
      setBusy(false);
    }
  };

  if (!items.length) return <div className="page"><h1>Your cart is empty</h1><Link to="/" className="btn">Shop kits</Link></div>;
  return (
    <div className="page">
      <h1>Cart</h1>
      {items.map((i) => {
        const p = PRODUCTS.find((x) => x.id === i.id);
        return (
          <div className="line" key={`${i.id}${i.size}${i.custom?.name}${i.custom?.number}`}>
            <div className="art sm"><Jersey p={p} number={i.custom?.number} /></div>
            <div className="grow">
              <strong>{p.name}</strong>
              <div className="muted">Size {i.size}{i.custom ? ` · ${i.custom.name} #${i.custom.number}` : ""}</div>
            </div>
            <div className="qty">
              <button onClick={() => setQty(i, i.qty - 1)} aria-label="Fewer">−</button>
              <span>{i.qty}</span>
              <button onClick={() => setQty(i, i.qty + 1)} aria-label="More">+</button>
            </div>
            <div className="price">{money(p.price * i.qty)}</div>
          </div>
        );
      })}
      <div className="total"><span>Total</span><strong>{money(total)}</strong></div>
      <p className="muted">Shipping address is collected at checkout.</p>
      {err && <p className="err">{err}</p>}
      <button className="btn" disabled={busy} onClick={checkout}>{busy ? "Redirecting…" : "Checkout"}</button>
    </div>
  );
}

function Success() {
  const { clear } = useCart();
  useEffect(() => { clear(); }, []);
  return <div className="page"><h1>Order received</h1><p>Thanks. A receipt is on its way to your email.</p><Link to="/" className="btn">Keep shopping</Link></div>;
}

export default function App() {
  return (
    <CartProvider>
      <Header />
      <Routes>
        <Route path="/" element={<Shop />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/success" element={<Success />} />
        <Route path="*" element={<p className="page">Not found. <Link to="/">Shop</Link></p>} />
      </Routes>
      <footer className="foot">© {new Date().getFullYear()} {BRAND.name}</footer>
    </CartProvider>
  );
}
