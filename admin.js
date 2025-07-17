// admin.js

document.addEventListener('DOMContentLoaded', () => {
    // HTML要素の取得
    const adminLoginSection = document.getElementById('admin-login-section');
    const adminLoginForm = document.getElementById('admin-login-form');
    const loginMessage = document.getElementById('login-message');
    const adminDashboardSection = document.getElementById('admin-dashboard-section');
    const reservationsTableBody = document.querySelector('#reservations-table tbody');
    const dashboardMessage = document.getElementById('dashboard-message');
    const exportCsvButton = document.getElementById('export-csv-button');
    const logoutButton = document.getElementById('logout-button');

    const BACKEND_BASE_URL = 'http://localhost:3000'; // バックエンドのURL

    // --- ユーティリティ関数 ---

    /**
     * メッセージを表示する関数
     * @param {HTMLElement} element - メッセージを表示する要素
     * @param {string} message - 表示するメッセージ
     * @param {string} type - メッセージのタイプ ('success', 'error', 'info')
     */
    function displayMessage(element, message, type) {
        element.textContent = message;
        element.className = `message-box ${type}`;
        element.style.display = 'block';
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000); // 5秒後に非表示
    }

    /**
     * 認証トークンを取得する
     * @returns {string|null} JWTトークン、またはnull
     */
    function getAuthToken() {
        return localStorage.getItem('adminToken');
    }

    /**
     * 認証トークンを保存する
     * @param {string} token - 保存するJWTトークン
     */
    function setAuthToken(token) {
        localStorage.setItem('adminToken', token);
    }

    /**
     * 認証トークンを削除する
     */
    function removeAuthToken() {
        localStorage.removeItem('adminToken');
    }

    /**
     * 認証状態に基づいて画面を切り替える
     */
    function checkAuthAndRender() {
        const token = getAuthToken();
        if (token) {
            // トークンがある場合はダッシュボードを表示
            adminLoginSection.style.display = 'none';
            adminDashboardSection.style.display = 'block';
            logoutButton.style.display = 'inline-block'; // ログアウトボタン表示
            fetchReservations(); // 予約データを取得して表示
        } else {
            // トークンがない場合はログイン画面を表示
            adminLoginSection.style.display = 'block';
            adminDashboardSection.style.display = 'none';
            logoutButton.style.display = 'none'; // ログアウトボタン非表示
        }
    }

    // --- イベントリスナー ---

    // 管理者ログインフォームの送信イベント
    adminLoginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;

        try {
            const response = await fetch(`${BACKEND_BASE_URL}/api/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (response.ok) {
                setAuthToken(result.token);
                displayMessage(loginMessage, 'ログイン成功！', 'success');
                adminLoginForm.reset(); // フォームをリセット
                checkAuthAndRender(); // ダッシュボードに切り替え
            } else {
                displayMessage(loginMessage, result.error || 'ログインに失敗しました。', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            displayMessage(loginMessage, 'サーバーとの通信中にエラーが発生しました。', 'error');
        }
    });

    // 予約データを取得してテーブルに表示する関数
    async function fetchReservations() {
        reservationsTableBody.innerHTML = '<tr><td colspan="10">予約データを読み込み中...</td></tr>'; // ローディング表示
        const token = getAuthToken();
        if (!token) {
            displayMessage(dashboardMessage, '認証トークンがありません。ログインしてください。', 'error');
            checkAuthAndRender(); // ログイン画面に戻す
            return;
        }

        try {
            const response = await fetch(`${BACKEND_BASE_URL}/api/admin/reservations`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}` // トークンをヘッダーに含める
                }
            });

            if (response.status === 401 || response.status === 403) {
                // トークンが無効または期限切れの場合
                displayMessage(dashboardMessage, '認証エラー。再度ログインしてください。', 'error');
                removeAuthToken();
                checkAuthAndRender();
                return;
            }

            const reservations = await response.json();

            if (response.ok) {
                renderReservationsTable(reservations);
                if (reservations.length === 0) {
                    displayMessage(dashboardMessage, '現在、予約データはありません。', 'info');
                } else {
                    dashboardMessage.style.display = 'none'; // メッセージを非表示に
                }
            } else {
                displayMessage(dashboardMessage, reservations.error || '予約データの取得に失敗しました。', 'error');
            }
        } catch (error) {
            console.error('Error fetching reservations:', error);
            displayMessage(dashboardMessage, 'サーバーとの通信中にエラーが発生しました。', 'error');
        }
    }

    // 予約データをテーブルにレンダリングする関数
    function renderReservationsTable(reservations) {
        reservationsTableBody.innerHTML = ''; // 既存の行をクリア
        if (reservations.length === 0) {
            reservationsTableBody.innerHTML = '<tr><td colspan="10">予約データがありません。</td></tr>';
            return;
        }

        reservations.forEach(reservation => {
            const row = reservationsTableBody.insertRow();
            row.insertCell().textContent = reservation.reservation_id;
            row.insertCell().textContent = reservation.receipt_number;
            row.insertCell().textContent = reservation.performance_name;
            row.insertCell().textContent = new Date(reservation.start_time).toLocaleString('ja-JP', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', weekday: 'short',
                hour12: false
            });
            row.insertCell().textContent = reservation.user_name;
            row.insertCell().textContent = reservation.user_email;
            row.insertCell().textContent = reservation.num_tickets;
            row.insertCell().textContent = reservation.notes || ''; // 備考がない場合は空文字列
            row.insertCell().textContent = reservation.is_cancelled ? 'はい' : 'いいえ';
            row.insertCell().textContent = new Date(reservation.created_at).toLocaleString('ja-JP', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit',
                hour12: false
            });
        });
    }

    // CSVエクスポートボタンのクリックイベント
    exportCsvButton.addEventListener('click', async () => {
        const token = getAuthToken();
        if (!token) {
            displayMessage(dashboardMessage, '認証トークンがありません。ログインしてください。', 'error');
            return;
        }

        displayMessage(dashboardMessage, 'CSVファイルを生成中...', 'info');

        try {
            const response = await fetch(`${BACKEND_BASE_URL}/api/admin/reservations/export/csv`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}` // トークンをヘッダーに含める
                }
            });

            if (response.status === 401 || response.status === 403) {
                displayMessage(dashboardMessage, '認証エラー。再度ログインしてください。', 'error');
                removeAuthToken();
                checkAuthAndRender();
                return;
            }

            if (response.ok) {
                // Blobとしてレスポンスを取得し、ファイルとしてダウンロード
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = 'reservations.csv'; // ダウンロードファイル名
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                displayMessage(dashboardMessage, 'CSVファイルがダウンロードされました。', 'success');
            } else {
                const errorText = await response.text(); // エラーレスポンスをテキストとして取得
                displayMessage(dashboardMessage, `CSVエクスポートに失敗しました: ${errorText}`, 'error');
            }
        } catch (error) {
            console.error('CSV export error:', error);
            displayMessage(dashboardMessage, 'サーバーとの通信中にエラーが発生しました。', 'error');
        }
    });

    // ログアウトボタンのクリックイベント
    logoutButton.addEventListener('click', () => {
        removeAuthToken();
        displayMessage(loginMessage, 'ログアウトしました。', 'info');
        checkAuthAndRender(); // ログイン画面に戻す
    });

    // 初期ロード時に認証状態をチェックして画面をレンダリング
    checkAuthAndRender();
});
