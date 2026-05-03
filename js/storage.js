var Storage = {
    init: function() {
        this.migrate();
        console.log('Storage ready');
    },
    migrate: function() {
        var t = this.getData('keuangan_transaksi');
        var u = false;
        var n = [];
        for (var i = 0; i < t.length; i++) {
            var item = t[i];
            if (!item.id) {
                u = true;
                item.id = 'trx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                item.tanggal = item.tanggal || '';
                item.waktu = item.waktu || '00:00';
                item.kategori = item.kategori || 'Lainnya';
                item.subKategori = item.subKategori || '-';
                item.nama = item.nama || 'Unknown';
                item.jumlah = item.jumlah || 1;
                item.harga = item.harga || 0;
                item.total = item.total || (item.jumlah * item.harga) || 0;
                item.jenis = item.jenis || 'pengeluaran';
                item.timestamp = item.timestamp || Date.now();
            }
            n.push(item);
        }
        if (u) {
            this.saveData('keuangan_transaksi', n);
        }
    },
    getBudgetKey: function(bulan, tahun) {
        return 'keuangan_budget_' + tahun + '_' + bulan;
    },
    getBudgetData: function(bulan, tahun) {
        var key = this.getBudgetKey(bulan, tahun);
        var data = this.getData(key);
        if (!data || data.length === 0) {
            return [];
        }
        return data;
    },
    saveBudgetData: function(bulan, tahun, data) {
        var key = this.getBudgetKey(bulan, tahun);
        return this.saveData(key, data);
    },
    saveData: function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            return false;
        }
    },
    getData: function(key) {
        try {
            var data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },
    deleteById: function(key, id) {
        var data = this.getData(key);
        for (var i = 0; i < data.length; i++) {
            if (data[i].id === id) {
                data.splice(i, 1);
                return this.saveData(key, data);
            }
        }
        return false;
    }
};

Storage.init();