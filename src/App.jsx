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
  const [uplo