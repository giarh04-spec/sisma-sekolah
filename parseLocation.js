function parseLocation(text) {
  const match = text.match(/\(([^)]+)\)/);
  return match;
}
console.log(parseLocation("Gerbang Utama Sekolah (-6.200000, 106.816666)"));
