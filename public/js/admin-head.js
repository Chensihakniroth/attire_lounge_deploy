// Avoid FOUC (Flash of Unstyled Content) and white flash
(function () {
    var storedTheme = localStorage.getItem('admin-theme');
    var systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = storedTheme || (systemPrefersDark ? 'dark' : 'light');

    var bgColor = theme === 'dark' ? '#050505' : '#f9fafb';
    var fgColor = theme === 'dark' ? '#ffffff' : '#111827';

    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    document.write(
        '<style>' +
            'body { background-color: ' + bgColor + ' !important; color: ' + fgColor + ' !important; }' +
            '.initial-loader { background-color: ' + bgColor + '; }' +
        '</style>'
    );
})();
