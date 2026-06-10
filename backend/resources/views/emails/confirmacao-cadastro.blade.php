<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirme seu cadastro</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; }
        .header { background: #1a1a2e; padding: 32px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 24px; }
        .body { padding: 32px; color: #333; line-height: 1.6; }
        .body h2 { color: #1a1a2e; }
        .btn { display: inline-block; background: #4f46e5; color: #fff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 16px 0; }
        .info { background: #f8f9ff; border-left: 4px solid #4f46e5; padding: 16px; border-radius: 4px; margin: 16px 0; }
        .footer { background: #f4f4f4; padding: 16px; text-align: center; font-size: 12px; color: #999; }
        .link { color: #4f46e5; word-break: break-all; font-size: 13px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>ExpoSite</h1>
        </div>
        <div class="body">
            <h2>Olá, {{ $registro->nome }}! 👋</h2>
            <p>Recebemos seu cadastro no ExpoSite. Para ativar sua conta, clique no botão abaixo para confirmar seu e-mail:</p>

            <p style="text-align: center;">
                <a href="{{ $link_confirmacao }}" class="btn">Confirmar meu e-mail</a>
            </p>

            <div class="info">
                <strong>Resumo do seu cadastro:</strong><br>
                Empresa: {{ $registro->nome_empresa }}<br>
                Tipo de site: {{ $registro->tipo_site }}<br>
                @if($registro->slug_desejado)
                Endereço desejado: {{ $registro->slug_desejado }}.exposite.com.br<br>
                @endif
            </div>

            <p>Após confirmar, entraremos em contato para ativar seu site no Telegram.</p>

            <p style="font-size: 13px; color: #666;">
                Se o botão não funcionar, copie e cole este link no navegador:<br>
                <a href="{{ $link_confirmacao }}" class="link">{{ $link_confirmacao }}</a>
            </p>

            <p style="font-size: 13px; color: #999;">
                Se você não fez este cadastro, ignore este e-mail.
            </p>
        </div>
        <div class="footer">
            ExpoSite &mdash; Crie seu site por voz e texto no Telegram
        </div>
    </div>
</body>
</html>
