const logging = false;
let globalItems = JSON.parse(getItem("sites"));
if (globalItems === null) globalItems = [];

/*chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  console.log(tabId);
  const path = data.url
  let splitedPath = path.split("/")
  const host = splitedPath[2];
  let current_page = data.title;
})*/

function htmlTmeplate({index, host, current_page, favIconUrl}) {
  let favicon;
  log(index);
  if(favIconUrl){
    favicon = `<img src="${favIconUrl}" width="50px"/>`
  } else {
    favicon = ""
  }
  return html = `
    <li class="item" id="item_${index}">
      <h2>${host}</h2>
      ${favicon}
      <div class="a_container">
        <a class="prev" href="#" id="prevButton_${index}">이전:::${globalItems[index].prev_current_page}</a><br>
          <a class="current" id="a_${index}" href="#">현재::: ${current_page}</a>
      </div>
      <div class="button_container">
        <a class="delete buttons" id="deleteButton_${index}" href="#">delete</a>
        <a class="updateAuto buttons" id="updateButton_${index}" href="#">auto update</a>
      </div>
    </li>
  `
}
function getCurrentUrl(fn, args) {
  let queryInfo = {
    active: true,
    currentWindow: true,
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    let tab = tabs[0];
    log(tab);
    if(!args) fn(tab);
    if(args) fn(tab, args[0])
  })
}

function deleteOneInArrAndConnectStr(arr, i){
  arr.splice(i, 1);
  let str = "";
  arr.map((item) => {
    str += item
  });
  return str;
}

function onUpdateClick(data, index) {
  let globalItem = globalItems[index];
  let globalItem_splited_path = globalItem.full_path.split("/")
  let globalItem_path_except = deleteOneInArrAndConnectStr(globalItem_splited_path, -1)
  const path = data.url
  let splitedPath = path.split("/")
  const host = splitedPath[2];
  let current_page = data.title;
  let path_except = deleteOneInArrAndConnectStr(splitedPath, -1);
  log('yeah')
  if(path === globalItem.full_path) {
    alert('저번과 같은 페이지 입니다.');
    return;
  }
  if(host !== globalItem.host){
    if(confirm('서로 다른 사이트입니다. 추가할까요?')){
      onAddClick(data);
      alert('추가 되었습니다.')
      return;
    }
  }
  log(path_except);
  log(globalItem_path_except)
  if(path_except === globalItem_path_except){
    [
      globalItems[index].prev_current_page,
      globalItems[index].current_page
    ] = [globalItems[index].current_page,current_page];
    [
      globalItems[index].prev_full_path,
      globalItems[index].full_path
    ] = [globalItems[index].full_path,path];
    setItem("sites", JSON.stringify(globalItems));
    log(globalItems)
    window.location.reload(false);
  }


}

function onAddClick(data){
    const path = data.url
    let splitedPath = path.split("/")
    const host = splitedPath[2];
    let current_page = data.title;
    globalItems.push({
      host:host,
      current_page:current_page,
      full_path:path,
      favIconUrl: data.favIconUrl,
      prev_full_path:path,
      prev_current_page: current_page,
    })
    let json = JSON.stringify(globalItems)
    setItem("sites", json)
    let index = globalItems.length-1;
    log(index);
    window.location.reload(false)
}

function addClickListener(index) {
  console.log(index);
  console.log(globalItems[index])//해당 인덱스에 요소가 있는지 확인해야할까??
  //if (idx > -1) console.log(globalItems.splice(idx, 1));
  globalItems.splice(index, 1)
  setItem("sites", JSON.stringify(globalItems))
  window.location.reload(false);
}

function updateTab(url) {
  chrome.tabs.update({
     url: url
   });
}

function writePageInfo(data) {
  let path = data.url.trim()
  if (path.length > 110) {
    path = path.slice(0 ,109) +"...............";

  }
  const splitedPath = path.split("/")
  const host = splitedPath[2];
  const current_page = data.title;
  favicon = data.favIconUrl ? `<img src="${data.favIconUrl}" width="35px"/> <br>` : "";
  document.getElementById('page_info').innerHTML = `
    <h2>${host}</h2>
    ${favicon}
     <span class="page_info_txt">current_page: ${current_page} </span>
    <span class="page_info_txt">url: ${path}</span>
  `
}

window.onload = function() {
  getCurrentUrl(writePageInfo); // 현재 페이지 정보를 표시하는 코드
  document.getElementById('add').onclick = () => getCurrentUrl(onAddClick);
  let list = document.getElementById('list');
  globalItems.map((item, index, arr) => {
    list.innerHTML = htmlTmeplate({
      index:index,
      host:item.host,
      current_page:item.current_page,
      favIconUrl: item.favIconUrl
    }) + list.innerHTML

  });
  globalItems.map((item, index) => {
    document.getElementById(`deleteButton_${index}`).onclick = function() {
      addClickListener(index)
    };
    document.getElementById(`a_${index}`).onclick = function() {
      updateTab(item.full_path);
    };
    document.getElementById(`updateButton_${index}`).onclick = function() {
      getCurrentUrl(onUpdateClick, [index])
    };
    document.getElementById(`prevButton_${index}`).onclick = function() {
      updateTab(item.prev_full_path)
    }
  })

}
function setItem(key, value) {
  try {
    //log("Storing [" + key + ":" + value + "]");
    window.localStorage.removeItem(key);      // <-- Local storage!
    window.localStorage.setItem(key, value);  // <-- Local storage!
  } catch(e) {
    log("Error inside setItem");
    log(e);
  }
  //log("Return from setItem" + key + ":" +  value);
}
function getItem(key) {
  var value;
  //log('Retrieving key [' + key + ']');
  try {
    value = window.localStorage.getItem(key);  // <-- Local storage!
  }catch(e) {
    log("Error inside getItem() for key:" + key);
  log(e);
  value = "null";
  }
  //log("Returning value: " + value);
  return value;
}
function clearStrg() {
  log('about to clear local storage');
  window.localStorage.clear(); // <-- Local storage!
  log('cleared');
}
function log(txt) {
  if(logging) {
    console.log(txt);
  }
}
