<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seu site foi suspenso</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; }
        .header { background: #dc2626; padding: 32px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 24px; }
        .body { padding: 32px; color: #333; line-height: 1.6; }
        .body h2 { color: #991b1b; }
        .btn { display: inline-block; background: #4f46e5; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; margin: 8px 4px; }
        .footer { background: #f4f4f4; padding: 16px; text-align: center; font-size: 12px; color: #999; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>ExpoSite</h1>
        </div>
        <div class="body">
            <h2>Seu site foi suspenso</h2>
            <p>O site <strong>{{ $cliente->subdominio }}</strong> foi suspenso por falta de renovação do plano.</p>
            <p>Seus dados estão preservados. Para reativar o acesso completo ao seu site e ao assistente Telegram, renove seu plano agora.</p>
            <p style="text-align: center;">
                <a href="{{ config('app.url') }}/painel/faturamento" class="btn">Reativar Agora</a>
            </p>
            <p>Se precisar de ajuda, responda a este e-mail.</p>
        </div>
        <div class="footer">
            ExpoSite &mdash; Crie seu site por voz e texto no Telegram
        </div>
    </div>
</body>
</html>
