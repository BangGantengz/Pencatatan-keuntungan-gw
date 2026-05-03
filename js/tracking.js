var YEN_TO_IDR_RATE = parseInt(localStorage.getItem('yenRate')) || 110;
var HUTANG_KEY = 'keuangan_hutang';
var HUTANG_RATE = parseInt(localStorage.getItem('yenRate')) || 110;
var lastEdited = null;

// ============================================
// FUNGSI TRANSLATE UNTUK TRACKING (TANPA ICON DUPLIKAT)
// ============================================
function translateKategoriTracking(kat) {
    if (!kat) return 'その他 (Lainnya)';
    var map = {
        'Makanan': '食費 (Makanan)', '食費': '食費 (Makanan)',
        'Transportasi': '交通費 (Transportasi)', '交通費': '交通費 (Transportasi)',
        'Belanja': '買い物 (Belanja)', '買い物': '買い物 (Belanja)',
        'Hiburan': '娯楽 (Hiburan)', '娯楽': '娯楽 (Hiburan)',
        'Komunikasi': '通信費 (Komunikasi)', '通信費': '通信費 (Komunikasi)',
        'Sewa': '家賃 (Sewa)', '家賃': '家賃 (Sewa)',
        'Utilitas': '光熱費 (Utilitas)', '光熱費': '光熱費 (Utilitas)',
        'Kesehatan': '医療費 (Kesehatan)', '医療費': '医療費 (Kesehatan)',
        'Pendidikan': '教育 (Pendidikan)', '教育': '教育 (Pendidikan)',
        'Pakaian': '衣服 (Pakaian)', '衣服': '衣服 (Pakaian)',
        'Kecantikan': '美容 (Kecantikan)', '美容': '美容 (Kecantikan)',
        'Hewan': 'ペット (Hewan)', 'ペット': 'ペット (Hewan)',
        'Asuransi': '保険 (Asuransi)', '保険': '保険 (Asuransi)',
        'Tabungan': '貯金 (Tabungan)', '貯金': '貯金 (Tabungan)',
        'Investasi': '投資 (Investasi)', '投資': '投資 (Investasi)',
        'Bayar Hutang': '借金返済 (Bayar Hutang)', '借金返済': '借金返済 (Bayar Hutang)',
        'Dana Darurat': '緊急資金 (Dana Darurat)', '緊急資金': '緊急資金 (Dana Darurat)',
        'Gaji': '給料 (Gaji)', '給料': '給料 (Gaji)',
        'Bonus': 'ボーナス (Bonus)', 'ボーナス': 'ボーナス (Bonus)',
        'Freelance': '副業 (Freelance)', '副業': '副業 (Freelance)',
        'Hadiah': '贈り物 (Hadiah)', '贈り物': '贈り物 (Hadiah)',
        'Lainnya': 'その他 (Lainnya)', 'その他': 'その他 (Lainnya)'
    };
    for (var key in map) {
        if (kat === key || kat.includes(key)) return map[key];
    }
    return kat;
}

function translateSubTracking(sub) {
    if (!sub || sub === '-' || sub === '') return '-';
    var map = {
        'Beras': '米 (Beras)', '米': '米 (Beras)',
        'Daging Sapi': '牛肉 (Daging Sapi)', '牛肉': '牛肉 (Daging Sapi)',
        'Daging Babi': '豚肉 (Daging Babi)', '豚肉': '豚肉 (Daging Babi)',
        'Ayam': '鶏肉 (Ayam)', '鶏肉': '鶏肉 (Ayam)',
        'Ikan': '魚 (Ikan)', '魚': '魚 (Ikan)',
        'Udang': '海老 (Udang)', '海老': '海老 (Udang)',
        'Sayuran': '野菜 (Sayuran)', '野菜': '野菜 (Sayuran)',
        'Tomat': 'トマト (Tomat)', 'トマト': 'トマト (Tomat)',
        'Telur': '卵 (Telur)', '卵': '卵 (Telur)',
        'Ramen': 'ラーメン (Ramen)', 'ラーメン': 'ラーメン (Ramen)',
        'Sushi': '寿司 (Sushi)', '寿司': '寿司 (Sushi)',
        'Bento': '弁当 (Bento)', '弁当': '弁当 (Bento)',
        'Kari': 'カレー (Kari)', 'カレー': 'カレー (Kari)',
        'Makan Siang': '昼食 (Makan Siang)', '昼食': '昼食 (Makan Siang)',
        'Makan Malam': '夕食 (Makan Malam)', '夕食': '夕食 (Makan Malam)',
        'Cemilan': 'おやつ (Cemilan)', 'おやつ': 'おやつ (Cemilan)',
        'Minuman': '飲み物 (Minuman)', '飲み物': '飲み物 (Minuman)',
        'Alkohol': 'アルコール (Alkohol)', 'アルコール': 'アルコール (Alkohol)',
        'Bumbu Dapur': '調味料 (Bumbu Dapur)', '調味料': '調味料 (Bumbu Dapur)',
        'Saus': 'ソース (Saus)', 'ソース': 'ソース (Saus)',
        'Kalengan': '缶詰 (Kalengan)', '缶詰': '缶詰 (Kalengan)',
        'Mie Instan': '即席麺 (Mie Instan)', '即席麺': '即席麺 (Mie Instan)',
        'Snack': 'スナック (Snack)', 'スナック': 'スナック (Snack)',
        'Buah': '果物 (Buah)', '果物': '果物 (Buah)',
        'Kereta': '電車 (Kereta)', '電車': '電車 (Kereta)',
        'Bus': 'バス (Bus)', 'バス': 'バス (Bus)',
        'Taksi': 'タクシー (Taksi)', 'タクシー': 'タクシー (Taksi)',
        'Mobil Pribadi': '自家用車 (Mobil Pribadi)', '自家用車': '自家用車 (Mobil Pribadi)',
        'Bensin': 'ガソリン (Bensin)', 'ガソリン': 'ガソリン (Bensin)',
        'Parkir': '駐車場 (Parkir)', '駐車場': '駐車場 (Parkir)',
        'Suica/PASMO': 'Suica/PASMO', 'Suica': 'Suica', 'PASMO': 'PASMO',
        'Sepeda': '自転車 (Sepeda)', '自転車': '自転車 (Sepeda)',
        'Motor': 'バイク (Motor)', 'バイク': 'バイク (Motor)',
        'Pesawat': '飛行機 (Pesawat)', '飛行機': '飛行機 (Pesawat)',
        'Bank': '銀行返済 (Bank)', '銀行返済': '銀行返済 (Bank)',
        'Kartu Kredit': 'カード返済 (Kartu Kredit)', 'カード返済': 'カード返済 (Kartu Kredit)',
        'Internet': 'インターネット (Internet)', 'インターネット': 'インターネット (Internet)',
        'Listrik': '電気代 (Listrik)', '電気代': '電気代 (Listrik)',
        'Air': '水道代 (Air)', '水道代': '水道代 (Air)',
        'Gas': 'ガス代 (Gas)', 'ガス代': 'ガス代 (Gas)'
    };
    for (var key in map) {
        if (sub === key || sub.includes(key)) return map[key];
    }
    return sub;
}

// ============================================
// KONVERSI YEN ↔ IDR
// ============================================
function convertYenToIdr() {
    var yen = parseInt(document.getElementById('hutangYen').value) || 0;
    if (yen > 0 && lastEdited !== 'idr') {
        lastEdited = 'yen';
        document.getElementById('hutangIdr').value = yen * HUTANG_RATE;
        var ib = document.getElementById('idrAutoBadge'); 
        if (ib) ib.style.display = 'block';
        var yb = document.getElementById('yenAutoBadge'); 
        if (yb) yb.style.display = 'none';
    } else if (yen === 0) {
        document.getElementById('hutangIdr').value = '';
        var ib = document.getElementById('idrAutoBadge'); 
        if (ib) ib.style.display = 'none';
        lastEdited = null;
    }
}

function convertIdrToYen() {
    var idr = parseInt(document.getElementById('hutangIdr').value) || 0;
    if (idr > 0 && lastEdited !== 'yen') {
        lastEdited = 'idr';
        document.getElementById('hutangYen').value = Math.round(idr / HUTANG_RATE);
        var yb = document.getElementById('yenAutoBadge'); 
        if (yb) yb.style.display = 'block';
        var ib = document.getElementById('idrAutoBadge'); 
        if (ib) ib.style.display = 'none';
    } else if (idr === 0) {
        document.getElementById('hutangYen').value = '';
        var yb = document.getElementById('yenAutoBadge'); 
        if (yb) yb.style.display = 'none';
        lastEdited = null;
    }
}

// ============================================
// HITUNG RATA-RATA HARGA
// ============================================
function hitungRataHarga(bulan, tahun) {
    var trx = Storage.getData('keuangan_transaksi');
    
    var flt = [];
    for (var i = 0; i < trx.length; i++) {
        var it = trx[i];
        if (!it.tanggal) continue;
        if (it.jenis !== 'pengeluaran') continue;
        var parts = it.tanggal.split('-');
        if (parts.length !== 3) continue;
        var tBulan = parseInt(parts[1]);
        var tTahun = parseInt(parts[0]);
        if (tBulan === bulan && tTahun === tahun) {
            flt.push(it);
        }
    }
    
    var tb = document.getElementById('trackingBody');
    var tf = document.getElementById('trackingFoot');
    
    if (!tb) return;
    
    if (flt.length === 0) {
        tb.innerHTML = '<tr><td colspan="10" class="text-center py-4" style="color:#8b949e">📭 データなし (Tidak ada data pengeluaran)</td></tr>';
        if (tf) tf.innerHTML = '';
        var ks = document.getElementById('konversiSection');
        var bs = document.getElementById('budgetTrackingStatus');
        if (ks) ks.style.display = 'none';
        if (bs) bs.style.display = 'none';
        return;
    }
    
    var g = {};
    for (var i = 0; i < flt.length; i++) {
        var it = flt[i];
        var key = it.nama.toLowerCase();
        if (!g[key]) {
            g[key] = {
                on: it.nama,
                kat: it.kategori || '-',
                sub: it.subKategori || '-',
                tempat: it.tempat || '-',
                nilaiJumlah: it.nilaiJumlah || 0,
                nilaiSatuan: it.nilaiSatuan || '',
                nilaiHarga: it.nilaiHarga || 0,
                tp: 0,
                jt: 0,
                tq: 0,
                lastHarga: it.harga || 0,
                its: []
            };
        }
        g[key].tp += parseInt(it.total) || 0;
        g[key].jt++;
        g[key].tq += parseInt(it.jumlah) || 0;
        g[key].lastHarga = it.harga || g[key].lastHarga;
        g[key].its.push(it);
        if (it.tempat) g[key].tempat = it.tempat;
        if (it.nilaiJumlah) {
            g[key].nilaiJumlah = it.nilaiJumlah;
            g[key].nilaiSatuan = it.nilaiSatuan;
            g[key].nilaiHarga = it.nilaiHarga;
        }
    }
    
    var s = Object.values(g).sort(function(a, b) { return b.tp - a.tp; });
    
    var h = '';
    for (var i = 0; i < s.length; i++) {
        var d = s[i];
        var rata = Math.round(d.tp / d.jt);
        var kc = (d.kat || '').replace(/^[^\s]+\s/, '').replace(/\(.*\)/g, '').trim();
        var sc = (d.sub && d.sub !== '-') ? d.sub.replace(/^[^\s]+\s/, '').replace(/\(.*\)/g, '').trim() : '-';
        
        // Ambil icon dari fungsi getCategoryIcon dan getSubIcon (SATU KALI)
        var iconKat = getCategoryIcon(kc);
        var iconSub = getSubIcon(sc);
        var translatedKat = translateKategoriTracking(kc);
        var translatedSub = translateSubTracking(sc);
        
        var tmp = d.tempat !== '-' ? '🏪 ' + d.tempat : '-';
        var nilai = d.nilaiJumlah > 0 ? d.nilaiJumlah + ' ' + d.nilaiSatuan + ' = ' + formatYen(d.nilaiHarga) : '-';
        var detailId = 'detail-' + i;
        
        h += '<tr>';
        h += '<td style="color:#fff"><strong>' + d.on + '</strong></td>';
        h += '<td style="color:#fff">' + iconKat + ' ' + translatedKat + '</td>';
        h += '<td style="color:#ccc">' + (iconSub ? iconSub + ' ' : '') + translatedSub + '</td>';
        h += '<td style="color:#ffd700">' + tmp + '</td>';
        h += '<td style="color:#00e676;font-size:.55rem">' + nilai + '</td>';
        h += '<td style="text-align:center"><span class="badge bg-warning" style="font-size:.5rem">' + d.jt + 'x</span></td>';
        h += '<td style="color:#fff">' + formatYen(d.lastHarga) + '</td>';
        h += '<td style="color:#fff"><strong>' + formatYen(d.tp) + '</strong></td>';
        h += '<td style="color:#58a6ff"><strong>' + formatYen(rata) + '</strong></td>';
        h += '<td><button class="btn btn-sm btn-link" onclick="toggleDetail(\'' + detailId + '\')" style="font-size:.5rem;color:#58a6ff">📋 詳細</button></td>';
        h += '</tr>';
        
        h += '<tr id="' + detailId + '" style="display:none"><td colspan="10" style="background:#0d1117;padding:8px">';
        h += '<div style="font-size:.55rem;color:#ccc"><strong style="color:#fff">📋 購入履歴 (Riwayat Pembelian):</strong><br>';
        for (var j = 0; j < d.its.length; j++) {
            var item = d.its[j];
            h += '<span style="display:inline-block;background:rgba(255,255,255,.05);padding:2px 6px;border-radius:3px;margin:2px;color:#e6e6e6">';
            h += '📅 ' + formatTanggal(item.tanggal) + ' | ' + item.jumlah + 'x @' + formatYen(item.harga) + ' = ' + formatYen(item.total);
            h += '</span> ';
        }
        h += '</div></td></tr>';
    }
    
    tb.innerHTML = h;
    
    var totP = 0;
    for (var i = 0; i < flt.length; i++) {
        totP += parseInt(flt[i].total) || 0;
    }
    var totT = flt.length;
    
    if (tf) {
        tf.innerHTML = '<tr style="font-weight:700;background:#010409;border-top:2px solid #ffd700">' +
            '<td style="color:#ffd700;padding:8px 4px">📊 合計 (TOTAL)</td>' +
            '<td></td><td></td><td></td><td></td>' +
            '<td style="color:#fff;text-align:center"><span class="badge bg-primary" style="font-size:.55rem">' + totT + 'x 取引</span></td>' +
            '<td></td>' +
            '<td style="color:#ffd700"><strong>' + formatYen(totP) + '</strong></td>' +
            '<td></td><td></td>' +
        '</tr>';
    }
    
    updateTrackingBudget(bulan, tahun, totP);
    
    var ks = document.getElementById('konversiSection');
    if (ks) {
        ks.style.display = 'block';
        var totalYen = document.getElementById('totalYen');
        var totalIDR = document.getElementById('totalIDR');
        var rateKonversi = document.getElementById('rateKonversi');
        if (totalYen) totalYen.textContent = formatYen(totP);
        if (totalIDR) totalIDR.textContent = 'Rp ' + (totP * YEN_TO_IDR_RATE).toLocaleString('id-ID');
        if (rateKonversi) rateKonversi.textContent = '💱 1 JPY = Rp ' + YEN_TO_IDR_RATE.toLocaleString('id-ID');
    }
}

function toggleDetail(id) {
    var r = document.getElementById(id);
    if (r) {
        r.style.display = r.style.display === 'none' ? 'table-row' : 'none';
    }
}

// ============================================
// BUDGET TRACKING (TANPA DUPLIKAT ICON)
// ============================================
function updateTrackingBudget(bulan, tahun, totP) {
    var c = document.getElementById('budgetTrackingStatus');
    if (!c) return;
    c.style.display = 'block';
    
    var bd = Storage.getBudgetData(bulan, tahun);
    var tB = 0;
    for (var i = 0; i < bd.length; i++) {
        tB += parseInt(bd[i].amount) || 0;
    }
    
    var months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    var nm = months[bulan - 1] + ' ' + tahun;
    
    if (tB > 0) {
        var s = tB - totP;
        var p = (totP / tB) * 100;
        var ov = totP > tB;
        var statusColor = ov ? '#ff4444' : (p >= 90 ? '#ffa502' : '#00e676');
        var statusText = ov ? '⚠️ 超過 (Over Budget)' : (p >= 90 ? '🟡 注意 (Hati-hati)' : '✅ 良好 (Aman)');
        
        var kr = '';
        var budgetItems = [];
        for (var i = 0; i < bd.length; i++) {
            var bk = bd[i];
            var ba = parseInt(bk.amount) || 0;
            if (ba <= 0) continue;
            
            var kn = bk.kategori || '';
            var sn = bk.subKategori || '';
            var nmBarang = bk.namaBarang || '';
            var kc = kn.replace(/^[^\s]+\s/, '').replace(/\(.*\)/g, '').trim();
            var sc = sn ? sn.replace(/^[^\s]+\s/, '').replace(/\(.*\)/g, '').trim() : '';
            
            var pk = 0;
            var trx = Storage.getData('keuangan_transaksi');
            for (var j = 0; j < trx.length; j++) {
                var it = trx[j];
                if (!it.tanggal) continue;
                if (it.jenis !== 'pengeluaran') continue;
                var parts = it.tanggal.split('-');
                if (parts.length !== 3) continue;
                if (parseInt(parts[1]) !== bulan || parseInt(parts[0]) !== tahun) continue;
                if (it.kategori !== kn) continue;
                if (sn && it.subKategori !== sn) continue;
                if (nmBarang && it.nama !== nmBarang) continue;
                pk += parseInt(it.total) || 0;
            }
            
            var pp2 = (pk / ba) * 100;
            var over = pk > ba;
            var statusColorItem = over ? '#ff4444' : (pp2 >= 90 ? '#ffa502' : '#00e676');
            var icon = getCategoryIcon(kc);
            var sicon = getSubIcon(sc);
            var translatedKat = translateKategoriTracking(kc);
            var translatedSub = sc ? translateSubTracking(sc) : '';
            
            budgetItems.push({
                icon: icon,
                sicon: sicon,
                kat: translatedKat,
                sub: translatedSub,
                nama: nmBarang,
                budget: ba,
                actual: pk,
                percent: pp2,
                statusColor: statusColorItem,
                over: over
            });
        }
        
        budgetItems.sort(function(a, b) { return b.percent - a.percent; });
        
        for (var i = 0; i < budgetItems.length; i++) {
            var it = budgetItems[i];
            kr += '<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid #30363d;font-size:.55rem;flex-wrap:wrap;gap:4px">';
            kr += '<div><strong>' + it.icon + ' ' + it.kat + '</strong>';
            if (it.sub && it.sub !== '-') {
                kr += ' <small style="color:#ffd700">' + (it.sicon || '📁') + ' ' + it.sub + '</small>';
            }
            if (it.nama) {
                kr += '<br><span style="font-size:.5rem;color:#8b949e">📝 ' + it.nama + '</span>';
            }
            kr += '</div>';
            kr += '<div style="text-align:right">';
            kr += '<span style="color:' + it.statusColor + '">' + formatYen(it.actual) + ' / ' + formatYen(it.budget) + ' (' + it.percent.toFixed(0) + '%)</span>';
            kr += '<div style="width:100px;height:4px;background:rgba(255,255,255,.1);border-radius:2px;margin-top:2px"><div style="width:' + Math.min(it.percent, 100) + '%;height:4px;background:' + it.statusColor + ';border-radius:2px"></div></div>';
            kr += '</div>';
            kr += '</div>';
        }
        
        c.innerHTML = '<div class="card" style="border:2px solid ' + statusColor + ';background:#161b22">' +
            '<div class="card-body" style="padding:12px">' +
            '<h6 style="font-size:.75rem;color:#fff;margin-bottom:8px">📊 予算追跡 (Budget Tracking) - ' + nm + '</h6>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">' +
            '<div><small style="color:#8b949e">💰 予算 (Budget)</small><br><strong style="color:#fff;font-size:.9rem">' + formatYen(tB) + '</strong></div>' +
            '<div><small style="color:#8b949e">💸 支出 (Pengeluaran)</small><br><strong style="color:' + statusColor + ';font-size:.9rem">' + formatYen(totP) + '</strong></div>' +
            '</div>' +
            '<div class="progress" style="height:10px;margin-bottom:6px;background:rgba(255,255,255,.06);border-radius:5px">' +
            '<div class="progress-bar" style="width:' + Math.min(p, 100) + '%;background:' + statusColor + ';border-radius:5px">' + p.toFixed(1) + '%</div>' +
            '</div>' +
            '<small style="color:' + statusColor + '">' + statusText + ' - ' + (ov ? '⚠️ 超過 ' + formatYen(Math.abs(s)) : '✅ 残り ' + formatYen(s)) + '</small>' +
            (kr ? '<div style="margin-top:10px;padding-top:8px;border-top:1px solid #30363d"><small style="color:#8b949e">📂 カテゴリー別 (Per Kategori):</small>' + kr + '</div>' : '') +
            '</div></div>';
    } else {
        c.innerHTML = '<div class="card" style="border:2px solid #58a6ff;background:#161b22">' +
            '<div class="card-body" style="padding:12px">' +
            '<h6 style="font-size:.75rem;color:#fff">📊 予算追跡 (Budget Tracking)</h6>' +
            '<p style="font-size:.65rem;color:#8b949e;margin:0">📝 予算未設定 (Budget belum diset) <a href="budget.html" style="color:#58a6ff">💰 予算を設定 (Set Budget)</a></p>' +
            '</div></div>';
    }
}

// ============================================
// HUTANG MANAGEMENT
// ============================================
function tambahHutang() {
    var nama = document.getElementById('hutangNama').value.trim();
    var yen = parseInt(document.getElementById('hutangYen').value) || 0;
    var idr = parseInt(document.getElementById('hutangIdr').value) || 0;
    
    if (!nama) {
        alert('🏦 借金名を入力してください (Isi nama hutang)');
        return;
    }
    
    var jumlahYen;
    if (lastEdited === 'yen' && yen > 0) jumlahYen = yen;
    else if (lastEdited === 'idr' && idr > 0) jumlahYen = Math.round(idr / HUTANG_RATE);
    else if (yen > 0) jumlahYen = yen;
    else if (idr > 0) jumlahYen = Math.round(idr / HUTANG_RATE);
    else {
        alert('💰 金額を入力してください (Isi jumlah Yen atau Rupiah)');
        return;
    }
    
    if (jumlahYen <= 0) {
        alert('💰 金額は0より大きい (Jumlah harus > 0)');
        return;
    }
    
    var hutang = Storage.getData(HUTANG_KEY);
    hutang.push({
        id: 'h_' + Date.now(),
        nama: nama,
        jumlah: jumlahYen,
        jumlahIdr: jumlahYen * HUTANG_RATE,
        createdAt: new Date().toISOString()
    });
    Storage.saveData(HUTANG_KEY, hutang);
    
    document.getElementById('hutangNama').value = '';
    document.getElementById('hutangYen').value = '';
    document.getElementById('hutangIdr').value = '';
    var yb = document.getElementById('yenAutoBadge'); if (yb) yb.style.display = 'none';
    var ib = document.getElementById('idrAutoBadge'); if (ib) ib.style.display = 'none';
    lastEdited = null;
    
    renderHutangTable();
    if (window.updateHeaderRate) window.updateHeaderRate(HUTANG_RATE);
}

function renderHutangTable() {
    var hutang = Storage.getData(HUTANG_KEY);
    var trx = Storage.getData('keuangan_transaksi');
    var tb = document.getElementById('hutangTableBody');
    
    var totalBayarPerHutang = {};
    for (var i = 0; i < hutang.length; i++) {
        totalBayarPerHutang[hutang[i].id] = 0;
    }
    
    for (var i = 0; i < trx.length; i++) {
        var it = trx[i];
        if (it.jenis === 'pengeluaran' && it.kategori && it.kategori.includes('借金返済')) {
            for (var j = 0; j < hutang.length; j++) {
                if (it.nama === hutang[j].nama) {
                    totalBayarPerHutang[hutang[j].id] += parseInt(it.total) || 0;
                }
            }
        }
    }
    
    if (!tb) return;
    
    if (hutang.length === 0) {
        tb.innerHTML = '<tr><td colspan="7" class="text-center" style="color:#8b949e;padding:15px;font-size:.6rem">📭 借金データなし (Belum ada data hutang)</td></tr>';
        var td = document.getElementById('totalHutangDisplay'); 
        if (td) td.textContent = '¥0';
        return;
    }
    
    hutang.sort(function(a, b) {
        var sisaA = a.jumlah - (totalBayarPerHutang[a.id] || 0);
        var sisaB = b.jumlah - (totalBayarPerHutang[b.id] || 0);
        return sisaB - sisaA;
    });
    
    var h = '';
    var totalSisaAll = 0;
    
    for (var i = 0; i < hutang.length; i++) {
        var hu = hutang[i];
        var bayarHutangIni = totalBayarPerHutang[hu.id] || 0;
        var sisa = hu.jumlah - bayarHutangIni;
        if (sisa < 0) sisa = 0;
        totalSisaAll += sisa;
        
        var persen = hu.jumlah > 0 ? Math.round((bayarHutangIni / hu.jumlah) * 100) : 0;
        var statusWarna = sisa > 0 ? '#ff4444' : '#00e676';
        var statusText = sisa > 0 ? '🔴 未完了 (Belum Lunas)' : '🟢 完了 (Lunas)';
        var progressWarna = persen >= 100 ? '#00e676' : (persen >= 50 ? '#ffa502' : '#ff4444');
        var createdDate = formatTanggal(hu.createdAt);
        
        h += '<tr>';
        h += '<td><strong style="color:#fff">' + hu.nama + '</strong><br><small style="color:#8b949e">📅 作成: ' + createdDate + '</small></td>';
        h += '<td style="color:#ffd700"><strong>¥' + hu.jumlah.toLocaleString('ja-JP') + '</strong></td>';
        h += '<td style="color:#58a6ff"><strong>¥' + bayarHutangIni.toLocaleString('ja-JP') + '</strong></td>';
        h += '<td><div style="width:80px"><div class="progress" style="height:6px;background:rgba(255,255,255,.06);border-radius:3px"><div class="progress-bar" style="width:' + persen + '%;background:' + progressWarna + ';height:6px;border-radius:3px"></div></div><small style="color:#ccc;font-size:.5rem">' + persen + '%</small></div></td>';
        h += '<td style="color:' + statusWarna + '"><strong>¥' + sisa.toLocaleString('ja-JP') + '</strong></td>';
        h += '<td style="color:' + statusWarna + ';font-size:.55rem">' + statusText + '</td>';
        h += '<td><button class="btn btn-sm text-danger" style="font-size:.45rem;padding:1px 4px" onclick="hapusHutang(\'' + hu.id + '\')">🗑️ 削除 (Hapus)</button></td>';
        h += '</tr>';
        
        if (bayarHutangIni > 0) {
            h += '<tr><td colspan="7" style="background:#0d1117;padding:4px 8px"><details style="font-size:.5rem"><summary style="cursor:pointer;color:#58a6ff">📋 支払履歴 (Riwayat Pembayaran) ▼</summary>';
            for (var j = 0; j < trx.length; j++) {
                var p = trx[j];
                if (p.jenis === 'pengeluaran' && p.kategori && p.kategori.includes('借金返済') && p.nama === hu.nama) {
                    h += '<div style="color:#ccc;padding:2px 0;border-bottom:1px solid #1a1a2e">• 📅 ' + formatTanggal(p.tanggal) + ' | 💰 <strong style="color:#00e676">¥' + (parseInt(p.total) || 0).toLocaleString('ja-JP') + '</strong></div>';
                }
            }
            h += '</details></td></tr>';
        }
    }
    
    tb.innerHTML = h;
    var td = document.getElementById('totalHutangDisplay'); 
    if (td) td.textContent = '¥' + totalSisaAll.toLocaleString('ja-JP');
}

function hapusHutang(id) {
    if (!confirm('この借金を削除しますか？ (Hapus hutang ini?)')) return;
    var hutang = Storage.getData(HUTANG_KEY);
    var i = hutang.findIndex(function(h) { return h.id === id; });
    if (i !== -1) {
        hutang.splice(i, 1);
        Storage.saveData(HUTANG_KEY, hutang);
        renderHutangTable();
        if (window.updateHeaderRate) window.updateHeaderRate(HUTANG_RATE);
    }
}

function updateRate() {
    var nr = prompt('💱 1 JPY = Rp:', YEN_TO_IDR_RATE);
    if (!nr) return;
    var p = parseInt(nr);
    if (isNaN(p) || p <= 0) return;
    YEN_TO_IDR_RATE = p;
    HUTANG_RATE = p;
    localStorage.setItem('yenRate', p);
    if (window.updateHeaderRate) window.updateHeaderRate(p);
    var hr = document.getElementById('hutangRate'); 
    if (hr) hr.textContent = p;
    hitungRataHarga(
        parseInt(document.getElementById('trackBulan').value),
        parseInt(document.getElementById('trackTahun').value)
    );
}

function exportTrackingData() {
    var trx = Storage.getData('keuangan_transaksi');
    var b = parseInt(document.getElementById('trackBulan').value);
    var t = parseInt(document.getElementById('trackTahun').value);
    var flt = [];
    for (var i = 0; i < trx.length; i++) {
        var it = trx[i];
        if (!it.tanggal) continue;
        if (it.jenis !== 'pengeluaran') continue;
        var parts = it.tanggal.split('-');
        if (parts.length !== 3) continue;
        if (parseInt(parts[1]) === b && parseInt(parts[0]) === t) flt.push(it);
    }
    if (flt.length === 0) {
        alert('❌ Tidak ada data untuk diekspor');
        return;
    }
    var csv = '\uFEFFNama Barang,Kategori,Sub Kategori,Tempat,Nilai Jumlah,Nilai Satuan,Nilai Harga,Jumlah,Harga Satuan,Total,Tanggal\n';
    for (var i = 0; i < flt.length; i++) {
        var it = flt[i];
        csv += '"' + it.nama + '","' + (it.kategori || '') + '","' + (it.subKategori || '-') + '","' + (it.tempat || '-') + '",' + (it.nilaiJumlah || 0) + ',"' + (it.nilaiSatuan || '-') + '",' + (it.nilaiHarga || 0) + ',' + it.jumlah + ',' + it.harga + ',' + it.total + ',"' + it.tanggal + '"\n';
    }
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'tracking_' + t + '_' + b + '.csv';
    a.click();
    URL.revokeObjectURL(a.href);
}