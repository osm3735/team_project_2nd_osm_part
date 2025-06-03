const thumbnails = document.querySelectorAll('.item_img_selector .thumb');
    const mainImage = document.getElementById('mainImage');

    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', () => {
            const newSrc = thumbnail.getAttribute('src');
            mainImage.setAttribute('src', newSrc);
        });
    });