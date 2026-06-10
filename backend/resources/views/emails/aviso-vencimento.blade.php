<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seu plano vence em 3 dias</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; }
        .header { background: #f59e0b; padding: 32px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 24px; }
        .body { padding: 32px; color: #333; line-height: 1.6; }
        .body h2 { color: #92400e; }
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
            <h2>Seu plano vence em 3 dias</h2>
            <p>Olá! Este é um aviso de que o plano do <strong>{{ $cliente->subdominio }}</strong> vencerá em 3 dias.</p>
            <p>Para evitar a suspensão do seu site e perder o acesso ao assistente, renove seu plano antes da data de vencimento.</p>
            <p style="text-align: center;">
                <a href="{{ config('app.url') }}/painel/faturamento" class="btn">Renovar Plano</a>
            </p>
        </div>
        <div class="footer">
            ExpoSite &mdash; Crie seu site por voz e texto no Telegram
        </div>
    </div>
</body>
</html>
