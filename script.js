/* ==========================================================================
   YOZGAT YEMİNLİ TERCÜME BÜROSU - JAVASCRIPT DOSYASI
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const sanitizeText = (value, maxLength = 500) => {
        return String(value || '')
            .replace(/[<>]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, maxLength);
    };

    const canSubmit = (key, waitMs = 8000) => {
        const now = Date.now();
        const lastSubmit = Number(sessionStorage.getItem(key) || 0);
        if (now - lastSubmit < waitMs) {
            return false;
        }
        sessionStorage.setItem(key, String(now));
        return true;
    };

    // 1. Mobil Menü Aç/Kapat (Hamburger Menü)
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('open');
            // Hamburger ikonunun animasyonu için (isteğe bağlı CSS ile desteklenebilir)
            const spans = hamburger.querySelectorAll('span');
            if (hamburger.classList.contains('open')) {
                spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });

        // Menü linklerine tıklandığında menüyü kapat (Mobil için)
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('open');
                const spans = hamburger.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            });
        });
    }

    // 2. Sayfa Aşağı Kaydırıldığında Navbar Tasarımını Değiştir (Sticky Header)
    const header = document.querySelector('.main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 3. Aktif Navigasyon Linkini Güncelle (Intersection Observer ile)
    const sections = document.querySelectorAll('section');
    const observerOptions = {
        root: null,
        threshold: 0.3,
        rootMargin: '-50px 0px -50px 0px'
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeId = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${activeId}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // 4. E-Posta Hızlı Fiyat Sor Formu
    const emailForm = document.getElementById('emailForm');
    if (emailForm) {
        emailForm.addEventListener('submit', (e) => {
            e.preventDefault();

            if (document.getElementById('websiteField')?.value) return;
            
            const sourceLang = document.getElementById('sourceLanguage').value;
            const targetLang = document.getElementById('targetLanguage').value;
            const docType = sanitizeText(document.getElementById('docType').value, 80);
            const privacyAccepted = document.getElementById('emailPrivacy')?.checked;

            if (!sourceLang || !targetLang || !docType || !privacyAccepted) {
                alert('Lütfen tüm alanları doldurun ve bilgilendirme onayını işaretleyin.');
                return;
            }

            const emailAddress = 'yozgattercumeofisi66@hotmail.com'; 
            const subject = encodeURIComponent('Web Sitesinden Fiyat Talebi: ' + docType);
            
            const body = encodeURIComponent(`Merhaba Yozgat Yeminli Tercüman, web siteniz üzerinden fiyat teklifi almak istiyorum. 

*Kaynak Dil:* ${sourceLang}
*Hedef Çeviri Dili:* ${targetLang}
*Belge Türü:* ${docType}

Lütfen çevirisi yapılacak belgeyi bu maile yanıt olarak EKE (PDF veya Fotoğraf olarak) eklemeyi unutmayınız.

İyi çalışmalar.`);

            const mailtoLink = `mailto:${emailAddress}?subject=${subject}&body=${body}`;
            
            window.location.href = mailtoLink;
        });
    }

    // 5. İletişim Formu Kontrolü
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            if (document.getElementById('contactWebsite')?.value) return;
            if (!canSubmit('lastContactSubmit', 10000)) {
                formStatus.className = 'form-status error';
                formStatus.textContent = 'Güvenlik için kısa süre içinde tekrar gönderim sınırlandırıldı.';
                return;
            }

            const name = sanitizeText(document.getElementById('name').value, 80);
            const phone = sanitizeText(document.getElementById('phone').value, 20);
            const email = sanitizeText(document.getElementById('email').value, 120);
            const subject = sanitizeText(document.getElementById('subject').value, 120);
            const message = sanitizeText(document.getElementById('message').value, 1200);
            const privacyAccepted = document.getElementById('contactPrivacy')?.checked;
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!name || !phone || !emailPattern.test(email) || !subject || !message || !privacyAccepted) {
                formStatus.className = 'form-status error';
                formStatus.textContent = 'Lütfen bilgileri kontrol edin ve KVKK onayını işaretleyin.';
                return;
            }

            const mailBody = [
                `Ad Soyad: ${name}`,
                `Telefon: ${phone}`,
                `E-posta: ${email}`,
                '',
                message
            ].join('\n');

            const mailtoUrl = `mailto:yozgattercumeofisi66@hotmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailBody)}`;
            window.location.href = mailtoUrl;

            formStatus.className = 'form-status success';
            formStatus.textContent = 'Mail uygulamanız açıldı. Mesajı göndermeyi tamamlayabilirsiniz.';
        });
    }
    // 6. Sayfa Kaydırıldığında Animasyonları Tetikle (Intersection Observer)
    const animElements = document.querySelectorAll('.animate-on-scroll');
    
    const animObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                // Eleman bir kez göründükten sonra dinlemeyi bırakabiliriz
                animObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    animElements.forEach(el => {
        animObserver.observe(el);
    });

    // 7. Yozgat ve İlçeleri Görsel Galerisi Kahraman Slayt Gösterisi (Hero Background Carousel)
    const heroSlider = document.querySelector('.hero-slider');
    const heroSlides = document.querySelectorAll('.hero-slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const heroLocationBadge = document.getElementById('heroLocationBadge');
    
    let currentHeroSlide = 0;
    let heroSlideInterval;
    const heroIntervalTime = 5000;

    const locationNames = [
        "Yozgat Çamlık Milli Parkı",
        "Yozgat Merkez Saat Kulesi"
    ];

    function updateSliderPosition() {
        if (!heroSlider) return;
        heroSlider.style.transform = `translateX(-${currentHeroSlide * 100}%)`;
        
        if (heroLocationBadge && locationNames[currentHeroSlide]) {
            heroLocationBadge.innerHTML = `<i class="fa-solid fa-location-dot"></i> Görsel: ${locationNames[currentHeroSlide]}`;
        }
    }

    function showNextSlide() {
        currentHeroSlide = (currentHeroSlide + 1) % heroSlides.length;
        updateSliderPosition();
    }

    function showPrevSlide() {
        currentHeroSlide = (currentHeroSlide - 1 + heroSlides.length) % heroSlides.length;
        updateSliderPosition();
    }

    function startHeroSlideShow() {
        heroSlideInterval = setInterval(showNextSlide, heroIntervalTime);
    }

    function resetHeroSlideShow() {
        clearInterval(heroSlideInterval);
        startHeroSlideShow();
    }

    if (heroSlides.length > 0) {
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                showNextSlide();
                resetHeroSlideShow();
            });
        }
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                showPrevSlide();
                resetHeroSlideShow();
            });
        }
        updateSliderPosition();
        startHeroSlideShow();
    }

});
