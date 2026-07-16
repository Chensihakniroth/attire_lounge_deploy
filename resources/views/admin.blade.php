<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Admin Panel | Attire Lounge Official</title>
        <meta name="robots" content="noindex, nofollow">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Bayon&family=Kantumruy+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600&display=swap" rel="stylesheet">
        <link rel="icon" type="image/png" href="https://bucket-production-4ca0.up.railway.app/product-assets/uploads/asset/ALO.png">
        <link href="{{ asset('/css/app.css') }}?v={{ time() }}" rel="stylesheet">
        <script src="{{ asset('/js/admin-head.js') }}?v={{ time() }}"></script>
        <style>
            .initial-loader {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                width: 100vw;
                position: fixed;
                top: 0;
                left: 0;
                z-index: 9999;
                transition: opacity 0.4s ease-out;
            }
            .loader-line-container {
                width: 120px;
                height: 2px;
                background: rgba(212, 175, 55, 0.1);
                border-radius: 4px;
                position: relative;
                overflow: hidden;
            }
            .loader-line-progress {
                position: absolute;
                left: -100%;
                width: 100%;
                height: 100%;
                background: #d4af37;
                animation: loading-bar 1.8s cubic-bezier(0.65, 0, 0.35, 1) infinite;
            }
            @keyframes loading-bar {
                0% { left: -100%; }
                50% { left: 0; }
                100% { left: 100%; }
            }
            /* Hide loader once React mounts */
            #admin-app:not(:empty) .initial-loader {
                display: none;
            }
        </style>
    </head>
    <body class="bg-gray-50 dark:bg-[#050505]">
        <div id="admin-app">
            <div class="initial-loader">
                <div class="loader-line-container">
                    <div class="loader-line-progress"></div>
                </div>
            </div>
        </div>
        <script type="module" src="{{ asset('/js/admin.js') }}?v={{ time() }}"></script>
    </body>
</html>