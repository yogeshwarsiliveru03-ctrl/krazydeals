import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Search, Plus, X, ArrowRight, Tag, Package,
  Star, Edit2, Trash2, Filter, Grid, List, Check,
  Home, Shirt, Monitor, BookOpen, Dumbbell, Zap,
  TrendingUp, Flame, ShoppingCart, Heart, Eye,
  Sparkles, ChevronRight, Bell
} from "lucide-react";
import { db } from "./firebase";
import {
  collection, onSnapshot, doc, setDoc, deleteDoc
} from "firebase/firestore";

const PLATFORMS = {
  flipkart: { name:"Flipkart", color:"#2874F0", grad:"linear-gradient(135deg,#2874F0,#1557c0)", text:"#fff",
    logo:()=><svg viewBox="0 0 60 18" className="h-3.5 w-auto"><text x="0" y="14" fontFamily="Arial" fontWeight="900" fontSize="13" fill="#2874F0">flip</text><text x="27" y="14" fontFamily="Arial" fontWeight="900" fontSize="13" fill="#F9A825">kart</text></svg> },
  amazon: { name:"Amazon", color:"#FF9900", grad:"linear-gradient(135deg,#FF9900,#e67e00)", text:"#111",
    logo:()=><svg viewBox="0 0 76 18" className="h-3.5 w-auto"><text x="0" y="13" fontFamily="Arial" fontWeight="900" fontSize="13" fill="#111">amazon</text><path d="M3 16 Q28 21 53 16" stroke="#FF9900" strokeWidth="2" strokeLinecap="round" fill="none"/><polygon points="51,14 55,16 51,18" fill="#FF9900"/></svg> },
  meesho: { name:"Meesho", color:"#9B30FF", grad:"linear-gradient(135deg,#9B30FF,#7a20e0)", text:"#fff",
    logo:()=><svg viewBox="0 0 66 18" className="h-3.5 w-auto"><text x="0" y="14" fontFamily="Arial" fontWeight="900" fontSize="13" fill="#9B30FF">meesho</text></svg> },
  myntra: { name:"Myntra", color:"#FF3F6C", grad:"linear-gradient(135deg,#FF3F6C,#e0204e)", text:"#fff",
    logo:()=><svg viewBox="0 0 62 18" className="h-3.5 w-auto"><text x="0" y="14" fontFamily="Arial" fontWeight="900" fontSize="13" fill="#FF3F6C">myntra</text></svg> },
  nykaa: { name:"Nykaa", color:"#FC2779", grad:"linear-gradient(135deg,#FC2779,#d41060)", text:"#fff",
    logo:()=><svg viewBox="0 0 52 18" className="h-3.5 w-auto"><text x="0" y="14" fontFamily="Arial" fontWeight="900" fontSize="13" fill="#FC2779">nykaa</text></svg> },
  ajio: { name:"Ajio", color:"#E8142B", grad:"linear-gradient(135deg,#E8142B,#b50e20)", text:"#fff",
    logo:()=><svg viewBox="0 0 40 18" className="h-3.5 w-auto"><text x="0" y="14" fontFamily="Arial" fontWeight="900" fontSize="13" fill="#E8142B">ajio</text></svg> },
  snapdeal: { name:"Snapdeal", color:"#E40000", grad:"linear-gradient(135deg,#E40000,#b30000)", text:"#fff",
    logo:()=><svg viewBox="0 0 80 18" className="h-3.5 w-auto"><text x="0" y="14" fontFamily="Arial" fontWeight="900" fontSize="13" fill="#E40000">snapdeal</text></svg> },
  other: { name:"Shop", color:"#6366f1", grad:"linear-gradient(135deg,#6366f1,#4f46e5)", text:"#fff",
    logo:()=><span className="text-[12px] font-bold text-indigo-600">Shop</span> },
};

function detectPlatform(url=""){
  const u=url.toLowerCase();
  if(u.includes("flipkart.com")) return "flipkart";
  if(u.includes("amazon.in")||u.includes("amazon.com")||u.includes("amzn")) return "amazon";
  if(u.includes("meesho.com")) return "meesho";
  if(u.includes("myntra.com")) return "myntra";
  if(u.includes("nykaa.com")) return "nykaa";
  if(u.includes("ajio.com")) return "ajio";
  if(u.includes("snapdeal.com")) return "snapdeal";
  return "other";
}

const CAT_THEMES = {
  "All":          { grad:"linear-gradient(135deg,#667eea,#764ba2)", icon:"*", light:"#f3f0ff" },
  "Electronics":  { grad:"linear-gradient(135deg,#4facfe,#00f2fe)", icon:"!", light:"#e0f7ff" },
  "Fashion":      { grad:"linear-gradient(135deg,#f093fb,#f5576c)", icon:"", light:"#fce4ff" },
  "Home & Kitchen":{ grad:"linear-gradient(135deg,#4CAF50,#8BC34A)", icon:"", light:"#e8f5e9" },
  "Books":        { grad:"linear-gradient(135deg,#f7971e,#ffd200)", icon:"", light:"#fff8e1" },
  "Sports":       { grad:"linear-gradient(135deg,#11998e,#38ef7d)", icon:"", light:"#e0fff4" },
  "Beauty":       { grad:"linear-gradient(135deg,#FC2779,#ff758c)", icon:"", light:"#ffe0eb" },
};

const CATEGORIES = Object.keys(CAT_THEMES);

const defaultProducts = [
  { id:"1", name:"boAt Rockerz 450 Bluetooth Headphone", category:"Electronics", price:1299, originalPrice:3999, discount:68, rating:4.2, reviews:18432,
    image:"https://rukminim2.flixcart.com/image/312/312/xif0q/headphone/n/k/i/rockerz-450-boat-original-imaghx3grfhbyszq.jpeg",
    affiliateLink:"https://www.flipkart.com/boat-rockerz-450-bluetooth-headphone/p/itm", badge:"Bestseller", description:"40-hour battery, 40mm drivers, foldable design" },
  { id:"2", name:"Samsung 55\" 4K Smart LED TV", category:"Electronics", price:34999, originalPrice:79900, discount:56, rating:4.4, reviews:6821,
    image:"https://rukminim2.flixcart.com/image/312/312/xif0q/television/e/j/e/-original-imaghgxzfgh3hhrg.jpeg",
    affiliateLink:"https://www.flipkart.com/samsung-4k-smart-tv/p/itm", badge:"Deal of Day", description:"Crystal 4K processor, HDR, Tizen OS" },
  { id:"3", name:"Nike Air Max 270 Running Shoes", category:"Fashion", price:7495, originalPrice:12995, discount:42, rating:4.5, reviews:3200,
    image:"https://rukminim2.flixcart.com/image/312/312/xif0q/shoe/r/s/y/-original-imaghfhy2qhzufzp.jpeg",
    affiliateLink:"https://www.myntra.com/nike-air-max-270/p/itm", badge:"Trending", description:"Max Air unit, breathable mesh upper" },
  { id:"4", name:"Prestige Iris 750W Mixer Grinder", category:"Home & Kitchen", price:2199, originalPrice:4995, discount:56, rating:4.3, reviews:9104,
    image:"https://rukminim2.flixcart.com/image/312/312/xif0q/mixer-juicer-grinder/g/n/t/iris-750-prestige-original-imaghxz3vrgzy2qg.jpeg",
    affiliateLink:"https://www.amazon.in/prestige-iris-750/dp/itm", badge:"Top Pick", description:"750W motor, 3 SS jars, 5-year warranty" },
  { id:"5", name:"Maybelline Fit Me Foundation", category:"Beauty", price:349, originalPrice:699, discount:50, rating:4.3, reviews:24800,
    image:"https://rukminim2.flixcart.com/image/312/312/xif0q/foundation/v/a/z/30-fit-me-matte-poreless-foundation-maybelline-original-imaghyb3ggbfwyzq.jpeg",
    affiliateLink:"https://www.nykaa.com/maybelline-fit-me-foundation/p/itm", badge:"Bestseller", description:"24hr wear, natural finish, 30ml" },
  { id:"6", name:"L'Oreal Hyaluronic Acid Serum", category:"Beauty", price:699, originalPrice:1299, discount:46, rating:4.4, reviews:11200,
    image:"https://rukminim2.flixcart.com/image/312/312/xif0q/serum/n/z/v/30-revitalift-15-pure-hyaluronic-acid-serum-loreal-paris-original-imagh4cygfh5zzy6.jpeg",
    affiliateLink:"https://www.nykaa.com/loreal-hyaluronic-serum/p/itm", badge:"Trending", description:"Plumps & hydrates, dermatologist tested, 30ml" },
  { id:"7", name:"Lakme Eyeconic Kajal Twin Pack", category:"Beauty", price:298, originalPrice:398, discount:25, rating:4.5, reviews:38500,
    image:"https://rukminim2.flixcart.com/image/312/312/xif0q/eyeliner/h/g/g/0-35-eyeconic-kajal-lakme-original-imaghyekpkfchzze.jpeg",
    affiliateLink:"https://www.meesho.com/lakme-eyeconic-kajal/p/itm", badge:"Top Pick", description:"12hr smudge-proof, ultra-dark black, 0.35gx2" },
];

function FloatingOrbs() {
  const orbs = [
    { w:320, h:320, x:"-10%", y:"-15%", color:"rgba(102,126,234,0.15)", dur:8 },
    { w:250, h:250, x:"75%",  y:"5%",   color:"rgba(245,87,108,0.12)",  dur:11 },
    { w:180, h:180, x:"45%",  y:"60%",  color:"rgba(79,172,254,0.13)",  dur:7 },
    { w:140, h:140, x:"10%",  y:"70%",  color:"rgba(252,39,121,0.10)",  dur:13 },
    { w:200, h:200, x:"85%",  y:"55%",  color:"rgba(155,48,255,0.10)",  dur:9 },
  ];
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex:0 }}>
      {orbs.map((o,i)=>(
        <div key={i} style={{
          position:"absolute", borderRadius:"50%",
          width:o.w, height:o.h, left:o.x, top:o.y,
          background:o.color, filter:"blur(60px)",
          animation:`floatOrb${i} ${o.dur}s ease-in-out infinite alternate`,
        }}/>
      ))}
      <style>{`
        @keyframes floatOrb0{from{transform:translate(0,0) scale(1)}to{transform:translate(30px,40px) scale(1.1)}}
        @keyframes floatOrb1{from{transform:translate(0,0) scale(1)}to{transform:translate(-40px,20px) scale(0.9)}}
        @keyframes floatOrb2{from{transform:translate(0,0)}to{transform:translate(20px,-30px)}}
        @keyframes floatOrb3{from{transform:translate(0,0)}to{transform:translate(-20px,25px)}}
        @keyframes floatOrb4{from{transform:translate(0,0)}to{transform:translate(15px,-20px)}}
      `}</style>
    </div>
  );
}

function DealTicker({ products }) {
  const items = products.slice(0,6).map(p=>` ${p.name} - Rs.${p.price?.toLocaleString()} (${p.discount}% OFF)`);
  const text = items.join("   -   ");
  return (
    <div className="overflow-hidden py-2 px-0" style={{ background:"linear-gradient(90deg,#667eea,#764ba2,#f5576c,#FC2779,#667eea)", backgroundSize:"300% 100%", animation:"gradShift 6s linear infinite" }}>
      <div style={{ display:"flex", animation:"ticker 30s linear infinite", whiteSpace:"nowrap" }}>
        {[text,text].map((t,i)=>(
          <span key={i} className="text-white text-[12px] font-medium px-8" style={{ whiteSpace:"nowrap" }}>{t}</span>
        ))}
      </div>
      <style>{`
        @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes gradShift{0%{background-position:0%}100%{background-position:300%}}
      `}</style>
    </div>
  );
}

function Stars({ rating, size=11 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i=>(
        <Star key={i} size={size} className={i<=Math.round(rating)?"fill-amber-400 text-amber-400":"text-gray-200"} />
      ))}
    </div>
  );
}

const BADGE_STYLES = {
  "Bestseller":"linear-gradient(135deg,#f7971e,#ffd200)",
  "Deal of Day":"linear-gradient(135deg,#667eea,#764ba2)",
  "Trending":"linear-gradient(135deg,#f093fb,#f5576c)",
  "Top Pick":"linear-gradient(135deg,#11998e,#38ef7d)",
  "New":"linear-gradient(135deg,#4facfe,#00f2fe)",
};
function Badge({ label }) {
  const g = BADGE_STYLES[label] || "linear-gradient(135deg,#888,#555)";
  return (
    <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full shadow-sm"
      style={{ background:g, textShadow:"0 1px 2px rgba(0,0,0,0.2)" }}>
      {label}
    </span>
  );
}

function ShopBtn({ url }) {
  const [hov,setHov]=useState(false);
  const key=detectPlatform(url);
  const p=PLATFORMS[key];
  const Logo=p.logo;
  return (
    <a href={url||"#"} target="_blank" rel="noopener noreferrer"
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      className="flex items-center gap-2 rounded-full pl-3 pr-2 py-1.5 text-[11px] font-bold transition-all duration-200"
      style={{ background:p.grad, color:p.text, transform:hov?"scale(1.05)":"scale(1)", boxShadow:hov?`0 6px 20px ${p.color}55`:`0 2px 8px ${p.color}33` }}>
      <Logo/>
      <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300"
        style={{ backgroundColor:"rgba(255,255,255,0.25)", transform:hov?"rotate(-45deg)":"rotate(0)" }}>
        <ArrowRight size={9} style={{color:p.text}}/>
      </span>
    </a>
  );
}

// ScrollReveal - animates children when they enter the viewport
function ScrollReveal({ children, delay=0, direction="up" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const transforms = {
    up:    "translateY(40px)",
    down:  "translateY(-40px)",
    left:  "translateX(40px)",
    right: "translateX(-40px)",
    scale: "scale(0.85)",
  };

  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0) translateX(0) scale(1)" : transforms[direction]||transforms.up,
      transition: `opacity 0.55s ease ${delay}ms, transform 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      willChange: "opacity, transform",
    }}>
      {children}
    </div>
  );
}

function ProductPage({ products, darkMode, settings }) {
  const { productId } = useParams();
  const navigate = useNavigate();
  const product = products.find(p => p.id === productId);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [productId]);

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-5"
      style={{ background: darkMode ? "#0f0f1a" : "#f8f9ff" }}>
      <div className="text-4xl">Unable to find</div>
      <p className="text-[16px] font-bold" style={{ color: darkMode ? "#e2e8f0" : "#1a202c" }}>Product not found</p>
      <button onClick={() => navigate("/")}
        className="px-6 py-3 rounded-2xl text-white font-bold text-[13px]"
        style={{ background: "linear-gradient(135deg,#667eea,#764ba2)" }}>
        Back to Deals
      </button>
    </div>
  );

  const platKey = detectPlatform(product.affiliateLink);
  const plat = PLATFORMS[platKey];
  const bg = darkMode ? "#1e1e2e" : "#fff";
  const pageBg = darkMode ? "linear-gradient(160deg,#0f0f1a,#1a1a2e)" : "linear-gradient(160deg,#f8f9ff,#fef3fb)";
  const textColor = darkMode ? "#e2e8f0" : "#1a202c";
  const subText = darkMode ? "#94a3b8" : "#6b7280";

  const handleWhatsApp = () => {
    const waNumber = settings?.whatsapp?.replace(/\D/g, "") || "";
    const text = encodeURIComponent("Hi! I want to order:\n\n*" + product.name + "*\nPrice: Rs." + product.price?.toLocaleString() + " (" + product.discount + "% OFF)\n\nLink: " + product.affiliateLink);
    window.open(waNumber ? "https://wa.me/" + waNumber + "?text=" + text : "https://wa.me/?text=" + text, "_blank");
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    const text = "Check out this deal!\n" + product.name + "\nRs." + product.price + " (" + product.discount + "% OFF)\n" + shareUrl;
    if (navigator.share) { navigator.share({ title: product.name, text, url: shareUrl }).catch(() => {}); }
    else { navigator.clipboard?.writeText(shareUrl).catch(() => {}); }
  };

  return (
    <div className="min-h-screen font-sans" style={{ background: pageBg }}>
      <div className="sticky top-0 z-40 px-3 pt-3 pb-2">
        <div className="max-w-[600px] mx-auto rounded-3xl px-3 py-2 flex items-center gap-3"
          style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", boxShadow: "0 4px 30px rgba(0,0,0,0.1)" }}>
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(0,0,0,0.06)" }}>
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#1a202c" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <span className="font-bold text-[14px] truncate flex-1" style={{ color: textColor }}>Product Details</span>
          <button onClick={handleShare} className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.06)" }}>
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-gray-500" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="max-w-[600px] mx-auto px-4 pb-32">
        <div className="rounded-3xl overflow-hidden mb-4 mt-2" style={{ background: bg, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <div className="relative" style={{ aspectRatio: "1/1" }}>
            <img src={product.image} alt={product.name} className="w-full h-full object-cover"
              onError={e => { e.target.style.display = "none"; }}/>
            {product.discount > 0 && (
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl text-white font-black text-[14px]"
                style={{ background: "linear-gradient(135deg,#f5576c,#c0392b)" }}>
                {product.discount}% OFF
              </div>
            )}
            <div className="absolute top-4 right-4 px-2 py-1 rounded-xl text-white text-[11px] font-bold" style={{ background: plat.color }}>
              {plat.name}
            </div>
          </div>
        </div>

        <div className="rounded-3xl p-5 mb-3" style={{ background: bg, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
              style={{ background: "rgba(102,126,234,0.1)", color: "#667eea" }}>{product.category}</span>
            {product.subCategory && (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full text-white"
                style={{ background: product.subCategory === "Men" ? "#4facfe" : product.subCategory === "Women" ? "#f093fb" : "#f7971e" }}>
                {product.subCategory} Corner
              </span>
            )}
            {product.badge && (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full text-white"
                style={{ background: "linear-gradient(135deg,#f7971e,#ffd200)" }}>{product.badge}</span>
            )}
          </div>

          <h1 className="text-[18px] font-bold leading-snug mb-3" style={{ color: textColor }}>{product.name}</h1>

          {product.rating > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[13px] font-bold text-white px-2.5 py-1 rounded-lg flex items-center gap-1.5" style={{ background: "#388e3c" }}>
                {product.rating} <Star size={12} className="fill-white text-white"/>
              </span>
              {product.reviews > 0 && <span className="text-[13px]" style={{ color: subText }}>{product.reviews?.toLocaleString()} ratings</span>}
            </div>
          )}

          <div className="h-px mb-3" style={{ background: "rgba(0,0,0,0.06)" }}/>

          <div className="flex items-baseline gap-3 flex-wrap mb-1">
            <span className="text-[28px] font-black" style={{ color: textColor }}>Rs.{product.price?.toLocaleString()}</span>
            {product.originalPrice > product.price && (
              <span className="text-[16px] line-through" style={{ color: subText }}>Rs.{product.originalPrice?.toLocaleString()}</span>
            )}
          </div>
          {product.discount > 0 && (
            <p className="text-[14px] font-bold text-green-500 mb-3">
              You save Rs.{(product.originalPrice - product.price)?.toLocaleString()} ({product.discount}% off)
            </p>
          )}

          {product.description && (
            <>
              <div className="h-px mb-3" style={{ background: "rgba(0,0,0,0.06)" }}/>
              <h3 className="text-[13px] font-bold uppercase tracking-wide mb-2" style={{ color: subText }}>Description</h3>
              <p className="text-[14px] leading-relaxed" style={{ color: textColor }}>{product.description}</p>
            </>
          )}

          {product.tags && (
            <>
              <div className="h-px my-3" style={{ background: "rgba(0,0,0,0.06)" }}/>
              <div className="flex flex-wrap gap-1.5">
                {product.tags.split(",").map(t => t.trim()).filter(Boolean).map(tag => (
                  <span key={tag} className="text-[11px] px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(102,126,234,0.1)", color: "#667eea" }}>#{tag}</span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 pt-3 z-40"
        style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="max-w-[600px] mx-auto flex gap-3">
          {product.isOwnProduct && (
            <button onClick={handleWhatsApp}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-[14px] text-white flex-shrink-0"
              style={{ background: "#25D366", boxShadow: "0 4px 15px rgba(37,211,102,0.4)" }}>
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.116 1.523 5.845L.057 23.857a.5.5 0 0 0 .609.61l6.101-1.457A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.65-.5-5.175-1.373l-.371-.214-3.85.919.937-3.738-.233-.389A9.943 9.943 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              Order
            </button>
          )}
          <a href={product.affiliateLink} target="_blank" rel="noopener noreferrer" className="flex-1">
            <button className="w-full py-3.5 rounded-2xl font-bold text-[15px] text-white"
              style={{ background: plat.grad, boxShadow: "0 4px 20px " + plat.color + "44" }}>
              Buy on {plat.name}
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, onEdit, onDelete, isAdmin, darkMode, settings }) {
  const [liked,setLiked]=useState(false);
  const [shared,setShared]=useState(false);
  const navigate = useNavigate();
  const platKey=detectPlatform(product.affiliateLink);
  const plat=PLATFORMS[platKey];

  // Share uses direct Flipkart/Amazon image URL - not base64
  const imageForShare = product.image && !product.image.startsWith("data:") ? product.image : "";
  const shareUrl = `https://krazydeals-ebvr.vercel.app/share?product=${product.id}`;

  const handleShare = (e) => {
    e.stopPropagation();
    const text = `Check out this deal!\n${product.name}\nRs.${product.price} (${product.discount}% OFF)\n${shareUrl}`;
    if (navigator.share) {
      navigator.share({ title: product.name, text, url: shareUrl }).catch(()=>{});
    } else {
      navigator.clipboard?.writeText(text).catch(()=>{});
      setShared(true);
      setTimeout(()=>setShared(false), 2000);
    }
  };

  const cardBg = darkMode ? "#1e1e2e" : "#fff";
  const textColor = darkMode ? "#e2e8f0" : "#1a202c";
  const subTextColor = darkMode ? "#94a3b8" : "#6b7280";

  return (
    <>
      <div className="relative flex flex-col overflow-hidden transition-all duration-300 group"
        style={{ background:cardBg, borderRadius:"12px", boxShadow: darkMode ? "0 1px 4px rgba(0,0,0,0.4)" : "0 1px 4px rgba(0,0,0,0.08)" }}>

        {/* Image - tap to open detail */}
        <div className="relative overflow-hidden cursor-pointer" style={{ aspectRatio:"1/1", background: darkMode?"#2d2d44":"#f9fafb" }}
          onClick={()=>navigate("/product/"+product.id)}>
          <img src={product.image} alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={e=>{e.target.style.display="none"; e.target.parentNode.style.background=darkMode?"#2d2d44":"#f3f4f6";}}/>

          {/* Heart top-left */}
          <button onClick={e=>{e.stopPropagation();setLiked(l=>!l);}}
            className="absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
            style={{ background:"rgba(255,255,255,0.9)", boxShadow:"0 1px 4px rgba(0,0,0,0.12)" }}>
            <Heart size={13} className={liked?"fill-red-500 text-red-500":"text-gray-400"}/>
          </button>

          {/* Share top-right */}
          <button onClick={handleShare}
            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
            style={{ background: shared?"#22c55e":"rgba(255,255,255,0.9)", boxShadow:"0 1px 4px rgba(0,0,0,0.12)" }}>
            {shared
              ? <Check size={11} className="text-white"/>
              : <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-gray-500" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
            }
          </button>

          {/* Discount badge bottom-left */}
          {product.discount>0 && (
            <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-white font-black text-[11px]"
              style={{ background:"linear-gradient(135deg,#f5576c,#c0392b)" }}>
              {product.discount}% off
            </div>
          )}

          {/* Platform badge bottom-right */}
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-white text-[9px] font-bold"
            style={{ background:plat.color }}>
            {plat.name}
          </div>

          {/* Admin buttons */}
          {isAdmin && (
            <div className="absolute top-9 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button onClick={e=>{e.stopPropagation();onEdit(product);}} className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                <Edit2 size={10} className="text-gray-700"/>
              </button>
              <button onClick={e=>{e.stopPropagation();onDelete(product.id);}} className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                <Trash2 size={10} className="text-red-500"/>
              </button>
            </div>
          )}
        </div>

        {/* Info - tap to open detail */}
        <div className="p-2.5 flex flex-col gap-1.5 cursor-pointer" onClick={()=>navigate("/product/"+product.id)}>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-[15px] font-black" style={{ color:textColor }}>Rs.{product.price?.toLocaleString()}</span>
            {product.originalPrice>product.price && (
              <span className="text-[11px] line-through" style={{ color:subTextColor }}>Rs.{product.originalPrice?.toLocaleString()}</span>
            )}
            {product.discount>0 && <span className="text-[11px] font-bold text-green-500">{product.discount}% off</span>}
          </div>
          <p className="text-[12px] leading-snug line-clamp-2" style={{ color:subTextColor }}>{product.name}</p>
          {product.rating>0 && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded flex items-center gap-0.5" style={{ background:"#388e3c" }}>
                {product.rating} <Star size={8} className="fill-white text-white"/>
              </span>
              {product.reviews>0 && <span className="text-[10px]" style={{ color:subTextColor }}>({product.reviews?.toLocaleString()})</span>}
            </div>
          )}
        </div>

        {/* Shop button - does NOT open popup */}
        <div className="px-2.5 pb-2.5">
          <ShopBtn url={product.affiliateLink}/>
        </div>
      </div>
    </>
  );
}

// Skeleton Card - shown while products are loading
function SkeletonCard({ darkMode }) {
  const bg = darkMode ? "#2d2d44" : "#f3f4f6";
  const shimmer = darkMode ? "#3d3d54" : "#e5e7eb";
  return (
    <div className="relative flex flex-col overflow-hidden rounded-xl" style={{ background: darkMode?"#1e1e2e":"#fff", boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }}>
      <div style={{ aspectRatio:"1/1", background:bg, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:`linear-gradient(90deg,${bg} 0%,${shimmer} 50%,${bg} 100%)`, backgroundSize:"200% 100%", animation:"shimmer 1.5s infinite" }}/>
      </div>
      <div className="p-2.5 flex flex-col gap-2">
        {[["60%","16px"],["90%","12px"],["40%","12px"]].map(([w,h],i)=>(
          <div key={i} style={{ width:w, height:h, borderRadius:"6px", background:bg, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", inset:0, background:`linear-gradient(90deg,${bg} 0%,${shimmer} 50%,${bg} 100%)`, backgroundSize:"200% 100%", animation:`shimmer 1.5s infinite ${i*0.1}s` }}/>
          </div>
        ))}
      </div>
    </div>
  );
}

function CatPill({ cat, active, onClick }) {
  const theme = CAT_THEMES[cat]||CAT_THEMES["All"];
  const [pressed, setPressed] = useState(false);

  const handleClick = () => {
    setPressed(true);
    setTimeout(() => setPressed(false), 300);
    onClick();
  };

  return (
    <button onClick={handleClick}
      className="flex items-center gap-2 flex-shrink-0 rounded-2xl pl-1.5 pr-4 py-1.5 text-[12px] font-bold border-2 transition-all duration-300 select-none"
      style={{
        ...(active ? {
          background:theme.grad, color:"#fff", borderColor:"transparent",
          boxShadow:`0 4px 15px rgba(0,0,0,0.2)`, transform: pressed ? "scale(0.92)" : "scale(1.05)"
        } : {
          background:"rgba(255,255,255,0.7)", color:"#555", borderColor:"rgba(255,255,255,0.8)",
          backdropFilter:"blur(8px)", transform: pressed ? "scale(0.92)" : "scale(1)"
        }),
        transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1), background 0.3s ease, box-shadow 0.3s ease",
      }}>
      <span className="flex items-center justify-center rounded-full flex-shrink-0"
        style={{
          width: "26px", height: "26px", fontSize: "15px",
          background: active ? "rgba(255,255,255,0.25)" : theme.light,
          transform: pressed ? "rotate(15deg) scale(1.15)" : "rotate(0) scale(1)",
          transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        }}>
        {theme.icon}
      </span>
      {cat==="All"?"All Deals":cat}
    </button>
  );
}

function Field({ label, k, type="text", placeholder="", value, onChange, accentColor }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      <input type={type} value={value||""} onChange={e=>onChange(k, type==="number"?+e.target.value:e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl px-4 py-3 text-[13px] text-gray-800 focus:outline-none transition-all duration-200"
        style={{ background:"rgba(0,0,0,0.04)", border:"2px solid transparent" }}
        onFocus={e=>{e.target.style.borderColor=accentColor;e.target.style.background="rgba(255,255,255,0.9)";}}
        onBlur={e=>{e.target.style.borderColor="transparent";e.target.style.background="rgba(0,0,0,0.04)";}}/>
    </div>
  );
}

function ImageUploadField({ value, onChange, accentColor }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    setUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 600;
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = Math.round(height * (maxDim / width));
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round(width * (maxDim / height));
          height = maxDim;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.75;
        let compressed = canvas.toDataURL("image/jpeg", quality);
        while (compressed.length > 700000 && quality > 0.3) {
          quality -= 0.15;
          compressed = canvas.toDataURL("image/jpeg", quality);
        }

        onChange(compressed);
        setUploading(false);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Product image</label>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFile(e.target.files?.[0])}
        className="hidden"
      />

      {value ? (
        <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio:"1/1", maxWidth:"100%" }}>
          <img src={value} alt="Product" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center"
          >
            <X size={13} className="text-white" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-2 left-2 right-2 rounded-xl py-1.5 text-[11px] font-bold text-white text-center"
            style={{ background: "rgba(0,0,0,0.55)" }}
          >
            Change photo
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full rounded-2xl py-14 flex flex-col items-center justify-center gap-3 transition-all duration-200"
          style={{ background: "rgba(0,0,0,0.04)", border: `2px dashed ${accentColor}50` }}
        >
          {uploading ? (
            <>
              <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: accentColor, borderTopColor: "transparent" }} />
              <span className="text-[12px] font-medium text-gray-500">Processing...</span>
            </>
          ) : (
            <>
              <Package size={36} style={{ color: accentColor }} />
              <span className="text-[15px] font-bold" style={{ color: accentColor }}>Upload from gallery</span>
              <span className="text-[12px] text-gray-400">Tap to choose a photo</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

function ProductModal({ product, onSave, onClose }) {
  const [form,setForm]=useState(product||{ name:"",category:"Electronics",price:"",originalPrice:"",discount:"",rating:"",reviews:"",image:"",affiliateLink:"",badge:"",description:"",tags:"",subCategory:"",isOwnProduct:false });
  const [saved,setSaved]=useState(false);
  const [tagInput,setTagInput]=useState("");
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const platKey=detectPlatform(form.affiliateLink);
  const plat=PLATFORMS[platKey];
  const Logo=plat.logo;

  const addTag=(tag)=>{
    const t=tag.trim().toLowerCase().replace(/[^a-z0-9 ]/g,"");
    if(!t) return;
    const existing=(form.tags||"").split(",").map(x=>x.trim()).filter(Boolean);
    if(existing.includes(t)) return;
    set("tags",[...existing,t].join(","));
    setTagInput("");
  };

  const removeTag=(tag)=>{
    const existing=(form.tags||"").split(",").map(x=>x.trim()).filter(Boolean);
    set("tags",existing.filter(t=>t!==tag).join(","));
  };

  const handleSave=()=>{
    if(!form.name||!form.price||!form.affiliateLink) return;
    const disc=form.originalPrice&&form.price ? Math.round((1-form.price/form.originalPrice)*100) : form.discount;
    onSave({...form,id:form.id||Date.now().toString(),discount:disc});
    setSaved(true);
    setTimeout(onClose,700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      style={{ backgroundColor:"rgba(0,0,0,0.6)", backdropFilter:"blur(8px)" }} onClick={onClose}>
      <div className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[92vh]"
        style={{ background:"rgba(255,255,255,0.95)", backdropFilter:"blur(20px)", animation:"slideUp 0.4s cubic-bezier(0.32,0.72,0,1)" }}
        onClick={e=>e.stopPropagation()}>

        {/* Colourful header */}
        <div className="relative px-6 py-5 flex items-center justify-between overflow-hidden"
          style={{ background:plat.grad }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Package size={18} className="text-white"/>
            </div>
            <div>
              <p className="text-white/70 text-[11px] font-medium">Krazy Deals Admin</p>
              <p className="text-white font-bold text-[15px]">{product?"Edit Product":"Add New Product"}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30">
            <X size={15} className="text-white"/>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-4">
          <Field label="Product name *" k="name" placeholder="e.g. boAt Rockerz 450" value={form.name} onChange={set} accentColor={plat.color}/>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Category *</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.filter(c=>c!=="All").map(c=>{
                const t=CAT_THEMES[c];
                return <button key={c} onClick={()=>{ set("category",c); set("subCategory",""); }}
                  className="text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all duration-200"
                  style={form.category===c?{background:t.grad,color:"#fff",boxShadow:"0 3px 10px rgba(0,0,0,0.2)"}:{background:t.light,color:"#666"}}>
                  {t.icon} {c}
                </button>;
              })}
            </div>
          </div>

          {/* Sub-category - only for Fashion and Beauty */}
          {(form.category==="Fashion"||form.category==="Beauty") && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Sub-Category</label>
              <div className="flex gap-2 flex-wrap">
                {["Men","Women","Kids"].map(sub=>{
                  const grads={
                    "Men":"linear-gradient(135deg,#4facfe,#00f2fe)",
                    "Women":"linear-gradient(135deg,#f093fb,#f5576c)",
                    "Kids":"linear-gradient(135deg,#f7971e,#ffd200)"
                  };
                  const lights={"Men":"#e0f7ff","Women":"#fce4ff","Kids":"#fff8e1"};
                  const isActive=form.subCategory===sub;
                  return (
                    <button key={sub} onClick={()=>set("subCategory",isActive?"":sub)}
                      className="text-[12px] font-bold px-4 py-2 rounded-2xl transition-all duration-200 flex items-center gap-1.5"
                      style={isActive
                        ? { background:grads[sub], color:"#fff", boxShadow:"0 3px 10px rgba(0,0,0,0.2)" }
                        : { background:lights[sub], color:"#666" }}>
                      {sub==="Men"?"M":sub==="Women"?"W":"K"} {sub} Corner
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-gray-400">Optional - helps users filter by Men, Women or Kids</p>
            </div>
          )}

          {/* Affiliate link + live platform preview */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Affiliate Link *</label>
            <input type="text" value={form.affiliateLink||""} onChange={e=>set("affiliateLink",e.target.value)}
              placeholder="https://flipkart.com/... or amazon.in/..."
              className="w-full rounded-2xl px-4 py-3 text-[13px] text-gray-800 focus:outline-none transition-all duration-200"
              style={{ background:"rgba(0,0,0,0.04)", border:`2px solid ${plat.color}40` }}/>
            {form.affiliateLink && (
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl mt-1"
                style={{ background:plat.grad }}>
                <div className="w-2 h-2 rounded-full bg-white animate-pulse"/>
                <span className="text-white text-[11px] font-bold">Detected: {plat.name}</span>
                <div className="ml-auto bg-white/20 rounded-xl px-2 py-1"><Logo/></div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Selling price Rs. *" k="price" type="number" placeholder="1299" value={form.price} onChange={set} accentColor={plat.color}/>
            <Field label="Original price Rs." k="originalPrice" type="number" placeholder="3999" value={form.originalPrice} onChange={set} accentColor={plat.color}/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Rating (0-5)" k="rating" type="number" placeholder="4.2" value={form.rating} onChange={set} accentColor={plat.color}/>
            <Field label="Reviews count" k="reviews" type="number" placeholder="18432" value={form.reviews} onChange={set} accentColor={plat.color}/>
          </div>
          <ImageUploadField value={form.image} onChange={(val)=>set("image",val)} accentColor={plat.color}/>
          <Field label="Short description" k="description" placeholder="Key features in one line" value={form.description} onChange={set} accentColor={plat.color}/>

          {/* My Own Product toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl transition-all duration-200"
            style={{ background: form.isOwnProduct ? "rgba(37,211,102,0.1)" : "rgba(0,0,0,0.04)", border: form.isOwnProduct ? "2px solid rgba(37,211,102,0.4)" : "2px solid transparent" }}>
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] font-bold text-gray-800">My Own Product</span>
              <span className="text-[11px] text-gray-400">Turn ON to show WhatsApp order button on this product</span>
            </div>
            <button onClick={()=>set("isOwnProduct",!form.isOwnProduct)}
              className="relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0"
              style={{ background: form.isOwnProduct ? "#25D366" : "#d1d5db" }}>
              <span className="absolute top-0.5 transition-all duration-300 w-5 h-5 rounded-full bg-white shadow-sm"
                style={{ left: form.isOwnProduct ? "calc(100% - 22px)" : "2px" }}/>
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Badge</label>
            <div className="flex flex-wrap gap-2">
              {["","Bestseller","Deal of Day","Trending","Top Pick","New"].map(b=>(
                <button key={b} onClick={()=>set("badge",b)}
                  className="text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all duration-200"
                  style={form.badge===b
                    ? { background:BADGE_STYLES[b]||"linear-gradient(135deg,#888,#555)", color:"#fff", boxShadow:"0 3px 10px rgba(0,0,0,0.2)" }
                    : { background:"rgba(0,0,0,0.05)", color:"#666" }}>
                  {b||"None"}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Search Tags</label>
            <p className="text-[10px] text-gray-400">Add keywords so users can find this product easily. Press Enter or comma to add.</p>
            {/* Tag input */}
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={e=>setTagInput(e.target.value)}
                onKeyDown={e=>{
                  if(e.key==="Enter"||e.key===","){ e.preventDefault(); addTag(tagInput); }
                  if(e.key==="Backspace"&&!tagInput){
                    const existing=(form.tags||"").split(",").map(x=>x.trim()).filter(Boolean);
                    if(existing.length) removeTag(existing[existing.length-1]);
                  }
                }}
                placeholder="e.g. wireless, boat, audio..."
                className="flex-1 rounded-2xl px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none transition-all duration-200"
                style={{ background:"rgba(0,0,0,0.04)", border:`2px solid transparent` }}
                onFocus={e=>{e.target.style.borderColor=plat.color;}}
                onBlur={e=>{e.target.style.borderColor="transparent"; if(tagInput) addTag(tagInput);}}
              />
              <button onClick={()=>addTag(tagInput)}
                className="px-4 py-2 rounded-2xl text-[12px] font-bold text-white transition-all duration-200"
                style={{ background:plat.grad }}>
                Add
              </button>
            </div>
            {/* Tag chips */}
            {form.tags && (
              <div className="flex flex-wrap gap-2 mt-1">
                {form.tags.split(",").map(t=>t.trim()).filter(Boolean).map(tag=>(
                  <span key={tag} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-white"
                    style={{ background:"linear-gradient(135deg,#667eea,#764ba2)" }}>
                    #{tag}
                    <button onClick={()=>removeTag(tag)} className="hover:opacity-70 transition-opacity">
                      <X size={10}/>
                    </button>
                  </span>
                ))}
              </div>
            )}
            {/* Suggested tags based on category */}
            <div className="flex flex-wrap gap-1.5 mt-1">
              <span className="text-[10px] text-gray-400 w-full">Quick add:</span>
              {(form.category==="Electronics"?["wireless","bluetooth","charging","smart","4k","android"]:
                form.category==="Fashion"?["men","women","cotton","casual","formal","summer"]:
                form.category==="Beauty"?["skincare","makeup","organic","spf","moisturizer"]:
                form.category==="Home & Kitchen"?["kitchen","cooking","storage","decor","cleaning"]:
                form.category==="Sports"?["fitness","gym","outdoor","running","yoga"]:
                form.category==="Books"?["fiction","academic","self-help","children","novel"]:
                ["trending","popular","offer","sale"]
              ).map(suggestion=>(
                <button key={suggestion} onClick={()=>addTag(suggestion)}
                  className="text-[10px] px-2.5 py-1 rounded-full border transition-all duration-200 hover:scale-105"
                  style={{ borderColor:plat.color+"40", color:plat.color, background:plat.color+"10" }}>
                  +{suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 flex gap-3" style={{ borderTop:"1px solid rgba(0,0,0,0.06)" }}>
          <button onClick={onClose} className="flex-1 rounded-2xl py-3 text-[13px] font-bold text-gray-500 transition-colors hover:bg-gray-100">
            Cancel
          </button>
          <button onClick={handleSave}
            className="flex-1 rounded-2xl py-3 text-[13px] font-bold text-white transition-all duration-300 flex items-center justify-center gap-2"
            style={{ background:saved?"linear-gradient(135deg,#22c55e,#16a34a)":plat.grad, boxShadow:saved?"0 4px 15px #22c55e55":`0 4px 15px ${plat.color}55` }}>
            {saved?<><Check size={14}/>Saved!</>:(product?"Save changes":"Add product")}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatsBar({ products }) {
  const platforms = [...new Set(products.map(p=>detectPlatform(p.affiliateLink)))].length;
  const avgDisc = Math.round(products.reduce((a,p)=>a+(p.discount||0),0)/(products.length||1));
  const stats=[
    { icon:"", label:"Products", value:products.length, grad:"linear-gradient(135deg,#667eea,#764ba2)" },
    { icon:"", label:"Platforms", value:platforms,       grad:"linear-gradient(135deg,#f093fb,#f5576c)" },
    { icon:"", label:"Avg Off",   value:`${avgDisc}%`,   grad:"linear-gradient(135deg,#4facfe,#00f2fe)" },
    { icon:"*", label:"Avg Rating",value:(products.reduce((a,p)=>a+(p.rating||0),0)/(products.length||1)).toFixed(1), grad:"linear-gradient(135deg,#f7971e,#ffd200)" },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {stats.map(s=>(
        <div key={s.label} className="rounded-3xl p-4 flex items-center gap-3 transition-all duration-300 hover:scale-105 cursor-default"
          style={{ background:"rgba(255,255,255,0.7)", backdropFilter:"blur(20px)", boxShadow:"0 4px 20px rgba(0,0,0,0.07)" }}>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0" style={{ background:s.grad }}>
            {s.icon}
          </div>
          <div>
            <p className="text-[18px] font-black text-gray-900 leading-none">{s.value}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SettingsPanel({ settings, onSave, saved }) {
  const [form, setForm] = useState({ ...settings });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => { setForm({ ...settings }); }, [settings]);

  const SField = ({ label, k, placeholder = "", hint = "" }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      {hint && <p className="text-[10px] text-gray-400">{hint}</p>}
      <input
        value={form[k] || ""}
        onChange={e => set(k, e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl px-4 py-3 text-[13px] text-gray-800 focus:outline-none transition-all duration-200"
        style={{ background:"rgba(0,0,0,0.04)", border:"2px solid transparent" }}
        onFocus={e => { e.target.style.borderColor="#667eea"; e.target.style.background="rgba(255,255,255,0.9)"; }}
        onBlur={e => { e.target.style.borderColor="transparent"; e.target.style.background="rgba(0,0,0,0.04)"; }}
      />
    </div>
  );

  return (
    <div className="mb-10">
      <div className="rounded-3xl overflow-hidden"
        style={{ background:"rgba(255,255,255,0.85)", backdropFilter:"blur(20px)", boxShadow:"0 4px 30px rgba(0,0,0,0.08)" }}>

        {/* Header */}
        <div className="px-6 py-5 flex items-center gap-3"
          style={{ background:"linear-gradient(135deg,#667eea,#764ba2)" }}>
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <Zap size={18} className="text-white"/>
          </div>
          <div>
            <p className="text-white font-bold text-[15px]">Site Settings</p>
            <p className="text-white/70 text-[11px]">Changes go live instantly for all visitors</p>
          </div>
        </div>

        <div className="p-6 flex flex-col gap-5">

          {/* Branding */}
          <div>
            <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-3">Branding</p>
            <div className="flex flex-col gap-4">

              {/* Logo upload */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Logo Image</label>
                <p className="text-[10px] text-gray-400">Upload your own logo image (shows in navbar)</p>
                <div className="flex items-center gap-3">
                  {form.logoImage ? (
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-gray-100 flex-shrink-0">
                      <img src={form.logoImage} alt="Logo" className="w-full h-full object-contain p-1"/>
                      <button onClick={()=>setForm(f=>({...f,logoImage:""}))}
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <X size={10} className="text-white"/>
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center flex-shrink-0"
                      style={{ background:"rgba(0,0,0,0.02)" }}>
                      <Package size={20} className="text-gray-300"/>
                    </div>
                  )}
                  <div className="flex-1">
                    <input type="file" accept="image/*" id="logoUpload" className="hidden"
                      onChange={e=>{
                        const file=e.target.files?.[0];
                        if(!file) return;
                        const reader=new FileReader();
                        reader.onload=ev=>{
                          const img=new Image();
                          img.onload=()=>{
                            const canvas=document.createElement("canvas");
                            const max=200;
                            let {width:w,height:h}=img;
                            if(w>h&&w>max){h=Math.round(h*(max/w));w=max;}
                            else if(h>max){w=Math.round(w*(max/h));h=max;}
                            canvas.width=w; canvas.height=h;
                            canvas.getContext("2d").drawImage(img,0,0,w,h);
                            setForm(f=>({...f,logoImage:canvas.toDataURL("image/png",0.9)}));
                          };
                          img.src=ev.target.result;
                        };
                        reader.readAsDataURL(file);
                      }}/>
                    <label htmlFor="logoUpload"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl cursor-pointer text-[12px] font-bold text-white w-full justify-center"
                      style={{ background:"linear-gradient(135deg,#667eea,#764ba2)" }}>
                      Upload Logo
                    </label>
                    <p className="text-[10px] text-gray-400 mt-1 text-center">PNG with transparent background works best</p>
                  </div>
                </div>
              </div>

              <SField label="Site Name" k="siteName" placeholder="Krazy Deals"
                hint="Appears in the navbar logo and footer"/>
              <SField label="Tagline" k="tagline" placeholder="Krazy deals, unreal prices."
                hint="Shown below the main headline on the homepage"/>
            </div>
          </div>

          <div style={{ height:"1px", background:"rgba(0,0,0,0.06)" }}/>

          {/* Social Links */}
          <div>
            <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-3">Social Media Links</p>
            <div className="flex flex-col gap-4">

              {/* Instagram preview */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Instagram URL</label>
                <p className="text-[10px] text-gray-400">e.g. https://instagram.com/yourusername</p>
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background:"linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)" }}>
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <input value={form.instagram || ""} onChange={e => set("instagram", e.target.value)}
                    placeholder="https://instagram.com/yourusername"
                    className="flex-1 rounded-2xl px-4 py-3 text-[13px] text-gray-800 focus:outline-none transition-all duration-200"
                    style={{ background:"rgba(0,0,0,0.04)", border:"2px solid transparent" }}
                    onFocus={e => { e.target.style.borderColor="#e6683c"; e.target.style.background="rgba(255,255,255,0.9)"; }}
                    onBlur={e => { e.target.style.borderColor="transparent"; e.target.style.background="rgba(0,0,0,0.04)"; }}/>
                </div>
              </div>

              {/* Telegram */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Telegram URL</label>
                <p className="text-[10px] text-gray-400">e.g. https://t.me/yourusername</p>
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background:"linear-gradient(135deg,#2AABEE,#229ED9)" }}>
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.820 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                  </div>
                  <input value={form.telegram || ""} onChange={e => set("telegram", e.target.value)}
                    placeholder="https://t.me/yourusername"
                    className="flex-1 rounded-2xl px-4 py-3 text-[13px] text-gray-800 focus:outline-none transition-all duration-200"
                    style={{ background:"rgba(0,0,0,0.04)", border:"2px solid transparent" }}
                    onFocus={e => { e.target.style.borderColor="#2AABEE"; e.target.style.background="rgba(255,255,255,0.9)"; }}
                    onBlur={e => { e.target.style.borderColor="transparent"; e.target.style.background="rgba(0,0,0,0.04)"; }}/>
                </div>
              </div>

              <SField label="Email" k="email" placeholder="youremail@gmail.com"/>
              <SField label="WhatsApp link (optional)" k="whatsapp"
                placeholder="https://wa.me/91XXXXXXXXXX"
                hint="e.g. https://wa.me/919876543210 - leave blank to hide"/>
            </div>
          </div>

          {/* Save button */}
          <button onClick={() => onSave(form)}
            className="w-full rounded-2xl py-3.5 text-[14px] font-bold text-white transition-all duration-300 flex items-center justify-center gap-2"
            style={{ background: saved ? "linear-gradient(135deg,#22c55e,#16a34a)" : "linear-gradient(135deg,#667eea,#764ba2)",
              boxShadow: saved ? "0 4px 20px rgba(34,197,94,0.4)" : "0 4px 20px rgba(102,126,234,0.4)" }}>
            {saved ? <><Check size={16}/>Saved! Changes are live</> : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}


const ADMIN_PASSWORD = "krazy123";

// Bottom Navigation Bar - fixed, mobile app style
function BottomNav({ activeTab, onTabChange, darkMode, cartCount }) {
  const tabs = [
    { key:"home", label:"Home", icon: (active) => (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill={active?"currentColor":"none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ) },
    { key:"search", label:"Search", icon: (active) => (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      ) },
    { key:"categories", label:"Categories", icon: (active) => (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill={active?"currentColor":"none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
        </svg>
      ) },
    { key:"wishlist", label:"Wishlist", icon: (active) => (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill={active?"currentColor":"none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      ) },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden px-3 pb-3">
      <div className="max-w-[500px] mx-auto rounded-3xl flex items-center justify-around px-2 py-2"
        style={{
          background: darkMode ? "rgba(30,30,46,0.92)" : "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
          border: darkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(255,255,255,0.9)",
        }}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => onTabChange(tab.key)}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-300"
              style={{
                color: isActive ? "#F26522" : (darkMode ? "#94a3b8" : "#9ca3af"),
                transform: isActive ? "translateY(-2px)" : "translateY(0)",
              }}>
              {tab.key==="wishlist" && cartCount>0 && (
                <span className="absolute -top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center" style={{fontSize:"9px", fontWeight:"bold"}}>
                  {cartCount>9?"9+":cartCount}
                </span>
              )}
              {tab.icon(isActive)}
              <span style={{ fontSize:"9px", fontWeight: isActive?"700":"500" }}>{tab.label}</span>
              {isActive && (
                <span className="absolute -bottom-0.5 w-1 h-1 rounded-full" style={{ background:"#F26522" }}/>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { PLATFORMS, detectPlatform, CAT_THEMES, CATEGORIES, ADMIN_PASSWORD, defaultProducts, FloatingOrbs, DealTicker, Stars, BADGE_STYLES, Badge, ShopBtn, ProductCard, SkeletonCard, CatPill, Field, ImageUploadField, ProductModal, StatsBar, SettingsPanel, ScrollReveal, ProductPage, BottomNav };