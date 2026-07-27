//================================================================================================
// favicon.js use here to connect easily
(function() {
    const setFavicon = () => {
        // Create the link element
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/png';
        
        // Use your official Vilarci icon URL
        link.href = 'https://officialpic.vilarci.in/Icons/web-icon.png';
        
        // Append it to the head section
        document.head.appendChild(link);
    };

    // Run the function when the script loads
    setFavicon();
})();
