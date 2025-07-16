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
    const performances = {
        'perf001': {
            title: '感動のミュージカル「星の歌」',
            shows: [
                { id: 'show001-0801', date: '2025年8月1日(木) 14:00', capacity: 100, remaining: 80 },
                { id: 'show001-0802', date: '2025年8月2日(金) 18:30', capacity: 100, remaining: 50 },
                { id: 'show001-0803', date: '2025年8月3日(土) 13:00', capacity: 100, remaining: 10 },
                { id: 'show001-0804', date: '2025年8月4日(日) 13:00', capacity: 100, remaining: 0 } // 満席の例
            ]
        },
        'perf002': {
            title: '古典落語傑作選「笑いの殿堂」',
            shows: [
                { id: 'show002-0905', date: '2025年9月5日(金) 19:00', capacity: 80, remaining: 70 },
                { id: 'show002-0906', date: '2025年9月6日(土) 15:00', capacity: 80, remaining: 25 }
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
                    option.value = show.id; // 上演IDを値に設定
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
            performanceId: formData.get('performance-id'),
            showId: formData.get('show-date'),
            userName: formData.get('user-name'),
            userEmail: formData.get('user-email'),
            numTickets: parseInt(formData.get('num-tickets'), 10),
            notes: formData.get('notes')
        };

        console.log('予約データ:', reservationData);

        // ここでバックエンドAPIへのデータ送信処理を実装します
        // 例: fetch('/api/reservations', { method: 'POST', body: JSON.stringify(reservationData), headers: { 'Content-Type': 'application/json' } })
        //     .then(response => response.json())
        //     .then(data => {
        //         console.log('予約成功:', data);
        //         // 予約完了メッセージの表示や、完了画面への遷移
        //         alert(`予約が完了しました！\n受付番号: ${data.receiptNumber || 'XXXX-XXXX'}\nご登録のメールアドレスに詳細をお送りしました。`);
        //         reservationForm.reset(); // フォームをリセット
        //         // 公演一覧に戻る
        //         performanceListSection.style.display = 'block';
        //         reservationFormSection.style.display = 'none';
        //     })
        //     .catch(error => {
        //         console.error('予約エラー:', error);
        //         alert('予約中にエラーが発生しました。もう一度お試しください。');
        //     });

        // 現時点では、仮の成功メッセージとフォームリセット、画面切り替え
        // 実際のアプリでは、バックエンドからのレスポンスを待ってからこれらの処理を行います。
        // alert('予約を送信しました！ (これはデモです)'); // alertは非推奨のため、カスタムメッセージボックスに置き換える
        displayMessage('予約を送信しました！これはデモです。', 'success');
        reservationForm.reset(); // フォームをリセット
        performanceListSection.style.display = 'block'; // 公演一覧に戻る
        reservationFormSection.style.display = 'none';
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
