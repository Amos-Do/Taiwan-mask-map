# Taiwan mask Map

![](https://i.imgur.com/y8oAbmo.jpg)


## Demo
https://amos-do.github.io/Taiwan-mask-map/

## 簡介
> 因發生重大嚴重特殊傳染性肺炎（新型冠狀病毒病 COVID-19），政府提出口罩實名制，確保口罩數量足夠國人使用，因此透過「衛生福利部中央健康保險署」提供健保特約機構「口罩剩餘數量開放資料」，以及許多開發者的資料與貢獻，進行開發此專案，雖然專案完成時台灣疫情逐漸趨緩，但還是希望為此次的疫情貢獻一份心力，願世界能度過難關。  
> 
> -- 特別感謝所有為此疫情盡一份心力的所有人

此作品的功能有:

* 地圖
    * 快速定位使用者位置（Geolocation）
    * Leaflet + OpenStreetMap 地圖顯示還存有口罩之店家
    * 彈跳視窗可了解店家距離、更新時間、口罩數量、收藏以及連接至Google map 導航

* 導覽列
    * banner 可提醒領取口罩之限制
    * 搜尋關鍵字尋找店家、地區
    * 可選擇口罩的分類（所有、成人、兒童），快速找出還有口罩的店家
    * 再尚有庫存店家中可過濾距離最近，以及庫存量最多的店家
    * 點擊店家資訊卡，可移動地圖到該位置
    * 店家資訊卡顯示所有資訊與口罩數量，並加入收藏（LocalStorage）

## 主要練習

* [Leaflet + OpenStreetMap](https://leafletjs.com/) 地圖應用開發
* [Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster) （marker 群組化）
* Geolocation API（地理位置定位）
* JavaScript DOM 操作
* Promise 應用
* Ajax 串接 API
* LocalStorage 應用
* 手刻切版 SCSS
* RWD

## 感謝

* [The F2E 2nd 精神時光屋 以及 六角學院](https://challenge.thef2e.com/news/21)
* [口罩供需資訊平台](https://g0v.hackmd.io/gGrOI4_aTsmpoMfLP1OU4A) 的所有貢獻者與開發者
* [Cristy 的 UI 設計稿](https://challenge.thef2e.com/user/3509?schedule=4438#works-4438) 美麗又實用的設計稿


## 聲明
* 此專案採用 The F2E 2ed - [Cristy 的 UI 設計稿](https://challenge.thef2e.com/user/3509?schedule=4438#works-4438)
* 資料來源來自於 [口罩供需資訊平台](https://g0v.hackmd.io/gGrOI4_aTsmpoMfLP1OU4A) 、[政府資料開放平臺](https://data.gov.tw/dataset/116285)、[The F2E 2nd 精神時光屋](https://challenge.thef2e.com/news/21)
* 本作品內的圖片與內容，純粹為個人練習技術使用，不做任何商業用途。

###### tags: `GitHub README`