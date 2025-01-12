document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('theme-box').addEventListener('change', (e) => {
        const theme = e.target.checked ? 'dark' : 'light';

        chrome.storage.sync.set({'theme':theme}, () => {
            console.log('saved settings')
        });

        document.body.classList.toggle('dark-mode', theme === 'dark');

        alert('Reload Inna for changes to apply');
    });

    // load prev state
    chrome.storage.sync.get('theme', (savedTheme) => {
        if (savedTheme.theme) {
            document.body.classList.toggle('dark-mode', savedTheme.theme === 'dark');
            document.getElementById('theme-box').checked = savedTheme.theme === 'dark';
        }
    })
    
});
