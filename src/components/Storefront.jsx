import { ArrowLeft, ArrowRight, Camera, CheckCircle2, Laptop, LogIn, MessageCircle, Phone, Search, ShieldCheck, ShoppingBag, Sparkles, Zap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { money } from '../data/laptops';
import logo from '../assets/logo.jpeg';
import heroImage from '../assets/img.jpeg';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/catalog/laptops`;

export default function Storefront({ openLogin }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('الكل');

  useEffect(() => {
    fetch(API_URL).then(response => response.ok ? response.json() : Promise.reject())
      .then(setProducts).catch(() => setProducts([])).finally(() => setLoading(false));
  }, []);

  const brands = useMemo(() => ['الكل', ...new Set(products.map(product => product.brand).filter(Boolean))], [products]);
  const filteredProducts = useMemo(() => products.filter(product => {
    const content = `${product.brand} ${product.model} ${product.processor} ${product.ram} ${product.storage}`.toLowerCase();
    return (!search || content.includes(search.toLowerCase())) && (selectedBrand === 'الكل' || product.brand === selectedBrand);
  }), [products, search, selectedBrand]);

  return <main className="storefront">
    <nav className="store-nav">
      <a className="store-logo" href="#top"><img src={logo} alt="FALCON LAPTOP"/><span>FALCON<span>LAPTOP</span></span></a>
      <div className="store-links"><a href="#products">المنتجات</a><a href="#why-us">ليه FALCON؟</a><a href="#contact">تواصل معنا</a></div>
      <button className="store-login" onClick={openLogin}><LogIn size={17}/> تسجيل الدخول</button>
    </nav>

    <section className="store-hero" id="top"><div className="hero-grid-lines"/><div className="store-hero-copy"><span className="store-kicker"><Sparkles size={15}/> أجهزة مختارة بعناية</span><h1>اختار جهازك.<br/><em>وابدأ أقوى.</em></h1><p>لابتوبات أصلية بحالة ممتازة، مواصفات واضحة، وسعر يخلّي قرارك أسهل.</p><div className="hero-actions"><button className="store-primary" onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}>تصفح المنتجات <ArrowLeft size={18}/></button><span><CheckCircle2 size={16}/> ضمان وجودة نثق فيها</span></div></div><div className="hero-device"><img className="hero-brand-image" src={heroImage} alt="FALCON LAPTOP"/></div></section>

    <section className="store-products" id="products"><div className="section-heading"><div><span className="store-kicker">COLLECTED FOR YOU</span><h2>منتجات تستاهل تشوفها</h2><p>كل جهاز اتراجع واتختار عشان يقدملك أفضل قيمة.</p></div><div className="product-count">{filteredProducts.length} <span>جهاز متاح</span></div></div><div className="catalog-tools"><div className="catalog-search"><Search size={18}/><input value={search} onChange={event => setSearch(event.target.value)} placeholder="دور على موديل، ماركة، أو مواصفة..."/></div><div className="brand-filters">{brands.map(brand => <button className={selectedBrand === brand ? 'active' : ''} key={brand} onClick={() => setSelectedBrand(brand)}>{brand}</button>)}</div></div>{loading ? <div className="catalog-empty">جاري تحميل المنتجات...</div> : <div className="product-grid">{filteredProducts.map((product, index) => <article className="store-product" key={product.id || product._id || index} onClick={openLogin}><div className="product-image"><span className="product-badge">{index < 2 ? 'مميز' : 'متاح الآن'}</span>{product.image ? <img src={product.image} alt={product.model}/> : <Laptop size={76}/>}<div className="image-brand">{product.brand}</div></div><div className="store-product-body"><span className="product-brand">{product.brand}</span><h3>{product.model}</h3><p>{product.processor || 'أداء عملي يومي'}</p><div className="product-specs"><span>{product.ram || '8 GB RAM'}</span><span>{product.storage || '256 GB SSD'}</span></div><div className="product-footer"><strong>{money(product.price)}</strong>{Number(product.oldPrice) > Number(product.price) && <del>{money(product.oldPrice)}</del>}<button aria-label="اطلب الآن"><ArrowLeft size={17}/></button></div></div></article>)}</div>}</section>

    <section className="store-benefits" id="why-us"><div><span className="benefit-icon"><ShieldCheck/></span><h3>اختيار مضمون</h3><p>بنراجع كل جهاز قبل ما يوصل لك.</p></div><div><span className="benefit-icon"><Zap/></span><h3>مواصفات واضحة</h3><p>تعرف كل تفاصيل جهازك من أول لحظة.</p></div><div><span className="benefit-icon"><ShoppingBag/></span><h3>طلب أسهل</h3><p>سجّل دخولك وابدأ طلبك في ثواني.</p></div></section><footer id="contact"><a className="store-logo" href="#top"><img src={logo} alt="FALCON LAPTOP"/><span>FALCON<span>LAPTOP</span></span></a><div className="social-links"><a href="tel:+201116067708" aria-label="اتصال"><Phone size={18}/></a><a href="https://wa.me/201116067708" target="_blank" rel="noreferrer" aria-label="واتساب"><MessageCircle size={18}/></a><a href="https://www.instagram.com/falconlaptopp?stkn=MTFsZmJ3azhvaWNybQ==" target="_blank" rel="noreferrer" aria-label="Instagram"><Camera size={18}/></a><a className="facebook-icon" href="https://www.facebook.com/share/19QPWTUbHB/" target="_blank" rel="noreferrer" aria-label="Facebook">f</a></div><button onClick={openLogin}>ابدأ الآن <ArrowRight size={16}/></button></footer>
  </main>;
}