import Search from "./scripts/search.js";
import Recipe from "./scripts/recipe.js";
import { ele, notify, renderLoader, renderResults } from "./scripts/ui.js";
import { categories } from "./scripts/constant.js";
// uuid kütüphanesinden id oluşturma methodu import etme
import { v4 } from "https://jspm.dev//uuid";

// class'ın örneğini oluşturma
const search = new Search();
const recipe = new Recipe();

//! Olay İzleyicileri

// sayfa yüklenme olayını izler
document.addEventListener("DOMContentLoaded", () => {
  // rastgele kategori seç
  const index = Math.floor(Math.random() * categories.length);

  // Kategori verilerini al ve erkana bas.
  getResults(categories[index]);
});

// Formun gönderilme olayını izler
ele.form.addEventListener("submit", (e) => {
  e.preventDefault();
  const query = e.target[0].value;
  getResults(query);
});

// Sayfa yüklenme olayını izle.
window.addEventListener("DOMContentLoaded", () => {
  controlUrl();
  renderBasketItems();
});

// Url'deki id'nin değişme olayını izle
window.addEventListener("hashchange", controlUrl);

// Tarif alnındaki tıklanmma olaylarını izle
ele.recipe_area.addEventListener("click", handleClick);

//! Fonksiyonlar
// Arama Sonuçlarını alıp ekrana basar
async function getResults(query) {
  // Arama terimi var mı kontrol et.
  if (!query.trim()) {
    return notify("Arama terimi giriniz!");
  }

  // Loader bas
  renderLoader(ele.result_list);

  try {
    // API'dan verileri al
    await search.fetchResults(query.trim());

    if (search.results.error) {
      // veri hatalı geldiyse ekrana uyarı bas
      notify("This recipe could not be found");

      // Loader'ı kaldır
      ele.result_list.innerHTML = "";
    } else {
      // Sonucları ekrana bas.
      renderResults(search.results.recipes);
    }
  } catch (err) {
    // hata olursa bildirim ver
    notify("Bir sorun oluştu");
    // loader'ı kaldır
    ele.result_list.innerHTML = "";
  }
}

// Detay verilerini alıp ekrana basar.
async function controlUrl() {
  // detayı gösterilicek olan ürünün id'sine eriş
  const id = location.hash.slice(1);

  if (id) {
    // yükleniyor'a bas
    renderLoader(ele.recipe_area);

    // Tarif bilgilerini al
    await recipe.getRecipe(id);

    // Tarif bilgilerini ekrana bas.
    recipe.renderRecipe(recipe.info);
  }
}

//! Sepete Alanı
let basket = JSON.parse(localStorage.getItem("basket")) || [];

// Tarif alanındaki tıklamalarda çalışır.
function handleClick(e) {
  if (e.target.id === "add-to-cart") {
    // Bütün malzemleri sepete ekle
    recipe.info.ingredients.forEach((title) => {
      //  Her bir tarif için yeni bir obje oluştur ve id ekle
      const newItem = {
        id: v4(),
        title,
      };

      // oluşturulan id'li tarifi sepete ekle
      basket.push(newItem);
    });

    // Local'ı güncelle
    localStorage.setItem("basket", JSON.stringify(basket));

    // Sepette arayüzünü güncelle
    renderBasketItems();
  }
}

// tarif verilerini ekrana bsar
function renderBasketItems() {
  ele.basket_list.innerHTML = basket
    .map(
      (i) => `
  <li data-id="${i.id}">
    <i id="delete-item" class="bi bi-x"></i>
    <span>${i.title}</span>
  </li>
  `
    )
    .join(" ");
}

// silme butona tıklanma olayı
ele.clear_btn.addEventListener("click", () => {
  const res = confirm("Sepet temizlenecek emin misniz?");

  if (res) {
    // sepet dizisini sıfırla
    basket = [];

    // Local'i temizle
    localStorage.removeItem("basket");

    // arayüz'u temizle
    ele.basket_list.innerHTML = "";
  }
});

// tek tek silme
ele.basket_list.addEventListener("click", (e) => {
  if (e.target.id == "delete-item") {
    // Tıklana elemanın id'sine eriş
    const parent = e.target.parentElement;
    const id = parent.dataset.id;

    // id'sine göre diziden kaldırma
    basket = basket.filter((i) => i.id !== id);

    // Local'e güncel diziyi aktar
    localStorage.setItem("basket", JSON.stringify(basket));

    // Arayüzden ilgili elemanı kaldır
    parent.remove();
  }
});
