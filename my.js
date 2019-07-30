window.onload = function load() {
    setInterval(function () {
        console.log("定时检测");
    }, 1000);
};

// 获取秒数
function getSeconds(dateStr) {
    let s = 0;
    if (dateStr) {
        let arr = dateStr.split(":");

        for (let i = 0; i < arr.length; i++) {
            if (i == arr.length - 1) {
                s += Number(arr[i]);
            } else {
                let x = arr.length - i - 1;
                s += Number(arr[i]) * (60 ** (x < 1 ? 1 : x));
            }
        }
    }
    return s;
}

var url = "https://cd.phncdn.com/videos/201901/23/203407481/720P_1500K_203407481.mp4?TzBNkRYIYVjg-8oLFiFysmgW7FGuwbzPcH3sIximz0jeLB5lI3SeGhgcn4YbrXyyAUY_buUc2vCgxKoPQPe5pFJbg9EJq5jFN8UWKWF1rbsmvSEmsSTEO8lAOWuvIu94nFAQCfFwBUd6PEypkcEw9EQhlRp4OmgU7hKmiRxBFRrjRNlPpCZeqh74Y1MSI0nuPzJNLjBtyFs";
var regx = /(\/)(.*?)\.(.*?)(\??)/;
console.log(str.replace(regx, '$1'));
let arr_1 = url.split("?");
let arr_2 = arr_1[0].split('/');
let name = arr_2[arr_2.length-1];
console.log(name);