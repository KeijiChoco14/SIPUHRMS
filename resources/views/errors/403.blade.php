<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>403 - Access Denied | SIPU Swiss-Belinn</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600,700,800&display=swap" rel="stylesheet" />
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Figtree', sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
            color: #f8fafc;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
        }
        .card {
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 24px;
            padding: 2.5rem;
            max-width: 520px;
            width: 100%;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .icon-wrap {
            width: 80px;
            height: 80px;
            margin: 0 auto 1.5rem;
            background: linear-gradient(135deg, #e11d48, #f59e0b);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 10px 25px rgba(225, 29, 72, 0.4);
        }
        .icon-wrap svg {
            width: 44px;
            height: 44px;
            stroke: #fff;
            fill: none;
        }
        .badge {
            display: inline-block;
            font-size: 0.75rem;
            font-weight: 700;
            color: #fca5a5;
            background: rgba(239, 68, 68, 0.15);
            border: 1px solid rgba(239, 68, 68, 0.3);
            padding: 0.3rem 0.8rem;
            border-radius: 9999px;
            margin-bottom: 0.75rem;
        }
        h1 {
            font-size: 1.75rem;
            font-weight: 800;
            margin-bottom: 0.75rem;
            letter-spacing: -0.02em;
        }
        p {
            color: #cbd5e1;
            font-size: 0.925rem;
            line-height: 1.6;
            margin-bottom: 1.75rem;
        }
        .btn-row {
            display: flex;
            gap: 0.75rem;
            justify-content: center;
            flex-wrap: wrap;
        }
        .btn-primary {
            background: #4f46e5;
            color: #fff;
            text-decoration: none;
            padding: 0.75rem 1.5rem;
            border-radius: 12px;
            font-weight: 700;
            font-size: 0.875rem;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
            transition: all 0.2s;
        }
        .btn-primary:hover {
            background: #4338ca;
            transform: translateY(-1px);
        }
        .btn-secondary {
            background: rgba(255, 255, 255, 0.1);
            color: #e2e8f0;
            text-decoration: none;
            padding: 0.75rem 1.25rem;
            border-radius: 12px;
            font-weight: 600;
            font-size: 0.875rem;
            border: 1px solid rgba(255, 255, 255, 0.15);
            cursor: pointer;
            transition: all 0.2s;
        }
        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.18);
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon-wrap">
            <svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
        </div>
        <div class="badge">403 FORBIDDEN • RESTRICTED ACCESS</div>
        <h1>Access Denied</h1>
        <p>{{ $exception->getMessage() ?: 'Sorry, your account does not have the required permissions or role to view this page or module.' }}</p>
        <div class="btn-row">
            <a href="{{ route('dashboard') }}" class="btn-primary">
                ⊞ Return to Main Menu
            </a>
            <button onclick="window.history.back()" class="btn-secondary">
                ↺ Go Back
            </button>
        </div>
    </div>
</body>
</html>
