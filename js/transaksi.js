var transaksiMaxData = parseInt(localStorage.getItem('transaksiMaxData')) || 10;
var transaksiCurrentPage = 1, transaksiAllData = [];

function initTransaksi() {
    updateKategori();
    renderTransaksi(1);
    document.getElementById('bodyTabel').addEventListener('click', function(e) {
        var b = e.target.closest('.btn-delete');
        if (b) {
            var id = b.getAttribute('data-id');
            if (id) hapusTransaksiById(id);
        }
    });
}

function updateKategori() {
    var j = document.getElementById('jenis').value;
    var ks = document.getElementById('kategori'), ss = document.getElementById('subKategori');
    ks.innerHTML = '<option value="">選択 (Pilih Kategori)</option>';
    ss.innerHTML = '<option value="">選択 (Pilih Sub Kategori)</option>';
    if (j && KATEGORI[j]) {
        KATEGORI[j].forEach(function(k) {
            var o = document.createElement('option');
            o.value = k;
            o.textContent = k;
            ks.appendChild(o);
        });
    }
}

function updateSubKategori(ku) {
    var ss = document.getElementById('subKategori');
    ss.innerHTML = '<option value="">選択 (Pilih Sub Kategori)</option>';
    if (!ku) return;
    for (var key in SUB_KATEGORI) {
        var ck = key.replace(/^[^\s]+\s/, '').replace(/\(.*\)/g, '').trim();
        var cu = ku.replace(/^[^\s]+\s/, '').replace(/\(.*\)/g, '').trim();
        if (ck === cu || ck.includes(cu) || cu.includes(ck)) {
            SUB_KATEGORI[key].forEach(function(s) {
                var o = document.createElement('option');
                o.value = s;
                o.textContent = s;
                ss.appendChild(o);
            });
            return;
        }
    }
}

function hitungTotal() {
    var j = parseInt(document.getElementById('jumlah').value) || 0;
    var h = parseInt(document.getElementById('harga').value) || 0;
    document.getElementById('total').value = formatYen(j * h);
    return j * h;
}

function tambahTransaksi() {
    var tgl = document.getElementById('tanggal').value;
    var wkt = document.getElementById('waktu').value || new Date().toTimeString().slice(0, 5);
    var jns = document.getElementById('jenis').value;
    var kat = document.getElementById('kategori').value;
    var sub = document.getElementById('subKategori').value || '-';
    var nm = document.getElementById('nama').value.trim();
    var jml = parseInt(document.getElementById('jumlah').value);
    var hrg = parseInt(document.getElementById('harga').value);
    var tot = jml * hrg;
    var tempat = document.getElementById('tempat').value.trim();
    var nilaiJml = parseFloat(document.getElementById('nilaiJumlah').value) || 0;
    var nilaiSat = document.getElementById('nilaiSatuan').value;
    var nilaiHrg = parseInt(document.getElementById('nilaiHarga').value) || 0;

    if (!tgl) { showNotification('📅 日付を入力してください (Isi tanggal)', 'warning'); return; }
    if (!jns) { showNotification('💱 種類を選択してください (Pilih jenis transaksi)', 'warning'); return; }
    if (!kat) { showNotification('📂 カテゴリーを選択してください (Pilih kategori)', 'warning'); return; }
    if (!nm) { showNotification('📝 商品名を入力してください (Isi nama barang)', 'warning'); return; }
    if (jml <= 0) { showNotification('🔢 数量は1以上 (Jumlah minimal 1)', 'warning'); return; }
    if (hrg <= 0) { showNotification('💴 価格は¥1以上 (Harga minimal ¥1)', 'warning'); return; }

    var trx = {
        id: 'trx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        tanggal: tgl, waktu: wkt, kategori: kat, subKategori: sub,
        nama: nm, jumlah: jml, harga: hrg, total: tot,
        jenis: jns, timestamp: Date.now()
    };

    if (jns === 'pengeluaran' && tempat) {
        trx.tempat = tempat;
        trx.nilaiJumlah = nilaiJml;
        trx.nilaiSatuan = nilaiSat;
        trx.nilaiHarga = nilaiHrg;
    }

    var all = Storage.getData('keuangan_transaksi');
    all.push(trx);

    if (Storage.saveData('keuangan_transaksi', all)) {
        showNotification('✅ 取引を保存しました (Transaksi disimpan)!', 'success');
        resetForm();
        renderTransaksi(1);
        if (window.refreshDashboard) setTimeout(function() { window.refreshDashboard(); }, 200);
    } else {
        showNotification('❌ 保存に失敗しました (Gagal menyimpan)', 'danger');
    }
}

function resetForm() {
    var n = new Date();
    document.getElementById('tanggal').value = n.toISOString().split('T')[0];
    document.getElementById('waktu').value = n.toTimeString().slice(0, 5);
    document.getElementById('jenis').value = '';
    document.getElementById('kategori').innerHTML = '<option value="">選択 (Pilih Kategori)</option>';
    document.getElementById('subKategori').innerHTML = '<option value="">選択 (Pilih Sub Kategori)</option>';
    document.getElementById('nama').value = '';
    document.getElementById('jumlah').value = '1';
    document.getElementById('harga').value = '';
    document.getElementById('total').value = '';
    document.getElementById('tempat').value = '';
    document.getElementById('nilaiJumlah').value = '1';
    document.getElementById('nilaiHarga').value = '';
    document.getElementById('tempatSection').classList.remove('show');
}

// TRANSLATE MAP
var TR_TRX = {
    '食費':'食費 (Makanan)','交通費':'交通費 (Transportasi)','買い物':'買い物 (Belanja)',
    '娯楽':'娯楽 (Hiburan)','通信費':'通信費 (Komunikasi)','家賃':'家賃 (Sewa)',
    '光熱費':'光熱費 (Utilitas)','医療費':'医療費 (Kesehatan)','教育':'教育 (Pendidikan)',
    '衣服':'衣服 (Pakaian)','美容':'美容 (Kecantikan)','ペット':'ペット (Hewan)',
    '保険':'保険 (Asuransi)','貯金':'貯金 (Tabungan)','投資':'投資 (Investasi)',
    '借金返済':'借金返済 (Bayar Hutang)','緊急資金':'緊急資金 (Dana Darurat)',
    '給料':'給料 (Gaji)','ボーナス':'ボーナス (Bonus)','副業':'副業 (Freelance)',
    '投資収入':'投資収入 (Investasi)','贈り物':'贈り物 (Hadiah)','Lainnya':'Lainnya (その他)'
};
function trx(k) { return TR_TRX[k] || k; }

function renderTransaksi(page) {
    var all = Storage.getData('keuangan_transaksi'), tb = document.getElementById('bodyTabel');
    if (!all || all.length === 0) {
        tb.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:30px;color:#8b949e">📭 取引なし (Belum ada transaksi)</td></tr>';
        document.getElementById('transaksiPagination').innerHTML = '';
        return;
    }
    var sorted = all.slice().sort(function(a, b) { return new Date(b.tanggal + 'T' + (b.waktu || '00:00')) - new Date(a.tanggal + 'T' + (a.waktu || '00:00')); });
    transaksiAllData = sorted;
    transaksiCurrentPage = page || 1;
    var tp = Math.ceil(sorted.length / transaksiMaxData);
    if (transaksiCurrentPage > tp) transaksiCurrentPage = tp;
    if (transaksiCurrentPage < 1) transaksiCurrentPage = 1;
    var st = (transaksiCurrentPage - 1) * transaksiMaxData, ed = Math.min(st + transaksiMaxData, sorted.length), pd = sorted.slice(st, ed);

    var h = '';
    pd.forEach(function(it) {
        var isPemasukan = it.jenis === 'pemasukan';
        var rc = isPemasukan ? 'table-success-light' : 'table-danger-light';
        var bd = isPemasukan ? '<span class="badge bg-success">💰 収入 (Masuk)</span>' : '<span class="badge bg-danger">💸 支出 (Keluar)</span>';
        var kc = (it.kategori || '').replace(/^[^\s]+\s/, '').replace(/\(.*\)/g, '').trim();
        var sc = (it.subKategori && it.subKategori !== '-') ? it.subKategori.replace(/^[^\s]+\s/, '').replace(/\(.*\)/g, '').trim() : '';
        var katIcon = getCategoryIcon(kc);
        var subIcon = getSubIcon(sc);
        var tmp = it.tempat || '-';
        var nilai = it.nilaiJumlah ? it.nilaiJumlah + ' ' + it.nilaiSatuan + ' = ' + formatYen(it.nilaiHarga || 0) : '-';

        h += '<tr class="' + rc + '">';
        h += '<td style="color:#fff"><strong>' + formatTanggal(it.tanggal) + '</strong><br><small style="color:#8b949e">' + (it.waktu || '') + '</small></td>';
        h += '<td>' + bd + '</td>';
        h += '<td style="color:#fff">' + katIcon + ' <strong>' + trx(kc) + '</strong>' + (sc ? '<br><small style="color:#8b949e">' + (subIcon || '📁') + ' ' + sc + '</small>' : '') + '</td>';
        h += '<td style="color:#fff">' + it.nama + '</td>';
        h += '<td style="color:#ffd700">' + (tmp !== '-' ? '🏪 ' + tmp : '-') + '</td>';
        h += '<td style="color:#00e676">' + nilai + '</td>';
        h += '<td style="color:#fff">' + formatYen(it.harga) + '</td>';
        h += '<td style="color:#fff"><strong>' + formatYen(it.total) + '</strong></td>';
        h += '<td><button class="btn btn-sm btn-outline-danger btn-delete" data-id="' + it.id + '" style="font-size:.55rem;padding:2px 5px">🗑️ 削除 (Hapus)</button></td>';
        h += '</tr>';
    });
    tb.innerHTML = h;

    if (tp > 1) {
        var ph = '<span style="color:#8b949e;font-size:.6rem">📄 ページ (Halaman): </span>';
        if (transaksiCurrentPage > 1) ph += '<button class="btn btn-sm btn-outline-secondary" onclick="goToPage(' + (transaksiCurrentPage - 1) + ')" style="padding:2px 6px">◀ 前 (Prev)</button> ';
        for (var i = 1; i <= tp; i++) {
            ph += '<button class="btn btn-sm ' + (i === transaksiCurrentPage ? 'btn-warning' : 'btn-outline-secondary') + '" onclick="goToPage(' + i + ')" style="padding:2px 6px">' + i + '</button> ';
        }
        if (transaksiCurrentPage < tp) ph += '<button class="btn btn-sm btn-outline-secondary" onclick="goToPage(' + (transaksiCurrentPage + 1) + ')" style="padding:2px 6px">次 (Next) ▶</button> ';
        document.getElementById('transaksiPagination').innerHTML = ph;
    } else {
        document.getElementById('transaksiPagination').innerHTML = '<span style="color:#8b949e;font-size:.6rem">全 ' + sorted.length + ' 件 (Total)</span>';
    }
}

function goToPage(p) { renderTransaksi(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }

async function hapusTransaksiById(id) {
    if (!await confirmAction('この取引を削除しますか？ (Hapus transaksi ini?)')) return;
    if (Storage.deleteById('keuangan_transaksi', id)) {
        showNotification('🗑️ 取引を削除しました (Transaksi dihapus)', 'success');
        renderTransaksi(transaksiCurrentPage);
        if (window.refreshDashboard) setTimeout(function() { window.refreshDashboard(); }, 200);
    } else {
        showNotification('❌ 削除に失敗しました (Gagal menghapus)', 'danger');
    }
}