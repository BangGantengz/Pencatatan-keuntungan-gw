var pieChartInstance = null;
var barChartInstance = null;
var lineChartInstance = null;
var monthlyChartInstance = null;

// ============================================
// FUNGSI TRANSLATE (TANPA ICON DUPLIKAT)
// ============================================
function translateKategoriDashboard(kat) {
    if (!kat) return 'Lainnya';
    var map = {
        'Makanan': 'Makanan', '食費': 'Makanan',
        'Transportasi': 'Transportasi', '交通費': 'Transportasi',
        'Belanja': 'Belanja', '買い物': 'Belanja',
        'Hiburan': 'Hiburan', '娯楽': 'Hiburan',
        'Komunikasi': 'Komunikasi', '通信費': 'Komunikasi',
        'Sewa': 'Sewa', '家賃': 'Sewa',
        'Utilitas': 'Utilitas', '光熱費': 'Utilitas',
        'Kesehatan': 'Kesehatan', '医療費': 'Kesehatan',
        'Pendidikan': 'Pendidikan', '教育': 'Pendidikan',
        'Pakaian': 'Pakaian', '衣服': 'Pakaian',
        'Kecantikan': 'Kecantikan', '美容': 'Kecantikan',
        'Hewan': 'Hewan', 'ペット': 'Hewan',
        'Asuransi': 'Asuransi', '保険': 'Asuransi',
        'Tabungan': 'Tabungan', '貯金': 'Tabungan',
        'Investasi': 'Investasi', '投資': 'Investasi',
        'Bayar Hutang': 'Bayar Hutang', '借金返済': 'Bayar Hutang',
        'Dana Darurat': 'Dana Darurat', '緊急資金': 'Dana Darurat',
        'Gaji': 'Gaji', '給料': 'Gaji',
        'Bonus': 'Bonus', 'ボーナス': 'Bonus',
        'Freelance': 'Freelance', '副業': 'Freelance',
        'Hadiah': 'Hadiah', '贈り物': 'Hadiah',
        'Lainnya': 'Lainnya', 'その他': 'Lainnya'
    };
    for (var key in map) {
        if (kat === key || kat.includes(key)) return map[key];
    }
    return kat;
}

function translateSubDashboard(sub) {
    if (!sub || sub === '-' || sub === '') return '';
    var map = {
        'Beras': 'Beras', '米': 'Beras',
        'Daging Sapi': 'Daging Sapi', '牛肉': 'Daging Sapi',
        'Ayam': 'Ayam', '鶏肉': 'Ayam',
        'Ikan': 'Ikan', '魚': 'Ikan',
        'Sayuran': 'Sayuran', '野菜': 'Sayuran',
        'Telur': 'Telur', '卵': 'Telur',
        'Bumbu Dapur': 'Bumbu Dapur', '調味料': 'Bumbu Dapur',
        'Mie Instan': 'Mie Instan', '即席麺': 'Mie Instan',
        'Kereta': 'Kereta', '電車': 'Kereta',
        'Bus': 'Bus', 'バス': 'Bus',
        'Taksi': 'Taksi', 'タクシー': 'Taksi',
        'Bensin': 'Bensin', 'ガソリン': 'Bensin',
        'Parkir': 'Parkir', '駐車場': 'Parkir',
        'Suica/PASMO': 'Suica/PASMO',
        'Pesawat': 'Pesawat', '飛行機': 'Pesawat',
        'Bank': 'Bank', '銀行返済': 'Bank',
        'Internet': 'Internet', 'インターネット': 'Internet',
        'Listrik': 'Listrik', '電気代': 'Listrik',
        'Air': 'Air', '水道代': 'Air',
        'Gas': 'Gas', 'ガス代': 'Gas'
    };
    for (var key in map) {
        if (sub === key || sub.includes(key)) return map[key];
    }
    return sub;
}

function initDashboard() {
    var b = parseInt(document.getElementById('filterBulan').value) || new Date().getMonth() + 1;
    var t = parseInt(document.getElementById('filterTahun').value) || new Date().getFullYear();
    hitungDashboard(b, t);
}
function refreshDashboard() { initDashboard(); }

function hitungDashboard(bulan, tahun) {
    try {
        var transaksi = Storage.getData('keuangan_transaksi');
        var budgetData = Storage.getBudgetData(bulan, tahun);
        var blnIni = [], detailKat = {}, semuaBarang = {}, semuaPemasukan = {};
        
        for (var i = 0; i < transaksi.length; i++) {
            var it = transaksi[i]; if (!it.tanggal) continue;
            var parts = it.tanggal.split('-'); if (parts.length !== 3) continue;
            var tBulan = parseInt(parts[1]), tTahun = parseInt(parts[0]);
            
            if (it.jenis === 'pengeluaran') {
                var kc = (it.kategori || '').replace(/^[^\s]+\s/, '').replace(/\(.*\)/g, '').trim() || 'Lainnya';
                var sc = it.subKategori ? it.subKategori.replace(/^[^\s]+\s/, '').replace(/\(.*\)/g, '').trim() : '-';
                var key = it.nama.toLowerCase();
                if (!semuaBarang[key]) semuaBarang[key] = { 
                    n: it.nama, kat: kc, sub: sc, total: 0, count: 0, lastHarga: 0,
                    subIcon: getSubIcon(sc), katIcon: getCategoryIcon(kc)
                };
                semuaBarang[key].total += parseInt(it.total) || 0;
                semuaBarang[key].count++;
                semuaBarang[key].lastHarga = parseInt(it.harga) || 0;
            }
            if (it.jenis === 'pemasukan') {
                var sk = (it.kategori || '').replace(/^[^\s]+\s/, '').replace(/\(.*\)/g, '').trim() || 'Lainnya';
                var sn = it.nama || '';
                if (!semuaPemasukan[sk]) semuaPemasukan[sk] = { total: 0, count: 0, items: {} };
                semuaPemasukan[sk].total += parseInt(it.total) || 0;
                semuaPemasukan[sk].count++;
                if (!semuaPemasukan[sk].items[sn]) semuaPemasukan[sk].items[sn] = { total: 0, count: 0 };
                semuaPemasukan[sk].items[sn].total += parseInt(it.total) || 0;
                semuaPemasukan[sk].items[sn].count++;
            }
            if (tBulan === bulan && tTahun === tahun) {
                blnIni.push(it);
                if (it.jenis === 'pengeluaran') {
                    var kat = (it.kategori || '').replace(/^[^\s]+\s/, '').replace(/\(.*\)/g, '').trim() || 'Lainnya';
                    var sub = it.subKategori ? it.subKategori.replace(/^[^\s]+\s/, '').replace(/\(.*\)/g, '').trim() : '-';
                    var nama = it.nama || '-';
                    var fullKey = kat + '|||' + sub + '|||' + nama;
                    if (!detailKat[fullKey]) detailKat[fullKey] = { 
                        kategori: kat, subKategori: sub, namaBarang: nama, 
                        total: 0, count: 0, items: [],
                        subIcon: getSubIcon(sub), katIcon: getCategoryIcon(kat)
                    };
                    detailKat[fullKey].total += parseInt(it.total) || 0;
                    detailKat[fullKey].count++;
                    detailKat[fullKey].items.push(it);
                }
            }
        }
        
        var tPem = 0, tPeng = 0, katPeng = {}, hPem = {}, hPeng = {};
        for (var i = 0; i < blnIni.length; i++) { 
            var it = blnIni[i], tot = parseInt(it.total) || 0; 
            if (it.jenis === 'pemasukan') { 
                tPem += tot; 
                hPem[it.tanggal] = (hPem[it.tanggal] || 0) + tot; 
            } else { 
                tPeng += tot; 
                var kat = (it.kategori || '').replace(/^[^\s]+\s/, '').replace(/\(.*\)/g, '').trim() || 'Lainnya'; 
                katPeng[kat] = (katPeng[kat] || 0) + tot; 
                hPeng[it.tanggal] = (hPeng[it.tanggal] || 0) + tot; 
            } 
        }
        var saldo = tPem - tPeng;
        document.getElementById('totalPemasukan').textContent = formatYen(tPem);
        document.getElementById('totalPengeluaran').textContent = formatYen(tPeng);
        document.getElementById('sisaSaldo').textContent = formatYen(saldo);
        
        renderBudget(bulan, tahun, tPeng, tPem, budgetData, detailKat, saldo);
        if (document.getElementById('pieChart')) renderPieChart(katPeng);
        if (document.getElementById('barChart')) renderBarChart(tPem, tPeng);
        if (document.getElementById('lineChart')) renderLineChart(hPem, hPeng, bulan, tahun);
        if (document.getElementById('monthlyCompareChart')) renderMonthlyChart(transaksi, tahun, bulan);
        if (document.getElementById('topItemsList')) renderTopItems(blnIni);
        if (document.getElementById('monthCompareContent')) renderMonthCompare(transaksi, bulan, tahun);
        if (document.getElementById('barangSeringDibeli')) renderBarangSeringDibeli(semuaBarang);
        if (document.getElementById('sumberPemasukan')) renderSumberPemasukanDetail(semuaPemasukan);
    } catch(e) { console.error('Dashboard error:', e); }
}

// ============================================
// RENDER BUDGET - Header (TIDAK SCROLL) + Items (SCROLL)
// ============================================
function renderBudget(bulan, tahun, tPeng, tPem, budgetData, detailKat, saldo) {
    var container = document.getElementById('budgetStatusContainer');
    if (!container) return;
    
    var nm = new Date(tahun, bulan - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    var tBud = 0;
    for (var i = 0; i < budgetData.length; i++) {
        tBud += safeNumber(budgetData[i].amount);
    }
    
    var totalPersen = tBud > 0 ? (tPeng / tBud) * 100 : 0;
    var totalSisa = tBud - tPeng;
    var totalOver = tPeng > tBud;
    var statusColor = totalOver ? '#ff4444' : (totalPersen >= 80 ? '#ffa502' : '#00e676');
    var statusText = totalOver ? '⚠️ 超過 (Over Budget)' : (totalPersen >= 80 ? '🟡 注意 (Hati-hati)' : '✅ 良好 (Aman)');
    
    // HEADER (TIDAK SCROLL)
    var headerHtml = '';
    if (tBud > 0) {
        headerHtml = '<div class="dashboard-budget-header">' +
            '<div style="display:flex;justify-content:space-between;margin-bottom:6px">' +
            '<span style="font-size:0.6rem;color:#fff">💰 総予算 (Total Budget)</span>' +
            '<span style="font-size:0.6rem;color:#fff"><strong>' + formatYen(tBud) + '</strong></span>' +
            '</div>' +
            '<div class="dashboard-budget-total-row">' +
            '<span>💸 総支出: ' + formatYen(tPeng) + '</span>' +
            '<span>' + totalPersen.toFixed(0) + '%</span>' +
            '</div>' +
            '<div class="dashboard-budget-progress">' +
            '<div class="dashboard-budget-progress-bar" style="width:' + Math.min(totalPersen, 100) + '%;background:' + statusColor + '"></div>' +
            '</div>' +
            '<div class="dashboard-budget-status-text" style="color:' + statusColor + '">' + statusText + ' - ' + (totalOver ? '⚠️ 超過 ' + formatYen(Math.abs(totalSisa)) : '✅ 残り ' + formatYen(totalSisa)) + '</div>' +
            '</div>';
    } else {
        headerHtml = '<div class="dashboard-budget-header">' +
            '<p style="font-size:0.6rem;color:#8b949e;margin:0;text-align:center">📝 予算未設定 (Budget belum diset)</p>' +
            '<div style="text-align:center;margin-top:6px"><a href="budget.html" class="btn btn-primary btn-sm" style="font-size:0.55rem;padding:4px 10px">💰 予算を設定 (Set Budget)</a></div>' +
            '</div>';
    }
    
    // BUDGET ITEMS (HANYA INI YANG SCROLL)
    var itemsHtml = '';
    if (tBud > 0 && budgetData.length > 0) {
        var budgetItems = [];
        for (var i = 0; i < budgetData.length; i++) {
            var bk = budgetData[i];
            var budgetAmt = safeNumber(bk.amount);
            if (budgetAmt <= 0) continue;
            
            var kn = bk.kategori || '';
            var sn = bk.subKategori || '';
            var nmBarang = bk.namaBarang || '';
            var kc = kn.replace(/^[^\s]+\s/, '').replace(/\(.*\)/g, '').trim() || 'Lainnya';
            var sc = sn ? sn.replace(/^[^\s]+\s/, '').replace(/\(.*\)/g, '').trim() : '';
            var fullKey = kc + '|||' + sc + '|||' + nmBarang;
            var actualTotal = (detailKat[fullKey] || { total: 0 }).total;
            
            var persen = budgetAmt > 0 ? (actualTotal / budgetAmt) * 100 : 0;
            var over = actualTotal > budgetAmt;
            var icon = getCategoryIcon(kc);
            var sicon = getSubIcon(sc);
            var translatedKat = translateKategoriDashboard(kc);
            var translatedSub = sc ? translateSubDashboard(sc) : '';
            
            var statusClass = over ? 'budget-item-over' : (persen >= 80 ? 'budget-item-caution' : 'budget-item-safe');
            
            budgetItems.push({
                icon: icon, sicon: sicon, kat: translatedKat, sub: translatedSub,
                nama: nmBarang, budget: budgetAmt, actual: actualTotal, persen: persen,
                over: over, statusClass: statusClass
            });
        }
        
        budgetItems.sort(function(a, b) { return b.persen - a.persen; });
        
        itemsHtml = '<div class="dashboard-budget-items">';
        for (var i = 0; i < budgetItems.length; i++) {
            var it = budgetItems[i];
            itemsHtml += '<div class="budget-item-row ' + it.statusClass + '">' +
                '<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px;margin-bottom:3px">' +
                '<div><span style="font-size:0.55rem">' + it.icon + ' <strong>' + it.kat + '</strong>' +
                (it.sub ? ' <small style="color:#ffd700">' + (it.sicon || '📁') + ' ' + it.sub + '</small>' : '') +
                (it.nama ? '<br><span style="font-size:0.45rem;color:#8b949e">📝 ' + it.nama + '</span>' : '') + '</span></div>' +
                '<div><span style="font-size:0.55rem;color:' + (it.over ? '#ff4444' : '#00e676') + '">' + formatYen(it.actual) + ' / ' + formatYen(it.budget) + ' (' + it.persen.toFixed(0) + '%)</span></div>' +
                '</div>' +
                '<div style="height:3px;background:rgba(255,255,255,.1);border-radius:2px;overflow:hidden">' +
                '<div style="width:' + Math.min(it.persen, 100) + '%;height:3px;background:' + (it.over ? '#ff4444' : (it.persen >= 80 ? '#ffa502' : '#00e676')) + '"></div>' +
                '</div>' +
                '</div>';
        }
        itemsHtml += '</div>';
    }
    
    container.innerHTML = headerHtml + itemsHtml;
}

// ============================================
// RENDER BARANG SERING DIBELI - RAPI
// ============================================
function renderBarangSeringDibeli(data) {
    var el = document.getElementById('barangSeringDibeli');
    if (!el) return;
    var sorted = Object.values(data).sort(function(a, b) { return b.total - a.total; }).slice(0, 10);
    if (sorted.length === 0) {
        el.innerHTML = '<p style="text-align:center;color:#8b949e;font-size:0.55rem;padding:10px">📭 Tidak ada data</p>';
        return;
    }
    var h = '';
    for (var i = 0; i < sorted.length; i++) {
        var d = sorted[i];
        var icon = d.katIcon || getCategoryIcon(d.kat);
        var sicon = d.subIcon || getSubIcon(d.sub);
        var translatedKat = translateKategoriDashboard(d.kat);
        var translatedSub = (d.sub && d.sub !== '-') ? translateSubDashboard(d.sub) : '';
        
        h += '<div class="dashboard-list-item">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px">' +
            '<div><span class="dashboard-item-name">' + d.n + '</span> <small style="color:#8b949e;font-size:0.45rem">(' + d.count + 'x)</small><br>' +
            '<span class="dashboard-item-category">' + icon + ' ' + translatedKat +
            (translatedSub ? ' ' + (sicon || '📁') + ' ' + translatedSub : '') + '</span></div>' +
            '<div class="dashboard-item-price">' + formatYen(d.total) + '</div>' +
            '</div>' +
            '<div style="font-size:0.45rem;color:#8b949e;margin-top:2px">💴 Harga Satuan: ' + formatYen(d.lastHarga) + '</div>' +
            '</div>';
    }
    el.innerHTML = h;
}

// ============================================
// RENDER SUMBER PEMASUKAN - RAPI
// ============================================
function renderSumberPemasukanDetail(data) {
    var el = document.getElementById('sumberPemasukan');
    if (!el) return;
    var sorted = Object.entries(data).sort(function(a, b) { return b[1].total - a[1].total; });
    if (sorted.length === 0) {
        el.innerHTML = '<p style="text-align:center;color:#8b949e;font-size:0.55rem;padding:10px">📭 Tidak ada data</p>';
        return;
    }
    var totalSemua = 0;
    for (var i = 0; i < sorted.length; i++) totalSemua += sorted[i][1].total;
    var h = '';
    for (var i = 0; i < sorted.length; i++) {
        var d = sorted[i];
        var kat = d[0];
        var detail = d[1];
        var icon = getCategoryIcon(kat);
        var translatedKat = translateKategoriDashboard(kat);
        var persen = totalSemua > 0 ? Math.round((detail.total / totalSemua) * 100) : 0;
        
        h += '<div class="dashboard-list-item">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px">' +
            '<span>' + icon + ' <strong class="dashboard-item-name">' + translatedKat + '</strong> <small style="color:#8b949e;font-size:0.45rem">(' + detail.count + 'x)</small></span>' +
            '<span class="dashboard-item-price" style="color:#00e676">' + formatYen(detail.total) + ' <small style="color:#8b949e;font-size:0.45rem">(' + persen + '%)</small></span>' +
            '</div>';
        if (Object.keys(detail.items).length > 0) {
            h += '<details style="font-size:0.5rem;margin-top:2px">' +
                '<summary style="cursor:pointer;color:#58a6ff">📋 Lihat Detail ▼</summary>' +
                '<div style="padding-left:8px;margin-top:2px">';
            var itemsSorted = Object.entries(detail.items).sort(function(a, b) { return b[1].total - a[1].total; });
            for (var j = 0; j < Math.min(itemsSorted.length, 3); j++) {
                var item = itemsSorted[j];
                h += '<div style="display:flex;justify-content:space-between;color:#ccc;padding:2px 0">• <strong>' + item[0] + '</strong> <small>(' + item[1].count + 'x)</small><span>' + formatYen(item[1].total) + '</span></div>';
            }
            if (itemsSorted.length > 3) {
                h += '<small style="color:#8b949e">+ ' + (itemsSorted.length - 3) + ' lainnya</small>';
            }
            h += '</div></details>';
        }
        h += '</div>';
    }
    el.innerHTML = h;
}

// ============================================
// RENDER TOP ITEMS - RAPI
// ============================================
function renderTopItems(blnIni) {
    var el = document.getElementById('topItemsList');
    if (!el) return;
    var peng = [];
    for (var i = 0; i < blnIni.length; i++) {
        if (blnIni[i].jenis === 'pengeluaran') peng.push(blnIni[i]);
    }
    if (peng.length === 0) {
        el.innerHTML = '<p style="text-align:center;color:#8b949e;font-size:0.55rem;padding:10px">📭 Tidak ada data</p>';
        return;
    }
    var g = {};
    for (var i = 0; i < peng.length; i++) {
        var it = peng[i], k = it.nama.toLowerCase();
        if (!g[k]) g[k] = { n: it.nama, kat: it.kategori || '', sub: it.subKategori || '-', t: 0, c: 0, h: it.harga };
        g[k].t += parseInt(it.total) || 0;
        g[k].c++;
    }
    var s = Object.values(g).sort(function(a, b) { return b.t - a.t; }).slice(0, 10);
    var tot = peng.reduce(function(s, i) { return s + (parseInt(i.total) || 0); }, 0);
    var h = '';
    for (var i = 0; i < s.length; i++) {
        var it = s[i];
        var medal = i === 0 ? '🥇' : (i === 1 ? '🥈' : (i === 2 ? '🥉' : (i + 1)));
        var kc = (it.kat || '').replace(/^[^\s]+\s/, '').replace(/\(.*\)/g, '').trim();
        var sc = (it.sub && it.sub !== '-') ? it.sub.replace(/^[^\s]+\s/, '').replace(/\(.*\)/g, '').trim() : '';
        var ic = getCategoryIcon(kc);
        var sic = getSubIcon(sc);
        var translatedKat = translateKategoriDashboard(kc);
        var translatedSub = sc ? translateSubDashboard(sc) : '';
        var pr = tot > 0 ? Math.round((it.t / tot) * 100) : 0;
        
        h += '<div class="dashboard-list-item">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px">' +
            '<div><span class="dashboard-item-name">' + medal + ' ' + it.n + '</span><br>' +
            '<span class="dashboard-item-category">' + ic + ' ' + translatedKat +
            (translatedSub ? ' ' + (sic || '📁') + ' ' + translatedSub : '') +
            ' | ' + it.c + 'x</span></div>' +
            '<div class="dashboard-item-price">' + formatYen(it.t) + ' <small class="dashboard-item-percent">(' + pr + '%)</small></div>' +
            '</div></div>';
    }
    el.innerHTML = h;
}

// ============================================
// RENDER MONTH COMPARE
// ============================================
function renderMonthCompare(transaksi, bulan, tahun) {
    var el = document.getElementById('monthCompareContent');
    if (!el) return;
    var bl = bulan === 1 ? 12 : bulan - 1;
    var tl = bulan === 1 ? tahun - 1 : tahun;
    var ps = 0, pm = 0, pl = 0, pml = 0;
    for (var i = 0; i < transaksi.length; i++) {
        var it = transaksi[i];
        if (!it.tanggal) continue;
        var p = it.tanggal.split('-');
        if (p.length !== 3) continue;
        var tot = parseInt(it.total) || 0;
        if (parseInt(p[1]) === bulan && parseInt(p[0]) === tahun) {
            if (it.jenis === 'pemasukan') pm += tot;
            else ps += tot;
        }
        if (parseInt(p[1]) === bl && parseInt(p[0]) === tl) {
            if (it.jenis === 'pemasukan') pml += tot;
            else pl += tot;
        }
    }
    var months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    var ns = months[bulan - 1] + ' ' + tahun;
    var nl = months[bl - 1] + ' ' + tl;
    if (pl === 0 && ps === 0 && pml === 0 && pm === 0) {
        el.innerHTML = '<p style="text-align:center;color:#8b949e;font-size:0.55rem;padding:10px">📭 Tidak ada data</p>';
        return;
    }
    var h = '<div style="font-size:0.55rem">';
    h += '<div style="font-weight:700;color:#ff4444;margin-bottom:4px">💸 Pengeluaran:</div>';
    h += '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)">' +
        '<span>📅 ' + nl + '</span><span><strong>' + formatYen(pl) + '</strong></span></div>';
    h += '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)">' +
        '<span>📅 ' + ns + '</span><span><strong>' + formatYen(ps) + '</strong></span></div>';
    if (pl > 0) {
        var sp = ps - pl, absp = Math.abs(sp), perp = Math.round((absp / pl) * 100);
        if (sp !== 0) h += '<div style="display:flex;justify-content:space-between;padding:4px 0;color:' + (sp > 0 ? '#ff4444' : '#00e676') + '">' +
            '<span>' + (sp > 0 ? '🔺 Naik' : '🔻 Turun') + '</span>' +
            '<span><strong>' + (sp > 0 ? '+' : '-') + formatYen(absp) + ' (' + perp + '%)</strong></span></div>';
    }
    h += '<div style="font-weight:700;color:#00e676;margin:8px 0 4px">💰 Pemasukan:</div>';
    h += '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)">' +
        '<span>📅 ' + nl + '</span><span><strong>' + formatYen(pml) + '</strong></span></div>';
    h += '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)">' +
        '<span>📅 ' + ns + '</span><span><strong>' + formatYen(pm) + '</strong></span></div>';
    if (pml > 0) {
        var sm = pm - pml, absm = Math.abs(sm), perm = Math.round((absm / pml) * 100);
        if (sm !== 0) h += '<div style="display:flex;justify-content:space-between;padding:4px 0;color:' + (sm > 0 ? '#00e676' : '#ff4444') + '">' +
            '<span>' + (sm > 0 ? '🔺 Naik' : '🔻 Turun') + '</span>' +
            '<span><strong>' + (sm > 0 ? '+' : '-') + formatYen(absm) + ' (' + perm + '%)</strong></span></div>';
    }
    h += '</div>';
    el.innerHTML = h;
}

// ============================================
// CHARTS FUNCTIONS
// ============================================
function renderPieChart(data) { 
    var ctx = document.getElementById('pieChart'); 
    if (!ctx) return; 
    if (pieChartInstance) pieChartInstance.destroy(); 
    var l = Object.keys(data), v = Object.values(data); 
    if (l.length === 0) { 
        pieChartInstance = new Chart(ctx, { 
            type: 'doughnut', 
            data: { labels: ['Tidak ada data'], datasets: [{ data: [1], backgroundColor: ['#30363d'] }] }, 
            options: { responsive: true, maintainAspectRatio: false } 
        }); 
        return; 
    } 
    pieChartInstance = new Chart(ctx, { 
        type: 'doughnut', 
        data: { 
            labels: l.map(function(x) { 
                var icon = getCategoryIcon(x);
                var translated = translateKategoriDashboard(x);
                return icon + ' ' + translated;
            }), 
            datasets: [{ data: v, backgroundColor: ['#ffd700','#58a6ff','#00e676','#ff4444','#ffa502','#a29bfe','#9b59b6','#e84393','#f39c12','#1abc9c'], borderWidth: 2, borderColor: '#0d1117' }] 
        }, 
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { 
                legend: { position: 'bottom', labels: { padding: 4, font: { size: 8 }, usePointStyle: true, color: '#e6e6e6' } } 
            } 
        } 
    }); 
}

function renderBarChart(pem, peng) { 
    var ctx = document.getElementById('barChart'); 
    if (!ctx) return; 
    if (barChartInstance) barChartInstance.destroy(); 
    barChartInstance = new Chart(ctx, { 
        type: 'bar', 
        data: { 
            labels: ['Pemasukan vs Pengeluaran'], 
            datasets: [
                { label: '💰 Pemasukan', data: [pem], backgroundColor: '#00e676', borderRadius: 4 }, 
                { label: '💸 Pengeluaran', data: [peng], backgroundColor: '#ff4444', borderRadius: 4 }
            ] 
        }, 
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            scales: { 
                y: { beginAtZero: true, ticks: { callback: function(v) { return formatYen(v); }, font: { size: 9 }, color: '#e6e6e6' }, grid: { color: 'rgba(255,255,255,.06)' } }, 
                x: { ticks: { font: { size: 9 }, color: '#e6e6e6' } } 
            }, 
            plugins: { legend: { position: 'bottom', labels: { font: { size: 8 }, usePointStyle: true, color: '#e6e6e6' } } } 
        } 
    }); 
}

function renderLineChart(hPem, hPeng, bulan, tahun) { 
    var ctx = document.getElementById('lineChart'); 
    if (!ctx) return; 
    if (lineChartInstance) lineChartInstance.destroy(); 
    var jh = new Date(tahun, bulan, 0).getDate(), lb = [], pd = [], pnd = []; 
    for (var i = 1; i <= jh; i++) { 
        var tgl = tahun + '-' + String(bulan).padStart(2, '0') + '-' + String(i).padStart(2, '0'); 
        lb.push(i); 
        pd.push(hPem[tgl] || 0); 
        pnd.push(hPeng[tgl] || 0); 
    } 
    lineChartInstance = new Chart(ctx, { 
        type: 'line', 
        data: { 
            labels: lb, 
            datasets: [
                { label: '💰 Pemasukan', data: pd, borderColor: '#00e676', tension: 0.3, fill: false, borderWidth: 2, pointRadius: 1, pointBackgroundColor: '#00e676' }, 
                { label: '💸 Pengeluaran', data: pnd, borderColor: '#ff4444', tension: 0.3, fill: false, borderWidth: 2, pointRadius: 1, pointBackgroundColor: '#ff4444' }
            ] 
        }, 
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            scales: { 
                y: { beginAtZero: true, ticks: { callback: function(v) { return formatYen(v); }, font: { size: 8 }, color: '#e6e6e6' }, grid: { color: 'rgba(255,255,255,.06)' } }, 
                x: { ticks: { font: { size: 8 }, color: '#e6e6e6', maxRotation: 45, minRotation: 45 } } 
            }, 
            plugins: { legend: { position: 'bottom', labels: { font: { size: 8 }, usePointStyle: true, color: '#e6e6e6' } } } 
        } 
    }); 
}

function renderMonthlyChart(transaksi, tahun, bulanSkr) { 
    var ctx = document.getElementById('monthlyCompareChart'); 
    if (!ctx) return; 
    if (monthlyChartInstance) monthlyChartInstance.destroy(); 
    var bl = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    var pb = [0,0,0,0,0,0,0,0,0,0,0,0], mb = [0,0,0,0,0,0,0,0,0,0,0,0]; 
    for (var i = 0; i < transaksi.length; i++) { 
        var it = transaksi[i]; 
        if (!it.tanggal) continue; 
        var p = it.tanggal.split('-'); 
        if (p.length !== 3) continue; 
        if (parseInt(p[0]) === tahun) { 
            var tot = parseInt(it.total) || 0; 
            if (it.jenis === 'pemasukan') mb[parseInt(p[1]) - 1] += tot; 
            else pb[parseInt(p[1]) - 1] += tot; 
        } 
    } 
    monthlyChartInstance = new Chart(ctx, { 
        type: 'bar', 
        data: { 
            labels: bl, 
            datasets: [
                { label: '💰 Pemasukan', data: mb, backgroundColor: 'rgba(0,230,118,0.5)', borderColor: '#00e676', borderWidth: 1, borderRadius: 4 }, 
                { label: '💸 Pengeluaran', data: pb, backgroundColor: pb.map(function(v, i) { return i === bulanSkr - 1 ? 'rgba(255,68,68,0.7)' : 'rgba(255,68,68,0.4)'; }), borderColor: '#ff4444', borderWidth: 1, borderRadius: 4 }
            ] 
        }, 
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            scales: { 
                y: { beginAtZero: true, ticks: { callback: function(v) { return formatYen(v); }, font: { size: 8 }, color: '#e6e6e6' }, grid: { color: 'rgba(255,255,255,.06)' } }, 
                x: { ticks: { font: { size: 8 }, color: '#e6e6e6' } } 
            }, 
            plugins: { legend: { position: 'bottom', labels: { font: { size: 8 }, usePointStyle: true, color: '#e6e6e6' } } } 
        } 
    }); 
}