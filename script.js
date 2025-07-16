// DOMContentLoaded: HTMLの読み込みが完了したらスクリプトを実行
document.addEventListener('DOMContentLoaded', () => {
    // 各HTML要素の取得
    const performanceListSection = document.getElementById('performance-list'); // 公演一覧セクション
    const reservationFormSection = document.getElementById('reservation-form-section'); // 予約フォームセクション
    const detailButtons = document.querySelectorAll('.detail-button'); // 各公演の詳細ボタン
    const selectedPerformanceTitle = document.getElementById('selected-performance-title'); // 予約フォームの公演タイトル表示要素
    const showDateSelect = document.getElementById('show-date'); // 上演日時選択ドロップダウン
    const reservationForm = document.getElementById('reservation-form'); // 予約フォーム
    const backToListButton = document.getElementById('back-to-list-button'); // 公演一覧に戻るボタン
    const selectedPerformanceIdInput = document.getElementById('selected-performance-id'); // 選択された公演IDを保持する隠しフィールド

    // 仮の公演データ（本来はバックエンドから取得します）
    // IMPORTANT: show.id をデータベースのIDに合わせて整数値に変更しました。
    const performances = {
        'perf001': { // このIDはフロントエンド内部での識別用
            title: '感動のミュージカル「星の歌」',
            shows: [
                // ここで、データベースに実際に追加するshowsテーブルのIDと合わせる必要があります。
                // 例として、仮の整数IDを割り当てます。
                // 実際のアプリでは、バックエンドから取得したshowsのID（整数）を使用します。
                { id: 1, date: '2025年8月1日(木) 14:00', capacity: 100, remaining: 80 },
                { id: 2, date: '2025年8月2日(金) 18:30', capacity: 100, remaining: 50 },
                { id: 3, date: '2025年8月3日(土) 13:00', capacity: 100, remaining: 10 },
                { id: 4, date: '2025年8月4日(日) 13:00', capacity: 100, remaining: 0 } // 満席の例
            ]
        },
        'perf002': { // このIDはフロントエンド内部での識別用
            title: '古典落語傑作選「笑いの殿堂」',
            shows: [
                // ここで、データベースに実際に追加するshowsテーブルのIDと合わせる必要があります。
                { id: 5, date: '2025年9月5日(金) 19:00', capacity: 80, remaining: 70 },
                { id: 6, date: '2025年9月6日(土) 15:00', capacity: 80, remaining: 25 }
            ]
        }
        // 他の公演データもここに追加
    };

    // --- イベントリスナーの設定 ---

    // 1. 各公演の「詳細・予約へ」ボタンのクリックイベント
    detailButtons.forEach(button => {
        button.addEventListener('click', () => {
            const performanceId = button.dataset.performanceId; // data-performance-id属性から公演IDを取得
            const selectedPerformance = performances[performanceId]; // 選択された公演データを取得

            if (selectedPerformance) {
                // 予約フォームセクションに公演情報を設定
                selectedPerformanceTitle.textContent = selectedPerformance.title; // 公演タイトルを設定
                selectedPerformanceIdInput.value = performanceId; // 隠しフィールドに公演IDを設定

                // 上演日時ドロップダウンをクリア
                showDateSelect.innerHTML = '<option value="">日時を選択してください</option>';

                // 選択された公演の上演日時をドロップダウンに追加
                selectedPerformance.shows.forEach(show => {
                    const option = document.createElement('option');
                    // option.value には、データベースの shows テーブルの実際のID（整数）を設定します
                    option.value = show.id; // show.id は整数値になりました
                    // 残席がある場合のみ選択可能にする
                    if (show.remaining > 0) {
                        option.textContent = `${show.date} (残席: ${show.remaining})`;
                    } else {
                        option.textContent = `${show.date} (満席)`;
                        option.disabled = true; // 満席の場合は選択不可にする
                    }
                    showDateSelect.appendChild(option);
                });

                // 画面を切り替える: 公演一覧を非表示、予約フォームを表示
                performanceListSection.style.display = 'none';
                reservationFormSection.style.display = 'block';
                window.scrollTo(0, 0); // ページトップにスクロール
            } else {
                console.error('選択された公演が見つかりません:', performanceId);
                // エラーメッセージをユーザーに表示するなどの処理
            }
        });
    });

    // 2. 予約フォームの送信イベント
    reservationForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // フォームのデフォルト送信を防ぐ

        // フォームデータの取得
        const formData = new FormData(reservationForm);
        const reservationData = {
            performanceId: formData.get('performance-id'), // これは現在バックエンドでは使用していませんが、将来のために残します
            showId: parseInt(formData.get('show-date'), 10), // ここで showId を整数に変換！
            userName: formData.get('user-name'),
            userEmail: formData.get('user-email'),
            numTickets: parseInt(formData.get('num-tickets'), 10),
            notes: formData.get('notes')
        };

        console.log('送信する予約データ:', reservationData);

        try {
            // バックエンドAPIへのデータ送信
            const response = await fetch('http://localhost:3000/api/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reservationData)
            });

            const result = await response.json();

            if (response.ok) { // HTTPステータスコードが2xxの場合
                console.log('予約成功:', result);
                displayMessage(`予約が完了しました！\n受付番号: ${result.receiptNumber}\nご登録のメールアドレスに詳細をお送りしました。`, 'success');
                reservationForm.reset(); // フォームをリセット
                // 予約成功後、公演一覧に戻る
                performanceListSection.style.display = 'block';
                reservationFormSection.style.display = 'none';
                window.scrollTo(0, 0); // ページトップにスクロール

                // 予約成功後、公演リストを再読み込みして残席数を更新する処理があれば理想的
                // 例: fetchPerformances(); // 仮の関数
            } else {
                console.error('予約エラー:', result.error || '不明なエラー');
                displayMessage(`予約に失敗しました: ${result.error || '不明なエラー'}`, 'error');
            }
        } catch (error) {
            console.error('通信エラー:', error);
            displayMessage('サーバーとの通信中にエラーが発生しました。', 'error');
        }
    });

    // 3. 「公演一覧に戻る」ボタンのクリックイベント
    backToListButton.addEventListener('click', () => {
        // 画面を切り替える: 予約フォームを非表示、公演一覧を表示
        reservationFormSection.style.display = 'none';
        performanceListSection.style.display = 'block';
        window.scrollTo(0, 0); // ページトップにスクロール
    });

    // カスタムメッセージボックスの表示関数 (alertの代替)
    function displayMessage(message, type = 'info') {
        let messageBox = document.getElementById('custom-message-box');
        if (!messageBox) {
            messageBox = document.createElement('div');
            messageBox.id = 'custom-message-box';
            document.body.appendChild(messageBox);
        }
        messageBox.textContent = message;
        messageBox.className = `message-box ${type}`; // スタイルクラスを追加
        messageBox.style.display = 'block';

        // 数秒後に自動的に非表示にする
        setTimeout(() => {
            messageBox.style.display = 'none';
        }, 3000);
    }

    // カスタムメッセージボックス用のCSSを動的に追加
    const style = document.createElement('style');
    style.textContent = `
        #custom-message-box {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #4CAF50; /* Success green */
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            display: none; /* 初期は非表示 */
            font-size: 1.1em;
            text-align: center;
            opacity: 0.95;
            transition: opacity 0.3s ease-in-out;
        }
        #custom-message-box.success {
            background-color: #4CAF50;
        }
        #custom-message-box.error {
            background-color: #f44336; /* Error red */
        }
        #custom-message-box.info {
            background-color: #2196F3; /* Info blue */
        }
    `;
    document.head.appendChild(style);
});
