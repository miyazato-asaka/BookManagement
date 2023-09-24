// expressを使えるようにするおまじない
const express = require('express');
const app = express();

// postgresqlへの接続
var { Client } = require('pg');
var client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'miyazato0',
    port: '5432'
});
client.connect();

// ホームディレクトリの指定
// http://localhost:8000/にアクセスしたらwebディレクトリ配下のindex.htmlを表示
app.use(express.static('web'))

 // 起動テスト用　JSONを返すAPI http://localhost:8000/api/v1/list
app.get('/api/v1/list', (req, res) => {
    const todoList = [
        {tilte: 'Javascriptの勉強', done: true},
        {tilte: 'Node.jsの勉強', done: false},
        {tilte: 'Web APIを作る', done: false}
    ];

    res.json(todoList);
});

//ログイン情報照合API
app.get('/api/v1/login/:user_name/:user_pass', (req, res) => {
    // ユーザidとパスワードを受けとる
    var user_name = req.params.user_name;
    var user_pass = req.params.user_pass;
    console.log("user_name : |" + user_name + "|");
    console.log("user_pass : |" + user_pass + "|");
    // ユーザＩＤをキーにパスワードを取得するＳＱＬを実行する
    var query = {
        text: 'SELECT password FROM user_list WHERE users = $1; ',
        values: [user_name]
    };
    //作成したクエリの実行
     //実行
    client.query(query)//DBに対するクエリが実行される
        .then(q => {//②
            // 取得したパスワードを比較する
            // num = result.rows[0].num;
            var pass = q.rows[0].password;
            var login_flag;
            console.log("pass:|" + pass + "|")//
            if (pass == user_pass) {
                login_flag = { flag: true };
            } else {
                login_flag = { flag: false };
            }
            // 比較結果をＪＳＯＮで返す
            console.log(login_flag);
            res.json(login_flag);
        })//成功した時：上記のクエリを実行した結果が返ってくる
    .catch(e => console.error(e.stack));//エラーの時：エラーの内容をconsole.log

});


// 検索履歴登録API ./api/v1/input_history
app.get('/api/v1/input_history/:word', (req, res) => {
    // データを受け取る
    var word = req.params.word;
    console.log("word : " + word);

    //　初めて検索するワードか？
    var query = {
        text: 'SELECT word, num FROM search_history WHERE word = $1',
        values: [word]
    };

    client.query(query, function(err, result){
        if(result.rowCount == "0"){
            // データ登録クエリ
            var query = {
                text: 'INSERT INTO search_history(word, num, date) VALUES($1, $2, current_timestamp)',
                values: [word, 1]
            };

            client.query(query)
                .then(res.json([{result: 'INSERTED !'}]))
                .catch(e => console.error(e.stack));
            console.log("はじめて検索したよ");
        }else{
            num = result.rows[0].num;
            num = num + 1;

            var query = {
                text: 'UPDATE search_history SET num = $1, date = current_Timestamp WHERE word = $2',
                values: [num, word]
            };

            client.query(query)
                .then(res.json([{result: 'UPDATED !'}]))
                .catch(e => console.error(e.stack));
                console.log("二回目以降の検索だよ");
        }
    })
});

// 検索履歴を3件取得する
app.get('/api/v1/get_history', (req, res) => {
    //検索クエリ
    var query = {
        text: 'SELECT word, date FROM search_history order by date desc OFFSET 0 LIMIT 3',
    }

    //実行
    client.query(query)
        .then(q => res.json(q.rows))
        .catch(e => console.error(e.stack));
});

//アプリケーションサーバ起動
app.listen(8000, () => console.log('Server running at http://127.0.0.1:8000/'))
