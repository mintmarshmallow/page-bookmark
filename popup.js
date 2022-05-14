const logging = false;
let globalItems = JSON.parse(getItem("sites"));
let haveToScroll = JSON.parse(getItem("haveToScroll"));
if (globalItems === null) globalItems = [];
if(haveToScroll === null) haveToScroll = [0, ""];//[scroll, url]
console.log(haveToScroll)
chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab	){
  console.log(changeInfo);
  if(changeInfo.status == "complete"){
    chrome.tabs.executeScript({code:`window.scrollTo(0, ${haveToScroll[0]})`}, function(result){
      haveToScroll[0] = 0;
      haveToScroll[1] = "";
    });
  }

});


/*chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  console.log(tabId);
  const path = data.url
  let splitedPath = path.split("/")
  const host = splitedPath[2];
  let current_page = data.title;
})*/

function htmlTmeplate({index, host, current_page, favIconUrl, caption, scrollTop}) {
  log(caption)
  let favicon;
  log(index);
  if(favIconUrl){
    favicon = `<img src="${favIconUrl}" width="50px"/>`
  } else {
    favicon = ""
  }
  return html = `
    <li class="item" id="item_${index}">
      <h2>${host}${caption}</h2>
      ${favicon}
      <div class="a_container">
        <a class="current" id="a_${index}" href="#"><strong>${chrome.i18n.getMessage("current")}</strong>::: ${current_page}</a><br>
        <a class="prev" href="#" id="prevButton_${index}"><strong>${chrome.i18n.getMessage("previous")}</strong>:::${globalItems[index].prev_current_page}</a>
      </div>
      <div class="button_container">
        <a class="delete buttons" id="deleteButton_${index}" href="#">${chrome.i18n.getMessage("deleteButton")}</a>
        <a class="updateAuto buttons" id="updateButton_${index}" href="#">${chrome.i18n.getMessage("updateButton")}</a>
      </div>
    </li>
  `
}
function getCurrentUrl(fn, args) {
  let queryInfo = {
    active: true,
    currentWindow: true,
  };
  chrome.tabs.executeScript({
    code: "document.querySelector('html').scrollTop"
  }, function(result) {

    chrome.tabs.query(queryInfo, function(tabs) {
      let tab = tabs[0];
      tab = {...tab, scrollTop: (result ? result[0]:0)};
      log(tab);
      if(!args) fn(tab);
      if(args) fn(tab, args[0])
    });

  });

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
  /*if(path === globalItem.full_path) {
    alert(chrome.i18n.getMessage("samePageAlert"));
    return;
  }*/
  if(host !== globalItem.host){
    if(confirm(chrome.i18n.getMessage("differentPageAlert"))
    ){
      onAddClick(data);
      alert(chrome.i18n.getMessage("successfulAdd"));
      return;
    }
    return;
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
    globalItems[index].scrollTop = data.scrollTop,
    setItem("sites", JSON.stringify(globalItems));
    log(globalItems)
    window.location.reload(false);
  } else {
    [
      globalItems[index].prev_current_page,
      globalItems[index].current_page
    ] = [globalItems[index].current_page,current_page];
    [
      globalItems[index].prev_full_path,
      globalItems[index].full_path
    ] = [globalItems[index].full_path,path];
    globalItems[index].scrollTop = data.scrollTop,
    setItem("sites", JSON.stringify(globalItems));
    log(globalItems)
    window.location.reload(false);
  } // 나중에 파일네임을 제외한 경로(path_except)가 저번과 다를때는 다르게 로직 분기하게 코드짜야함
  //경로 변경 패턴을 두세번째까지 분석해서 다음부턴 path_except다를때 경고 메시지 나오지 않게 조절
  //path_except값도 분석을 통해 뒤에서 몇번째 slash 자리를 기준으로 결정할것인지 구형해야함


}

function onAddClick(data){
    const path = data.url;
    let splitedPath = path.split("/");
    const host = splitedPath[2];
    let current_page = data.title;
    let caption = "";
    let isSamePath = false;
    let isSameHost = false;
    let sameHostCount = 0;
    for(let i = 0; globalItems.length > i; i++) {
      if(globalItems[i].full_path === path) {
        isSamePath = true;
        isSameHost = true;
        sameHostCount++;
        continue;
      }
      if(globalItems[i].host === host) {
        isSameHost = true;
        sameHostCount++;
      }
    }
    if(isSamePath) {
      if(!(confirm(chrome.i18n.getMessage("samePageAlert2")))){
        return;
      }
    }
    if(isSameHost) {
      caption = `(${sameHostCount})`
    }
    log(caption)
    globalItems.push({
      host:host,
      current_page:current_page,
      full_path:path,
      favIconUrl: data.favIconUrl,
      prev_full_path:path,
      prev_current_page: current_page,
      caption: caption,
      scrollTop:data.scrollTop,
    });
    let json = JSON.stringify(globalItems)
    setItem("sites", json)
    let index = globalItems.length-1;
    log(index);
    window.location.reload(false)
}

function addClickListener(index) {
  log(index);
  log(globalItems[index])//해당 인덱스에 요소가 있는지 확인해야할까??
  //if (idx > -1) console.log(globalItems.splice(idx, 1));
  globalItems.splice(index, 1)
  setItem("sites", JSON.stringify(globalItems))
  window.location.reload(false);
}

function updateTab(url, scrollTop) {
  setItem("haveToScroll", JSON.stringify([scrollTop, url]));
  chrome.tabs.update({
     url: url
   }, function(result){
     window.location.reload(false);
   });


}

function writePageInfo(data) {
  let path = data.url;
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
    <div class="page_info_txt_container">
      <span class="page_info_txt">${chrome.i18n.getMessage("currentPage")}: ${current_page} </span>
      <span class="page_info_txt">${chrome.i18n.getMessage("url")}: ${path}</span>
    </div>

  `
}

window.onload = function() {

  getCurrentUrl(writePageInfo); // 현재 페이지 정보를 표시하는 코드
  document.getElementById('add').innerHTML = chrome.i18n.getMessage("addThisPage");
  document.getElementById('add').onclick = () => getCurrentUrl(onAddClick);
  let list = document.getElementById('list');
  globalItems.map((item, index, arr) => {
    list.innerHTML = htmlTmeplate({
      index:index,
      host:item.host,
      current_page:item.current_page,
      favIconUrl: item.favIconUrl,
      caption: item.caption,
      scrollTop: item.scrollTop ? item.scrollTop : item.scrollTop=0,
    }) + list.innerHTML
  });
  globalItems.map((item, index) => {
    console.log(item.scrollTop)
    document.getElementById(`deleteButton_${index}`).onclick = function() {
      addClickListener(index)
    };
    document.getElementById(`a_${index}`).onclick = function() {
      updateTab(item.full_path, item.scrollTop);
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
