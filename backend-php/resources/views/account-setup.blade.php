<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="referrer" content="no-referrer">
    <title>Set up your {{ config('app.name') }} account</title>
    <style>
        body { font-family: system-ui, sans-serif; background: #f1f5f9; color: #0f172a; display: grid; min-height: 100vh; place-items: center; margin: 0; }
        main { background: white; border-radius: 16px; box-shadow: 0 12px 36px #0f172a1a; max-width: 420px; padding: 32px; width: calc(100% - 40px); }
        h1 { font-size: 1.4rem; margin-top: 0; }
        label { display: block; font-weight: 600; margin: 16px 0 6px; }
        input { border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box; font: inherit; padding: 11px; width: 100%; }
        button { background: #0369a1; border: 0; border-radius: 8px; color: white; cursor: pointer; font: inherit; font-weight: 700; margin-top: 20px; padding: 12px; width: 100%; }
        #message { margin-top: 16px; }
    </style>
</head>
<body>
<main>
    <h1>Set your account password</h1>
    <p>Choose a new password with at least 12 characters. This setup link can only be used once.</p>
    <form id="setup-form">
        <input type="hidden" name="token" value="">
        <label for="password">New password</label>
        <input id="password" name="password" type="password" minlength="12" autocomplete="new-password" required>
        <label for="password_confirmation">Confirm password</label>
        <input id="password_confirmation" name="password_confirmation" type="password" minlength="12" autocomplete="new-password" required>
        <button type="submit">Set password</button>
    </form>
    <hr>
    <h2>Need a fresh setup link?</h2>
    <form id="request-form">
        <label for="identifier">Student admission number or staff ID</label>
        <input id="identifier" name="identifier" autocomplete="username" required>
        <label for="email">Registered parent/guardian or staff email</label>
        <input id="email" name="email" type="email" autocomplete="email" required>
        <button type="submit">Request a new link</button>
    </form>
    <p id="message" role="status" aria-live="polite"></p>
</main>
<script>
    const form = document.getElementById('setup-form');
    const message = document.getElementById('message');
    const token = new URLSearchParams(window.location.hash.slice(1)).get('token') || '';
    form.elements.token.value = token;
    window.history.replaceState(null, '', window.location.pathname);
    if (!token) {
        form.remove();
    }
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        message.textContent = 'Saving password…';
        const payload = Object.fromEntries(new FormData(form).entries());
        try {
            const response = await fetch('/api/auth/account-setup', {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            message.textContent = response.ok ? result.message : (result.message || 'The setup link could not be used.');
            if (response.ok) form.remove();
        } catch {
            message.textContent = 'Unable to contact the server. Please try again.';
        }
    });

    document.getElementById('request-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        message.textContent = 'Sending request…';
        const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
        try {
            const response = await fetch('/api/auth/account-setup/request', {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            message.textContent = result.message || 'If the account details match, a setup link will be sent.';
        } catch {
            message.textContent = 'Unable to contact the server. Please try again.';
        }
    });
</script>
</body>
</html>
