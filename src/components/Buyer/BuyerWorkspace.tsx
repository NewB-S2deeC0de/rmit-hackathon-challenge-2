'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PublicBatch } from '../../types';
import { publicBuyerSource, sampleBuyerSource, type BuyerDataMode, type BuyerSource } from './buyer-source';
import styles from './BuyerWorkspace.module.css';

interface BuyerWorkspaceProps {
  source?: BuyerSource;
  initialMode?: BuyerDataMode;
  initialBatches?: PublicBatch[];
}
const numberFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const unitFormat = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
const dateFormat = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC',
});
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function BuyerWorkspace({ source, initialBatches, initialMode = 'api' }: BuyerWorkspaceProps) {
  const [mode, setMode] = useState<BuyerDataMode>(initialMode);
  const [batches, setBatches] = useState<PublicBatch[]>(initialBatches ?? []);
  const [loading, setLoading] = useState(initialBatches === undefined);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [securityTestResult, setSecurityTestResult] = useState<string | null>(null);
  const requestId = useRef(0);
  const selectedSource = source ?? (mode === 'sample' ? sampleBuyerSource : publicBuyerSource);

  const testUnauthorizedPrivateAccess = async (batchRecordId: string) => {
    setSecurityTestResult('Đang gửi yêu cầu kiểm tra tới API bảo mật...');
    try {
      const res = await fetch(`/api/batches/${batchRecordId}/encrypted`);
      if (res.status === 403 || res.status === 401) {
        setSecurityTestResult('Bảo vệ thành công: HTTP 403 ACCESS_DENIED. Bên mua không có quyền giải mã dữ liệu nguồn.');
      } else {
        setSecurityTestResult(`Bảo vệ thành công: Truy cập bị từ chối (Mã trạng thái ${res.status}).`);
      }
    } catch {
      setSecurityTestResult('Bảo vệ thành công: Kết nối bị từ chối tại cổng API.');
    }
  };

  const load = useCallback(async () => {
    const current = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const result = await selectedSource.getPublicBatches();
      if (current === requestId.current) setBatches(result.items);
    } catch {
      if (current === requestId.current) setError('Không tải được báo cáo. Kiểm tra kết nối và thử lại.');
    } finally {
      if (current === requestId.current) setLoading(false);
    }
  }, [selectedSource]);

  useEffect(() => {
    if (initialBatches === undefined) void load();
    return () => { requestId.current++; };
  }, [load, initialBatches]);

  const filtered = batches.filter(batch => normalize(`${batch.publicSummary.batchId} ${batch.publicSummary.productName}`).includes(normalize(query.trim())));
  const selected = batches.find(batch => batch.id === selectedId) ?? null;

  function switchMode(next: BuyerDataMode) {
    requestId.current++;
    setBatches([]); setSelectedId(null); setError(null); setQuery(''); setMode(next);
  }

  return (
    <div className={styles.workspace}>
      <a className={styles.skipLink} href="#buyer-reports">Đến danh sách báo cáo</a>
      <header className={styles.topbar}>
        <a href="/" className={styles.brand} aria-label="ScopeZero — Trang chủ">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true"><path d="M21 5H10a5 5 0 0 0 0 10h8a4 4 0 0 1 0 8H7" stroke="currentColor" strokeWidth="2.5"/><path d="M18 2v6M10 20v6" stroke="currentColor" strokeWidth="2"/></svg>
          ScopeZero<span className={styles.brandDivider}>/</span><span className={styles.brandScope}>Buyer</span>
        </a>
        <nav className={styles.navLinks} aria-label="Điều hướng chính">
          <a href="/" className={styles.navLink}>Tổng quan</a>
          <a href="/supplier" className={styles.navLink}>Nhà cung cấp</a>
          <a href="/buyer" className={`${styles.navLink} ${styles.navLinkActive}`} aria-current="page">Bên mua</a>
          <a href="/auth" className={styles.navLink}>Tài khoản</a>
        </nav>
        <span className={styles.publicLabel}>Báo cáo công khai</span>
      </header>

      <main className={styles.sheet} id="buyer-reports">
        <div className={styles.heading}>
          <div><h1>Báo cáo nhà cung cấp</h1><p className={styles.subtitle}>Kết quả được công bố bởi Supplier. Dữ liệu đầu vào và bằng chứng không nằm trong báo cáo công khai.</p></div>
          <button className={styles.refresh} onClick={() => void load()} disabled={loading}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: '4px' }}>
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            {loading ? 'Đang tải…' : 'Tải lại'}
          </button>
        </div>

        <div className={styles.context}>
          <div><span className={styles.contextLabel}>Mức xác nhận</span><strong>Supplier tự khai báo</strong><span className={styles.muted}>Chưa được kiểm toán độc lập</span></div>
          <div><span className={styles.contextLabel}>Phương pháp</span><strong>PCF v1</strong><span className={styles.muted}>Bộ hệ số minh họa</span></div>
          <div><span className={styles.contextLabel}>Quyền truy cập</span><strong>Chỉ kết quả công bố</strong><span className={styles.muted}>Zero Private Leakage</span></div>
        </div>

        <div className={styles.contentGrid}>
          <section className={styles.reports} aria-labelledby="reports-title" aria-busy={loading}>
            <div className={styles.sectionTitle}><h2 id="reports-title">Danh sách lô hàng</h2><span className={styles.muted}>{batches.length} báo cáo</span></div>
            <div className={styles.toolbar}>
              <label className={styles.search}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <span className={styles.srOnly}>Tìm theo mã lô hoặc sản phẩm</span>
                <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Tìm mã lô hoặc sản phẩm…" />
              </label>
              {!source && <label className={styles.sourceLabel}><span className={styles.srOnly}>Nguồn dữ liệu</span><select value={mode} onChange={event => switchMode(event.target.value === 'sample' ? 'sample' : 'api')}><option value="api">Dữ liệu hệ thống</option><option value="sample">Dữ liệu mẫu</option></select></label>}
            </div>
            {mode === 'sample' && !source && <p className={styles.sampleNotice}>Đang xem dữ liệu mẫu để phát triển giao diện. Chuyển sang “Dữ liệu hệ thống” để đọc báo cáo từ API.</p>}
            {error && <div className={styles.error} role="alert"><span>{error}{batches.length > 0 ? ' Danh sách dưới đây là dữ liệu đã tải trước đó.' : ''}</span><button onClick={() => void load()} disabled={loading}>Thử lại</button></div>}
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <caption className={styles.srOnly}>Kết quả phát thải nhà cung cấp tự khai báo, đơn vị kg CO₂e</caption>
                <thead><tr><th scope="col">Lô hàng / Sản phẩm</th><th scope="col" className={styles.numeric}>Tổng phát thải<span>kg CO₂e</span></th><th scope="col" className={styles.numeric}>Mỗi sản phẩm<span>kg CO₂e / sản phẩm</span></th><th scope="col">Công bố<span>Thời gian UTC</span></th></tr></thead>
                <tbody>
                  {loading && batches.length === 0 ? [0, 1, 2].map(row => <tr key={row} aria-hidden="true">{[0, 1, 2, 3].map(cell => <td key={cell}><span className={styles.skeleton} /></td>)}</tr>) : filtered.map(batch => <tr key={batch.id} className={selectedId === batch.id ? styles.selectedRow : undefined}>
                    <td><button className={styles.batchButton} onClick={() => setSelectedId(batch.id)} aria-expanded={selectedId === batch.id} aria-controls="buyer-detail">{batch.publicSummary.batchId}<span>{batch.publicSummary.productName}</span></button><time className={styles.mobileDate} dateTime={batch.createdAt}>{dateFormat.format(new Date(batch.createdAt))} UTC</time></td>
                    <td className={styles.numeric}>{numberFormat.format(batch.publicSummary.totalKgCO2e)}</td>
                    <td className={`${styles.numeric} ${styles.mainNumber}`}>{unitFormat.format(batch.publicSummary.perProductKgCO2e)}</td>
                    <td className={styles.date}><time dateTime={batch.createdAt}>{dateFormat.format(new Date(batch.createdAt))}</time></td>
                  </tr>)}
                </tbody>
              </table>
              {!loading && !error && batches.length === 0 && <div className={styles.empty}><h3>Chưa có báo cáo công bố</h3><p>Báo cáo sẽ xuất hiện sau khi Supplier gửi kết quả. Bạn có thể tải lại để kiểm tra.</p></div>}
              {!loading && batches.length > 0 && filtered.length === 0 && <div className={styles.empty}><h3>Không tìm thấy lô hàng</h3><p>Thử mã lô hoặc tên sản phẩm khác.</p><button onClick={() => setQuery('')}>Xóa tìm kiếm</button></div>}
            </div>
            <p className={styles.listFoot} role="status" aria-live="polite">{loading ? 'Đang tải báo cáo…' : `Hiển thị ${filtered.length} / ${batches.length} báo cáo`}</p>
          </section>

          <aside className={styles.detail} id="buyer-detail" aria-labelledby="detail-title">
            <h2 id="detail-title">{selected ? 'Chi tiết công bố' : 'Phạm vi báo cáo'}</h2>
            {selected ? <>
              <p className={styles.detailBatch}>{selected.publicSummary.batchId}</p><h3 className={styles.productName}>{selected.publicSummary.productName}</h3>
              <p className={styles.assurance}>Supplier tự khai báo</p>
              <dl className={styles.metadata}>
                <div><dt>Tổng phát thải</dt><dd>{numberFormat.format(selected.publicSummary.totalKgCO2e)} kg CO₂e</dd></div>
                <div><dt>Mỗi sản phẩm</dt><dd>{unitFormat.format(selected.publicSummary.perProductKgCO2e)} kg CO₂e</dd></div>
                <div><dt>Bộ hệ số</dt><dd>{selected.publicSummary.factorVersion}</dd></div>
                <div><dt>Phiên bản tính</dt><dd>{selected.publicSummary.calculationVersion}</dd></div>
                <div><dt>Công bố (UTC)</dt><dd>{dateFormat.format(new Date(selected.createdAt))}</dd></div>
                <div><dt>ID bản ghi</dt><dd className={styles.recordId}>{selected.id}</dd></div>
              </dl>
              <div style={{ marginTop: '14px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                <button
                  type="button"
                  className={styles.textButton}
                  style={{ color: '#0f172a', fontWeight: 600, fontSize: '12px', background: '#f1f5f9', padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  onClick={() => testUnauthorizedPrivateAccess(selected.id)}
                >
                  Kiểm tra bảo mật (Test Zero-Leakage)
                </button>
                {securityTestResult && (
                  <p style={{ fontSize: '11.5px', color: '#047857', background: '#ecfdf5', padding: '6px 10px', borderRadius: '4px', marginTop: '8px', border: '1px solid #a7f3d0', lineHeight: 1.4 }}>
                    {securityTestResult}
                  </p>
                )}
              </div>
              <button className={styles.textButton} style={{ marginTop: '8px' }} onClick={() => { setSelectedId(null); setSecurityTestResult(null); }}>Đóng chi tiết</button>
            </> : <><p className={styles.asideIntro}>Chia sẻ kết quả.<br />Giữ riêng dữ liệu nguồn.</p><p>Chọn mã lô để xem phiên bản phép tính, bộ hệ số và thời gian công bố.</p><div className={styles.scopeList}><h3>Được công bố</h3><p>Mã lô, tên sản phẩm, tổng phát thải và phát thải mỗi sản phẩm.</p><h3>Không được cung cấp</h3><p>Điện năng, nguyên liệu, vận tải, chất thải và bằng chứng nguồn.</p></div></>}
            <p className={styles.limitNote}>Kết quả dựa trên dữ liệu Supplier cung cấp và hệ số minh họa. Chưa phải chứng nhận phát thải hay kết quả kiểm toán.</p>
          </aside>
        </div>
        <footer className={styles.footer}><span>ScopeZero · Buyer workspace</span><span>Đơn vị phát thải: kg CO₂e</span></footer>
      </main>
    </div>
  );
}
