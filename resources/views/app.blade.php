<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Attire Lounge Official | Styling House & Luxury Menswear</title>
        <meta name="description" content="Attire Lounge Official is Phnom Penh's Styling House, offering Milan-certified expert styling, curated luxury menswear collections, and personalized fashion consulting for the modern gentleman.">
        <meta name="robots" content="index, follow">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Bayon&family=Kantumruy+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600&display=swap" rel="stylesheet">
        <link rel="icon" type="image/png" href="https://bucket-production-4ca0.up.railway.app/product-assets/uploads/asset/ALO.png">
        <link href="{{ asset('/css/app.css') }}?v={{ time() }}" rel="stylesheet">
    </head>
    <body class="bg-background text-foreground antialiased" style="background-color: #000000;">
        <div id="app"></div>
        <script type="module" src="{{ asset('/js/app.js') }}?v={{ time() }}"></script>
    </body>
</html>