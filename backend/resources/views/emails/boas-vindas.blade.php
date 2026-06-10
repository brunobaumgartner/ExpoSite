<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bem-vindo ao ExpoSite</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; }
        .header { background: #1a1a2e; padding: 32px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 24px; }
        .body { padding: 32px; color: #333; line-height: 1.6; }
        .body h2 { color: #1a1a2e; }
        .btn { display: inline-block; background: #4f46e5; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; margin: 8px 4px; }
        .btn-telegram { background: #0088cc; }
        .footer { background: #f4f4f4; padding: 16px; text-align: center; font-size: 12px; color: #999; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>ExpoSite</h1>
        </div>
        <div class="body">
            <h2>Sua conta está pronta!</h2>
            <p>Olá! Seu cadastro no ExpoSite foi concluído com sucesso. Agora você pode criar e gerenciar seu site diretamente pelo Telegram.</p>

            <p><strong>Seu subdomínio:</strong> {{ $cliente->subdominio }}</p>

            <p>Para começar, clique no botão abaixo para acessar seu assistente no Telegram:</p>

            <p style="text-align: center;">
                <a href="{{ $link_telegram }}" class="btn btn-telegram">Abrir no Telegram</a>
            </p>

            <p>Você também pode acessar o painel de controle pelo link abaixo:</p>

            <p style="text-align: center;">
                <a href="{{ $link_painel }}" class="btn">Acessar o Painel</a>
            </p>

            <p>Se precisar de ajuda, responda a este e-mail.</p>
        </div>
        <div class="footer">
            ExpoSite &mdash; Crie seu site por voz e texto no Telegram
        </div>
    </div>
</body>
</html>
