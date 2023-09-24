//HTML部品の取得
const search_form = document.getElementById("search_form");
const search_btn = document.getElementById("search_btn");
const search_text = document.getElementById("search_text");
const template = document.getElementById("bookInfo");
const table = document.getElementById("search_result");
const history_area = document.getElementById("history_area");
const temp_his = document.getElementById("history_link");

//定数定義
const API_URI = "https://www.googleapis.com/books/v1/volumes?q=";
const MY_API_INPUT_HISTORY = "./api/v1/input_history/";
const MY_API_GET_HISTORY = "./api/v1/get_history";
const MY_API_GET_LOGIN = "./api/v1/login/";


//---------------------------------
//ログイン機能
'use strict';//厳格モード:厳格にエラーを検出する
var login_form = document.getElementById('login_form');
if (login_form != null) { //まずはnullチェック（それで問題なければ処理を通す）
    // 押したボタンのid名取得
login_form.addEventListener('click', function () {
    //  if (!(document.getElementById('login_btn'))){ return false;}
  //alert('id名「' + this.id + '」のボタンを押しました。');
      //入力されたユーザー名、パスワードを取得
      //alert(user_name.value);
      //alert(user_password.value);
      //ログインボタンが押されたら、ログイン認証APIを実行する
     // alert(MY_API_GET_LOGIN + user_name.value +"/"+ user_password.value);
    fetch(MY_API_GET_LOGIN + user_name.value + "/" + user_password.value)
        .then(res => {
            return res.json();
        })
        .then(res_json => {
            if (res_json.flag == true) {
                  //ログインできる：home.htmlに遷移する
                  //alert("ログインできました");
                location.href = "http://127.0.0.1:8000/home.html";
            } else {
                  //ログインできない：エラーメッセージの表示？
                alert("エラー:ログインできませんでした");
            }
        })

});


}


//---------------------------------

//初期表示
getHistory();

// イベントハンドラ 入力フォームEnter押下

search_form.addEventListener("submit", (event) => {

    event.preventDefault();
    if(search_text.value != ""){
        searchBook(search_text.value);
        insertHistory(search_text.value);
        getHistory();
    }
});

//---------------------------------

//検索履歴登録
function insertHistory(value){
    fetch(MY_API_INPUT_HISTORY + value)
    .then(res => {
        console.log(res.json());
    });
}

//検索履歴取得、表示
function getHistory(){
    fetch(MY_API_GET_HISTORY)
    .then(res => {
        return res.json();
    })
    .then(res_json => {
        console.log(res_json);

        //検索履歴表示をクリア
        while(history_area.firstChild){
            history_area.removeChild(history_area.firstChild)
        }

        //履歴を表示させるループ
        for(let i = 0; i < res_json.length; i++){
            //テンプレートの準備
            const clone = temp_his.content.cloneNode(true);
            const text = clone.querySelector("#text");

            //履歴文字列の埋め込み
            text.textContent = res_json[i].word;
            //表示
            history_area.appendChild(clone);
        }
    });
}

//書籍検索, 結果表示
function searchBook(value){
    // テーブル初期化
    table.innerHTML = "";

    let url = API_URI + value;
    console.log(url);
    fetch(url)
    .then(res => {
        return res.json();
    })
    .then(res_json => {
        console.log(res_json);
        for(let i = 0; i < res_json.items.length; i++){
            //テンプレートの準備
            const clone = template.content.cloneNode(true);
            const title = clone.querySelector("#title");
            const author = clone.querySelector("#author");
            const publishedDate = clone.querySelector("#publication");
            const publisher = clone.querySelector("#publisher");
            const pic = clone.querySelector("#pic");
            const overview = clone.querySelector("#overview");

            //JSONのi番目の要素をターゲットに情報を取り出しテンプレートに埋め込んでいく
            let item = res_json.items[i];

            // タイトル
            title.textContent = item.volumeInfo.title;

            // 表紙
            if("imageLinks" in item.volumeInfo){
                pic.src = item.volumeInfo.imageLinks.smallThumbnail;
            }

            // 著者
            let author_text = "著者：";
            if("authors" in item.volumeInfo){
                let author_num = item.volumeInfo.authors.length;
                for(let j = 0; j < author_num; j++){
                    author_text = author_text + item.volumeInfo.authors[j];
                    if(j != author_num - 1){
                        author_text = author_text + ", ";
                    }
                }
                author.textContent = author_text;
            }else{
                author.textContent = author_text + "不明";
            }

            // 出版日
            if("publishedDate" in item.volumeInfo){
                publishedDate.textContent = "出版日：" + item.volumeInfo.publishedDate;
            }else{
                publishedDate.textContent = "出版日：不明";
            }

            // 出版社
            if("publisher" in item.volumeInfo){
                publisher.textContent = "出版社：" + item.volumeInfo.publisher;
            }else{
                publisher.textContent = "出版社：不明";
            }
            
            // あらすじ
            if("searchInfo" in item){
                overview.innerHTML = item.searchInfo.textSnippet;
            }else if("description" in item.volumeInfo){
                overview.innerHTML = item.volumeInfo.description;
            }else{
                overview.textContent = "-";
            }
            //テーブルに追加
            table.appendChild(clone);
        }
    })
};

function re_searchBook(text){
    // ３．ワードを検索ボックスに入力
    search_text.value = text;
   

    // ４．検索機能を実行
    searchBook(text);
    insertHistory(text);
    getHistory();
}
