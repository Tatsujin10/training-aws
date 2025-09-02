const css = `
/* リセットとベース設定 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f4f4f4;
}

/* ヘッダー */
header {
    background-color: #35424a;
    color: #ffffff;
    padding: 1rem 0;
    text-align: center;
}

header h1 {
    margin-bottom: 1rem;
}

nav ul {
    list-style: none;
    display: flex;
    justify-content: center;
    gap: 2rem;
}

nav a {
    color: #ffffff;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: background-color 0.3s;
}

nav a:hover {
    background-color: #e8491d;
}

/* メインコンテンツ */
main {
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

main h2 {
    color: #35424a;
    margin-bottom: 1rem;
    border-bottom: 2px solid #e8491d;
    padding-bottom: 0.5rem;
}

main h3 {
    color: #35424a;
    margin: 1.5rem 0 0.5rem;
}

main ul {
    margin-left: 2rem;
    margin-top: 1rem;
}

main p {
    margin-bottom: 1rem;
}

.contact-info {
    background-color: #f9f9f9;
    padding: 1rem;
    border-left: 4px solid #e8491d;
    margin-top: 1rem;
}

/* フッター */
footer {
    text-align: center;
    padding: 1rem;
    background-color: #35424a;
    color: #ffffff;
    position: fixed;
    bottom: 0;
    width: 100%;
}
`;

const createHtmlTemplate = (title, content, basePath = '') => `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>${css}</style>
</head>
<body>
    <header>
        <h1>AWS Lambdaで構築したWebサイト</h1>
        <nav>
            <ul>
                <li><a href="${basePath}/">ホーム</a></li>
                <li><a href="${basePath}/about">概要</a></li>
                <li><a href="${basePath}/contact">お問い合わせ</a></li>
            </ul>
        </nav>
    </header>
    ${content}
    <footer>
        <p>&copy; 2024 AWS Training Site</p>
    </footer>
</body>
</html>
`;

const pages = {
    '/': {
        title: 'AWS Lambda Webサイト - ホーム',
        content: (basePath) => `
            <main>
                <h2>ようこそ！</h2>
                <p>このWebサイトはAWS Lambda上で動作しています。</p>
                <p>API Gatewayを通じてHTTPS接続を提供し、サーバーレスアーキテクチャで構築されています。</p>
                <p>従来のEC2 + Apacheから、よりスケーラブルで費用効率の良いLambda + API Gatewayに移行しました。</p>
            </main>
        `
    },
    '/about': {
        title: 'AWS Lambda Webサイト - 概要',
        content: (basePath) => `
            <main>
                <h2>サイト概要</h2>
                <p>このサイトはAWS Lambdaを使用したサーバーレスWebアプリケーションのデモです。</p>
                <h3>使用技術</h3>
                <ul>
                    <li>AWS Lambda (Node.js)</li>
                    <li>API Gateway</li>
                    <li>HTML/CSS</li>
                    <li>JavaScript</li>
                </ul>
                <h3>特徴</h3>
                <ul>
                    <li>サーバーレスアーキテクチャ</li>
                    <li>自動スケーリング</li>
                    <li>従量課金制</li>
                    <li>高可用性</li>
                </ul>
            </main>
        `
    },
    '/contact': {
        title: 'AWS Lambda Webサイト - お問い合わせ',
        content: (basePath) => `
            <main>
                <h2>お問い合わせ</h2>
                <p>このサイトは学習用のデモサイトです。</p>
                <p>実際のお問い合わせフォームは実装されていません。</p>
                <div class="contact-info">
                    <p><strong>Email:</strong> demo@example.com</p>
                    <p><strong>電話:</strong> 000-0000-0000</p>
                </div>
            </main>
        `
    }
};

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    try {
        // API Gatewayからのパスとステージ情報を取得
        const path = event.path || event.rawPath || event.pathParameters?.proxy || '/';
        const stage = event.requestContext?.stage || '';
        const basePath = stage ? `/${stage}` : '';
        
        console.log('Path:', path, 'Stage:', stage, 'BasePath:', basePath);
        
        // 対応するページがある場合
        if (pages[path]) {
            const page = pages[path];
            const html = createHtmlTemplate(page.title, page.content(basePath), basePath);
            
            const response = {
                statusCode: 200,
                headers: {
                    'Content-Type': 'text/html; charset=utf-8',
                    'Cache-Control': 'public, max-age=300'
                },
                body: html,
                isBase64Encoded: false
            };
            
            console.log('Response headers:', response.headers);
            return response;
        }
        
        // CSSファイルのリクエスト（念のため）
        if (path === '/style.css') {
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'text/css; charset=utf-8',
                    'Cache-Control': 'public, max-age=3600'
                },
                body: css,
                isBase64Encoded: false
            };
        }
        
        // 404エラーページ
        const notFoundHtml = createHtmlTemplate('ページが見つかりません', `
            <main>
                <h2>404 - ページが見つかりません</h2>
                <p>お探しのページは見つかりませんでした。</p>
                <p><a href="${basePath}/">ホームページに戻る</a></p>
            </main>
        `, basePath);
        
        return {
            statusCode: 404,
            headers: {
                'Content-Type': 'text/html; charset=utf-8'
            },
            body: notFoundHtml,
            isBase64Encoded: false
        };
        
    } catch (error) {
        console.error('Error:', error);
        
        const errorHtml = createHtmlTemplate('エラー', `
            <main>
                <h2>500 - サーバーエラー</h2>
                <p>サーバーでエラーが発生しました。</p>
                <p><a href="${basePath}/">ホームページに戻る</a></p>
            </main>
        `, basePath);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'text/html; charset=utf-8'
            },
            body: errorHtml,
            isBase64Encoded: false
        };
    }
};