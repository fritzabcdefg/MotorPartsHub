// Item detail page script
(function () {
    function getQueryParam(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    }

    function renderItem(item) {
        const root = document.getElementById('itemRoot');
        if (!root) return;

        if (!item) {
            root.innerHTML = '<div class="card"><h2>Item not found</h2><p>The requested part could not be loaded.</p></div>';
            return;
        }

        root.innerHTML = `
            <div class="card item-detail-card">
                <h1>${item.name}</h1>
                <p class="lead">Price: $${Number(item.price).toFixed(2)}</p>
                <p><strong>Part ID:</strong> ${item.id}</p>
                <p>This part is available in inventory and can be added to the cart from the item page.</p>
                <div class="item-actions">
                    <a href="item.html" class="btn secondary">Browse more parts</a>
                </div>
            </div>
        `;
    }

    async function loadItem() {
        const partId = getQueryParam('partId');
        if (!partId) {
            renderItem(null);
            return;
        }

        try {
            const response = await fetch(`http://localhost:4000/parts/${encodeURIComponent(partId)}`);
            if (!response.ok) {
                renderItem(null);
                return;
            }
            const item = await response.json();
            renderItem(item);
        } catch (error) {
            console.error('Failed to load item', error);
            renderItem(null);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadItem);
    } else {
        loadItem();
    }
})();
