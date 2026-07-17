export default function sitemap() {
  const base = "https://yozgatyeminlitercuman.com";
  const routes = ["", "/en", "/ar", "/gizlilik-politikasi", "/kvkk-aydinlatma-metni", "/cerez-politikasi", "/kullanim-kosullari"];
  return routes.map((route, index) => ({
    url: `${base}${route}`, lastModified: new Date(),
    changeFrequency: index === 0 ? "weekly" : "yearly",
    priority: index === 0 ? 1 : 0.3
  }));
}
