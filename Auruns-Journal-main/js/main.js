
document.addEventListener('DOMContentLoaded', () => {
    // Lightbox Functionality
    const lightbox = document.getElementById('imageLightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeBtn = document.querySelector('.close');
    const galleryImages = document.querySelectorAll('.gallery-item img');

    if (lightbox && lightboxImg && closeBtn) {
        galleryImages.forEach(img => {
            img.addEventListener('click', () => {
                lightbox.style.display = "block";
                lightboxImg.src = img.src;
                // Disable scrolling when lightbox is open
                document.body.style.overflow = 'hidden';
            });
        });

        closeBtn.addEventListener('click', () => {
            lightbox.style.display = "none";
            document.body.style.overflow = 'auto';
        });

        // Close when clicking outside the image
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.style.display = "none";
                document.body.style.overflow = 'auto';
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === "Escape" && lightbox.style.display === "block") {
                lightbox.style.display = "none";
                document.body.style.overflow = 'auto';
            }
        });
    }
});

// Photo Carousel
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-slide');
const totalSlides = slides.length;

function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.classList.remove('active');
        if (i === index) {
            slide.classList.add('active');
        }
    });
}

function moveCarousel(direction) {
    currentSlide += direction;
    
    if (currentSlide >= totalSlides) {
        currentSlide = 0;
    } else if (currentSlide < 0) {
        currentSlide = totalSlides - 1;
    }
    
    showSlide(currentSlide);
}

// Auto-advance carousel every 4 seconds
if (slides.length > 0) {
    setInterval(() => {
        moveCarousel(1);
    }, 4000);
}

// Scroll Animations for Journey Section
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.2 // Trigger when 20% of the item is visible
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show-item');
        } else {
            // Optional: Remove class to re-animate when scrolling back up
            entry.target.classList.remove('show-item');
        }
    });
}, observerOptions);

const hiddenElements = document.querySelectorAll('.hidden-item');
hiddenElements.forEach((el) => observer.observe(el));
