export default class Search {
  constructor() {
    // Sonuclar
    this.results = [];
  }

  // API'dan arama sonuçlarını alan bir method
  async fetchResults(query) {
    try {
      // Aratılan teirme uygun tarifleri al.
      const res = await fetch(
        `https://forkify-api.herokuapp.com/api/search?q=${query}`
      );

      // gelen cevabı işle
      const data = await res.json();

      // sınıf içerisndeki değişkene data'yı aktar.
      this.results = data;
    } catch (err) {
      console.log("hata oluştu", err);
    }
  }
}
