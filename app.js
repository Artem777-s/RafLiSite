(function(){
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const LS = localStorage;

  // set years
  Array.from(document.querySelectorAll('span[id^="year"]')).forEach(e=>e.textContent = new Date().getFullYear());

  // default admin and products
  if(!LS.getItem('rafli_users')){
    const users=[{email:'admin@rafli.test', password:'admin123', role:'admin'}];
    LS.setItem('rafli_users', JSON.stringify(users));
  }
  if(!LS.getItem('rafli_products')){
    const products=[{id:Date.now(), name:'Переносная лежанка (беж)', price:'5490', desc:'Антислип, антивандальный велюр, синтепон — идеальна для путешествий.', img:'images/product1.jpg'}];
    LS.setItem('rafli_products', JSON.stringify(products));
  }

  // register pet form
  const petForm = $('#petForm');
  if(petForm){
    petForm.addEventListener('submit', function(e){
      e.preventDefault();
      const pet = {
        name: $('#petName').value.trim(),
        breed: $('#petBreed').value.trim(),
        age: $('#petAge').value.trim(),
        dob: $('#petDob').value,
        chip: $('#petChip').value.trim(),
        owner: $('#ownerInfo').value.trim(),
        city: $('#petCity').value.trim(),
        vet: $('#petVet').value.trim(),
        food: $('#petFood').value.trim(),
        notes: $('#petNotes').value.trim(),
        created: Date.now()
      };
      // encode pet as base64 JSON
      const json = JSON.stringify(pet);
      // encode to base64 safely
      function strToB64(str){ return btoa(unescape(encodeURIComponent(str))); }
      const b64 = strToB64(json);
      // create URL relative to current origin
      const petUrl = window.location.origin + window.location.pathname.replace(/register\.html$/, '') + 'pet.html?data=' + encodeURIComponent(b64);
      // set link and QR image using Google Chart API
      $('#petLink').textContent = petUrl;
      $('#petLink').href = petUrl;
      const qrUrl = 'https://chart.googleapis.com/chart?chs=400x400&cht=qr&chl=' + encodeURIComponent(petUrl);
      $('#qrImg').src = qrUrl;
      $('#result').classList.remove('hidden');
      // scroll to result
      $('#result').scrollIntoView({behavior:'smooth'});
      // Also store a small index of created pet links in localStorage for the user (optional)
      const myPets = JSON.parse(LS.getItem('rafli_created_pets') || '[]');
      myPets.unshift({name:pet.name, url:petUrl, created:Date.now()});
      LS.setItem('rafli_created_pets', JSON.stringify(myPets));
    });
  }

  // download QR button - create link to Google image
  const dl = $('#downloadQr');
  if(dl){
    dl.addEventListener('click', function(){
      const img = $('#qrImg');
      if(!img || !img.src) return;
      // open image in new tab for manual save (simpler and reliable)
      window.open(img.src, '_blank');
    });
  }

  // render products on shop page
  function renderProducts(){
    const grid = $('#productsGrid');
    if(!grid) return;
    const products = JSON.parse(LS.getItem('rafli_products') || '[]');
    grid.innerHTML = products.map(p=>`
      <article class="product">
        <img src="${p.img}" alt="${p.name}">
        <h4>${p.name}</h4>
        <p>${p.desc}</p>
        <p><strong>${p.price} ₽</strong></p>
      </article>
    `).join('');
  }
  renderProducts();

  // admin add product
  const productForm = $('#productForm');
  if(productForm){
    const cur = JSON.parse(LS.getItem('rafli_current') || 'null');
    if(cur){
      const users = JSON.parse(LS.getItem('rafli_users') || '[]');
      const u = users.find(x=>x.email===cur.email);
      if(u && u.role==='admin') productForm.classList.remove('hidden');
    }
    productForm.addEventListener('submit', function(e){
      e.preventDefault();
      const name = $('#pName').value.trim();
      const price = $('#pPrice').value.trim();
      const desc = $('#pDesc').value.trim();
      const img = $('#pImage').value.trim() || 'images/product1.jpg';
      const products = JSON.parse(LS.getItem('rafli_products') || '[]');
      products.unshift({id:Date.now(), name, price, desc, img});
      LS.setItem('rafli_products', JSON.stringify(products));
      renderProducts();
      alert('Товар добавлен');
    });
  }

})();