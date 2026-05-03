var APP_CONFIG = {
    TRANSACTION_KEY: 'keuangan_transaksi',
    BUDGET_KEY: 'keuangan_budget',
    BUDGET_KATEGORI_KEY: 'keuangan_budget_kategori',
    VERSION: '9.0.0'
};

function formatYen(a) {
    if (a === undefined || a === null || isNaN(a) || !isFinite(a)) a = 0;
    return new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(a);
}

function formatTanggal(d) {
    if (!d) return '-';
    var dt = new Date(d);
    if (isNaN(dt.getTime())) return '-';
    return dt.toLocaleDateString('ja-JP', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function safeNumber(v) {
    var n = parseInt(v);
    return (isNaN(n) || !isFinite(n)) ? 0 : n;
}

function showNotification(m, t, d) {
    t = t || 'info';
    d = d || 3000;
    var existing = document.querySelectorAll('.custom-notification');
    if (existing.length > 2) existing[0].remove();
    var ic = { success: '✅', danger: '❌', warning: '⚠️', info: 'ℹ️' };
    var cl = {
        success: 'linear-gradient(135deg,#2ecc71,#27ae60)',
        danger: 'linear-gradient(135deg,#e74c3c,#c0392b)',
        warning: 'linear-gradient(135deg,#f39c12,#e67e22)',
        info: 'linear-gradient(135deg,#3498db,#2980b9)'
    };
    var n = document.createElement('div');
    n.className = 'custom-notification';
    n.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;background:' + cl[t] + ';color:white;padding:14px 20px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.3);display:flex;align-items:center;gap:10px;font-weight:500;font-size:.9rem;min-width:250px;max-width:380px;animation:slideInRight .3s ease;cursor:pointer';
    n.innerHTML = '<span style="font-size:1.3rem">' + ic[t] + '</span><span style="flex:1">' + m + '</span><button style="background:none;border:none;color:white;cursor:pointer;font-size:1.2rem" onclick="this.parentElement.remove()">×</button>';
    document.body.appendChild(n);
    setTimeout(function() {
        if (n.parentElement) {
            n.style.animation = 'slideOutRight .3s ease';
            setTimeout(function() { n.remove(); }, 300);
        }
    }, d);
}

function confirmAction(m) {
    return new Promise(function(r) {
        var o = document.createElement('div');
        o.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:99998;display:flex;align-items:center;justify-content:center';
        var d = document.createElement('div');
        d.style.cssText = 'background:white;border-radius:16px;padding:24px;max-width:400px;width:90%;box-shadow:0 20px 40px rgba(0,0,0,.3)';
        d.innerHTML = '<div style="text-align:center;margin-bottom:20px"><div style="font-size:3rem">🗑️</div><h5>確認 (Konfirmasi)</h5><p style="color:#666">' + (m || 'Yakin?') + '</p></div><div style="display:flex;gap:10px"><button id="btnCancel" style="flex:1;padding:12px;border:2px solid #ddd;background:white;border-radius:10px;cursor:pointer;font-weight:600">Batal</button><button id="btnConfirm" style="flex:1;padding:12px;border:none;background:#c41e3a;color:white;border-radius:10px;cursor:pointer;font-weight:600">Ya</button></div>';
        o.appendChild(d);
        document.body.appendChild(o);
        document.getElementById('btnCancel').onclick = function() { o.remove(); r(false); };
        document.getElementById('btnConfirm').onclick = function() { o.remove(); r(true); };
    });
}

// ============================================
// KATEGORI LENGKAP DENGAN IKON (Kanji/Indonesia)
// ============================================
var KATEGORI = {
    pemasukan: [
        '💰 給料 (Gaji)',
        '🎉 ボーナス (Bonus)',
        '💼 副業 (Freelance)',
        '📈 投資収入 (Investasi)',
        '🎁 贈り物 (Hadiah)',
        '📦 その他 (Lainnya)'
    ],
    pengeluaran: [
        '🍱 食費 (Makanan)',
        '🚃 交通費 (Transportasi)',
        '🛍️ 買い物 (Belanja)',
        '🎮 娯楽 (Hiburan)',
        '📱 通信費 (Komunikasi)',
        '🏠 家賃 (Sewa)',
        '💡 光熱費 (Utilitas)',
        '🏥 医療費 (Kesehatan)',
        '📚 教育 (Pendidikan)',
        '👔 衣服 (Pakaian)',
        '💄 美容 (Kecantikan)',
        '🐾 ペット (Hewan)',
        '💳 保険 (Asuransi)',
        '💰 貯金 (Tabungan)',
        '📊 投資 (Investasi)',
        '💸 借金返済 (Bayar Hutang)',
        '🚨 緊急資金 (Dana Darurat)',
        '📦 その他 (Lainnya)'
    ]
};

// ============================================
// SUB KATEGORI LENGKAP (Kanji/Indonesia)
// ============================================
var SUB_KATEGORI = {
    // 食費 (Makanan) - LENGKAP
    '🍱 食費 (Makanan)': [
        '🍚 米 (Beras)', '🥩 肉 (Daging Sapi)', '🐷 豚肉 (Daging Babi)', '🐔 鶏肉 (Ayam)',
        '🐟 魚 (Ikan)', '🦐 海老 (Udang)', '🥬 野菜 (Sayuran)', '🍅 トマト (Tomat)',
        '🥚 卵 (Telur)', '🍜 ラーメン (Ramen)', '🍣 寿司 (Sushi)', '🍱 弁当 (Bento)',
        '🍛 カレー (Kari)', '🍲 鍋 (Hotpot)', '🍽️ 外食 (Makan di Luar)', '🍙 おにぎり (Onigiri)',
        '🍞 パン (Roti)', '🥛 牛乳 (Susu)', '🧀 チーズ (Keju)', '🍦 アイス (Es Krim)',
        '🍰 ケーキ (Kue)', '🍪 クッキー (Biskuit)', '🍫 チョコレート (Cokelat)',
        '🍡 おやつ (Cemilan)', '🥤 飲み物 (Minuman)', '🍺 アルコール (Alkohol)',
        '🧂 調味料 (Bumbu Dapur)', '🍯 ソース (Saus)', '🥫 缶詰 (Kalengan)',
        '🍜 即席麺 (Indomie/Mie Instan)', '🍿 スナック (Snack)', '🍎 果物 (Buah)'
    ],
    // 交通費 (Transportasi)
    '🚃 交通費 (Transportasi)': [
        '🚃 電車 (Kereta)', '🚌 バス (Bus)', '🚕 タクシー (Taksi)', '🚗 自家用車 (Mobil Pribadi)',
        '⛽ ガソリン (Bensin)', '🅿️ 駐車場 (Parkir)', '🎫 Suica/PASMO (IC Card)',
        '🚲 自転車 (Sepeda)', '🏍️ バイク (Motor)', '✈️ 飛行機 (Pesawat)',
        '🚢 フェリー (Ferry)', '🛴 スクーター (Skuter)'
    ],
    // 買い物 (Belanja)
    '🛍️ 買い物 (Belanja)': [
        '💻 パソコン (Komputer)', '📱 スマホ (Smartphone)', '🎮 ゲーム (Game)',
        '📺 テレビ (TV)', '👔 衣服 (Pakaian)', '👟 靴 (Sepatu)',
        '👜 バッグ (Tas)', '⌚ 時計 (Jam Tangan)', '💍 アクセサリー (Aksesoris)',
        '🪑 家具 (Furniture)', '🔧 工具 (Alat)', '📚 本 (Buku)',
        '🎁 ギフト (Hadiah)', '🏠 家庭用品 (Perlengkapan Rumah)'
    ],
    // 娯楽 (Hiburan)
    '🎮 娯楽 (Hiburan)': [
        '🎬 映画 (Bioskop)', '🎵 カラオケ (Karaoke)', '📺 動画配信 (Streaming)',
        '🍺 飲み会 (Nomikai)', '🎤 コンサート (Konser)', '⚽ スポーツ (Olahraga)',
        '🎣 釣り (Memancing)', '🏊 プール (Kolam Renang)', '🎨 趣味 (Hobi)',
        '🎰 パチンコ (Pachinko)', '🃏 ギャンブル (Judi)'
    ],
    // 通信費 (Komunikasi)
    '📱 通信費 (Komunikasi)': [
        '📞 携帯代 (Pulsa/Token)', '🌐 インターネット (Internet)',
        '📺 NHK受信料 (TV Subscription)', '📡 衛星放送 (Satelit)'
    ],
    // 光熱費 (Utilitas)
    '💡 光熱費 (Utilitas)': [
        '⚡ 電気代 (Listrik)', '💧 水道代 (Air)', '🔥 ガス代 (Gas)',
        '🗑️ ゴミ処理代 (Sampah)', '🏢 管理費 (IPL)'
    ],
    // 借金返済 (Bayar Hutang)
    '💸 借金返済 (Bayar Hutang)': [
        '🏦 銀行返済 (Bank)', '💳 カード返済 (Kartu Kredit)',
        '👨‍👩‍👧‍👦 家族借金 (Hutang Keluarga)', '👥 友人借金 (Hutang Teman)',
        '📱 リボ払い (Cicilan)'
    ],
    // 緊急資金 (Dana Darurat)
    '🚨 緊急資金 (Dana Darurat)': [
        '🏥 医療緊急 (Medis)', '🔧 修理緊急 (Perbaikan)',
        '🐕 ペット緊急 (Hewan)', '🚗 車緊急 (Darurat Kendaraan)'
    ],
    // 医療費 (Kesehatan)
    '🏥 医療費 (Kesehatan)': [
        '🏥 病院 (Rumah Sakit)', '💊 薬 (Obat)', '🦷 歯科 (Gigi)',
        '👓 眼科 (Mata)', '💆 マッサージ (Pijat)', '🧘 ヨガ (Yoga)',
        '💉 健康診断 (Cek Kesehatan)'
    ],
    // 教育 (Pendidikan)
    '📚 教育 (Pendidikan)': [
        '🏫 学費 (Biaya Sekolah)', '📖 教材 (Buku Pelajaran)', '🎓 塾 (Les)',
        '🌐 オンライン講座 (Kursus Online)', '🗣️ 語学 (Bahasa)'
    ],
    // 衣服 (Pakaian)
    '👔 衣服 (Pakaian)': [
        '👕 Tシャツ (Kaos)', '👖 ズボン (Celana)', '👗 ワンピース (Dress)',
        '🧥 ジャケット (Jaket)', '🧣 マフラー (Syal)', '🧤 手袋 (Sarung Tangan)',
        '🧦 靴下 (Kaus Kaki)', '👘 着物 (Kimono)'
    ],
    // 美容 (Kecantikan)
    '💄 美容 (Kecantikan)': [
        '💇 美容院 (Salon)', '💅 ネイル (Nail Art)', '💄 化粧品 (Kosmetik)',
        '🧴 スキンケア (Perawatan Kulit)', '✂️ 散髪 (Potong Rambut)',
        '👄 リップ (Lipstik)', '👁️ アイシャドウ (Eyeshadow)'
    ]
};

// ============================================
// ICON FUNCTIONS (LENGKAP)
// ============================================
function getCategoryIcon(k) {
    if (!k) return '📦';
    var icons = {
        '食費':'🍱','Makanan':'🍱','交通費':'🚃','Transportasi':'🚃',
        '買い物':'🛍️','Belanja':'🛍️','娯楽':'🎮','Hiburan':'🎮',
        '通信費':'📱','Komunikasi':'📱','家賃':'🏠','Sewa':'🏠',
        '光熱費':'💡','Utilitas':'💡','医療費':'🏥','Kesehatan':'🏥',
        '教育':'📚','Pendidikan':'📚','衣服':'👔','Pakaian':'👔',
        '美容':'💄','Kecantikan':'💄','ペット':'🐾','Hewan':'🐾',
        '保険':'💳','Asuransi':'💳','貯金':'💰','Tabungan':'💰',
        '投資':'📊','Investasi':'📊','借金返済':'💸','Hutang':'💸',
        '緊急資金':'🚨','Darurat':'🚨','給料':'💰','Gaji':'💰',
        'ボーナス':'🎉','Bonus':'🎉','副業':'💼','Freelance':'💼'
    };
    for (var key in icons) {
        if (k.includes(key)) return icons[key];
    }
    return '📦';
}

function getSubIcon(s) {
    if (!s) return '';
    var icons = {
        '米':'🍚','Beras':'🍚','肉':'🥩','Daging':'🥩','豚肉':'🐷','Babi':'🐷',
        '鶏肉':'🐔','Ayam':'🐔','魚':'🐟','Ikan':'🐟','海老':'🦐','Udang':'🦐',
        '野菜':'🥬','Sayur':'🥬','トマト':'🍅','Tomat':'🍅','卵':'🥚','Telur':'🥚',
        'ラーメン':'🍜','Ramen':'🍜','寿司':'🍣','Sushi':'🍣','弁当':'🍱','Bento':'🍱',
        'カレー':'🍛','Kari':'🍛','鍋':'🍲','Hotpot':'🍲','外食':'🍽️','Makan di Luar':'🍽️',
        'おにぎり':'🍙','Onigiri':'🍙','パン':'🍞','Roti':'🍞','牛乳':'🥛','Susu':'🥛',
        'チーズ':'🧀','Keju':'🧀','アイス':'🍦','Es Krim':'🍦','ケーキ':'🍰','Kue':'🍰',
        'クッキー':'🍪','Biskuit':'🍪','チョコレート':'🍫','Cokelat':'🍫','おやつ':'🍡','Cemilan':'🍡',
        '飲み物':'🥤','Minuman':'🥤','アルコール':'🍺','Alkohol':'🍺','調味料':'🧂','Bumbu':'🧂',
        'ソース':'🍯','Saus':'🍯','缶詰':'🥫','Kalengan':'🥫','即席麺':'🍜','Mie Instan':'🍜',
        'スナック':'🍿','Snack':'🍿','果物':'🍎','Buah':'🍎','電車':'🚃','Kereta':'🚃',
        'バス':'🚌','Bus':'🚌','タクシー':'🚕','Taksi':'🚕','自家用車':'🚗','Mobil':'🚗',
        'ガソリン':'⛽','Bensin':'⛽','駐車場':'🅿️','Parkir':'🅿️','自転車':'🚲','Sepeda':'🚲',
        'バイク':'🏍️','Motor':'🏍️','飛行機':'✈️','Pesawat':'✈️','フェリー':'🚢','Ferry':'🚢',
        'スクーター':'🛴','Skuter':'🛴','パソコン':'💻','Komputer':'💻','スマホ':'📱','Smartphone':'📱',
        'ゲーム':'🎮','Game':'🎮','テレビ':'📺','TV':'📺','衣服':'👔','Pakaian':'👔','靴':'👟','Sepatu':'👟',
        'バッグ':'👜','Tas':'👜','時計':'⌚','Jam Tangan':'⌚','アクセサリー':'💍','Aksesoris':'💍',
        '家具':'🪑','Furniture':'🪑','工具':'🔧','Alat':'🔧','本':'📚','Buku':'📚','ギフト':'🎁','Hadiah':'🎁',
        '家庭用品':'🏠','Perlengkapan Rumah':'🏠','映画':'🎬','Bioskop':'🎬','カラオケ':'🎵','Karaoke':'🎵',
        '配信':'📺','Streaming':'📺','飲み会':'🍺','Nomikai':'🍺','コンサート':'🎤','Konser':'🎤',
        'スポーツ':'⚽','Olahraga':'⚽','釣り':'🎣','Memancing':'🎣','プール':'🏊','Renang':'🏊',
        '趣味':'🎨','Hobi':'🎨','パチンコ':'🎰','Pachinko':'🎰','ギャンブル':'🃏','Judi':'🃏',
        '携帯代':'📞','Pulsa':'📞','インターネット':'🌐','Internet':'🌐','電気代':'⚡','Listrik':'⚡',
        '水道代':'💧','Air':'💧','ガス代':'🔥','Gas':'🔥','銀行返済':'🏦','Bank':'🏦','カード返済':'💳','Kartu Kredit':'💳',
        '医療緊急':'🏥','Medis':'🏥','修理緊急':'🔧','Perbaikan':'🔧','病院':'🏥','Rumah Sakit':'🏥',
        '薬':'💊','Obat':'💊','歯科':'🦷','Gigi':'🦷','眼科':'👓','Mata':'👓','マッサージ':'💆','Pijat':'💆',
        'ヨガ':'🧘','Yoga':'🧘','健康診断':'💉','Cek Kesehatan':'💉','学費':'🏫','Biaya Sekolah':'🏫',
        '教材':'📖','Buku Pelajaran':'📖','塾':'🎓','Les':'🎓','オンライン講座':'🌐','Kursus Online':'🌐',
        '語学':'🗣️','Bahasa':'🗣️','Tシャツ':'👕','Kaos':'👕','ズボン':'👖','Celana':'👖','ワンピース':'👗','Dress':'👗'
    };
    for (var key in icons) {
        if (s.includes(key)) return icons[key];
    }
    return '';
}

// ============================================
// TRANSLATE FUNCTIONS
// ============================================
function translateCategory(k) {
    var map = {
        '食費':'食費 (Makanan)','交通費':'交通費 (Transportasi)','買い物':'買い物 (Belanja)',
        '娯楽':'娯楽 (Hiburan)','通信費':'通信費 (Komunikasi)','家賃':'家賃 (Sewa)',
        '光熱費':'光熱費 (Utilitas)','医療費':'医療費 (Kesehatan)','教育':'教育 (Pendidikan)',
        '衣服':'衣服 (Pakaian)','美容':'美容 (Kecantikan)','ペット':'ペット (Hewan)',
        '保険':'保険 (Asuransi)','貯金':'貯金 (Tabungan)','投資':'投資 (Investasi)',
        '借金返済':'借金返済 (Bayar Hutang)','緊急資金':'緊急資金 (Dana Darurat)',
        '給料':'給料 (Gaji)','ボーナス':'ボーナス (Bonus)','副業':'副業 (Freelance)',
        '投資収入':'投資収入 (Investasi)','贈り物':'贈り物 (Hadiah)','Lainnya':'その他 (Lainnya)'
    };
    return map[k] || k;
}