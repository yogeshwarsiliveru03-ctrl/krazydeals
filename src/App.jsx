import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Plus, X, ArrowRight, Tag, Package, Star, Edit2, Trash2, Filter, Grid, List, Check, Home, Shirt, Monitor, BookOpen, Dumbbell, Zap, TrendingUp, Flame, ShoppingCart, Heart, Eye, Sparkles, ChevronRight, Bell } from "lucide-react";
import { db } from "./firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";
import { Routes, Route } from "react-router-dom";
import { PLATFORMS, CAT_THEMES, CATEGORIES, ADMIN_PASSWORD, defaultProducts, detectPlatform, Field, ImageUploadField, Stars, Badge, ShopBtn, CatPill, ProductCard, SkeletonCard, StatsBar, FloatingOrbs, DealTicker, ProductModal, SettingsPanel, ScrollReveal, ProductPage } from "./AppParts";

export default function App() {
  const [products,setProducts]=useState([]);
  const [view,setView]=useState("store");
  const [adminTab,setAdminTab]=useState("products");
  const [search,setSearch]=useState("");
  const [activeCategory,setActiveCategory]=useState("All");
  const [activeSubCat,setActiveSubCat]=useState("All");
  const [darkMode,setDarkMode]=useState(false);

  const toggleDark = () => {
    setDarkMode(d => {
      try { localStorage.setItem("kd-dark", d?"0":"1"); } catch {}
      return !d;
    });
  };

  const SUB_CATS = {
    "Fashion": ["All","Men","Women","Kids"],
    "Beauty":  ["All","Men","Women","Kids"],
  };

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    setActiveSubCat("All");
  };
  const [sortBy,setSortBy]=useState("default");
  const [layout,setLayout]=useState("grid");
  const [modal,setModal]=useState(null);
  const [loaded,setLoaded]=useState(false);
  const [searchFocused,setSearchFocused]=useState(false);
  const [isAdminUnlocked,setIsAdminUnlocked]=useState(false);
  const [showPasswordPrompt,setShowPasswordPrompt]=useState(false);
  const [passwordInput,setPasswordInput]=useState("");
  const [passwordError,setPasswordError]=useState(false);

  const [settings,setSettings]=useState({
    siteName: "Krazy Deals",
    tagline: "Krazy deals, unreal prices.",
    instagram: "https://instagram.com/krazydeals",
    telegram: "https://t.me/krazydeals",
    email: "krazydeals@gmail.com",
    whatsapp: "",
  });
  const [settingsSaved,setSettingsSaved]=useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("krazy-admin-unlocked") === "true") {
      setIsAdminUnlocked(true);
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "true") {
      if (sessionStorage.getItem("krazy-admin-unlocked") === "true") {
        setView("admin");
      } else {
        setShowPasswordPrompt(true);
      }
    }
  }, []);

  const requestAdminAccess = () => {
    if (view === "admin") {
      setView("store");
      return;
    }
    if (isAdminUnlocked) {
      setView("admin");
    } else {
      setShowPasswordPrompt(true);
      setPasswordInput("");
      setPasswordError(false);
    }
  };

  const submitPassword = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAdminUnlocked(true);
      sessionStorage.setItem("krazy-admin-unlocked", "true");
      setShowPasswordPrompt(false);
      setView("admin");
    } else {
      setPasswordError(true);
    }
  };

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        if (snapshot.empty) {
          defaultProducts.forEach((p) => setDoc(doc(db, "products", p.id), p).catch(()=>{}));
          setProducts(defaultProducts);
        } else {
          const list = snapshot.docs.map((d) => d.data());
          setProducts(list);
        }
        setLoaded(true);
      },
      (err) => {
        console.error("Firestore connection error:", err);
        setProducts(defaultProducts);
        setLoaded(true);
      }
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "settings", "site"),
      (snap) => {
        if (snap.exists()) {
          setSettings(s => ({ ...s, ...snap.data() }));
        }
      },
      (err) => console.error("Settings sync error:", err)
    );
    return () => unsub();
  }, []);

  const saveSettings = async (newSettings) => {
    try {
      await setDoc(doc(db, "settings", "site"), newSettings);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2000);
    } catch (e) {
      console.error("Could not save settings:", e);
      alert("Could not save settings. Check your internet connection.");
    }
  };

  const addProduct = async (p) => {
    try {
      const id = p.id || Date.now().toString();
      const createdAt = p.createdAt || Date.now();
      await setDoc(doc(db, "products", id), { ...p, id, createdAt });
    } catch (e) {
      console.error("Could not save product:", e);
      alert("Could not save product. Check your internet connection and try again.");
    }
    setModal(null);
  };

  const deleteProduct = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
    } catch (e) {
      console.error("Could not delete product:", e);
      alert("Could not delete product. Check your internet connection and try again.");
    }
  };

  const EXPIRE_DAYS = 100;
  const EXPIRE_MS = EXPIRE_DAYS * 24 * 60 * 60 * 1000;

  // Auto-delete expired products from Firestore
  useEffect(() => {
    const now = Date.now();
    products.forEach(p => {
      if (p.createdAt && (now - p.createdAt) > EXPIRE_MS) {
        deleteDoc(doc(db, "products", p.id)).catch(()=>{});
      }
    });
  }, [products]);

  const filtered=products.filter(p=>{
    // Hide expired products (older than 100 days)
    const now = Date.now();
    if (p.createdAt && (now - p.createdAt) > EXPIRE_MS) return false;
    const matchCat=activeCategory==="All"||p.category===activeCategory;
    const matchSubCat=activeSubCat==="All"||!p.subCategory||(p.subCategory&&p.subCategory.toLowerCase()===activeSubCat.toLowerCase());
    const q=search.toLowerCase();
    const matchTags = p.tags ? p.tags.toLowerCase().includes(q) : false;
    return matchCat&&matchSubCat&&(!q||p.name.toLowerCase().includes(q)||p.category.toLowerCase().includes(q)||matchTags);
  }).sort((a,b)=>{
    if(sortBy==="price-asc") return a.price-b.price;
    if(sortBy==="price-desc") return b.price-a.price;
    if(sortBy==="rating") return b.rating-a.rating;
    if(sortBy==="discount") return b.discount-a.discount;
    // Default: newest first (highest createdAt timestamp first)
    return (b.createdAt||0) - (a.createdAt||0);
  });

  if(!loaded) return (
    <div className="min-h-screen font-sans" style={{ background: darkMode?"linear-gradient(160deg,#0f0f1a,#1a1a2e)":"linear-gradient(160deg,#f8f9ff,#fef3fb)" }}>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 pt-20 pb-10">
        <div className="grid gap-4" style={{ gridTemplateColumns:"repeat(auto-fill, minmax(160px, 1fr))" }}>
          {Array.from({length:8}).map((_,i)=>(
            <SkeletonCard key={i} darkMode={darkMode}/>
          ))}
        </div>
      </div>
    </div>
  );

  const catTheme = CAT_THEMES[activeCategory] || CAT_THEMES["All"];

  return (
    <Routes>
      <Route path="/product/:productId" element={<ProductPage products={products} darkMode={darkMode} settings={settings}/>}/>
      <Route path="*" element={
    <div className="min-h-screen font-sans relative" style={{ background: darkMode ? "linear-gradient(160deg,#0f0f1a 0%,#1a1a2e 50%,#0d0d1f 100%)" : "linear-gradient(160deg,#f8f9ff 0%,#fef3fb 50%,#f0f9ff 100%)" }}>
      {!darkMode && <FloatingOrbs/>}

      <style>{`
        @keyframes slideUp{from{transform:translateY(50px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .line-clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
      `}</style>

      {/* -- TICKER -- */}
      {products.length>0 && <DealTicker products={products}/>}

      {/* -- NAVBAR -- */}
      <nav className="sticky top-0 z-40 px-3 pt-3 pb-2">
        <div className="mx-auto max-w-[1440px]">
          <div className="rounded-3xl px-3 py-2 flex items-center justify-between gap-3"
            style={{ background:"rgba(255,255,255,0.8)", backdropFilter:"blur(20px)", boxShadow:"0 4px 30px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.9)" }}>

            {/* Logo */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="relative w-10 h-10 flex-shrink-0">
                  {settings.logoImage ? (
                    <div className="w-10 h-10 rounded-2xl shadow-lg overflow-hidden flex items-center justify-center bg-white border border-gray-100">
                      <img src={settings.logoImage} alt="Logo" className="w-full h-full object-contain p-1"/>
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-2xl shadow-lg overflow-hidden flex items-center justify-center"
                      style={{ background:"linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)" }}>
                      <svg viewBox="0 0 40 40" className="w-8 h-8">
                        <defs>
                          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#F26522"/>
                            <stop offset="100%" stopColor="#FC2779"/>
                          </linearGradient>
                        </defs>
                        <polygon points="22,4 12,22 19,22 17,36 28,18 21,18" fill="url(#logoGrad)"/>
                        <circle cx="30" cy="10" r="4" fill="none" stroke="#F26522" strokeWidth="1.5"/>
                        <circle cx="30" cy="10" r="1.2" fill="#F26522"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-black tracking-tight text-gray-900" style={{ fontSize:"15px", letterSpacing:"-0.02em" }}>{settings.siteName?.split(" ")[0]||"KRAZY"}</span>
                  <span className="font-black tracking-tight" style={{ fontSize:"15px", letterSpacing:"-0.02em", background:"linear-gradient(135deg,#F26522,#FC2779)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{settings.siteName?.split(" ")[1]||"DEALS"}</span>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md relative">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input type="text" value={search} onChange={e=>setSearch(e.target.value)}
                onFocus={()=>setSearchFocused(true)} onBlur={()=>setSearchFocused(false)}
                placeholder="Search krazy deals..."
                className="w-full rounded-2xl pl-10 pr-4 py-2.5 text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none transition-all duration-300"
                style={{ background:searchFocused?"rgba(255,255,255,0.95)":"rgba(0,0,0,0.05)", boxShadow:searchFocused?"0 0 0 2px #667eea":"none" }}/>
              {search && <button onClick={()=>setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={13} className="text-gray-400"/></button>}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Dark mode toggle */}
              <button onClick={toggleDark}
                className="w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-200 flex-shrink-0"
                style={{ background: darkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.06)" }}
                title={darkMode?"Switch to Light Mode":"Switch to Dark Mode"}>
                {darkMode
                  ? <svg viewBox="0 0 24 24" className="w-4 h-4 fill-yellow-300"><path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/></svg>
                  : <svg viewBox="0 0 24 24" className="w-4 h-4 fill-gray-600"><path d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"/></svg>
                }
              </button>
              {view==="admin" && (
                <>
                  <button onClick={()=>setView("store")}
                    className="hidden sm:flex items-center gap-1.5 rounded-2xl px-4 py-2 text-[12px] font-bold transition-all duration-200"
                    style={{ background:"linear-gradient(135deg,#667eea,#764ba2)", color:"#fff", boxShadow:"0 4px 15px rgba(102,126,234,0.4)" }}>
                    <Grid size={13}/>Store View
                  </button>
                  <button onClick={()=>setModal("add")}
                    className="flex items-center gap-1.5 rounded-2xl px-4 py-2 text-[12px] font-bold text-white transition-all duration-200"
                    style={{ background:"linear-gradient(135deg,#f5576c,#FC2779)", boxShadow:"0 4px 15px rgba(245,87,108,0.4)" }}>
                    <Plus size={13}/><span className="hidden sm:inline">Add Product</span>
                  </button>
                  <button onClick={()=>setView("store")}
                    className="sm:hidden w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ background:"rgba(0,0,0,0.06)" }}>
                    <Grid size={16}/>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* -- HERO -- */}
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 pt-8 pb-6 relative" style={{ zIndex:1 }}>
        {view==="store" ? (
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-bold text-white px-3 py-1 rounded-full animate-pulse"
                  style={{ background:"linear-gradient(135deg,#f5576c,#FC2779)" }}> LIVE DEALS</span>
                <span className="text-[11px] text-gray-500 font-medium">{products.length} products across {[...new Set(products.map(p=>detectPlatform(p.affiliateLink)))].length} platforms</span>
              </div>
              <h1 className="font-black text-gray-900" style={{ fontSize:"clamp(2rem,5vw,3.5rem)", lineHeight:1.05, letterSpacing:"-0.03em" }}>
                Krazy deals,{" "}
                <span style={{ background:"linear-gradient(135deg,#667eea,#f5576c,#FC2779)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                  unreal prices.
                </span>
              </h1>
              <p className="text-gray-500 mt-2 text-[14px]">Hand-picked from Flipkart, Amazon, Myntra, Nykaa & more.</p>
            </div>
            {/* Platform chips */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(PLATFORMS).filter(([k])=>k!=="other").map(([key,p])=>{
                const Logo=p.logo;
                return <div key={key} className="px-3 py-2 rounded-2xl transition-all duration-200 hover:scale-105 cursor-default"
                  style={{ background:"rgba(255,255,255,0.8)", backdropFilter:"blur(10px)", boxShadow:"0 2px 10px rgba(0,0,0,0.07)" }}>
                  <Logo/>
                </div>;
              })}
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <h1 className="font-black text-gray-900" style={{ fontSize:"clamp(1.8rem,4vw,3rem)", lineHeight:1.05, letterSpacing:"-0.03em" }}>
              Admin <span style={{ background:"linear-gradient(135deg,#667eea,#764ba2)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Dashboard</span>
            </h1>
            <p className="text-gray-400 mt-1 text-[13px]">Manage your product catalogue and site settings.</p>
            <div className="mt-5"><StatsBar products={products}/></div>

            {/* Admin tab switcher */}
            <div className="flex gap-2 mt-5">
              {[["products","Products"],["settings","Site Settings"]].map(([tab,label])=>(
                <button key={tab} onClick={()=>setAdminTab(tab)}
                  className="px-5 py-2 rounded-2xl text-[13px] font-bold transition-all duration-200"
                  style={adminTab===tab
                    ? { background:"linear-gradient(135deg,#667eea,#764ba2)", color:"#fff", boxShadow:"0 4px 15px rgba(102,126,234,0.4)" }
                    : { background:"rgba(255,255,255,0.7)", color:"#666", backdropFilter:"blur(10px)" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ---- SETTINGS PANEL ---- */}
        {view==="admin" && adminTab==="settings" && (
          <SettingsPanel settings={settings} onSave={saveSettings} saved={settingsSaved}/>
        )}

        {/* ---- PRODUCTS PANEL ---- */}
        {(view!=="admin" || adminTab==="products") && (
        <div>

        {/* -- CATEGORY PILLS -- */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 mb-3" style={{ scrollbarWidth:"none" }}>
          {CATEGORIES.map(cat=>(
            <CatPill key={cat} cat={cat} active={activeCategory===cat} onClick={()=>handleCategoryClick(cat)}/>
          ))}
        </div>

        {/* -- SUB-CATEGORY PILLS (Fashion & Beauty only) -- */}
        {SUB_CATS[activeCategory] && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth:"none" }}>
            {["Men Corner","Women Corner","Kids Corner"].map(sub=>{
              const key = sub.replace(" Corner","");
              const isActive = activeSubCat===key;
              const subIcons = {"Men":"M","Women":"W","Kids":"K"};
              const subGrads = {
                "Men":"linear-gradient(135deg,#4facfe,#00f2fe)",
                "Women":"linear-gradient(135deg,#f093fb,#f5576c)",
                "Kids":"linear-gradient(135deg,#f7971e,#ffd200)"
              };
              return (
                <button key={sub} onClick={()=>setActiveSubCat(isActive?"All":key)}
                  className="flex items-center gap-1.5 flex-shrink-0 rounded-2xl px-4 py-2 text-[12px] font-bold border-2 transition-all duration-300"
                  style={isActive
                    ? { background:subGrads[key], color:"#fff", borderColor:"transparent", boxShadow:"0 4px 15px rgba(0,0,0,0.2)", transform:"scale(1.05)" }
                    : { background:"rgba(255,255,255,0.8)", color:"#666", borderColor:"rgba(255,255,255,0.8)", backdropFilter:"blur(8px)" }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                    style={{ background: isActive ? "rgba(255,255,255,0.3)" : subGrads[key], color:"#fff" }}>
                    {subIcons[key]}
                  </span>
                  {sub}
                </button>
              );
            })}
          </div>
        )}

        {/* -- SORT + COUNT -- */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold px-3 py-1.5 rounded-2xl text-white"
              style={{ background:catTheme.grad }}>
              {catTheme.icon} {filtered.length} deal{filtered.length!==1?"s":""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
              className="text-[12px] font-medium rounded-2xl px-4 py-2 focus:outline-none transition-all duration-200 cursor-pointer"
              style={{ background:"rgba(255,255,255,0.8)", backdropFilter:"blur(10px)", border:"none", boxShadow:"0 2px 10px rgba(0,0,0,0.07)" }}>
              <option value="default">New: Newest First</option>
              <option value="price-asc"> Price: Low to High</option>
              <option value="price-desc"> Price: High to Low</option>
              <option value="rating">* Top Rated</option>
              <option value="discount"> Biggest Discount</option>
            </select>
            <div className="flex items-center rounded-2xl overflow-hidden" style={{ background:"rgba(255,255,255,0.8)", backdropFilter:"blur(10px)", boxShadow:"0 2px 10px rgba(0,0,0,0.07)" }}>
              {[["grid",Grid],["list",List]].map(([k,Icon])=>(
                <button key={k} onClick={()=>setLayout(k)}
                  className="w-9 h-9 flex items-center justify-center transition-all duration-200"
                  style={layout===k?{background:catTheme.grad,color:"#fff"}:{color:"#999"}}>
                  <Icon size={14}/>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* -- PRODUCTS -- */}
        {filtered.length===0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
              style={{ background:"rgba(255,255,255,0.8)", boxShadow:"0 8px 30px rgba(0,0,0,0.1)" }}>:(</div>
            <p className="text-[16px] font-bold text-gray-700">No deals found!</p>
            <p className="text-[13px] text-gray-400">Try a different search or category</p>
            {view==="admin" && (
              <button onClick={()=>setModal("add")}
                className="flex items-center gap-2 rounded-2xl px-5 py-2.5 text-white font-bold text-[13px]"
                style={{ background:"linear-gradient(135deg,#f5576c,#FC2779)", boxShadow:"0 4px 20px rgba(245,87,108,0.4)" }}>
                <Plus size={14}/>Add first product
              </button>
            )}
          </div>
        ) : layout==="grid" ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5"
            style={{ gridTemplateColumns:"repeat(auto-fill, minmax(160px, 1fr))" }}>
            {filtered.map((p,i)=>(
              <ScrollReveal key={p.id} delay={i*50 > 400 ? 0 : i*50} direction="up">
                <ProductCard product={p} isAdmin={view==="admin"} onEdit={p=>setModal(p)} onDelete={deleteProduct} darkMode={darkMode} settings={settings}/>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((p,i)=>{
              const platKey=detectPlatform(p.affiliateLink);
              const plat=PLATFORMS[platKey];
              const Logo=plat.logo;
              const catT=CAT_THEMES[p.category]||CAT_THEMES["All"];
              return (
                <ScrollReveal key={p.id} delay={i*40 > 300 ? 0 : i*40} direction="left">
                <div
                  className="flex items-center gap-4 p-4 rounded-3xl transition-all duration-300 hover:scale-[1.01]"
                  style={{ background:"rgba(255,255,255,0.8)", backdropFilter:"blur(20px)", boxShadow:"0 4px 20px rgba(0,0,0,0.07)" }}>
                  <div className="w-20 h-20 rounded-2xl flex-shrink-0 overflow-hidden" style={{ background:catT.light }}>
                    <img src={p.image} alt={p.name} className="w-full h-full object-contain p-2" onError={e=>{e.target.style.display="none";}}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background:catT.light, color:"#666" }}>{catT.icon} {p.category}</span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background:plat.grad }}>{plat.name}</span>
                    </div>
                    <h3 className="text-[14px] font-bold text-gray-800 truncate">{p.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1"><Stars rating={p.rating}/><span className="text-[10px] text-gray-400">({p.reviews?.toLocaleString()})</span></div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-[17px] font-black text-gray-900">Rs.{p.price?.toLocaleString()}</p>
                      {p.originalPrice>p.price && <p className="text-[11px] text-gray-400 line-through">Rs.{p.originalPrice?.toLocaleString()}</p>}
                      {p.discount>0 && <p className="text-[10px] font-bold text-emerald-500">-{p.discount}%</p>}
                    </div>
                    <ShopBtn url={p.affiliateLink}/>
                    {view==="admin" && (
                      <div className="flex gap-1.5">
                        <button onClick={()=>setModal(p)} className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors" style={{ background:"rgba(102,126,234,0.1)" }}>
                          <Edit2 size={12} className="text-indigo-500"/>
                        </button>
                        <button onClick={()=>deleteProduct(p.id)} className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors" style={{ background:"rgba(239,68,68,0.1)" }}>
                          <Trash2 size={12} className="text-red-400"/>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                </ScrollReveal>
              );
            })}
          </div>
        )}
        </div>
        )}
      </div>

      {/* -- FOOTER -- */}
      {view==="store" && (
        <footer className="relative mt-16" style={{ zIndex:1 }}>
          {/* Top wave divider */}
          <div style={{ background:"linear-gradient(160deg,#1a1a2e,#16213e,#0f3460)" }}>
            <svg viewBox="0 0 1440 60" className="w-full" style={{ display:"block", marginBottom:"-2px" }}>
              <path d="M0,30 C360,60 1080,0 1440,30 L1440,0 L0,0 Z" fill="rgb(248,249,255)"/>
            </svg>

            <div className="max-w-[1440px] mx-auto px-5 sm:px-8 pt-10 pb-6">

              {/* Logo + tagline */}
              <div className="flex flex-col items-center text-center mb-10">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-10 h-10 rounded-2xl shadow-lg overflow-hidden flex items-center justify-center"
                    style={{ background:"linear-gradient(135deg,#F26522,#FC2779)" }}>
                    <svg viewBox="0 0 40 40" className="w-8 h-8">
                      <polygon points="22,4 12,22 19,22 17,36 28,18 21,18" fill="white"/>
                    </svg>
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="font-black text-white tracking-tight" style={{ fontSize:"18px" }}>KRAZY</span>
                    <span className="font-black tracking-tight" style={{ fontSize:"18px", background:"linear-gradient(135deg,#F26522,#FC2779)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>DEALS</span>
                  </div>
                </div>
                <p className="text-gray-400 text-[13px] max-w-xs leading-relaxed">
                  Your one-stop destination for the best deals across Flipkart, Amazon, Myntra, Nykaa and more.
                </p>
              </div>

              {/* 3 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">

                {/* About Us */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-white font-bold text-[14px] tracking-wide uppercase" style={{ borderBottom:"2px solid #F26522", paddingBottom:"8px", display:"inline-block" }}>About Us</h3>
                  <p className="text-gray-400 text-[13px] leading-relaxed">
                    Krazy Deals is a curated affiliate store bringing you hand-picked discounts from India's top e-commerce platforms. We help you save money on every purchase - electronics, fashion, beauty, home and more.
                  </p>
                  <p className="text-gray-400 text-[13px] leading-relaxed">
                    Every product is verified and linked directly to the official platform for a safe, secure shopping experience.
                  </p>
                </div>

                {/* Contact Us */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-white font-bold text-[14px] tracking-wide uppercase" style={{ borderBottom:"2px solid #FC2779", paddingBottom:"8px", display:"inline-block" }}>Contact Us</h3>
                  <div className="flex flex-col gap-2.5">
                    <a href={settings.instagram} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 group">
                      <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                        style={{ background:"linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)" }}>
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-white text-[13px] font-semibold group-hover:text-[#F26522] transition-colors">Instagram</p>
                        <p className="text-gray-500 text-[11px]">{settings.instagram.replace("https://instagram.com/","@ ").replace("https://www.instagram.com/","@ ")}</p>
                      </div>
                    </a>

                    <a href={settings.telegram} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 group">
                      <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                        style={{ background:"linear-gradient(135deg,#2AABEE,#229ED9)" }}>
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.820 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-white text-[13px] font-semibold group-hover:text-[#2AABEE] transition-colors">Telegram</p>
                        <p className="text-gray-500 text-[11px]">{settings.instagram.replace("https://instagram.com/","@ ").replace("https://www.instagram.com/","@ ")}</p>
                      </div>
                    </a>

                    <a href={`mailto:${settings.email}`}
                      className="flex items-center gap-3 group">
                      <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                        style={{ background:"linear-gradient(135deg,#F26522,#FC2779)" }}>
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-white text-[13px] font-semibold group-hover:text-[#F26522] transition-colors">Email Us</p>
                        <p className="text-gray-500 text-[11px]">{settings.email}</p>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-white font-bold text-[14px] tracking-wide uppercase" style={{ borderBottom:"2px solid #667eea", paddingBottom:"8px", display:"inline-block" }}>Quick Links</h3>
                  <div className="flex flex-col gap-2">
                    {["Electronics", "Fashion", "Beauty", "Home & Kitchen", "Books", "Sports"].map(cat=>(
                      <button key={cat} onClick={()=>{ setActiveCategory(cat); window.scrollTo({top:0,behavior:"smooth"}); }}
                        className="text-gray-400 text-[13px] text-left hover:text-[#F26522] transition-colors duration-200 flex items-center gap-2">
                        <span style={{ color:"#F26522" }}>-&gt;</span> {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Social media strip */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <a href={settings.instagram} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 hover:-translate-y-1"
                  style={{ background:"linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)" }}>
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href={settings.telegram} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 hover:-translate-y-1"
                  style={{ background:"linear-gradient(135deg,#2AABEE,#229ED9)" }}>
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.820 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </a>
              </div>

              {/* Disclaimer */}
              <div className="rounded-2xl p-4 mb-6 text-center"
                style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)" }}>
                <p className="text-gray-500 text-[11px] leading-relaxed">
                  Disclaimer: Krazy Deals is an affiliate marketing website. We earn a small commission when you purchase through our links, at no extra cost to you. All product prices and availability are subject to change at the time of purchase on the respective platforms.
                </p>
              </div>

              {/* Copyright */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4"
                style={{ borderTop:"1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-gray-600 text-[12px]">
                  &copy; {new Date().getFullYear()} Krazy Deals. All rights reserved.
                </p>
                <p className="text-gray-600 text-[12px]">
                  Made with <span style={{ color:"#FC2779" }}>love</span> in India
                </p>
              </div>
            </div>
          </div>
        </footer>
      )}

      {modal && <ProductModal product={modal==="add"?null:modal} onSave={addProduct} onClose={()=>setModal(null)}/>}

      {/* -- FAB -- */}
      {view==="admin" && (
        <button onClick={()=>setModal("add")}
          className="fixed bottom-6 right-6 sm:hidden w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl z-30 transition-transform duration-200 hover:scale-110"
          style={{ background:"linear-gradient(135deg,#f5576c,#FC2779)", boxShadow:"0 8px 30px rgba(245,87,108,0.5)" }}>
          <Plus size={24} className="text-white"/>
        </button>
      )}

      {/* -- ADMIN PASSWORD PROMPT -- */}
      {showPasswordPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor:"rgba(0,0,0,0.6)", backdropFilter:"blur(8px)" }}
          onClick={()=>setShowPasswordPrompt(false)}>
          <div className="w-full max-w-xs rounded-3xl overflow-hidden"
            style={{ background:"rgba(255,255,255,0.97)", backdropFilter:"blur(20px)" }}
            onClick={e=>e.stopPropagation()}>
            <div className="px-6 pt-6 pb-4 text-center"
              style={{ background:"linear-gradient(135deg,#667eea,#764ba2)" }}>
              <div className="w-12 h-12 mx-auto rounded-2xl bg-white/20 flex items-center justify-center mb-2">
                <Zap size={20} className="text-white"/>
              </div>
              <p className="text-white font-bold text-[15px]">Admin Access</p>
              <p className="text-white/70 text-[11px] mt-1">Enter password to manage products</p>
            </div>
            <div className="p-6 flex flex-col gap-3">
              <input
                type="password"
                value={passwordInput}
                onChange={e=>{ setPasswordInput(e.target.value); setPasswordError(false); }}
                onKeyDown={e=>{ if(e.key==="Enter") submitPassword(); }}
                placeholder="Password"
                autoFocus
                className="w-full rounded-2xl px-4 py-3 text-[14px] text-gray-800 text-center focus:outline-none transition-all duration-200"
                style={{ background:"rgba(0,0,0,0.05)", border: passwordError ? "2px solid #ef4444" : "2px solid transparent" }}
              />
              {passwordError && (
                <p className="text-[11px] text-red-500 text-center font-medium">Wrong password, try again</p>
              )}
              <button onClick={submitPassword}
                className="w-full rounded-2xl py-3 text-[13px] font-bold text-white transition-all duration-300"
                style={{ background:"linear-gradient(135deg,#667eea,#764ba2)" }}>
                Unlock Admin
              </button>
              <button onClick={()=>setShowPasswordPrompt(false)}
                className="text-[12px] text-gray-400 font-medium">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
      }/>
    </Routes>
  );
}