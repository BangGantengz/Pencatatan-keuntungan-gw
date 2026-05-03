(function(){
    var cp = window.location.pathname.split('/').pop() || 'dashboard.html';
    
    var titles = {
        'dashboard.html': '📊 ダッシュボード (Dashboard)',
        'transaksi.html': '💳 取引 (Transaksi)',
        'budget.html': '💰 予算 (Budget)',
        'tracking.html': '📈 追跡 (Tracking)',
        'hapus_data_lama.html': '🧹 ツール (Tools)'
    };
    
    var title = titles[cp] || '家計簿';
    var rate = parseInt(localStorage.getItem('yenRate')) || 110;

    function render() {
        var h = '';
        h += '<aside class="sidebar" id="sidebar">';
        h += '<div class="sidebar-header">';
        h += '<button class="sidebar-toggle" onclick="toggleSidebar()">✕</button>';
        h += '<span class="logo-icon">⛩️</span>';
        h += '<span class="logo-text">家計簿 (Keuangan)</span>';
        h += '</div>';
        h += '<ul class="sidebar-menu">';
        h += '<li><a href="dashboard.html" class="' + (cp === 'dashboard.html' ? 'active' : '') + '">';
        h += '<span class="menu-icon">📊</span>';
        h += '<span class="menu-text">ダッシュボード (Dashboard)</span>';
        h += '</a></li>';
        h += '<li><a href="transaksi.html" class="' + (cp === 'transaksi.html' ? 'active' : '') + '">';
        h += '<span class="menu-icon">💳</span>';
        h += '<span class="menu-text">取引 (Transaksi)</span>';
        h += '</a></li>';
        h += '<li><a href="budget.html" class="' + (cp === 'budget.html' ? 'active' : '') + '">';
        h += '<span class="menu-icon">💰</span>';
        h += '<span class="menu-text">予算 (Budget)</span>';
        h += '</a></li>';
        h += '<li><a href="tracking.html" class="' + (cp === 'tracking.html' ? 'active' : '') + '">';
        h += '<span class="menu-icon">📈</span>';
        h += '<span class="menu-text">追跡 (Tracking)</span>';
        h += '</a></li>';
        h += '<li><a href="hapus_data_lama.html" class="' + (cp === 'hapus_data_lama.html' ? 'active' : '') + '">';
        h += '<span class="menu-icon">🧹</span>';
        h += '<span class="menu-text">ツール (Tools)</span>';
        h += '</a></li>';
        h += '</ul>';
        h += '<div class="sidebar-footer">© 2026 家計簿 (Keuangan)</div>';
        h += '</aside>';
        h += '<div class="sidebar-overlay" id="sidebarOverlay" onclick="toggleSidebar()"></div>';
        h += '<header class="top-header">';
        h += '<button class="header-menu-btn" onclick="toggleSidebar()">☰</button>';
        h += '<div class="header-center">';
        h += '<div class="header-title-wrapper">';
        h += '<h1 class="header-title">' + title + '</h1>';
        h += '</div>';
        h += '<div class="header-info" id="headerInfo">';
        h += '<span class="header-clock" id="clockJepang">🇯🇵 --:-- JST</span>';
        h += '<span class="header-clock" id="clockIndo">🇮🇩 --:-- WIB</span>';
        h += '<span class="header-rate" id="headerRate">💱 ¥1=Rp' + rate + '</span>';
        h += '<span class="header-saldo" id="headerSaldo">💰 残高 --</span>';
        h += '<span class="header-hutang" id="headerHutang">💳 借金 --</span>';
        h += '</div>';
        h += '</div>';
        h += '</header>';
        
        document.body.insertAdjacentHTML('afterbegin', h);
        updateClocks();
        setInterval(updateClocks, 10000);
    }

    function pad(n) {
        return n.toString().padStart(2, '0');
    }
    
    function formatRupiahCompact(angka) {
        if (angka >= 1000000000) return 'Rp' + (angka / 1000000000).toFixed(1) + 'M';
        if (angka >= 1000000) return 'Rp' + (angka / 1000000).toFixed(1) + 'jt';
        if (angka >= 1000) return 'Rp' + (angka / 1000).toFixed(0) + 'rb';
        return 'Rp' + angka;
    }
    
    function formatRupiahFull(angka) {
        return 'Rp' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    
    function updateClocks() {
        var now = new Date();
        var jst = new Date(now.getTime() + (9 * 3600000) + (now.getTimezoneOffset() * 60000));
        var elJ = document.getElementById('clockJepang');
        if (elJ) elJ.textContent = '🇯🇵 ' + pad(jst.getUTCHours()) + ':' + pad(jst.getUTCMinutes()) + ' JST';
        
        var wib = new Date(now.getTime() + (7 * 3600000) + (now.getTimezoneOffset() * 60000));
        var elI = document.getElementById('clockIndo');
        if (elI) elI.textContent = '🇮🇩 ' + pad(wib.getUTCHours()) + ':' + pad(wib.getUTCMinutes()) + ' WIB';
        
        var sr = parseInt(localStorage.getItem('yenRate')) || 110;
        if (sr !== rate) {
            rate = sr;
            var elR = document.getElementById('headerRate');
            if (elR) elR.textContent = '💱 ¥1=Rp' + rate;
        }
        
        updateSaldo();
        updateHutangHeader();
    }
    
    function updateSaldo() {
        var elS = document.getElementById('headerSaldo');
        if (!elS) return;
        
        try {
            var trx = JSON.parse(localStorage.getItem('keuangan_transaksi') || '[]');
            var totalPem = 0, totalPeng = 0;
            for (var i = 0; i < trx.length; i++) {
                var it = trx[i];
                if (!it.tanggal) continue;
                var tot = parseInt(it.total) || 0;
                if (it.jenis === 'pemasukan') totalPem += tot;
                else totalPeng += tot;
            }
            var saldo = totalPem - totalPeng;
            var idr = saldo * rate;
            var rupiahFull = formatRupiahFull(idr);
            var rupiahCompact = formatRupiahCompact(idr);
            
            // MENGGUNAKAN ICON ➡️ BUKAN →
            elS.innerHTML = '💰 残高 (Saldo) &nbsp;&nbsp; ¥' + saldo.toLocaleString('ja-JP') + ' &nbsp;➡️&nbsp; ' + rupiahFull + ' &nbsp;(' + rupiahCompact + ')';
            elS.style.color = saldo >= 0 ? '#ffd700' : '#ff6b6b';
        } catch(e) {
            elS.textContent = '💰 残高 --';
        }
    }
    
    function updateHutangHeader() {
        var elH = document.getElementById('headerHutang');
        if (!elH) return;
        
        try {
            var hutang = JSON.parse(localStorage.getItem('keuangan_hutang') || '[]');
            var trx = JSON.parse(localStorage.getItem('keuangan_transaksi') || '[]');
            var totalBayar = 0;
            for (var i = 0; i < trx.length; i++) {
                var it = trx[i];
                if (it.jenis === 'pengeluaran' && it.kategori && it.kategori.includes('借金返済')) {
                    totalBayar += parseInt(it.total) || 0;
                }
            }
            var totalHutang = 0;
            for (var i = 0; i < hutang.length; i++) {
                totalHutang += parseInt(hutang[i].jumlah) || 0;
            }
            var sisa = totalHutang - totalBayar;
            if (sisa < 0) sisa = 0;
            var idr = sisa * rate;
            var rupiahFull = formatRupiahFull(idr);
            var rupiahCompact = formatRupiahCompact(idr);
            
            // MENGGUNAKAN ICON ➡️ BUKAN →
            elH.innerHTML = '💳 借金 (Hutang) &nbsp;&nbsp; ¥' + sisa.toLocaleString('ja-JP') + ' &nbsp;➡️&nbsp; ' + rupiahFull + ' &nbsp;(' + rupiahCompact + ')';
            elH.style.color = sisa > 0 ? '#ff6b6b' : '#00e676';
        } catch(e) {
            elH.textContent = '💳 借金 --';
        }
    }
    
    window.toggleSidebar = function() {
        var s = document.getElementById('sidebar');
        var o = document.getElementById('sidebarOverlay');
        if (s) {
            s.classList.toggle('show');
            if (o) o.classList.toggle('show');
        }
    };
    
    window.updateHeaderRate = function(r) {
        rate = r;
        localStorage.setItem('yenRate', r);
        var el = document.getElementById('headerRate');
        if (el) el.textContent = '💱 ¥1=Rp' + r;
        updateSaldo();
        updateHutangHeader();
    };
    
    document.addEventListener('click', function(e) {
        if (e.target.id === 'sidebarOverlay') toggleSidebar();
    });
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', render);
    } else {
        render();
    }
})();