async function test() {
  const res = await fetch("http://localhost:5173/src/Pages/OwnerReviews.css?t=" + Date.now());
  const text = await res.text();
  console.log("OwnerReviews.css Length:", text.length);
  const idx = text.indexOf("review-kpi-card");
  console.log("Index of review-kpi-card:", idx);
}
test();
