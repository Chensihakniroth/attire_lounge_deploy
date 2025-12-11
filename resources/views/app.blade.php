<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>Attire Lounge - Gentlemen's Clothing Catalog</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700|playfair-display:400,500,600,700" rel="stylesheet" />

    <!-- CSS -->
    <link rel="stylesheet" href="/css/app.css">

    <style>
        /* Fallback */
        body { margin: 0; font-family: 'Inter', sans-serif; }
    </style>
</head>
<body>
    <div id="app"></div>

    <!-- JavaScript -->
    <script src="/js/app.js"></script>
</body>
</html>
