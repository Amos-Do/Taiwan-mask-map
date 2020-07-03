let data;
let storeData = [];
let starData = JSON.parse(localStorage.getItem('myStar')) || [];
let storeList = document.querySelector('.store-items');
let loading = document.getElementById('loading');

// 以台北 101 為最初定位
let myLocation = {
  lat: 25.033976,
  lng: 121.562344,
}
// 先載入地圖
let map = L.map("map", {
  center: [myLocation.lat, myLocation.lng],
  zoom: 15,
  // 刪除預設 zoomControl
  zoomControl: false,
});
// 自訂 zoomControl 位置
L.control.zoom({
  position: 'bottomright',
}).addTo(map);
// 拉進 OSM 圖資
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
}).addTo(map);

let redIcon = new L.Icon({
  iconUrl:
    "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
let greyIcon = new L.Icon({
  iconUrl:
    "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// 初始定位 marker
let locatMarker = L.marker([myLocation.lat, myLocation.lng], { icon: redIcon }).addTo(map);
// marker 群組圖層
let markers = new L.MarkerClusterGroup().addTo(map);

function geo() {
  // 確認使用者裝置能不能抓到定位
  if ("geolocation" in navigator) {
    // getCurrentPosition（）非同步請求，允許取的位置後才抓使用者的 lat lng
    navigator.geolocation.getCurrentPosition(success, error);

    function success(position) {
      loading.setAttribute('class', 'd-block');
      myLocation.lat = position.coords.latitude;
      myLocation.lng = position.coords.longitude;
      // 轉移 locatMarker 的 marker 位置 至 定位點
      locatMarker.setLatLng([myLocation.lat, myLocation.lng]);
      // 將畫面移到該定位
      map.setView([myLocation.lat, myLocation.lng], 15);
      
      addDataMarker();
      storeInfo(storeData);
      loading.setAttribute('class', 'd-none');
    };

    function error() {
      alert('抱歉，無法取得您的位置。如需使用請點選「允許」即可取得目前定位。');
    }

  } else {
    alert('Sorry, 你的裝置不支援地理位置定位功能。')
  }
}

// 等待非同步操作完成的物件，當事件完成時，Promise 根據操作結果是成功、或者失敗
let promise = new Promise(function (resolve, reject) {
  let xhr = new XMLHttpRequest();
  xhr.open(
    'get',
    'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json',
    true
  );
  xhr.send(null);
  xhr.onload = function () {
    if (xhr.status == 200) {
      resolve(xhr.responseText);
    } else {
      reject('取得資料失敗');
    }
  }

});

promise.then(function (responseText) {
  geo();
  // 轉移 locatMarker 的 marker 位置 至 定位點
  locatMarker.setLatLng([myLocation.lat, myLocation.lng]);
  // 將畫面移到該定位
  // map.setView([myLocation.lat, myLocation.lng], 15);

  data = JSON.parse(responseText).features;
  addDataMarker();
  storeInfo(storeData);
  loading.setAttribute('class', 'd-none');

}, function (error) {
  alert(error);
});

let storeSelect = document.querySelector('.select');
let searchInput = document.getElementById('search');
let maskEl = document.querySelectorAll('.mask-item');
let selectEl = document.querySelectorAll('.select-item');
let searchBtn = document.querySelector('.search-btn');

storeSelect.addEventListener('click', storeSelectBtn);
searchBtn = addEventListener('click', searchStore, false);
searchInput.addEventListener('keydown', function (e) {
  if (e.keyCode === 13) {
    searchStore(e);
  }
}, false);
let checkMask = document.querySelector('.check-masks');
checkMask.addEventListener('click', checkMaskNum);

// 切換 side-nav
let dragBtn = document.querySelector('.drag-btn');
dragBtn.addEventListener('click', function () {
  let sideNav = document.querySelector('.side-nav');
  sideNav.classList.toggle('active');
})
// 回到定位點
let geoBtn = document.getElementById('geoBtn');
geoBtn.addEventListener('click', function () {
  map.setView([myLocation.lat, myLocation.lng], 15);
  addDataMarker();
  storeInfo(storeData);
})

// 加入藥局圖層資料
function addDataMarker() {
  storeData = [];
  markers.clearLayers();
  for (let i = 0; i < data.length; i++) {
    let name = data[i].properties.name;
    let updated = data[i].properties.updated;
    let maskAdult = data[i].properties.mask_adult;
    let maskChild = data[i].properties.mask_child;
    let maskLatLng = {
      lat: data[i].geometry.coordinates[1],
      lng: data[i].geometry.coordinates[0],
    }
    let distance = getDistance(myLocation, maskLatLng);
    let stared = starData.some(function (item) {
      return item === data[i].properties.phone;
    })
    // 加入與 myLocation 的距離
    data[i].dis = distance;
    // 顯示定位點最近的距離顯示
    if (data.length < 400) {
      if (distance.toFixed(1) < 20) {
        storeData.push(data[i]);
      }
    } else {
      if (distance.toFixed(1) < 2) {
        storeData.push(data[i]);
      }
    }

    let markIcon;
    if (maskAdult == 0 && maskChild == 0) {
      markIcon = greyIcon;
    } else {
      markIcon = L.divIcon({
        className: 'custom-green-icon',
        html: `<span>${maskAdult + maskChild}</span>`,
        iconSize: [65, 61],
        iconAnchor: [12, 41],
        popupAnchor: [20, -34],
      });
    }

    markers.addLayer(
      L.marker([maskLatLng.lat, maskLatLng.lng], { icon: markIcon })
        .bindPopup(`<div class="map-card">
                                    <div class="card">
                                        <h2>${name}<span class="distance">${distance >= 1 ? distance.toFixed(1) + 'km' : (distance * 1000 >> 0) + 'm'}</span></h2>
                                        <p class="update">${updated}更新</p>
                                        <ul>
                                            <li class="num-adult">成人 <span>${maskAdult}</span> </li>
                                            <li class="num-child">兒童 <span>${maskChild}</span> </li>
                                        </ul>
                                        <div>
                                            <a href="#" class="${stared ? 'store-star active' : 'store-star'}"></a><br>
                                            <a href="https://maps.google.com/maps/dir//${name}/@${maskLatLng.lat},${maskLatLng.lng},17z" target="_blank" class="store-map"></a>
                                        </div>
                                    </div>
                            </div>`)
        .openPopup()
    );
  }
  // 新增圖層在map上
  map.addLayer(markers);
}

// 顯示藥局資訊
function storeInfo(pharmacyStoreData) {
  let str = '';
  for (let i = 0; i < pharmacyStoreData.length; i++) {
    let stared = starData.some(function (item) {
      return item === pharmacyStoreData[i].properties.phone;
    })
    str += `<div class="card" data-lat="${pharmacyStoreData[i].geometry.coordinates[1]}" data-lng="${pharmacyStoreData[i].geometry.coordinates[0]}">
                    <h2>${pharmacyStoreData[i].properties.name}<span class="distance">${pharmacyStoreData[i].dis >= 1 ? pharmacyStoreData[i].dis.toFixed(1) + 'km' : (pharmacyStoreData[i].dis * 1000 >> 0) + 'm'}</span></h2>
                    <p>${pharmacyStoreData[i].properties.address}</p>
                    <p>${pharmacyStoreData[i].properties.phone}</p>
                    <p>營業時間：${pharmacyStoreData[i].properties.note}</p>
                    <ul>
                        <li class="num-adult">成人 <span>${pharmacyStoreData[i].properties.mask_adult}</span> </li>
                        <li class="num-child">兒童 <span>${pharmacyStoreData[i].properties.mask_child}</span> </li>
                    </ul>
                    <p class="update">${pharmacyStoreData[i].properties.updated}更新</p>
                    <div>
                        <a href="#" class="${stared ? 'store-star active' : 'store-star'}"></a><br>
                        <a href="https://maps.google.com/maps/dir//${pharmacyStoreData[i].properties.name}/@${pharmacyStoreData[i].geometry.coordinates[1]},${pharmacyStoreData[i].geometry.coordinates[1]},17z" target="_blank" class="store-map"></a>
                    </div>
                </div>`;
  }
  storeList.innerHTML = str;

  let storeCard = document.querySelectorAll('.card');
  storeCard.forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.stopPropagation();
      // 移動地圖至點選位置
      moveMap(el);
      let storeStar = e.target;
      if (storeStar.classList[0] === 'store-star') {
        myStar(e, storeStar, el);
        addDataMarker();
        markers.eachLayer(function (layer) {
          const layerLatLng = layer.getLatLng();
          if (layerLatLng.lat == el.dataset.lat && layerLatLng.lng == el.dataset.lng) {
            layer.openPopup();
          }
        });
      } else {
        return;
      }
    }, false)
  });

}

// 點選 storeInfo 移動地圖
function moveMap(el) {
  const lat = el.dataset.lat;
  const lng = el.dataset.lng;
  map.setView([lat, lng], 17);
  markers.eachLayer(function (layer) {
    const layerLatLng = layer.getLatLng();
    if (layerLatLng.lat == lat && layerLatLng.lng == lng) {
      layer.openPopup();
    }
  });
}

// 加入我的最愛 star
function myStar(e, storeStar, el) {
  e.preventDefault();
  let starTel = el.children[2].textContent;
  let mapStar = document.querySelector('.map-card').children[0].children[3].children[0];
  if (storeStar.className === 'store-star active') {
    starData.forEach(function (item, index) {
      if (starTel === item) {
        starData.splice(index, 1);
      }
    });
    localStorage.setItem('myStar', JSON.stringify(starData));
    storeStar.setAttribute('class', 'store-star');
    mapStar.setAttribute('class', 'store-star');
  } else {
    starData.push(starTel);
    localStorage.setItem('myStar', JSON.stringify(starData));
    storeStar.setAttribute('class', 'store-star active');
    mapStar.setAttribute('class', 'store-star active');
  }
}

// 選擇 store-select 的 btn
function storeSelectBtn(e) {
  e.preventDefault();
  let elDataset = e.target.dataset.store;
  switch (elDataset) {
    case 'nearDistance':
      selectEl[0].classList.add('active');
      selectEl[1].classList.remove('active');
      selectEl[2].classList.remove('active');
      nearStore();
      break;
    case 'numMore':
      selectEl[1].classList.add('active');
      selectEl[0].classList.remove('active');
      selectEl[2].classList.remove('active');
      moreMasks();
      break;
    case 'star':
      selectEl[2].classList.add('active');
      selectEl[1].classList.remove('active');
      selectEl[0].classList.remove('active');
      allStar();
      break;
  }
}



// 顯示距離最近店家在 store-items 上
// storeData把排序過的資料在存進去storeData
function nearStore() {
  storeData = storeData.sort(function (a, b) {
    return a.dis > b.dis ? 1 : -1;
  })
  storeInfo(storeData);
  storeList.scrollTop = 0;
}

// 顯示存量最多
function moreMasks() {
  storeData = storeData.sort(function (a, b) {
    let total1 = a.properties.mask_adult + a.properties.mask_child;
    let total2 = b.properties.mask_adult + b.properties.mask_child;
    return total2 - total1;
  })
  storeInfo(storeData);
  storeList.scrollTop = 0;
}

// 顯示已標星號
function allStar() {
  let allStaredData = [];
  for (let i = 0; i < data.length; i++) {
    let stared = starData.some(function (item) {
      return item === data[i].properties.phone;
    });

    if (stared) {
      allStaredData.push(data[i]);
    }
  }
  storeInfo(allStaredData);
  storeList.scrollTop = 0;
}

// 搜尋
function searchStore(e) {
  if (e.target.nodeName !== 'BUTTON' && e.keyCode !== 13) { return; }
  let searchText = searchInput.value.trim();
  if (searchText == '') {
    return;
  } else {
    storeData = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i].properties.name.indexOf(searchText) != -1 || data[i].properties.address.indexOf(searchText) != -1) {
        storeData.push(data[i]);
      }
    }
    for (let k = 0; k < maskEl.length; k++) {
      maskEl[k].classList.remove('active');
      selectEl[k].classList.remove('active');
    }
    storeInfo(storeData);
  }
}

function checkMaskNum(e) {
  e.stopPropagation();
  let el = e.target;
  let maskData = [];
  if (el.nodeName !== 'A') { return; }
  if (el.dataset.mask === 'all') {
    maskEl[0].classList.add('active');
    maskEl[1].classList.remove('active');
    maskEl[2].classList.remove('active');
    for (let i = 0; i < storeData.length; i++) {
      let maskAdult = storeData[i].properties.mask_adult;
      let maskChild = storeData[i].properties.mask_child;
      if (maskAdult >= 0 || maskChild >= 0) {
        maskData.push(storeData[i]);
      }
    }
  } else if (el.dataset.mask === 'adult') {
    maskEl[1].classList.add('active');
    maskEl[0].classList.remove('active');
    maskEl[2].classList.remove('active');
    for (let i = 0; i < storeData.length; i++) {
      let maskAdult = storeData[i].properties.mask_adult;
      if (maskAdult > 0) {
        maskData.push(storeData[i]);
      }
    }
  } else if (el.dataset.mask === 'child') {
    maskEl[2].classList.add('active');
    maskEl[1].classList.remove('active');
    maskEl[0].classList.remove('active');
    for (let i = 0; i < storeData.length; i++) {
      let maskChild = storeData[i].properties.mask_child;
      if (maskChild > 0) {
        maskData.push(storeData[i]);
      }
    }
  }
  storeInfo(maskData)
  storeList.scrollTop = 0;
}

// 取得所在位置與藥局距離
function getDistance(myLatLng, maskLatLng) {
  let lat1 = toRadian(myLatLng.lat);
  let lng1 = toRadian(myLatLng.lng);
  let lat2 = toRadian(maskLatLng.lat);
  let lng2 = toRadian(maskLatLng.lng);
  let deltaLat = lat2 - lat1;
  let deltaLng = lng2 - lng1;

  let distanceTo = 2 * 6371 * Math.asin(Math.sqrt(Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(deltaLng / 2), 2)));

  function toRadian(degree) {
    return degree * Math.PI / 180;
  }
  return distanceTo;
}


function getDate() {
  let date = new Date();
  let day = date.getDay();
  let dayList = ['日', '一', '二', '三', '四', '五', '六'];
  let toDate = document.querySelector('.time');
  let toDay = document.querySelector('.day');
  let idNum = document.querySelector('.id-number');

  toDate.textContent = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  toDay.textContent = `星期${dayList[day]}`;
  idNum.textContent = `所有人`;

}
getDate();