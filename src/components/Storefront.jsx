import { ArrowLeft, ArrowRight, BatteryFull, Camera, Cpu, Languages, Laptop, LogIn, Menu, MessageCircle, Moon, Phone, Search, ShieldCheck, ShoppingBag, Sparkles, Star, Sun, X, Zap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { money } from '../data/laptops';
import heroImage from '../assets/hero.png';
import { useUi } from '../UiContext';
import { useTrimmedImage } from '../utils/trimImageBorders';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/catalog/laptops`;
const API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ALL_BRANDS = '__all__';

function getNavLinks(isArabic) {
  return [
    { href: '#top', label: isArabic ? 'الرئيسية' : 'Home', active: true },
    { href: '#products', label: isArabic ? 'المنتجات' : 'Products' },
    { href: '#why-us', label: isArabic ? 'ليه؟ FALCON' : 'Why FALCON?' },
    { href: '#contact', label: isArabic ? 'تواصل معنا' : 'Contact us' },
  ];
}

function getBenefits(isArabic) {
  return [
    {
      icon: <ShieldCheck size={22} />,
      title: isArabic ? 'اختيار مضمون' : 'Guaranteed selection',
      desc: isArabic
        ? 'بنراجع كل جهاز قبل ما يوصل لك، من الشاشة للبطارية.'
        : 'We check every device before it reaches you, from the screen to the battery.',
    },
    {
      icon: <Zap size={22} />,
      title: isArabic ? 'مواصفات واضحة' : 'Clear specifications',
      desc: isArabic
        ? 'تعرف كل تفاصيل جهازك من أول لحظة، من غير مفاجآت.'
        : 'Know every detail about your device from the start, no surprises.',
    },
    {
      icon: <ShoppingBag size={22} />,
      title: isArabic ? 'طلب أسهل' : 'Easier ordering',
      desc: isArabic
        ? 'سجّل دخولك وابدأ طلبك في ثواني، ومتابعة كاملة لحد ما يوصلك.'
        : 'Sign in and start your order in seconds, with full tracking until it reaches you.',
    },
  ];
}

function getHeroChips(isArabic) {
  return [
    { icon: <Cpu size={17} />, label: isArabic ? 'معالجات قوية' : 'Powerful processors', top: '20%', end: '3%' },
    { icon: <ShieldCheck size={17} />, label: isArabic ? 'ضمان أصلي على كل جهاز' : 'Genuine warranty on every device', top: '42%', end: '9%' },
    { icon: <BatteryFull size={17} />, label: isArabic ? 'بطارية تدوم طويلًا' : 'Long-lasting battery', top: '64%', end: '3%' },
    { icon: <Star size={17} fill="currentColor" />, label: isArabic ? 'تقييم +4.8 من عملائنا' : '4.8+ rating from our customers', top: '86%', end: '9%' },
  ];
}

function HeroChip({ icon, label }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100/90 px-3 py-2 shadow-lg backdrop-blur">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</span>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-base-content/80">{label}</span>
        <span className="h-1.5 w-12 rounded-full bg-base-content/10" />
      </div>
    </div>
  );
}

function describeSpecs(product, isArabic) {
  if (!isArabic) {
    const parts = [];
    if (product.processor) {
      let text = `${product.processor} processor`;
      if (product.generation) text += `, ${product.generation} generation`;
      if (product.processorType) text += ` (${product.processorType})`;
      parts.push(text);
    }
    if (product.ram) parts.push(`${product.ram} RAM`);
    if (product.storage) parts.push(`${product.storage} storage`);
    if (product.graphics) parts.push(`${product.graphics} graphics`);
    if (!parts.length) return `${product.brand} ${product.model} carefully selected by FALCON.`;
    return `${product.brand} ${product.model} equipped with ${parts.join(', ')}, ready for daily use and work.`;
  }
  const parts = [];
  if (product.processor) {
    let text = `معالج ${product.processor}`;
    if (product.generation) text += ` من الجيل ${product.generation}`;
    if (product.processorType) text += ` فئة ${product.processorType}`;
    parts.push(text);
  }
  if (product.ram) parts.push(`رام ${product.ram}`);
  if (product.storage) parts.push(`مساحة تخزين ${product.storage}`);
  if (product.graphics) parts.push(`كارت شاشة ${product.graphics}`);
  if (!parts.length) return `جهاز ${product.brand} ${product.model} مختار بعناية من FALCON.`;
  return `جهاز ${product.brand} ${product.model} مجهز بـ${parts.join('، ')}، جاهز للاستخدام اليومي والعمل.`;
}

function ProductImage({ src, alt, className, onError }) {
  const trimmedSrc = useTrimmedImage(src);
  return <img src={trimmedSrc || src} alt={alt} className={className} onError={onError} />;
}

export default function Storefront({ openLogin = () => {}, authenticated = false, onLogout, user }) {
  const { language, setLanguage, isArabic, theme, setTheme } = useUi();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState(ALL_BRANDS);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [brokenImages, setBrokenImages] = useState(() => new Set());
  const [productPage, setProductPage] = useState(1);
  const productsPerPage = 6;

  useEffect(() => {
    fetch(API_URL).then(response => response.ok ? response.json() : Promise.reject())
      .then(setProducts).catch(() => setProducts([])).finally(() => setLoading(false));
  }, []);

  const navLinks = useMemo(() => getNavLinks(isArabic), [isArabic]);
  const footerLinks = useMemo(() => navLinks.filter(link => !link.active), [navLinks]);
  const navLinksDisplay = useMemo(() => (isArabic ? [...navLinks].reverse() : navLinks), [navLinks, isArabic]);
  const benefits = useMemo(() => getBenefits(isArabic), [isArabic]);
  const heroChips = useMemo(() => getHeroChips(isArabic), [isArabic]);
  const allBrandsLabel = isArabic ? 'الكل' : 'All';

  const brands = useMemo(() => [ALL_BRANDS, ...new Set(products.map(product => product.brand).filter(Boolean))], [products]);
  const filteredProducts = useMemo(() => products.filter(product => {
    const content = `${product.brand} ${product.model} ${product.processor} ${product.ram} ${product.storage}`.toLowerCase();
    return (!search || content.includes(search.toLowerCase())) && (selectedBrand === ALL_BRANDS || product.brand === selectedBrand);
  }), [products, search, selectedBrand]);
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage));
  const visibleProducts = useMemo(
    () => filteredProducts.slice((productPage - 1) * productsPerPage, productPage * productsPerPage),
    [filteredProducts, productPage],
  );
  useEffect(() => setProductPage(1), [search, selectedBrand]);
  useEffect(() => {
    if (productPage > pageCount) setProductPage(pageCount);
  }, [pageCount, productPage]);

  const productImageSrc = product => (
    product.imageUrl ? `${API_ROOT}${product.imageUrl.replace(/^\/api/, '')}` : product.image
  );
  const markImageBroken = id => setBrokenImages(previous => new Set(previous).add(id));

  const detailFields = [
    [isArabic ? 'المعالج' : 'Processor', selectedProduct?.processor],
    [isArabic ? 'الرام' : 'RAM', selectedProduct?.ram],
    [isArabic ? 'التخزين' : 'Storage', selectedProduct?.storage],
    [isArabic ? 'الجيل' : 'Generation', selectedProduct?.generation],
    [isArabic ? 'الفئة' : 'Type', selectedProduct?.processorType],
    [isArabic ? 'كارت الشاشة' : 'Graphics card', selectedProduct?.graphics],
    [isArabic ? 'الكمية المتاحة' : 'Available quantity', selectedProduct?.quantity],
  ];

  return (
    <main id="top" dir={isArabic ? 'rtl' : 'ltr'} className="min-h-screen bg-base-100 text-base-content">
      {/* Nav */}
      <nav dir="ltr" className="sticky top-0 z-50 border-b border-base-300 bg-base-100/80 backdrop-blur-md">
        <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 sm:px-8">
          <a href="#top" className="flex flex-col justify-self-start leading-tight">
            <span className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
              FALCON
              <span className="h-4 w-px bg-base-content/20" />
              <span className="text-primary">LAPTOP</span>
            </span>
            <span className="text-xs font-medium text-base-content/50">{isArabic ? 'أفضل الأجهزة، أفضل الأسعار' : 'Best devices, best prices'}</span>
          </a>
          <div className="hidden items-center justify-center gap-7 text-sm font-medium text-base-content/70 md:flex">
            {navLinksDisplay.map(link => (
              <a
                key={link.href}
                href={link.href}
                className={`pb-1 transition hover:text-primary ${link.active ? 'border-b-2 border-primary text-base-content' : ''}`}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex items-center justify-self-end gap-1">
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="btn btn-ghost btn-circle btn-sm"
              title={isArabic ? 'English' : 'العربية'}
              aria-label={isArabic ? 'تغيير اللغة' : 'Change language'}
            >
              <Languages size={18} />
            </button>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="btn btn-ghost btn-circle btn-sm" title={theme === 'dark' ? (isArabic ? 'الوضع الفاتح' : 'Light mode') : (isArabic ? 'الوضع الداكن' : 'Dark mode')} aria-label={isArabic ? 'تغيير المظهر' : 'Change appearance'}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })} className="btn btn-ghost btn-circle btn-sm" aria-label={isArabic ? 'بحث عن جهاز' : 'Search for a device'}>
              <Search size={18} />
            </button>
            <button onClick={authenticated ? onLogout : openLogin} className="btn btn-primary btn-sm ms-1 rounded-full px-5 font-bold sm:btn-md sm:px-6">
              {authenticated ? (user?.name || (isArabic ? 'حسابي' : 'My account')) : (isArabic ? 'سجل الآن' : 'Sign up now')}
            </button>
            <div className="dropdown dropdown-end md:hidden">
              <button tabIndex={0} className="btn btn-ghost btn-circle btn-sm" aria-label={isArabic ? 'القائمة' : 'Menu'}><Menu size={18} /></button>
              <ul tabIndex={0} className="dropdown-content menu menu-sm z-20 mt-3 w-44 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg">
                {navLinks.map(link => (
                  <li key={link.href}><a href={link.href}>{link.label}</a></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-base-100">
        <img
          src={heroImage}
          alt="FALCON LAPTOP"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-base-100 via-base-100/75 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-t from-base-100 via-transparent to-base-100/10" />

        <div dir="ltr" className="relative mx-auto min-h-144 max-w-7xl px-4 pb-28 pt-12 sm:min-h-168 sm:px-8 sm:pt-20 lg:min-h-184">
          <div className="max-w-xl">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-200/80 px-5 py-2 text-sm text-base-content/70 backdrop-blur">
              <Sparkles size={15} className="text-primary" /> {isArabic ? 'وجهتك الأولى لأجهزة اللابتوب' : 'Your first stop for laptops'}
            </span>
            <h1 className="text-4xl font-extrabold leading-normal sm:text-5xl lg:text-6xl">
              {isArabic ? <>اختار جهازك.<br /><em className="not-italic text-primary">وابدأ أقوى.</em></> : <>Choose your device.<br /><em className="not-italic text-primary">Start stronger.</em></>}
            </h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-base-content/70 sm:text-lg">
              {isArabic
                ? 'أجهزة لابتوب مختارة بعناية، مواصفات واضحة، وأسعار تساعدك تبدأ خطوتك القادمة بثقة.'
                : 'Laptops carefully selected, with clear specifications and prices that help you take your next step with confidence.'}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-3 rounded-full bg-primary py-1 pe-6 ps-1 text-base font-bold text-primary-content shadow-lg shadow-primary/20 transition hover:brightness-110"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white"><ArrowLeft size={18} /></span>
                {isArabic ? 'ابدأ رحلتك الآن' : 'Start your journey now'}
              </button>
              <button
                type="button"
                onClick={authenticated ? onLogout : openLogin}
                className="flex items-center gap-3 rounded-full border border-base-content/15 bg-base-100/40 py-1 pe-6 ps-1 text-base font-bold text-base-content backdrop-blur transition hover:bg-base-200"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-base-content/10"><LogIn size={16} /></span>
                {authenticated ? (isArabic ? 'تسجيل الخروج' : 'Log out') : (isArabic ? 'سجل الآن' : 'Sign up now')}
              </button>
            </div>

            <div className="mt-12 flex items-center gap-6 sm:gap-10">
              <div>
                <strong className="block text-3xl font-extrabold text-primary">+10K</strong>
                <span className="mt-1 block text-xs text-base-content/60">{isArabic ? 'جهاز تم اختياره' : 'Devices chosen'}</span>
              </div>
              <span className="h-10 w-px bg-base-content/15" />
              <div>
                <strong className="block text-3xl font-extrabold text-primary">+150</strong>
                <span className="mt-1 block text-xs text-base-content/60">{isArabic ? 'موديل متاح' : 'Models available'}</span>
              </div>
              <span className="h-10 w-px bg-base-content/15" />
              <div>
                <strong className="block text-3xl font-extrabold text-primary">100%</strong>
                <span className="mt-1 block text-xs text-base-content/60">{isArabic ? 'ثقة وجودة' : 'Trust and quality'}</span>
              </div>
            </div>
          </div>

          <div className="absolute inset-e-4 top-6 hidden max-w-44 text-end sm:inset-e-8 lg:block">
            <p className="text-sm font-semibold text-base-content/80">
              {isArabic ? <>أكثر من مجرد لابتوب..<br />إنه استثمار في مستقبلك</> : <>More than just a laptop..<br />it's an investment in your future</>}
            </p>
            <span className="ms-auto mt-2 block h-0.5 w-10 bg-primary" />
          </div>

          {heroChips.map(chip => (
            <div key={chip.label} className="absolute hidden lg:block" style={{ top: chip.top, insetInlineEnd: chip.end }}>
              <HeroChip icon={chip.icon} label={chip.label} />
            </div>
          ))}
        </div>

        <div dir="ltr" className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-base-content/60 sm:px-8">
          <span className="flex items-center gap-3">
            <span className="h-px w-8 bg-primary" /> {isArabic ? 'بالجودة... نصنع الفرق' : 'With quality... we make the difference'}
          </span>
          <span className="hidden items-center gap-2 sm:flex">
            <ShieldCheck size={14} className="text-primary" /> {isArabic ? 'ضمان استرجاع' : 'Return guarantee'}
          </span>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold tracking-widest text-primary">COLLECTED FOR YOU</span>
            <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">{isArabic ? 'منتجات تستاهل تشوفها' : 'Products worth seeing'}</h2>
            <p className="mt-1 text-base-content/70">{isArabic ? 'كل جهاز اتراجع عشان يقدملك أفضل قيمة.' : 'Every device is reviewed to give you the best value.'}</p>
          </div>
          <div className="text-end">
            <strong className="text-2xl font-extrabold text-primary">{filteredProducts.length}</strong>{' '}
            <span className="text-sm text-base-content/70">{isArabic ? 'جهاز متاح' : 'devices available'}</span>
          </div>
        </div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="input flex w-full items-center gap-2 sm:max-w-xs">
            <Search size={18} className="text-base-content/50" />
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder={isArabic ? 'دور على موديل، ماركة، أو مواصفة...' : 'Search for a model, brand, or spec...'}
              className="grow bg-transparent"
            />
          </label>
          <div role="tablist" className="tabs tabs-boxed w-fit bg-base-200">
            {brands.map(brand => (
              <button
                key={brand}
                role="tab"
                type="button"
                onClick={() => setSelectedBrand(brand)}
                className={`tab ${selectedBrand === brand ? 'tab-active' : ''}`}
              >
                {brand === ALL_BRANDS ? allBrandsLabel : brand}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-box border border-base-300 bg-base-200 py-24 text-base-content/60">
            {isArabic ? 'جاري تحميل المنتجات...' : 'Loading products...'}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex items-center justify-center rounded-box border border-base-300 bg-base-200 py-24 text-base-content/60">
            {isArabic ? 'مفيش نتائج مطابقة لبحثك.' : 'No results match your search.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((product, index) => (
              <article
                key={product.id || product._id || index}
                className="card group border border-base-300 bg-base-200 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <figure className="relative aspect-3/2 overflow-hidden bg-base-300">
                  <span className="badge badge-primary absolute top-3 inset-s-3 z-10">{isArabic ? 'متاح' : 'Available'}: {product.quantity}</span>
                  {(product.imageUrl || product.image) && !brokenImages.has(product.id || product._id) ? (
                    <ProductImage
                      src={productImageSrc(product)}
                      alt={product.model}
                      className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
                      onError={() => markImageBroken(product.id || product._id)}
                    />
                  ) : (
                    <Laptop size={76} className="text-base-content/30" />
                  )}
                  <span className="badge badge-neutral absolute bottom-3 inset-e-3 z-10">{product.brand}</span>
                </figure>
                <div className="card-body gap-2">
                  <span className="text-xs font-semibold text-primary">{product.brand}</span>
                  <h3 className="card-title text-lg">{product.model}</h3>
                  <p className="text-sm text-base-content/70">{product.processor ? `${isArabic ? 'المعالج' : 'Processor'}: ${product.processor}` : (isArabic ? 'أداء عملي يومي' : 'Practical daily performance')}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="badge badge-outline">{isArabic ? 'رام' : 'RAM'} {product.ram || '8 GB'}</span>
                    <span className="badge badge-outline">{isArabic ? 'تخزين' : 'Storage'} {product.storage || '256 GB'}</span>
                  </div>
                  <div className="card-actions mt-2 items-center justify-between">
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-[10px] text-base-content/50">{isArabic ? 'السعر' : 'Price'}</span>
                      <div className="flex items-baseline gap-2">
                        {Number(product.oldPrice) > 0 && <del className="text-xs text-base-content/50">{money(product.oldPrice, language)}</del>}
                        <strong className="text-xl font-extrabold text-primary">{money(product.price, language)}</strong>
                      </div>
                    </div>
                    <button type="button" onClick={() => setSelectedProduct(product)} className="btn btn-primary btn-sm gap-2 rounded-full px-4">
                      {isArabic ? 'التفاصيل' : 'Details'} <ArrowLeft size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        {!loading && filteredProducts.length > productsPerPage && <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <button type="button" className="btn btn-outline btn-sm" disabled={productPage === 1} onClick={() => setProductPage(page => page - 1)}>
            <ArrowRight size={16}/> {isArabic ? 'السابق' : 'Previous'}
          </button>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map(page => <button type="button" key={page} onClick={() => setProductPage(page)} className={`btn btn-sm ${productPage === page ? 'btn-primary' : 'btn-ghost border border-base-300'}`}>{page}</button>)}
          <button type="button" className="btn btn-outline btn-sm" disabled={productPage === pageCount} onClick={() => setProductPage(page => page + 1)}>
            {isArabic ? 'التالي' : 'Next'} <ArrowLeft size={16}/>
          </button>
        </div>}
      </section>

      {selectedProduct && <div className="modal modal-open" onMouseDown={event => event.target === event.currentTarget && setSelectedProduct(null)}>
        <div className="modal-box flex max-h-[92vh] max-w-3xl flex-col gap-0 overflow-hidden p-0">
          <div className="flex items-start justify-between gap-4 border-b border-base-300 p-5">
            <div><span className="text-xs font-bold tracking-widest text-primary">FALCON LAPTOP</span><h2 className="mt-1 text-2xl font-extrabold">{selectedProduct.brand} {selectedProduct.model}</h2></div>
            <button type="button" className="btn btn-circle btn-ghost btn-sm" onClick={() => setSelectedProduct(null)} aria-label={isArabic ? 'إغلاق' : 'Close'}><X size={19}/></button>
          </div>
          <div className="grid min-h-0 flex-1 gap-6 overflow-y-auto p-5 md:grid-cols-[.9fr_1.1fr]">
            <div className="relative self-start overflow-hidden rounded-box bg-base-300" style={{ paddingTop: '66.6667%' }}>
              <div className="absolute inset-0">
                {(selectedProduct.imageUrl || selectedProduct.image) && !brokenImages.has(selectedProduct.id || selectedProduct._id) ? (
                  <ProductImage
                    src={productImageSrc(selectedProduct)}
                    alt={selectedProduct.model}
                    className="h-full w-full object-contain"
                    onError={() => markImageBroken(selectedProduct.id || selectedProduct._id)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center"><Laptop size={90} className="text-base-content/30"/></div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <p className="text-base leading-8 text-base-content/70">{describeSpecs(selectedProduct, isArabic)}</p>
              <div className="grid grid-cols-2 gap-3">
                {detailFields.filter(([, value]) => value).map(([label, value]) => (
                  <div key={label} className="rounded-box border border-base-300 bg-base-200 p-3"><span className="block text-xs text-base-content/50">{label}</span><b className="mt-1 block text-sm">{value}</b></div>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-base-300 p-5">
            <div className="rounded-box border border-primary/20 bg-primary/5 p-4">
              <span className="block text-xs text-base-content/50">{isArabic ? 'السعر' : 'Price'}</span>
              <div className="mt-1 flex items-baseline gap-3">
                {Number(selectedProduct.oldPrice) > 0 && <del className="text-sm text-base-content/50">{money(selectedProduct.oldPrice, language)}</del>}
                <strong className="text-3xl text-primary">{money(selectedProduct.price, language)}</strong>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href="tel:+201116067708" className="btn btn-primary flex-1 gap-2"><Phone size={17}/> {isArabic ? 'اتصل الآن' : 'Call now'}</a>
              <a href="https://wa.me/201116067708" target="_blank" rel="noreferrer" className="btn btn-outline flex-1 gap-2"><MessageCircle size={17}/> WhatsApp</a>
            </div>
          </div>
        </div>
      </div>}

      {/* Benefits */}
      <section id="why-us" className="bg-base-200 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <span className="text-xs font-semibold tracking-widest text-primary">WHY FALCON</span>
            <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">{isArabic ? 'ليه تختار FALCON؟' : 'Why choose FALCON?'}</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {benefits.map((benefit, index) => (
              <div key={benefit.title} className="card border border-base-300 bg-base-100 transition hover:-translate-y-1 hover:shadow-lg">
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">{benefit.icon}</span>
                    <span className="text-3xl font-extrabold text-base-content/10">0{index + 1}</span>
                  </div>
                  <h3 className="mt-2 text-lg font-bold">{benefit.title}</h3>
                  <p className="text-base-content/70">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-base-300 bg-base-100">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
          <div>
            <a href="#top" className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight">
                FALCON<span className="text-primary">LAPTOP</span>
              </span>
            </a>
            <p className="mt-3 max-w-xs text-sm text-base-content/60">
              {isArabic
                ? 'أجهزة لابتوب مختارة بعناية عشان تبدأ خطوتك الجاية بثقة وجودة.'
                : 'Laptops carefully selected to help you start your next step with confidence and quality.'}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <a href="tel:+201116067708" aria-label={isArabic ? 'اتصال' : 'Call'} className="btn btn-circle btn-ghost btn-sm border border-base-300">
                <Phone size={16} />
              </a>
              <a href="https://wa.me/201116067708" target="_blank" rel="noreferrer" aria-label="WhatsApp" className="btn btn-circle btn-ghost btn-sm border border-base-300">
                <MessageCircle size={16} />
              </a>
              <a href="https://www.instagram.com/falconlaptopp?stkn=MTFsZmJ3azhvaWNybQ==" target="_blank" rel="noreferrer" aria-label="Instagram" className="btn btn-circle btn-ghost btn-sm border border-base-300">
                <Camera size={16} />
              </a>
              <a href="https://www.facebook.com/share/19QPWTUbHB/" target="_blank" rel="noreferrer" aria-label="Facebook" className="btn btn-circle btn-ghost btn-sm border border-base-300 font-bold">
                f
              </a>
            </div>
          </div>

          <div>
            <b className="text-sm font-semibold text-base-content/50">{isArabic ? 'روابط سريعة' : 'Quick links'}</b>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-base-content/70">
              {footerLinks.map(link => (
                <li key={link.href}><a href={link.href} className="transition hover:text-primary">{link.label}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <b className="text-sm font-semibold text-base-content/50">{isArabic ? 'تواصل معنا' : 'Contact us'}</b>
            <div className="mt-3 flex flex-col gap-2 text-sm text-base-content/70">
              <a href="tel:+201116067708" className="flex items-center gap-2 transition hover:text-primary"><Phone size={15} /> 01116067708</a>
              <a href="https://wa.me/201116067708" target="_blank" rel="noreferrer" className="flex items-center gap-2 transition hover:text-primary"><MessageCircle size={15} /> {isArabic ? 'تواصل عبر واتساب' : 'Contact via WhatsApp'}</a>
            </div>
            <button onClick={authenticated ? onLogout : openLogin} className="btn btn-primary btn-sm mt-4 gap-2">
              {authenticated ? (isArabic ? 'تسجيل الخروج' : 'Log out') : (isArabic ? 'ابدأ الآن' : 'Get started')} <ArrowRight size={15} />
            </button>
          </div>
        </div>
        <div className="border-t border-base-300 py-4 text-center text-xs text-base-content/50">
          © {new Date().getFullYear()} FALCON LAPTOP — {isArabic ? 'جميع الحقوق محفوظة' : 'All rights reserved'}
        </div>
      </footer>
    </main>
  );
}
