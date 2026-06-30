import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search, Plus, X, ArrowRight, Tag, Package,
  Star, Edit2, Trash2, Filter, Grid, List, Check,
  Home, Shirt, Monitor, BookOpen, Dumbbell, Zap,
  TrendingUp, Flame, ShoppingCart, Heart, Eye,
  Sparkles, ChevronRight, Bell
} from "lucide-react";

// --- PLATFORM CONFIG ----------------------------------------------------------
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

// --- CATEGORY COLOURS ---------------------------------------------------------
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
// Firestore collection name used: "products" (see App component below)

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

// --- FLOATING ORBS BACKGROUND ------------------------------------------------
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

// --- TICKER ------------------------------------------------------------------
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

// --- STARS -------------------------------------------------------------------
function Stars({ rating, size=11 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i=>(
        <Star key={i} size={size} className={i<=Math.round(rating)?"fill-amber-400 text-amber-400":"text-gray-200"} />
      ))}
    </div>
  );
}

// --- BADGE -------------------------------------------------------------------
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

// --- SHOP BUTTON -------------------------------------------------------------
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

// --- PRODUCT CARD -------------------------------------------------------------
function ProductCard({ product, onEdit, onDelete, isAdmin }) {
  const [hov,setHov]=useState(false);
  const [liked,setLiked]=useState(false);
  const [addedCart,setAddedCart]=useState(false);
  const platKey=detectPlatform(product.affiliateLink);
  const plat=PLATFORMS[platKey];
  const catTheme=CAT_THEMES[product.category]||CAT_THEMES["All"];

  const handleCart=()=>{
    setAddedCart(true);
    setTimeout(()=>setAddedCart(false),1500);
  };

  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      className="relative rounded-3xl overflow-hidden flex flex-col transition-all duration-400 group"
      style={{
        background:"rgba(255,255,255,0.85)",
        backdropFilter:"blur(20px)",
        boxShadow: hov ? "0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.8)" : "0 4px 20px rgba(0,0,0,0.07), 0 0 0 1px rgba(255,255,255,0.6)",
        transform: hov ? "translateY(-6px) scale(1.01)" : "translateY(0) scale(1)",
        transition:"all 0.35s cubic-bezier(0.34,1.56,0.64,1)"
      }}>

      {/* Colour accent top bar */}
      <div className="h-1 w-full" style={{ background:catTheme.grad }}/>

      {/* Image */}
      <div className="relative overflow-hidden flex items-center justify-center"
        style={{ aspectRatio:"1/1", background:`linear-gradient(145deg,${catTheme.light},#fff)` }}>
        <img src={product.image} alt={product.name}
          className="w-full h-full object-contain p-5 transition-transform duration-500"
          style={{ transform:hov?"scale(1.1) rotate(1deg)":"scale(1) rotate(0)" }}
          onError={e=>{e.target.style.display="none";}}/>

        {/* Overlays */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.badge && <Badge label={product.badge}/>}
        </div>

        {/* Discount pill top-right */}
        {product.discount>0 && (
          <div className="absolute top-3 right-3 flex flex-col items-center justify-center w-11 h-11 rounded-full text-white font-black text-[11px] leading-none shadow-lg"
            style={{ background:"linear-gradient(135deg,#f5576c,#c0392b)" }}>
            <span>-{product.discount}</span>
            <span style={{fontSize:"9px"}}>%</span>
          </div>
        )}

        {/* Hover action bar */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2.5 transition-all duration-300"
          style={{
            background:"linear-gradient(0deg,rgba(0,0,0,0.5),transparent)",
            opacity:hov?1:0, transform:hov?"translateY(0)":"translateY(8px)"
          }}>
          <button onClick={()=>setLiked(l=>!l)}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
            style={{ background:liked?"#ef4444":"rgba(255,255,255,0.2)", backdropFilter:"blur(4px)" }}>
            <Heart size={14} className={liked?"fill-white text-white":"text-white"}/>
          </button>
          <button onClick={handleCart}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold text-white transition-all duration-200"
            style={{ background:addedCart?"#22c55e":"rgba(255,255,255,0.2)", backdropFilter:"blur(4px)" }}>
            {addedCart?<><Check size={11}/>Added!</>:<><ShoppingCart size={11}/>Quick add</>}
          </button>
          {isAdmin && (
            <div className="flex gap-1">
              <button onClick={()=>onEdit(product)} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40">
                <Edit2 size={12} className="text-white"/>
              </button>
              <button onClick={()=>onDelete(product.id)} className="w-8 h-8 rounded-full bg-red-500/60 backdrop-blur-sm flex items-center justify-center hover:bg-red-500/80">
                <Trash2 size={12} className="text-white"/>
              </button>
            </div>
          )}
        </div>

        {/* Platform logo bottom-left (always visible, subtle) */}
        <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-0"
          style={{ display:"none" }}/>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* Category + platform */}
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{ background:catTheme.light, color:"#555" }}>
            {catTheme.icon} {product.category}
          </span>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white shadow-sm"
            style={{ background:plat.grad }}>
            {plat.name}
          </span>
        </div>

        <h3 className="text-[13px] font-semibold text-gray-800 leading-snug line-clamp-2">{product.name}</h3>

        {product.description && (
          <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">{product.description}</p>
        )}

        <div className="flex items-center gap-1.5">
          <Stars rating={product.rating}/>
          <span className="text-[10px] text-gray-400">({product.reviews?.toLocaleString()})</span>
        </div>

        {/* Price row */}
        <div className="flex items-center gap-2 mt-auto">
          <span className="text-[17px] font-black text-gray-900">Rs.{product.price?.toLocaleString()}</span>
          {product.originalPrice>product.price && (
            <span className="text-[11px] text-gray-400 line-through">Rs.{product.originalPrice?.toLocaleString()}</span>
          )}
          {product.discount>0 && (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full ml-auto">
              Save Rs.{(product.originalPrice-product.price)?.toLocaleString()}
            </span>
          )}
        </div>

        <div className="pt-1">
          <ShopBtn url={product.affiliateLink}/>
        </div>
      </div>
    </div>
  );
}

// --- CATEGORY PILL -----------------------------------------------------------
function CatPill({ cat, active, onClick }) {
  const theme = CAT_THEMES[cat]||CAT_THEMES["All"];
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 flex-shrink-0 rounded-2xl px-4 py-2 text-[12px] font-bold border-2 transition-all duration-300 select-none"
      style={active ? {
        background:theme.grad, color:"#fff", borderColor:"transparent",
        boxShadow:`0 4px 15px rgba(0,0,0,0.2)`, transform:"scale(1.05)"
      } : {
        background:"rgba(255,255,255,0.7)", color:"#555", borderColor:"rgba(255,255,255,0.8)",
        backdropFilter:"blur(8px)"
      }}>
      <span>{theme.icon}</span>
      {cat==="All"?"All Deals":cat}
    </button>
  );
}

// --- PRODUCT MODAL -----------------------------------------------------------
// Defined OUTSIDE ProductModal so it's never recreated on re-render --
// this is what keeps the keyboard from closing after every keystroke.
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

// Lets the user pick a photo straight from their phone's gallery.
// The image is converted to a compressed base64 data URL so it can be
// saved directly in localStorage -- no external image hosting needed.
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
        // Resize down to keep storage small (max 800px on the longest side)
        const maxDim = 800;
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
        const compressed = canvas.toDataURL("image/jpeg", 0.82);
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
        <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio:"1/1", maxWidth:"180px" }}>
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
          className="w-full rounded-2xl py-6 flex flex-col items-center justify-center gap-2 transition-all duration-200"
          style={{ background: "rgba(0,0,0,0.04)", border: `2px dashed ${accentColor}50` }}
        >
          {uploading ? (
            <>
              <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: accentColor, borderTopColor: "transparent" }} />
              <span className="text-[12px] font-medium text-gray-500">Processing...</span>
            </>
          ) : (
            <>
              <Package size={22} style={{ color: accentColor }} />
              <span className="text-[12px] font-bold" style={{ color: accentColor }}>Upload from gallery</span>
              <span className="text-[10px] text-gray-400">Tap to choose a photo</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

function ProductModal({ product, onSave, onClose }) {
  const [form,setForm]=useState(product||{ name:"",category:"Electronics",price:"",originalPrice:"",discount:"",rating:"",reviews:"",image:"",affiliateLink:"",badge:"",description:"" });
  const [saved,setSaved]=useState(false);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const platKey=detectPlatform(form.affiliateLink);
  const plat=PLATFORMS[platKey];
  const Logo=plat.logo;

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
                return <button key={c} onClick={()=>set("category",c)}
                  className="text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all duration-200"
                  style={form.category===c?{background:t.grad,color:"#fff",boxShadow:"0 3px 10px rgba(0,0,0,0.2)"}:{background:t.light,color:"#666"}}>
                  {t.icon} {c}
                </button>;
              })}
            </div>
          </div>

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

// --- STATS BAR ---------------------------------------------------------------
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

// --- ADMIN PASSWORD ----------------------------------------------------------
// Change this to your own secret password before publishing!
const ADMIN_PASSWORD = "krazy123";

// --- MAIN APP ----------------------------------------------------------------
export default function App() {
  const [products,setProducts]=useState([]);
  const [view,setView]=useState("store");
  const [search,setSearch]=useState("");
  const [activeCategory,setActiveCategory]=useState("All");
  const [sortBy,setSortBy]=useState("default");
  const [layout,setLayout]=useState("grid");
  const [modal,setModal]=useState(null);
  const [loaded,setLoaded]=useState(false);
  const [searchFocused,setSearchFocused]=useState(false);
  const [isAdminUnlocked,setIsAdminUnlocked]=useState(false);
  const [showPasswordPrompt,setShowPasswordPrompt]=useState(false);
  const [passwordInput,setPasswordInput]=useState("");
  const [passwordError,setPasswordError]=useState(false);

  // Check if already unlocked this session
  useEffect(() => {
    if (sessionStorage.getItem("krazy-admin-unlocked") === "true") {
      setIsAdminUnlocked(true);
    }
    // Secret admin entry: visit yoursite.com/?admin=true to reveal the password prompt.
    // No visible button anywhere on the site triggers this -- only someone who
    // knows this exact URL trick can open it.
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

  const STORAGE_KEY = "krazy-deals-v2";

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setProducts(raw ? JSON.parse(raw) : defaultProducts);
    } catch { setProducts(defaultProducts); }
    setLoaded(true);
  }, []);

  const save = (prods) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prods)); } catch {}
  };

  const addProduct = (p) => {
    const next = [...products.filter(x => x.id !== p.id), p];
    setProducts(next); save(next); setModal(null);
  };

  const deleteProduct = (id) => {
    if (!confirm("Delete this product?")) return;
    const next = products.filter(p => p.id !== id);
    setProducts(next); save(next);
  };

  const filtered=products.filter(p=>{
    const matchCat=activeCategory==="All"||p.category===activeCategory;
    const q=search.toLowerCase();
    return matchCat&&(!q||p.name.toLowerCase().includes(q)||p.category.toLowerCase().includes(q));
  }).sort((a,b)=>{
    if(sortBy==="price-asc") return a.price-b.price;
    if(sortBy==="price-desc") return b.price-a.price;
    if(sortBy==="rating") return b.rating-a.rating;
    if(sortBy==="discount") return b.discount-a.discount;
    return 0;
  });

  if(!loaded) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:"linear-gradient(135deg,#667eea,#764ba2,#f5576c)" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-2xl font-black text-white shadow-2xl animate-bounce"
          style={{ background:"rgba(255,255,255,0.2)", backdropFilter:"blur(10px)" }}>KD</div>
        <div className="w-8 h-8 rounded-full border-3 border-white border-t-transparent animate-spin" style={{ borderWidth:3 }}/>
      </div>
    </div>
  );

  const catTheme = CAT_THEMES[activeCategory] || CAT_THEMES["All"];

  return (
    <div className="min-h-screen font-sans relative" style={{ background:"linear-gradient(160deg,#f8f9ff 0%,#fef3fb 50%,#f0f9ff 100%)" }}>
      <FloatingOrbs/>

      <style>{`
        @keyframes slideUp{from{transform:translateY(50px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .line-clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        * { box-sizing: border-box; }
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
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                style={{ background:"linear-gradient(135deg,#667eea,#764ba2)" }}>
                <span className="text-white font-black text-[12px] tracking-tight">KD</span>
              </div>
              <div className="hidden sm:flex flex-col leading-none">
                <span className="font-black text-gray-900 tracking-tight" style={{ fontSize:"16px" }}>Krazy</span>
                <span className="font-black tracking-tight" style={{ fontSize:"16px", background:"linear-gradient(135deg,#f5576c,#FC2779)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginTop:"-2px" }}>Deals *</span>
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
            <p className="text-gray-400 mt-1 text-[13px]">Manage your entire product catalogue.</p>
            <div className="mt-5"><StatsBar products={products}/></div>
          </div>
        )}

        {/* -- CATEGORY PILLS -- */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 mb-5" style={{ scrollbarWidth:"none" }}>
          {CATEGORIES.map(cat=>(
            <CatPill key={cat} cat={cat} active={activeCategory===cat} onClick={()=>setActiveCategory(cat)}/>
          ))}
        </div>

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
              <option value="default">* Featured</option>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {filtered.map((p,i)=>(
              <div key={p.id} style={{ animation:`fadeIn 0.4s ease ${i*0.05}s both` }}>
                <ProductCard product={p} isAdmin={view==="admin"} onEdit={p=>setModal(p)} onDelete={deleteProduct}/>
              </div>
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
                <div key={p.id}
                  className="flex items-center gap-4 p-4 rounded-3xl transition-all duration-300 hover:scale-[1.01]"
                  style={{ background:"rgba(255,255,255,0.8)", backdropFilter:"blur(20px)", boxShadow:"0 4px 20px rgba(0,0,0,0.07)", animation:`fadeIn 0.3s ease ${i*0.04}s both` }}>
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
              );
            })}
          </div>
        )}
      </div>

      {/* -- MODAL -- */}
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
  );
}