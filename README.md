# 観劇予約アプリ

## アプリケーション名と概要

この「観劇予約アプリ」は、ユーザーが公演の情報を閲覧し、チケットをオンラインで予約できるウェブアプリケーションです。また、管理者向けのパネルも備えており、予約状況の確認やデータのエクスポートが可能です。

## 作成の背景・目的

観劇やイベントのチケット予約は、多くの場合、専用のプラットフォームや複雑な手順を伴います。このプロジェクトは、シンプルで直感的なインターフェースを提供し、ユーザーが手軽に公演を検索し、スムーズに予約を完了できるシステムの構築を目指しました。管理者はリアルタイムで予約状況を把握し、効率的に運営を行うことができます。

## 機能一覧（要件定義）

### ユーザー向け機能

* **公演一覧表示**: 開催中の公演情報を一覧で表示します。

* **公演詳細・予約**: 各公演の詳細情報（日時、残席数など）を確認し、チケットを予約できます。

* **予約フォーム**: 氏名、メールアドレス、枚数、備考を入力して予約を確定します。

* **予約完了通知**: 予約完了後、登録されたメールアドレスに確認メールを送信します（Nodemailerによる実装）。

* **基本的なバリデーション**: 必須項目の入力チェックや、残席数を超過しない予約枚数の制限。

### 管理者向け機能

* **管理者ログイン**: 管理者専用のログインページからシステムにアクセスします。

* **予約リスト表示**: 全ての予約データを一覧で確認できます。公演名、上演日時、予約者情報、枚数、受付番号などが表示されます。

* **CSVエクスポート**: 表示されている予約リストをCSV形式でダウンロードできます。

## 使用技術

このアプリケーションは、フロントエンドとバックエンドに分けて開発されています。

### フロントエンド

* **HTML**: アプリケーションの構造を定義します。

* **CSS**: スタイリングとレイアウトを定義し、レスポンシブデザインに対応します。

* **JavaScript**: 動的なUI操作、画面遷移、バックエンドAPIとの連携を実装します。

### バックエンド

* **Node.js**: サーバーサイドの実行環境。

* **Express.js**: Webアプリケーションフレームワーク。APIのルーティングとリクエスト処理を担います。

* **PostgreSQL**: リレーショナルデータベース。公演、上演、予約、管理者情報を格納します。

* **`pg`**: PostgreSQLデータベースに接続するためのNode.jsドライバ。

* **`dotenv`**: 環境変数を管理し、機密情報をコードから分離します。

* **`nodemailer`**: メール送信ライブラリ。予約完了メールの送信に使用します。

* **`bcryptjs`**: パスワードのハッシュ化と検証に使用し、セキュリティを強化します。

* **`jsonwebtoken`**: JWT（JSON Web Token）を生成・検証し、管理者認証に利用します。

* **`csv-stringify`**: データベースから取得したデータをCSV形式に変換し、エクスポート機能を提供します。

## デモ動画のYouTubeリンク

(現在、デモ動画は準備中です。完成次第、こちらにリンクを掲載します。)

## インストール方法・使用方法

### 前提条件

* Gitがインストールされていること

* Node.js (npmを含む) がインストールされていること

* PostgreSQLがインストールされ、稼働していること

* VS Code (推奨)

### 1. プロジェクトのクローン

まず、このリポジトリをローカルにクローンします。

```
git clone [リポジトリのURL]
cd kan-geki-backend # バックエンドディレクトリに移動

```

### 2. バックエンドのセットアップと起動

1. **必要なパッケージのインストール**:

   ```
   npm install
   
   ```

2. **PostgreSQLデータベースの設定**:

   * PostgreSQLサーバーを起動します。

   * `psql` コマンドラインツール（またはGUIツール）を使用して、データベースとユーザーを作成します。

     ```
     -- 新しいユーザー（例: kan_geki_user）を作成
     CREATE USER kan_geki_user WITH PASSWORD 'your_secure_password';
     -- 新しいデータベース（例: kan_geki_db）を作成し、所有者を設定
     CREATE DATABASE kan_geki_db OWNER kan_geki_user;
     
     ```

   * 作成したデータベースに接続し、テーブルを作成します。

     ```
     -- psql -U kan_geki_user -d kan_geki_db
     CREATE TABLE admins (
         id SERIAL PRIMARY KEY,
         email VARCHAR(255) UNIQUE NOT NULL,
         password_hash VARCHAR(255) NOT NULL,
         created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
     );
     CREATE TABLE performances (
         id SERIAL PRIMARY KEY,
         name VARCHAR(255) NOT NULL,
         description TEXT,
         created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
         updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
     );
     CREATE TABLE shows (
         id SERIAL PRIMARY KEY,
         performance_id INTEGER NOT NULL REFERENCES performances(id) ON DELETE CASCADE,
         start_time TIMESTAMP WITH TIME ZONE NOT NULL,
         capacity INTEGER NOT NULL,
         current_reservations INTEGER DEFAULT 0,
         deadline_time TIMESTAMP WITH TIME ZONE NOT NULL,
         is_active BOOLEAN DEFAULT TRUE,
         created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
         updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
     );
     CREATE TABLE reservations (
         id SERIAL PRIMARY KEY,
         show_id INTEGER NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
         user_name VARCHAR(255) NOT NULL,
         user_email VARCHAR(255) NOT NULL,
         num_tickets INTEGER NOT NULL,
         notes TEXT,
         receipt_number VARCHAR(255) UNIQUE NOT NULL,
         is_cancelled BOOLEAN DEFAULT FALSE,
         created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
         updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
     );
     
     ```

   * 初期データ（管理者ユーザー、公演、上演）を投入します。

     * **管理者パスワードのハッシュを生成**:
       `generate_hash.js` ファイルを一時的に作成し、実行してパスワードのハッシュ値を取得します。

       ```javascript
       // generate_hash.js
       const bcrypt = require('bcryptjs');
       async function generateHash() {
           const password = 'adminpass'; // あなたのパスワード
           const hashedPassword = await bcrypt.hash(password, 10);
           console.log('Hashed Password:', hashedPassword);
       }
       generateHash();
       ```node generate_hash.js` で実行し、出力されたハッシュ値をコピーします。
       

     * **管理者ユーザーと初期公演・上演データを挿入**:

       ```
       -- psql -U kan_geki_user -d kan_geki_db
       INSERT INTO admins (email, password_hash) VALUES ('admin@example.com', 'ここにコピーしたハッシュ値を貼り付け');
       INSERT INTO performances (name, description) VALUES ('感動のミュージカル「星の歌」', '夜空に輝く星々が織りなす、壮大な愛と冒険の物語。心揺さぶる歌声と美しい舞台演出があなたを魅了します。');
       INSERT INTO performances (name, description) VALUES ('古典落語傑作選「笑いの殿堂」', 'ベテランから若手まで、選りすぐりの落語家たちが贈る抱腹絶倒の二時間。日本の伝統芸能の真髄を体験してください。');
       INSERT INTO shows (performance_id, start_time, capacity, deadline_time) VALUES
       (1, '2025-08-01 14:00:00+09', 100, '2025-07-31 23:59:59+09'),
       (1, '2025-08-02 18:30:00+09', 100, '2025-08-01 23:59:59+09'),
       (1, '2025-08-03 13:00:00+09', 100, '2025-08-02 23:59:59+09'),
       (1, '2025-08-04 13:00:00+09', 100, '2025-08-03 23:59:59+09'),
       (2, '2025-09-05 19:00:00+09', 80, '2025-09-04 23:59:59+09'),
       (2, '2025-09-06 15:00:00+09', 80, '2025-09-05 23:59:59+09');
       
       ```

3. **環境変数の設定**:
   プロジェクトのルートディレクトリに `.env` ファイルを作成し、以下の内容を記述します。

   ```
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=kan_geki_user
   DB_PASSWORD=your_secure_password
   DB_NAME=kan_geki_db
   JWT_SECRET=your_super_secret_jwt_key_here
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=あなたのGmailアドレス@gmail.com
   EMAIL_PASS=あなたのGmailアプリパスワード
   
   ```

   `your_secure_password`, `your_super_secret_jwt_key_here`, `あなたのGmailアドレス@gmail.com`, `あなたのGmailアプリパスワード` は、ご自身の環境に合わせて置き換えてください。

4. **バックエンドサーバーの起動**:

   ```
   npm run dev
   
   ```

   `Server running on port 3000` と `Successfully connected to the database.` が表示されれば成功です。

### 3. フロントエンドの使用方法

1. **`index.html` を開く**:
   ウェブブラウザで、プロジェクトのフロントエンドディレクトリにある `index.html` ファイルを直接開きます。ユーザー向けの予約アプリが表示されます。

2. **`admin.html` を開く**:
   ウェブブラウザで、プロジェクトのフロントエンドディレクトリにある `admin.html` ファイルを直接開きます。管理者ログイン画面が表示されます。

   * **ログイン情報**:

     * メールアドレス: `admin@example.com`

     * パスワード: `adminpass` (またはあなたが設定したパスワード)

## 開発者情報

* [csto23097@g.nihon-u.ac.jp]
