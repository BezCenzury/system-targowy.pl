// Główny plik skryptów. Na ten moment pusty.

document.addEventListener('DOMContentLoaded', () => {
    // Mechanizm dla formularza w tle
    setInterval(processFormQueue, 5 * 60 * 1000); // Co 5 minut

    window.addEventListener('online', () => {
        processFormQueue();
    });

    async function processFormQueue() {
        if (!navigator.onLine) return; // Jeśli nie ma internetu, nie ruszamy kolejki

        let queue = [];
        try {
            const stored = localStorage.getItem('failedFormSubmissions');
            if (stored) {
                queue = JSON.parse(stored);
            }
        } catch (e) {
            console.error('Błąd odczytu localStorage:', e);
        }

        if (queue.length === 0) return;

        const stillFailed = [];
        const webhookUrl = 'https://hook.eu2.make.com/g0bia9g333fehks9pjyh2ns8gdtkbx7e';

        for (const payload of queue) {
            try {
                const response = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                if (!response.ok) {
                    throw new Error('Network response not ok');
                }
                // Jeśli wysłane pomyślnie, nie dodajemy tego z powrotem.
            } catch (error) {
                console.error('Błąd ponownej wysyłki w tle:', error);
                stillFailed.push(payload); // Dodajemy ponownie te, które znowu zawiodły
            }
        }

        if (stillFailed.length !== queue.length) {
            localStorage.setItem('failedFormSubmissions', JSON.stringify(stillFailed));
        } else if (stillFailed.length === 0) {
            localStorage.removeItem('failedFormSubmissions');
        }
    }
    
    // Uruchamiamy jednorazowo przy załadowaniu na wypadek zaległych zapytań
    processFormQueue();
});
