# Tercüman Sitesi

Yozgat Yeminli Tercüman için Next.js tabanlı, mobil uyumlu ve SEO odaklı kurumsal web sitesi.

## Kurulum

```bash
npm install
npm run dev
```

Uygulama geliştirme ortamında `http://localhost:3000` adresinde çalışır.

## Üretim

```bash
npm run build
npm start
```

## Fiyat teklifi formu

`config/quote-pricing.mjs` merkezi tarifedir. Varsayılan tarife onaylı değildir ve hiçbir tutar göstermez.
Onaylı tarifede dil çiftinin sayfa başına kuruş bedeli, belge ve hizmet çarpanları, sürüm ve onay durumu girilir.
Noter ücreti ancak onaylı bir değer varsa toplama katılır; diğer durumda ayrıca belirlenir.
Testlerdeki sayılar yalnızca test verisidir ve üretim tarifesine taşınmaz.

Yeni teklif formu doğrudan sunucu gönderimi kullanır. Genel iletişim formunun mevcut `mailto:` davranışı korunur.
Servisler kurulmadan yeni form başarı göstermez; e-posta ile alternatif iletişim adresini gösterir.

### Gönderimi etkinleştirme

`.env.example` içindeki alanları `.env.local` veya barındırma sağlayıcısının gizli ortam değişkenlerine girin.
Şifreleri Git'e eklemeyin; `NEXT_PUBLIC_` kullanmayın. Gönderici SMTP hesabınızın doğrulanmış adresi olmalıdır.
Müşteri adresi yalnızca Reply-To olarak kullanılır; müşterinin hesabından gönderim yapılmaz.

Özel AWS S3 bucket kurun. Dört Block Public Access ayarı açık, şifreleme etkin ve ACL'ler kapalı olsun.
IAM erişimini bu bucket ve `quote-uploads/` önekiyle sınırlayın. Uygulamanın PutObject, GetObject,
DeleteObject, GetBucketPublicAccessBlock, GetEncryptionConfiguration ve GetLifecycleConfiguration erişimleri gerekir.
Dosya yükleme CORS'unda yalnızca `QUOTE_SITE_ORIGIN` için POST'a izin verin. Yükleme yetkisi 5 dakika geçerlidir;
işlem belirteci 10 dakika geçerlidir. Dosyalar e-posta eki veya herkese açık URL olarak paylaşılmaz.
Bildirim e-postasında yalnızca yetkili AWS hesabıyla açılabilen konsol bağlantısı bulunur.

`quote-uploads/` önekine uygulanacak yaşam döngüsü kuralında, işletmenin onayladığı süre için hem
Expiration.Days hem NoncurrentVersionExpiration.NoncurrentDays ayarlayın; süreyi QUOTE_RETENTION_DAYS'e yazın.
Eski sürümleri ve yarım kalan çok parçalı yüklemeleri de temizleyin. S3 yaşam döngüsü silmesi anlık değildir.
Uygulama genel erişim engelini, şifrelemeyi ve mevcut/eski sürüm silme kurallarını yükleme öncesi denetler.
Başarısız veya terk edilmiş yüklemeler de aynı silme kuralına tabidir.

Ortak hız sınırı için Upstash uyumlu Redis REST URL/token sağlayın (10 dakikada 12 API isteği).
Reverse proxy gelen x-forwarded-for başlığını güvenilir biçimde yeniden yazmalıdır; Vercel'de platform başlığı kullanılır.
E-posta ve belge içerikleri uygulama loguna yazılmaz; SMTP debug kapalıdır. Sağlayıcı erişim loglarını da sınırlandırın.

KVKK ve gizlilik metnini gerçek sağlayıcı, işleme amacı ve onaylı saklama süresine göre tamamlayın;
ardından `QUOTE_PRIVACY_READY=true` yapın. Değerlendirme dosyalarını yalnızca yetkili çalışanlar açmalıdır.
Dosya türü/imza denetimi antivirüs değildir; açmadan önce kurumun güvenlik taramasından geçirin.
E-posta kutusundaki taleplerin ve yedeklerin saklama/silme politikasını ayrıca uygulayın.

SMTP servisi kabul ettiğinde form bunu bildirir; posta kutusuna nihai teslim garantisi verilmez.
Aynı yükleme belirteci yeniden kullanılamaz. SMTP sonucu belirsizse yeniden gönderim için yeni yükleme gerekir;
bu durumda olası çift talepleri talep referansından kontrol edin.

Kontroller: `node --test tests/quote.test.mjs`, `npm run build`.

## Online randevu

Sayfa `/randevu`; ana sayfada randevu CTA'sı bulunur. Mevcut teklif ve iletişim davranışları korunur.
Takvim `config/appointments.mjs` dosyasındadır. Başlangıç takvimi örnektir: hafta içi 09:00–12:00 ve
13:00–17:00, hafta sonu kapalı. Gerçek takvimi onayladıktan sonra `calendarApproved=true` yapın.
Kapalı günleri `closedDates` listesine ekleyebilirsiniz. Her randevu tam 20 dakika; saatler :00/:20/:40.
Europe/Istanbul hesabı IANA saat dilimiyle yapılır, veritabanında UTC anları `timestamptz` olarak saklanır.

### Kalıcı veritabanı ve kurulum

Production için barındırmaya uygun, TLS bağlantılı kalıcı PostgreSQL ve bir bağlantı havuzu URL'si kullanın.
Mevcut `db.sqlite3` boştu; canlı veri içerdiği varsayılmadı ve dosya değiştirilmedi.
`DATABASE_URL` sunucu sırrıdır. `node scripts/migrate-appointments.mjs` SQL şemasını transaction içinde uygular.
Bu komut otomatik olarak production'a çalıştırılmaz; hedef DB'yi doğruladıktan sonra çalıştırın.
Uygulama için tablolarla sınırlı DB hesabı, migration için ayrı DDL hesabı kullanın; dış erişimi sınırlandırın.
Üretimde yerel dosya veritabanı kullanılmaz. Development önizlemesinde `APPOINTMENT_LOCAL_DB_DIR` verilirse
PostgreSQL'in PGlite motoru yerel diske kalıcı kayıt yapar; `.local-data/` Git dışındadır. Yerel test verileri
canlı müşteri verisi değildir ve PostgreSQL sunucusuyla çoklu bağlantı/yük testi yerine geçmez.

Tablolar: `appointments`, `appointment_notifications`, `appointment_rate_limits`.
Aktif başlangıç zamanı için partial unique index çift rezervasyonu engeller. Süre ve 20 dakikalık hizalama
DB CHECK constraint ile korunur. Kayıt ve iki bildirim aynı transaction içinde oluşturulur.
İptal edilmiş kayıt geçmişte kalır ama unique index'ten çıkar; slot yeniden açılır. Rastgele referanslar
ve idempotency anahtarı kullanılır. Müsaitlik yanıtları kişisel veri içermez ve önbelleğe alınmaz.

### E-posta ve yeniden deneme

Mevcut SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD ayarları paylaşılır. Gönderici `MAIL_FROM` veya
mevcut `QUOTE_MAIL_FROM`; ofis alıcısı `MAIL_OFFICE_TO` veya sitedeki resmi Hotmail adresidir.
Teklif alıcısı `QUOTE_MAIL_TO` ayrı tutulur. Müşteri adresi SMTP göndericisi gibi kullanılmaz.
SMTP TLS zorunludur; şifre/anahtar frontend'e geçmez. Her alıcı için kalıcı bir kuyruk kaydı bulunur.
Yanıt sonrası ilk gönderim denenir. Bir scheduler, `GET /api/appointments/notifications` yolunu
Authorization: Bearer CRON_SECRET ile örneğin dakikada bir çağırmalıdır. Cron kurulmadan kalıcı
otomatik tekrar deneme etkin değildir. Bu çalışmada barındırma/scheduler hesabı değiştirilmedi.
Worker SKIP LOCKED ve 2 dakikalık lease kullanır; geçici hatalarda 1/2/4/... dakika arayla, en fazla
8 deneme yapar. SMTP yapılandırılmamışsa deneme hakkı tüketilmeden kuyrukta bekletilir.
Hata kaydı sadece genel bir kategori içerir; müşteri verisi/SMTP yanıtı/şifre loglanmaz.
SMTP kabulü posta kutusuna teslim garantisi değildir. SMTP'nin kabulünden sonra worker çökerse
tekrar e-posta oluşabilir; sabit Message-ID ve referans kullanılır. Bildirimler en az bir kez işlenir.

### İptal, gizlilik ve güvenlik

`POST /api/appointments/admin` yalnızca en az 32 karakterli `APPOINTMENT_ADMIN_TOKEN` bearer sırrıyla
çağrılabilir. Body: `{ "action": "cancel", "reference": "RND-..." }`. Müşteri referansı tek başına iptal
yetkisi vermez. Başarısız bildirimleri yeniden sıraya almak için aynı endpoint `action: retry` kabul eder.
Bu secret hiçbir müşteri ekranına konmaz; yönetim paneli ayrıca yetkili oturum gerektirecektir.
Yönetim ve cron sırları farklı olmalıdır. Kullanılmayan yönetim endpoint'i secret olmadan erişim vermez.
Rezervasyonlar sunucuda origin, input, geçmiş saat, çalışma aralığı, honeypot ve DB hız limitiyle kontrol edilir.
Reverse proxy istemciden gelen forwarded IP başlıklarını yeniden yazmalıdır. Rezervasyon limiti 10 dakikada
6 istek, müsaitlik limiti 120 istektir; IP veritabanına ham olarak yazılmaz.

Production'a geçmeden önce `APPOINTMENT_SITE_ORIGIN`, `APPOINTMENT_RATE_SECRET` (en az 32 karakter),
`APPOINTMENT_ADMIN_TOKEN`, `CRON_SECRET`, gerçek takvim, veri saklama süresi ve SMTP ayarlarını sağlayın.
`APPOINTMENT_RETENTION_DAYS` işletmenin onayladığı süre olmalıdır. Cron geçmiş randevuları bu süreden sonra
kişisel verileri ve bildirim kayıtlarıyla birlikte siler. DB yedekleri ve e-posta kutusu için ayrıca silme
politikası uygulanmalıdır. KVKK/gizlilik metnini gerçek sağlayıcı, saklama süresi ve randevu sürecine göre
tamamlayın; sonra `APPOINTMENT_PRIVACY_READY=true` yapın. Varsayılan production rezervasyonları kapalıdır.

Testler: `node --test tests/appointments.test.mjs` ve `node tests/appointments-browser.cjs`.
Browser testi development sunucusuna ve yalnızca sentetik müşteri verilerine yöneliktir.
# Teklif formunda isteğe bağlı randevu

Belge/fotoğraf yükleme zorunlu değildir. Dosya yoksa S3 kullanılmadan, mevcut SMTP ve Redis kontrolleriyle teklif gönderilir. Dosya eklendiğinde mevcut özel depolama, tür ve 5 MB doğrulaması korunur.

"Teklif ile birlikte randevu da almak istiyorum" alanı varsayılan olarak kapalıdır. Açıldığında ad, telefon, tarih ve gerçek müsait saat bilgileri alınır. Teklif başarılı gönderildikten sonra aynı veritabanı rezervasyon kuralları uygulanır. Randevu bildiriminin açıklamasında teklif referansı yer alır. SMTP ile veritabanı arasında ortak transaction yoktur: teklif gönderilip saat dolarsa kullanıcıya kısmi başarı gösterilir; yeniden deneme yalnızca randevu oluşturur. Gerçek SMTP yapılandırılmadan teklif veya birleşik gönderim başarı olarak gösterilmez.

