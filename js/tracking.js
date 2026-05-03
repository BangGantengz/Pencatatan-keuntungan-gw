var YEN_TO_IDR_RATE = parseInt(localStorage.getItem('yenRate')) || 110;
var HUTANG_KEY = 'keuangan_hutang';
var HUTANG_RATE = parseInt(localStorage.getItem('yenRate')) || 110;
var lastEdited = null;

var TR_MAP = {
    '食費':'食費 (Makanan)','交通費':'交通費 (Transportasi)','通信費':'通信費 (Komunikasi)',
    '光熱費':'光熱費 (Utilitas)','借金返済':'借金返済 (Bayar Hutang)','緊急資金':'緊急資金 (Dana Darurat)',
    '買い物':'買い物 (Belanja)','娯楽':'娯楽 (Hiburan)','家賃':'家賃 (Sewa)',
    '医療費':'医療費 (Kesehatan)','教育':'教育 (Pendidikan)','衣服':'衣服 (Pakaian)',
    '美容':'美容 (Kecantikan)','保険':'保険 (Asuransi)','貯金':'貯金 (Tabungan)',
    '投資':'投資 (Investasi)','Lainnya':'Lainnya (その他)'
};
function tr(k) { return TR_MAP[k] || k; }

// ============================================
// KONVERSI YEN ↔ IDR
// ============================================
function convertYenToIdr() {
    var yen = parseInt(document.getElementById('hutangYen').value) || 0;
    if (yen > 0 && lastEdited !== 'idr') {
        lastEdited = 'yen';
        document.getElementById('hutangIdr').value = yen * HUTANG_RATE;
        var ib = document.getElementById('idrAutoBadge'); if (ib) ib.style.display = 'block';
        var yb = document.getElementById('yenAutoBadge'); if (yb) yb.style.display = 'none';
    } else if (yen === 0) {
        document.getElementById('hutangIdr').value = '';
        var ib = document.getElementById('idrAutoBadge'); if (ib) ib.style.display = 'none';
        lastEdited = null;
    }
}

function convertIdrToYen() {
    var idr = parseInt(document.getElementById('hutangIdr').value) || 0;
    if (idr > 0 && lastEdited !== 'yen') {
        lastEdited = 'idr';
        document.getElementById('hutangYen').value = Math.round(idr / HUTANG_RATE);
        var yb = document.getElementById('yenAutoBadge'); if (yb) yb.style.display = 'block';
        var ib = document.getElementById('idrAutoBadge'); if (ib) ib.style.display = 'none';
    } else if (idr === 0) {
        document.getElementById('hutangYen').value = '';
        var yb = document.getElementById('yenAutoBadge'); if (yb) yb.style.display = 'none';
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
                on: it.nama, kat: it.kategori || '-', sub: it.subKategori || '-',
                tempat: it.tempat || '-', nilaiJumlah: it.nilaiJumlah || 0,
                nilaiSatuan: it.nilaiSatuan || '', nilaiHarga: it.nilaiHarga || 0,
                tp: 0, jt: 0, tq: 0, its: []
            };
        }
        g[key].tp += parseInt(it.total) || 0;
        g[key].jt++;
        g[key].tq += parseInt(it.jumlah) || 0;
        g[key].its.push(it);
        if (it.tempat) g[key].tempat = it.tempat;
        if (it.nilaiJumlah) { g[key].nilaiJumlah = it.nilaiJumlah; g[key].nilaiSatuan = it.nilaiSatuan; g[key].nilaiHarga = it.nilaiHarga; }
    }
    
    var s = Object.values(g).sort(function(a, b) { return b.tp - a.tp; });
    
    var h = '';
    for (var i = 0; i < s.length; i++) {
        var d = s[i];
        var rata = Math.round(d.tp / d.jt);
        var kc = (d.kat || '').replace(/^[^\s]+\s/, '').replace(/\(.*\)/g, '').trim();
        var sc = d.sub !== '-' ? (d.sub || '').replace(/^[^\s]+\s/, '').replace(/\(.*\)/g, '').trim() : '-';
        var katIcon = getCategoryIcon(kc);
        var subIcon = getSubIcon(sc);
        var tmp = d.tempat !== '-' ? '🏪 ' + d.tempat : '-';
        var nilai = d.nilaiJumlah > 0 ? d.nilaiJumlah + ' ' + d.nilaiSatuan + ' = ' + formatYen(d.nilaiHarga) : '-';
        var detailId = 'd-' + i;
        
        h += '<tr>';
        h += '<td style="color:#fff"><strong>' + d.on + '</strong></td>';
        h += '<td style="color:#fff">' + katIcon + ' <strong>' + tr(kc) + '</strong></td>';
        h += '<td style="color:#ccc">' + (subIcon || '📁') + ' ' + sc + '</td>';
        h += '<td style="color:#ffd700">' + tmp + '</td>';
        h += '<td style="color:#00e676">' + nilai + '</td>';
        h += '<td style="color:#fff;text-align:center"><span class="badge bg-warning">' + d.jt + 'x</span></td>';
        h += '<td style="color:#fff">' + formatYen(d.its[0].harga) + '</td>';
        h += '<td style="color:#fff"><strong>' + formatYen(d.tp) + '</strong></td>';
        h += '<td style="color:#58a6ff"><strong>' + formatYen(rata) + '</strong></td>';
        h += '<td><button class="btn btn-sm btn-link" onclick="toggleDetail(\'' + detailId + '\')" style="font-size:.55rem;color:#58a6ff">▼</button></td>';
        h += '</tr>';
        
        h += '<tr id="' + detailId + '" style="display:none"><td colspan="10" style="background:#0d1117;padding:6px">';
        h += '<div style="font-size:.55rem;color:#ccc"><strong style="color:#fff">📋 履歴 (Riwayat):</strong> ';
        for (var j = 0; j < d.its.length; j++) {
            var item = d.its[j];
            h += '<span style="display:inline-block;background:rgba(255,255,255,.05);padding:2px 6px;border-radius:3px;margin:1px;color:#e6e6e6">' + formatTanggal(item.tanggal) + ' | ' + item.jumlah + 'x @' + formatYen(item.harga) + ' = ' + formatYen(item.total) + '</span> ';
        }
        h += '</div></td></tr>';
    }
    
    tb.innerHTML = h;
    
    var totP = 0;
    for (var i = 0; i < flt.length; i++) { totP += parseInt(flt[i].total) || 0; }
    var totT = flt.length;
    
    if (tf) {
        tf.innerHTML = '<tr style="font-weight:700;background:#010409">' +
            '<td style="color:#ffd700!important;border-top:2px solid #ffd700;padding:8px 5px">📊 合計 (TOTAL)</td>' +
            '<td style="border-top:2px solid #ffd700"></td><td style="border-top:2px solid #ffd700"></td>' +
            '<td style="border-top:2px solid #ffd700"></td><td style="border-top:2px solid #ffd700"></td>' +
            '<td style="color:#fff;text-align:center;border-top:2px solid #ffd700"><span class="badge bg-primary">' + totT + 'x 取引 (transaksi)</span></td>' +
            '<td style="border-top:2px solid #ffd700"></td>' +
            '<td style="color:#fff!important;border-top:2px solid #ffd700"><strong>' + formatYen(totP) + '</strong></td>' +
            '<td style="border-top:2px solid #ffd700"></td><td style="border-top:2px solid #ffd700"></td>' +
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
    if (r) { r.style.display = r.style.display === 'none' ? 'table-row' : 'none'; }
}

// ============================================
// BUDGET TRACKING
// ============================================
function updateTrackingBudget(bulan, tahun, totP) {
    var c = document.getElementById('budgetTrackingStatus');
    if (!c) return;
    c.style.display = 'block';
    
    var bd = Storage.getBudgetData(bulan, tahun);
    var tB = 0;
    for (var i = 0; i < bd.length; i++) { tB += parseInt(bd[i].amount) || 0; }
    
    var nm = new Date(tahun, bulan - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    
    if (tB > 0) {
        var s = tB - totP, p = (totP / tB) * 100, ov = totP > tB;
        var kr = '';
        for (var i = 0; i < bd.length; i++) {
            var bk = bd[i], ba = parseInt(bk.amount) || 0;
            if (ba > 0) {
                var kn = bk.kategori || '', kc = kn.replace(/^[^\s]+\s/, '').replace(/\(.*\)/g, '').trim();
                var sn = bk.subKategori || '', sc = sn ? sn.replace(/^[^\s]+\s/, '').replace(/\(.*\)/g, '').trim() : '';
                var icon = getCategoryIcon(kc), sicon = getSubIcon(sc);
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
                    pk += parseInt(it.total) || 0;
                }
                var pp2 = (pk / ba) * 100;
                kr += '<div style="display:flex;justify-content:space-between;font-size:.6rem;padding:2px 0;color:#e6e6e6;border-bottom:1px solid #30363d">' +
                    icon + ' <strong style="color:#fff">' + tr(kc) + '</strong>' + (sc ? ' <small style="color:#8b949e">' + (sicon || '📁') + ' ' + sc + '</small>' : '') +
                    '<span style="color:' + (pk > ba ? '#ff4444' : '#00e676') + '">' + formatYen(pk) + ' / ' + formatYen(ba) + ' (' + pp2.toFixed(0) + '%)</span></div>';
            }
        }
        c.innerHTML = '<div class="card" style="border:2px solid ' + (ov ? '#ff4444' : '#00e676') + ';background:#161b22"><div class="card-body" style="padding:10px"><h6 style="font-size:.75rem;color:#fff;margin-bottom:6px">📊 予算追跡 (Budget Tracking) - ' + nm + '</h6><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:6px"><div><small style="color:#8b949e">💰 予算 (Budget)</small><br><strong style="color:#fff;font-size:.85rem">' + formatYen(tB) + '</strong></div><div><small style="color:#8b949e">💸 支出 (Pengeluaran)</small><br><strong style="color:' + (ov ? '#ff4444' : '#00e676') + ';font-size:.85rem">' + formatYen(totP) + '</strong></div></div><div class="progress" style="height:12px;margin-bottom:4px;background:rgba(255,255,255,.06)"><div class="progress-bar" style="width:' + Math.min(p, 100) + '%;background:' + (ov ? '#ff4444' : '#00e676') + '">' + p.toFixed(1) + '%</div></div><small style="color:' + (ov ? '#ff4444' : '#00e676') + '">' + (ov ? '⚠️ 超過 (Over) ' + formatYen(Math.abs(s)) : '✅ 残り (Sisa) ' + formatYen(s)) + '</small>' + (kr ? '<div style="margin-top:6px;padding-top:6px;border-top:1px solid #30363d"><small style="color:#8b949e">📂 カテゴリー別 (Per Kategori):</small>' + kr + '</div>' : '') + '</div></div>';
    } else {
        c.innerHTML = '<div class="card" style="border:2px solid #58a6ff;background:#161b22"><div class="card-body" style="padding:10px"><h6 style="font-size:.75rem;color:#fff">📊 予算追跡 (Budget Tracking)</h6><p style="font-size:.65rem;color:#8b949e;margin:0">📝 予算未設定 (Budget belum diset) <a href="budget.html" style="color:#58a6ff">💰 設定 (Set Budget)</a></p></div></div>';
    }
}

// ============================================
// HUTANG - TABEL PROFESIONAL
// ============================================
function tambahHutang() {
    var nama = document.getElementById('hutangNama').value.trim();
    var yen = parseInt(document.getElementById('hutangYen').value) || 0;
    var idr = parseInt(document.getElementById('hutangIdr').value) || 0;
    
    if (!nama) { alert('🏦 名前を入力してください (Isi nama hutang)'); return; }
    
    var jumlahYen;
    if (lastEdited === 'yen' && yen > 0) jumlahYen = yen;
    else if (lastEdited === 'idr' && idr > 0) jumlahYen = Math.round(idr / HUTANG_RATE);
    else if (yen > 0) jumlahYen = yen;
    else if (idr > 0) jumlahYen = Math.round(idr / HUTANG_RATE);
    else { alert('💰 金額を入力してください (Isi jumlah Yen atau Rupiah)'); return; }
    
    if (jumlahYen <= 0) { alert('💰 金額は0より大きい (Jumlah harus > 0)'); return; }
    
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
    
    // Kumpulkan semua pembayaran hutang
    var pembayaranList = [];
    var totalBayarAll = 0;
    for (var i = 0; i < trx.length; i++) {
        var it = trx[i];
        if (it.jenis === 'pengeluaran' && it.kategori && it.kategori.includes('借金返済')) {
            var bayar = parseInt(it.total) || 0;
            totalBayarAll += bayar;
            pembayaranList.push({ tanggal: it.tanggal, nama: it.nama, jumlah: bayar });
        }
    }
    
    if (!tb) return;
    
    if (hutang.length === 0) {
        tb.innerHTML = '<tr><td colspan="7" class="text-center" style="color:#8b949e;padding:15px;font-size:.6rem">📭 借金データなし (Belum ada data hutang)</td></tr>';
        var td = document.getElementById('totalHutangDisplay'); if (td) td.textContent = '¥0';
        return;
    }
    
    // Urutkan: yang belum lunas dulu
    hutang.sort(function(a, b) {
        var sa = Math.max(0, a.jumlah - totalBayarAll);
        var sb = Math.max(0, b.jumlah - totalBayarAll);
        return sb - sa;
    });
    
    var h = '';
    var sisaBayar = totalBayarAll;
    var totalSisaAll = 0;
    
    for (var i = 0; i < hutang.length; i++) {
        var hu = hutang[i];
        var bayarHutangIni = Math.min(sisaBayar, hu.jumlah);
        var sisa = hu.jumlah - bayarHutangIni;
        if (sisa < 0) sisa = 0;
        sisaBayar -= bayarHutangIni;
        totalSisaAll += sisa;
        
        var persen = hu.jumlah > 0 ? Math.round((bayarHutangIni / hu.jumlah) * 100) : 0;
        var statusWarna = sisa > 0 ? '#ff4444' : '#00e676';
        var statusText = sisa > 0 ? '🔴 未完了 (Belum Lunas)' : '🟢 完了 (Lunas)';
        var progressWarna = persen >= 100 ? '#00e676' : (persen >= 50 ? '#ffa502' : '#ff4444');
        
        h += '<tr>';
        h += '<td><strong style="color:#fff">' + hu.nama + '</strong><br><small style="color:#8b949e">📅 作成 (Dibuat): ' + formatTanggal(hu.createdAt) + '</small></td>';
        h += '<td style="color:#ffd700"><strong>¥' + hu.jumlah.toLocaleString('ja-JP') + '</strong></td>';
        h += '<td style="color:#58a6ff"><strong>¥' + bayarHutangIni.toLocaleString('ja-JP') + '</strong></td>';
        h += '<td><div style="width:80px"><div class="progress" style="height:8px;background:rgba(255,255,255,.06);border-radius:4px"><div class="progress-bar" style="width:' + persen + '%;background:' + progressWarna + ';height:8px;border-radius:4px"></div></div><small style="color:#ccc;font-size:.5rem">' + persen + '%</small></div></td>';
        h += '<td style="color:' + statusWarna + '"><strong>¥' + sisa.toLocaleString('ja-JP') + '</strong></td>';
        h += '<td style="color:' + statusWarna + ';font-size:.55rem">' + statusText + '</td>';
        h += '<td><button class="btn btn-sm text-danger" style="font-size:.45rem;padding:1px 4px" onclick="hapusHutang(\'' + hu.id + '\')">🗑️ 削除 (Hapus)</button></td>';
        h += '</tr>';
        
        // Detail pembayaran untuk hutang ini
        if (pembayaranList.length > 0 && bayarHutangIni > 0) {
            h += '<tr><td colspan="7" style="background:#0d1117;padding:4px 8px"><details style="font-size:.5rem"><summary style="cursor:pointer;color:#58a6ff">📋 支払履歴 (Riwayat Pembayaran) ▼</summary>';
            for (var j = 0; j < pembayaranList.length; j++) {
                var p = pembayaranList[j];
                h += '<div style="color:#ccc;padding:2px 0;border-bottom:1px solid #1a1a2e">• 📅 ' + formatTanggal(p.tanggal) + ' | 📝 ' + p.nama + ' | 💰 <strong style="color:#00e676">¥' + p.jumlah.toLocaleString('ja-JP') + '</strong></div>';
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
    if (i !== -1) { hutang.splice(i, 1); Storage.saveData(HUTANG_KEY, hutang); renderHutangTable(); if (window.updateHeaderRate) window.updateHeaderRate(HUTANG_RATE); }
}

// ============================================
// UPDATE RATE & EXPORT
// ============================================
function updateRate() {
    var nr = prompt('💱 1 JPY = Rp:', YEN_TO_IDR_RATE);
    if (!nr) return;
    var p = parseInt(nr);
    if (isNaN(p) || p <= 0) return;
    YEN_TO_IDR_RATE = p;
    HUTANG_RATE = p;
    localStorage.setItem('yenRate', p);
    if (window.updateHeaderRate) window.updateHeaderRate(p);
    var hr = document.getElementById('hutangRate'); if (hr) hr.textContent = p;
    hitungRataHarga(parseInt(document.getElementById('trackBulan').value), parseInt(document.getElementById('trackTahun').value));
}

function exportTrackingData() {
    var trx = Storage.getData('keuangan_transaksi');
    var b = parseInt(document.getElementById('trackBulan').value), t = parseInt(document.getElementById('trackTahun').value);
    var flt = [];
    for (var i = 0; i < trx.length; i++) {
        var it = trx[i];
        if (!it.tanggal) continue;
        if (it.jenis !== 'pengeluaran') continue;
        var parts = it.tanggal.split('-');
        if (parts.length !== 3) continue;
        if (parseInt(parts[1]) === b && parseInt(parts[0]) === t) flt.push(it);
    }
    if (flt.length === 0) { alert('❌ Tidak ada data'); return; }
    var csv = '\uFEFFNama,Kategori,Sub,Tempat,Nilai Jumlah,Nilai Satuan,Nilai Harga,Jumlah,Harga,Total,Tanggal\n';
    for (var i = 0; i < flt.length; i++) {
        var it = flt[i];
        csv += '"' + it.nama + '","' + it.kategori + '","' + (it.subKategori || '-') + '","' + (it.tempat || '-') + '",' + (it.nilaiJumlah || 0) + ',"' + (it.nilaiSatuan || '-') + '",' + (it.nilaiHarga || 0) + ',' + it.jumlah + ',' + it.harga + ',' + it.total + ',"' + it.tanggal + '"\n';
    }
    var blob = new Blob([csv], { type: 'text/csv' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'tracking-' + t + '-' + b + '.csv'; a.click();
}