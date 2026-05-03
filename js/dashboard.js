var pieChartInstance = null;
var barChartInstance = null;
var lineChartInstance = null;
var monthlyChartInstance = null;

function tr(k) {
    var m = {
        '食費':'食費 (Makanan)','交通費':'交通費 (Transportasi)','通信費':'通信費 (Komunikasi)',
        '光熱費':'光熱費 (Utilitas)','借金返済':'借金返済 (Bayar Hutang)','緊急資金':'緊急資金 (Dana Darurat)',
        '買い物':'買い物 (Belanja)','娯楽':'娯楽 (Hiburan)','家賃':'家賃 (Sewa)',
        '医療費':'医療費 (Kesehatan)','教育':'教育 (Pendidikan)','衣服':'衣服 (Pakaian)',
        '美容':'美容 (Kecantikan)','保険':'保険 (Asuransi)','貯金':'貯金 (Tabungan)',
        '投資':'投資 (Investasi)','給料':'給料 (Gaji)','ボーナス':'ボーナス (Bonus)',
        '副業':'副業 (Freelance)','投資収入':'投資収入 (Investasi)','贈り物':'贈り物 (Hadiah)',
        'Lainnya':'Lainnya (その他)'
    };
    return m[k] || k;
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
                if (!semuaBarang[key]) semuaBarang[key] = { n: it.nama, kat: kc, sub: sc, total: 0, count: 0, lastHarga: 0 };
                semuaBarang[key].total += parseInt(it.total) || 0; semuaBarang[key].count++; semuaBarang[key].lastHarga = parseInt(it.harga) || 0;
            }
            if (it.jenis === 'pemasukan') {
                var sk = (it.kategori || '').replace(/^[^\s]+\s/, '').replace(/\(.*\)/g, '').trim() || 'Lainnya';
                var sn = it.nama || '';
                if (!semuaPemasukan[sk]) semuaPemasukan[sk] = { total: 0, count: 0, items: {} };
                semuaPemasukan[sk].total += parseInt(it.total) || 0; semuaPemasukan[sk].count++;
                if (!semuaPemasukan[sk].items[sn]) semuaPemasukan[sk].items[sn] = { total: 0, count: 0 };
                semuaPemasukan[sk].items[sn].total += parseInt(it.total) || 0; semuaPemasukan[sk].items[sn].count++;
            }
            if (tBulan === bulan && tTahun === tahun) {
                blnIni.push(it);
                if (it.jenis === 'pengeluaran') {
                    var kat = (it.kategori || '').replace(/^[^\s]+\s/, '').replace(/\(.*\)/g, '').trim() || 'Lainnya';
                    var sub = it.subKategori ? it.subKategori.replace(/^[^\s]+\s/, '').replace(/\(.*\)/g, '').trim() : '-';
                    if (!detailKat[kat]) detailKat[kat] = { total: 0, count: 0, items: [], subKats: {} };
                    detailKat[kat].total += parseInt(it.total) || 0; detailKat[kat].count++; detailKat[kat].items.push(it);
                    if (!detailKat[kat].subKats[sub]) detailKat[kat].subKats[sub] = { total: 0, count: 0, items: [] };
                    detailKat[kat].subKats[sub].total += parseInt(it.total) || 0; detailKat[kat].subKats[sub].count++; detailKat[kat].subKats[sub].items.push(it);
                }
            }
        }
        
        var tPem = 0, tPeng = 0, katPeng = {}, hPem = {}, hPeng = {};
        for (var i = 0; i < blnIni.length; i++) { var it = blnIni[i], tot = parseInt(it.total) || 0; if (it.jenis === 'pemasukan') { tPem += tot; hPem[it.tanggal] = (hPem[it.tanggal] || 0) + tot; } else { tPeng += tot; var kat = (it.kategori || '').replace(/^[^\s]+\s/, '').replace(/\(.*\)/g, '').trim() || 'Lainnya'; katPeng[kat] = (katPeng[kat] || 0) + tot; hPeng[it.tanggal] = (hPeng[it.tanggal] || 0) + tot; } }
        var saldo = tPem - tPeng;
        document.getElementById('totalPemasukan').textContent = formatYen(tPem);
        document.getElementById('totalPengeluaran').textContent = formatYen(tPeng);
        document.getElementById('sisaSaldo').textContent = formatYen(saldo);
        
        var tBud = 0; for (var i = 0; i < budgetData.length; i++) tBud += parseInt(budgetData[i].amount) || 0;
        var mergedBudget = [], seen = {};
        for (var i = 0; i < budgetData.length; i++) { var bk = budgetData[i]; var key = (bk.kategori || '') + '|||' + (bk.subKategori || ''); if (seen[key]) { for (var j = 0; j < mergedBudget.length; j++) { if (mergedBudget[j]._key === key) { mergedBudget[j].amount = (parseInt(mergedBudget[j].amount) || 0) + (parseInt(bk.amount) || 0); break; } } } else { seen[key] = true; bk._key = key; mergedBudget.push(bk); } }
        
        renderBudget(bulan, tahun, tPeng, tPem, tBud, mergedBudget, detailKat, saldo);
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
// SISTEM PENILAIAN BUDGET + PROGRESS BAR + LIHAT DETAIL
// ============================================
function renderBudget(bulan, tahun, tPeng, tPem, tBud, budgetData, detailKat, saldo) {
    var el = document.getElementById('budgetStatus');
    if (!el) return;
    var nm = new Date(tahun, bulan - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    
    if (tBud <= 0) {
        el.innerHTML = '<div style="padding:10px;text-align:center;background:rgba(88,166,255,.1);border-radius:6px;border:1px dashed #58a6ff"><p style="margin:0 0 5px;font-size:.7rem">📝 予算未設定 (Budget belum diset)</p><a href="budget.html" class="btn btn-primary btn-sm">💰 予算を設定 (Set Budget)</a></div>';
        return;
    }
    
    // Analisis per kategori
    var kategoriOver = [], kategoriAman = [], totalOverAmount = 0, adaOver = false;
    
    for (var i = 0; i < budgetData.length; i++) {
        var bk = budgetData[i], bAmt = parseInt(bk.amount) || 0;
        if (bAmt <= 0) continue;
        var kn = bk.kategori || '', kc = kn.replace(/^[^\s]+\s/, '').replace(/\(.*\)/g, '').trim() || 'Lainnya';
        var sn = bk.subKategori || '', sc = sn ? sn.replace(/^[^\s]+\s/, '').replace(/\(.*\)/g, '').trim() : '';
        var icon = getCategoryIcon(kc), sicon = getSubIcon(sc);
        var kd = detailKat[kc] || { total: 0, items: [], subKats: {} };
        var pk = sn ? (kd.subKats[sn] || kd.subKats[sc] || { total: 0 }).total || 0 : kd.total || 0;
        var pp2 = (pk / bAmt) * 100, over = pk > bAmt, overAmount = pk - bAmt, sisa = bAmt - pk;
        var item = { icon: icon, sicon: sicon, kc: kc, sc: sc, bAmt: bAmt, pk: pk, pp2: pp2, over: over, overAmount: overAmount, sisa: sisa, kd: kd };
        if (over && bAmt > 0) { kategoriOver.push(item); totalOverAmount += overAmount; adaOver = true; }
        else if (bAmt > 0) { kategoriAman.push(item); }
    }
    
    var totalPersen = (tPeng / tBud) * 100, totalSisa = tBud - tPeng, totalOver = tPeng > tBud;
    
    // Status
    var statusColor, statusIcon, statusTitle, statusMsg;
    if (adaOver && totalOver) { statusColor = '#ff4444'; statusIcon = '🚨'; statusTitle = '⚠️ 警告 (Warning)'; statusMsg = kategoriOver.length + ' カテゴリー超過 & 総額超過! (' + kategoriOver.length + ' kategori over & total over)'; }
    else if (adaOver && !totalOver) { statusColor = '#ffa502'; statusIcon = '⚠️'; statusTitle = '⚠️ 注意 (Caution)'; statusMsg = kategoriOver.length + ' カテゴリー超過! 総額は安全 (' + kategoriOver.length + ' kategori over, total aman)'; }
    else if (totalPersen >= 80) { statusColor = '#ffa502'; statusIcon = '📊'; statusTitle = '📊 注意 (Hampir Over)'; statusMsg = '総予算の ' + totalPersen.toFixed(0) + '% 使用中 (Total ' + totalPersen.toFixed(0) + '% terpakai)'; }
    else { statusColor = '#00e676'; statusIcon = '✅'; statusTitle = '✅ 安全 (Aman)'; statusMsg = '全てのカテゴリーが予算内 (Semua kategori aman)'; }
    
    var h = '';
    h += '<div style="background:' + statusColor + ';color:#000;padding:10px;text-align:center;border-radius:6px 6px 0 0"><span style="font-size:2rem">' + statusIcon + '</span><br><strong style="font-size:.8rem">' + statusTitle + '</strong><br><small style="font-size:.6rem">' + nm + '</small></div>';
    h += '<div style="padding:10px;background:var(--bg-card);border:1px solid var(--border);border-top:none;border-radius:0 0 6px 6px;color:#e6e6e6">';
    
    // Alert
    h += '<div style="background:' + statusColor + '15;border:1px solid ' + statusColor + '40;border-radius:5px;padding:6px;margin-bottom:8px;font-size:.6rem;color:#e6e6e6">' + statusIcon + ' <strong>' + statusMsg + '</strong></div>';
    
    // PROGRESS BAR TOTAL
    h += '<div style="margin-bottom:8px">';
    h += '<div style="display:flex;justify-content:space-between;font-size:.65rem"><span>💸 総支出 (Total Pengeluaran)</span><span><strong>' + formatYen(tPeng) + '</strong> / ' + formatYen(tBud) + ' (' + totalPersen.toFixed(0) + '%)</span></div>';
    h += '<div style="background:rgba(255,255,255,.06);height:16px;border-radius:8px;overflow:hidden;margin:3px 0"><div style="background:' + (totalOver ? '#ff4444' : (totalPersen >= 80 ? '#ffa502' : '#00e676')) + ';height:16px;width:' + Math.min(totalPersen, 100) + '%;text-align:center;color:#000;font-size:.55rem;line-height:16px;font-weight:700">' + totalPersen.toFixed(1) + '%</div></div>';
    h += '<small style="color:' + (totalOver ? '#ff4444' : '#00e676') + '">' + (totalOver ? '⚠️ 超過 (Over) ' + formatYen(Math.abs(totalSisa)) : '✅ 残り (Sisa) ' + formatYen(totalSisa)) + '</small>';
    h += '</div>';
    
    // KATEGORI OVER
    if (kategoriOver.length > 0) {
        h += '<div style="margin-bottom:8px;background:rgba(255,68,68,.04);border:1px solid rgba(255,68,68,.15);border-radius:5px;padding:6px">';
        h += '<div style="font-size:.65rem;color:#ff4444;font-weight:700;margin-bottom:4px">🔴 予算超過 (Kategori Over):</div>';
        for (var i = 0; i < kategoriOver.length; i++) {
            var item = kategoriOver[i];
            h += '<div style="padding:4px 0;border-bottom:1px solid var(--border)">';
            h += '<div style="display:flex;justify-content:space-between;align-items:center;font-size:.6rem"><span>' + item.icon + ' <strong>' + tr(item.kc) + '</strong>' + (item.sc ? ' <small style="color:#8b949e">' + (item.sicon || '📁') + ' ' + item.sc + '</small>' : '') + '</span><span style="color:#ff4444"><strong>+' + formatYen(item.overAmount) + '</strong></span></div>';
            // PROGRESS BAR PER KATEGORI
            h += '<div style="background:rgba(255,255,255,.04);height:6px;border-radius:3px;overflow:hidden;margin:2px 0"><div style="background:#ff4444;height:6px;width:' + Math.min(item.pp2, 100) + '%"></div></div>';
            h += '<small style="font-size:.55rem;color:#ff6b6b">' + formatYen(item.pk) + ' / ' + formatYen(item.bAmt) + ' (' + item.pp2.toFixed(0) + '%)</small>';
            // LIHAT DETAIL
            if (item.kd.items && item.kd.items.length > 0) {
                h += '<details style="font-size:.5rem;margin-top:2px"><summary style="cursor:pointer;color:#58a6ff">📋 詳細を見る (Lihat Detail) ▼</summary><div style="margin-top:2px;padding-left:6px;border-left:1px solid var(--border)">';
                var sks = item.kd.subKats || {}; var cnt = 0;
                for (var subName in sks) { if (cnt >= 5) break; cnt++;
                    var sd = sks[subName]; var scn = subName !== '-' ? subName : 'Tanpa Sub';
                    h += '<div style="margin-bottom:2px"><strong>' + (getSubIcon(subName) || '📁') + ' ' + scn + '</strong> <small style="color:#8b949e">(' + sd.count + 'x, ' + formatYen(sd.total) + ')</small>';
                    var ng = {}; sd.items.forEach(function(it2) { var n = it2.nama; if (!ng[n]) ng[n] = { c: 0, t: 0, h: 0 }; ng[n].c++; ng[n].t += safeNumber(it2.total); ng[n].h = safeNumber(it2.harga); });
                    h += '<div style="padding-left:8px">';
                    Object.entries(ng).slice(0, 3).forEach(function(entry) { h += '<div style="color:#ccc">• <strong>' + entry[0] + '</strong> <small>(' + entry[1].c + 'x, @' + formatYen(entry[1].h) + ', Total: ' + formatYen(entry[1].t) + ')</small></div>'; });
                    h += '</div></div>';
                }
                h += '</div></details>';
            }
            h += '</div>';
        }
        h += '</div>';
    }
    
    // KATEGORI AMAN
    if (kategoriAman.length > 0) {
        h += '<div style="margin-bottom:8px">';
        h += '<div style="font-size:.65rem;color:#00e676;font-weight:700;margin-bottom:4px">🟢 予算内 (Kategori Aman):</div>';
        for (var i = 0; i < kategoriAman.length; i++) {
            var item = kategoriAman[i];
            h += '<div style="padding:4px 0;border-bottom:1px solid var(--border)">';
            h += '<div style="display:flex;justify-content:space-between;align-items:center;font-size:.6rem"><span>' + item.icon + ' <strong>' + tr(item.kc) + '</strong>' + (item.sc ? ' <small style="color:#8b949e">' + (item.sicon || '📁') + ' ' + item.sc + '</small>' : '') + '</span><span style="color:#00e676">' + formatYen(item.pk) + ' / ' + formatYen(item.bAmt) + ' (' + item.pp2.toFixed(0) + '%)</span></div>';
            // PROGRESS BAR
            h += '<div style="background:rgba(255,255,255,.04);height:6px;border-radius:3px;overflow:hidden;margin:2px 0"><div style="background:#00e676;height:6px;width:' + Math.min(item.pp2, 100) + '%"></div></div>';
            // LIHAT DETAIL
            if (item.kd.items && item.kd.items.length > 0) {
                h += '<details style="font-size:.5rem;margin-top:2px"><summary style="cursor:pointer;color:#58a6ff">📋 詳細を見る (Lihat Detail) ▼</summary><div style="margin-top:2px;padding-left:6px;border-left:1px solid var(--border)">';
                var sks = item.kd.subKats || {}; var cnt = 0;
                for (var subName in sks) { if (cnt >= 5) break; cnt++;
                    var sd = sks[subName]; var scn = subName !== '-' ? subName : 'Tanpa Sub';
                    h += '<div style="margin-bottom:2px"><strong>' + (getSubIcon(subName) || '📁') + ' ' + scn + '</strong> <small style="color:#8b949e">(' + sd.count + 'x, ' + formatYen(sd.total) + ')</small>';
                    var ng = {}; sd.items.forEach(function(it2) { var n = it2.nama; if (!ng[n]) ng[n] = { c: 0, t: 0, h: 0 }; ng[n].c++; ng[n].t += safeNumber(it2.total); ng[n].h = safeNumber(it2.harga); });
                    h += '<div style="padding-left:8px">';
                    Object.entries(ng).slice(0, 3).forEach(function(entry) { h += '<div style="color:#ccc">• <strong>' + entry[0] + '</strong> <small>(' + entry[1].c + 'x, @' + formatYen(entry[1].h) + ', Total: ' + formatYen(entry[1].t) + ')</small></div>'; });
                    h += '</div></div>';
                }
                h += '</div></details>';
            }
            h += '</div>';
        }
        h += '</div>';
    }
    
    // Summary
    h += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-top:6px;text-align:center"><div style="background:rgba(0,230,118,.1);padding:5px;border-radius:4px"><small style="color:#8b949e">💰 収入 (Masuk)</small><br><strong style="color:#00e676;font-size:.7rem">' + formatYen(tPem) + '</strong></div><div style="background:rgba(255,68,68,.1);padding:5px;border-radius:4px"><small style="color:#8b949e">💸 支出 (Keluar)</small><br><strong style="color:#ff4444;font-size:.7rem">' + formatYen(tPeng) + '</strong></div><div style="background:rgba(88,166,255,.1);padding:5px;border-radius:4px"><small style="color:#8b949e">💎 残高 (Saldo)</small><br><strong style="color:#58a6ff;font-size:.7rem">' + formatYen(saldo) + '</strong></div></div>';
    
    if (adaOver) {
        h += '<div style="background:rgba(255,68,68,.06);border:1px solid rgba(255,68,68,.15);border-radius:5px;padding:6px;margin-top:6px;font-size:.6rem;color:#ff6b6b">💡 <strong>アドバイス (Saran):</strong> Kurangi pengeluaran kategori over. Total over: <strong>' + formatYen(totalOverAmount) + '</strong></div>';
    }
    
    h += '</div>';
    el.innerHTML = h;
}

// ============================================
// BARANG SERING DIBELI
// ============================================
function renderBarangSeringDibeli(data) {
    var el = document.getElementById('barangSeringDibeli'); if (!el) return;
    var sorted = Object.values(data).sort(function(a, b) { return b.total - a.total; }).slice(0, 15);
    if (sorted.length === 0) { el.innerHTML = '<p style="text-align:center;color:#8b949e;font-size:.6rem;padding:10px">📭 データなし (Tidak ada data)</p>'; return; }
    var h = '';
    for (var i = 0; i < sorted.length; i++) {
        var d = sorted[i]; var icon = getCategoryIcon(d.kat); var sicon = getSubIcon(d.sub);
        h += '<div style="padding:5px 0;border-bottom:1px solid var(--border);color:#e6e6e6">';
        h += '<div style="display:flex;justify-content:space-between;align-items:center"><span>' + icon + ' <strong>' + d.n + '</strong> <small style="color:#8b949e">(' + d.count + 'x)</small></span><span><strong>' + formatYen(d.total) + '</strong></span></div>';
        h += '<div style="font-size:.55rem;color:#8b949e;margin-top:2px">' + tr(d.kat) + (d.sub !== '-' ? ' | ' + (sicon || '📁') + ' ' + d.sub : '') + ' | 💴 1回: <strong style="color:#fff">' + formatYen(d.lastHarga) + '</strong></div>';
        h += '</div>';
    }
    el.innerHTML = h;
}

// ============================================
// SUMBER PEMASUKAN
// ============================================
function renderSumberPemasukanDetail(data) {
    var el = document.getElementById('sumberPemasukan'); if (!el) return;
    var sorted = Object.entries(data).sort(function(a, b) { return b[1].total - a[1].total; });
    if (sorted.length === 0) { el.innerHTML = '<p style="text-align:center;color:#8b949e;font-size:.6rem;padding:10px">📭 データなし (Tidak ada data)</p>'; return; }
    var totalSemua = 0; for (var i = 0; i < sorted.length; i++) totalSemua += sorted[i][1].total;
    var h = '';
    for (var i = 0; i < sorted.length; i++) {
        var d = sorted[i]; var kat = d[0]; var detail = d[1];
        var icon = getCategoryIcon(kat); var persen = totalSemua > 0 ? Math.round((detail.total / totalSemua) * 100) : 0;
        h += '<div style="padding:5px 0;border-bottom:1px solid var(--border);color:#e6e6e6">';
        h += '<div style="display:flex;justify-content:space-between;align-items:center"><span>' + icon + ' <strong>' + tr(kat) + '</strong> <small style="color:#8b949e">(' + detail.count + 'x)</small></span><span><strong style="color:#00e676">' + formatYen(detail.total) + '</strong> <small style="color:#8b949e">(' + persen + '%)</small></span></div>';
        if (Object.keys(detail.items).length > 0) {
            h += '<details style="font-size:.55rem;margin-top:2px"><summary style="cursor:pointer;color:#58a6ff">📋 詳細 (Detail) ▼</summary><div style="padding-left:8px;margin-top:2px">';
            var itemsSorted = Object.entries(detail.items).sort(function(a, b) { return b[1].total - a[1].total; });
            for (var j = 0; j < itemsSorted.length; j++) {
                var item = itemsSorted[j];
                h += '<div style="display:flex;justify-content:space-between;color:#ccc">• <strong>' + item[0] + '</strong> <small>(' + item[1].count + 'x)</small><span>' + formatYen(item[1].total) + '</span></div>';
            }
            h += '</div></details>';
        }
        h += '</div>';
    }
    el.innerHTML = h;
}

// ============================================
// CHARTS
// ============================================
function renderPieChart(data) { var ctx = document.getElementById('pieChart'); if (!ctx) return; if (pieChartInstance) pieChartInstance.destroy(); var l = Object.keys(data), v = Object.values(data); if (l.length === 0) { pieChartInstance = new Chart(ctx, { type: 'doughnut', data: { labels: ['データなし (No data)'], datasets: [{ data: [1], backgroundColor: ['#30363d'] }] }, options: { responsive: true, maintainAspectRatio: false } }); return; } pieChartInstance = new Chart(ctx, { type: 'doughnut', data: { labels: l.map(function(x) { return tr(x); }), datasets: [{ data: v, backgroundColor: ['#ffd700','#58a6ff','#00e676','#ff4444','#ffa502','#a29bfe'], borderWidth: 2, borderColor: '#0d1117' }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 6, font: { size: 8 }, usePointStyle: true, color: '#e6e6e6' } } } } }); }
function renderBarChart(pem, peng) { var ctx = document.getElementById('barChart'); if (!ctx) return; if (barChartInstance) barChartInstance.destroy(); barChartInstance = new Chart(ctx, { type: 'bar', data: { labels: ['収入 vs 支出 (Pemasukan vs Pengeluaran)'], datasets: [{ label: '💰 収入 (Pemasukan)', data: [pem], backgroundColor: '#00e676', borderRadius: 4 }, { label: '💸 支出 (Pengeluaran)', data: [peng], backgroundColor: '#ff4444', borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { callback: function(v) { return formatYen(v); }, color: '#e6e6e6' }, grid: { color: 'rgba(255,255,255,.06)' } }, x: { ticks: { color: '#e6e6e6' } } }, plugins: { legend: { position: 'bottom', labels: { font: { size: 8 }, usePointStyle: true, color: '#e6e6e6' } } } } }); }
function renderLineChart(hPem, hPeng, bulan, tahun) { var ctx = document.getElementById('lineChart'); if (!ctx) return; if (lineChartInstance) lineChartInstance.destroy(); var jh = new Date(tahun, bulan, 0).getDate(), lb = [], pd = [], pnd = []; for (var i = 1; i <= jh; i++) { var tgl = tahun + '-' + String(bulan).padStart(2, '0') + '-' + String(i).padStart(2, '0'); lb.push(i + '日'); pd.push(hPem[tgl] || 0); pnd.push(hPeng[tgl] || 0); } lineChartInstance = new Chart(ctx, { type: 'line', data: { labels: lb, datasets: [{ label: '💰 収入 (Pemasukan)', data: pd, borderColor: '#00e676', tension: .4, fill: false, borderWidth: 2, pointRadius: 1, pointBackgroundColor: '#00e676' }, { label: '💸 支出 (Pengeluaran)', data: pnd, borderColor: '#ff4444', tension: .4, fill: false, borderWidth: 2, pointRadius: 1, pointBackgroundColor: '#ff4444' }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { callback: function(v) { return formatYen(v); }, color: '#e6e6e6' }, grid: { color: 'rgba(255,255,255,.06)' } }, x: { ticks: { color: '#e6e6e6' } } }, plugins: { legend: { position: 'bottom', labels: { font: { size: 8 }, usePointStyle: true, color: '#e6e6e6' } } } } }); }
function renderMonthlyChart(transaksi, tahun, bulanSkr) { var ctx = document.getElementById('monthlyCompareChart'); if (!ctx) return; if (monthlyChartInstance) monthlyChartInstance.destroy(); var bl = ['1月(Jan)','2月(Feb)','3月(Mar)','4月(Apr)','5月(Mei)','6月(Jun)','7月(Jul)','8月(Ags)','9月(Sep)','10月(Okt)','11月(Nov)','12月(Des)'], pb = [0,0,0,0,0,0,0,0,0,0,0,0], mb = [0,0,0,0,0,0,0,0,0,0,0,0]; for (var i = 0; i < transaksi.length; i++) { var it = transaksi[i]; if (!it.tanggal) continue; var p = it.tanggal.split('-'); if (p.length !== 3) continue; if (parseInt(p[0]) === tahun) { var tot = parseInt(it.total) || 0; if (it.jenis === 'pemasukan') mb[parseInt(p[1]) - 1] += tot; else pb[parseInt(p[1]) - 1] += tot; } } monthlyChartInstance = new Chart(ctx, { type: 'bar', data: { labels: bl, datasets: [{ label: '💰 収入 (Pemasukan)', data: mb, backgroundColor: 'rgba(0,230,118,.4)', borderColor: '#00e676', borderWidth: 1, borderRadius: 4, order: 2 }, { label: '💸 支出 (Pengeluaran)', data: pb, backgroundColor: pb.map(function(v, i) { return i === bulanSkr - 1 ? 'rgba(255,68,68,.7)' : 'rgba(255,68,68,.3)'; }), borderColor: '#ff4444', borderWidth: 1, borderRadius: 4, order: 1 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { callback: function(v) { return formatYen(v); }, color: '#e6e6e6' }, grid: { color: 'rgba(255,255,255,.06)' } }, x: { ticks: { color: '#e6e6e6' } } }, plugins: { legend: { position: 'bottom', labels: { font: { size: 8 }, usePointStyle: true, color: '#e6e6e6' } } } } }); }

function renderTopItems(blnIni) { var el = document.getElementById('topItemsList'); if (!el) return; var peng = []; for (var i = 0; i < blnIni.length; i++) { if (blnIni[i].jenis === 'pengeluaran') peng.push(blnIni[i]); } if (peng.length === 0) { el.innerHTML = '<p style="text-align:center;color:#8b949e;font-size:.65rem">📭 データなし (Tidak ada data)</p>'; return; } var g = {}; for (var i = 0; i < peng.length; i++) { var it = peng[i], k = it.nama.toLowerCase(); if (!g[k]) g[k] = { n: it.nama, kat: it.kategori || '', t: 0, c: 0 }; g[k].t += parseInt(it.total) || 0; g[k].c++; } var s = Object.values(g).sort(function(a, b) { return b.t - a.t; }).slice(0, 10); var tot = peng.reduce(function(s, i) { return s + (parseInt(i.total) || 0); }, 0); var h = ''; for (var i = 0; i < s.length; i++) { var it = s[i], bd = i === 0 ? '🥇' : (i === 1 ? '🥈' : (i === 2 ? '🥉' : (i + 1))); var kc = (it.kat || '').replace(/^[^\s]+\s/, '').replace(/\(.*\)/g, '').trim(); var ic = getCategoryIcon(kc); var pr = tot > 0 ? Math.round((it.t / tot) * 100) : 0; h += '<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid var(--border);font-size:.62rem;color:#e6e6e6"><span>' + bd + ' <strong>' + it.n + '</strong> <small style="color:#8b949e">' + ic + ' ' + tr(kc) + ' | ' + it.c + 'x</small></span><span><strong>' + formatYen(it.t) + '</strong> <small style="color:#8b949e">(' + pr + '%)</small></span></div>'; } el.innerHTML = h; }

function renderMonthCompare(transaksi, bulan, tahun) { var el = document.getElementById('monthCompareContent'); if (!el) return; var bl = bulan === 1 ? 12 : bulan - 1, tl = bulan === 1 ? tahun - 1 : tahun; var ps = 0, pm = 0, pl = 0, pml = 0; for (var i = 0; i < transaksi.length; i++) { var it = transaksi[i]; if (!it.tanggal) continue; var p = it.tanggal.split('-'); if (p.length !== 3) continue; var tot = parseInt(it.total) || 0; if (parseInt(p[1]) === bulan && parseInt(p[0]) === tahun) { if (it.jenis === 'pemasukan') pm += tot; else ps += tot; } if (parseInt(p[1]) === bl && parseInt(p[0]) === tl) { if (it.jenis === 'pemasukan') pml += tot; else pl += tot; } } var ns = new Date(tahun, bulan - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }); var nl = new Date(tl, bl - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }); if (pl === 0 && ps === 0 && pml === 0 && pm === 0) { el.innerHTML = '<p style="text-align:center;color:#8b949e;font-size:.65rem;padding:10px">📭 データなし (Tidak ada data)</p>'; return; } var h = '<div style="color:#e6e6e6;font-size:.62rem">'; h += '<div style="font-weight:700;color:#ff4444;margin-bottom:4px">💸 支出 (Pengeluaran):</div>'; h += '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)"><span>📅 ' + nl + ' (Bulan Lalu)</span><span><strong>' + formatYen(pl) + '</strong></span></div>'; h += '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)"><span>📅 ' + ns + ' (Bulan Ini)</span><span><strong>' + formatYen(ps) + '</strong></span></div>'; if (pl > 0) { var sp = ps - pl, absp = Math.abs(sp), perp = Math.round((absp / pl) * 100); if (sp !== 0) h += '<div style="display:flex;justify-content:space-between;padding:4px 0;color:' + (sp > 0 ? '#ff4444' : '#00e676') + '"><span>' + (sp > 0 ? '🔺 増加 (Naik)' : '🔻 減少 (Turun)') + '</span><span><strong>' + (sp > 0 ? '+' : '-') + formatYen(absp) + ' (' + perp + '%)</strong></span></div>'; } h += '<div style="font-weight:700;color:#00e676;margin:8px 0 4px">💰 収入 (Pemasukan):</div>'; h += '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)"><span>📅 ' + nl + ' (Bulan Lalu)</span><span><strong>' + formatYen(pml) + '</strong></span></div>'; h += '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border)"><span>📅 ' + ns + ' (Bulan Ini)</span><span><strong>' + formatYen(pm) + '</strong></span></div>'; if (pml > 0) { var sm = pm - pml, absm = Math.abs(sm), perm = Math.round((absm / pml) * 100); if (sm !== 0) h += '<div style="display:flex;justify-content:space-between;padding:4px 0;color:' + (sm > 0 ? '#00e676' : '#ff4444') + '"><span>' + (sm > 0 ? '🔺 増加 (Naik)' : '🔻 減少 (Turun)') + '</span><span><strong>' + (sm > 0 ? '+' : '-') + formatYen(absm) + ' (' + perm + '%)</strong></span></div>'; } h += '</div>'; el.innerHTML = h; }