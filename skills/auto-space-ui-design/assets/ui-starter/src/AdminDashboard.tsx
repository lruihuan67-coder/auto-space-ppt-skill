import { useEffect, useState } from "react"
import { Activity, ArrowDownToLine, ArrowRight, ArrowUpRight, Bell, Bot, Check, ChevronLeft, ChevronRight, CircleHelp, Database, FolderKanban, LayoutDashboard, Menu, Moon, Plus, Search, Settings2, ShieldCheck, Sun, Workflow, X, Zap } from "lucide-react"
import { Button } from "./components/ui/button"
import { Badge } from "./components/ui/badge"
import { Card } from "./components/ui/card"
import { Dialog } from "./components/ui/dialog"
import { Field, Input, Select, Textarea } from "./components/ui/form-field"

type Project = { id: string; name: string; description: string; type: string; status: string; owner: string; calls: number; date: string }
const initial: Project[] = [
  { id: "AS-001", name: "工业设备智能巡检", description: "视觉识别 · 异常检测与维护建议", type: "智能体", status: "运行中", owner: "张明", calls: 12846, date: "2026-10-19" },
  { id: "AS-002", name: "企业知识助手", description: "知识检索 · 企业内部知识问答", type: "知识库", status: "运行中", owner: "李晓", calls: 8652, date: "2026-10-19" },
  { id: "AS-003", name: "生产日报自动生成", description: "流程编排 · 数据汇总与报告生成", type: "工作流", status: "运行中", owner: "王宇", calls: 3420, date: "2026-10-18" },
  { id: "AS-004", name: "供应链需求预测", description: "预测分析 · 采购与库存优化", type: "智能体", status: "待发布", owner: "陈晨", calls: 128, date: "2026-10-18" },
  { id: "AS-005", name: "合同条款审查", description: "文档分析 · 合同风险识别", type: "工作流", status: "已暂停", owner: "李晓", calls: 2186, date: "2026-10-17" },
  { id: "AS-006", name: "售后服务助手", description: "客户服务 · 工单分类与智能回复", type: "智能体", status: "运行中", owner: "张明", calls: 5640, date: "2026-10-17" },
  { id: "AS-007", name: "产品技术资料库", description: "知识检索 · 产品手册与技术规范", type: "知识库", status: "待发布", owner: "王宇", calls: 0, date: "2026-10-16" },
]
const nav = [{ label: "工作台", icon: LayoutDashboard }, { label: "项目管理", icon: FolderKanban }, { label: "智能体", icon: Bot }, { label: "工作流", icon: Workflow }, { label: "知识库", icon: Database }]
const trend = [18, 22, 24, 30, 26, 43, 38, 48, 40, 53, 48, 61, 54, 69, 62, 75, 68, 82, 72, 86, 79, 96, 83, 99, 90, 110, 100, 119, 111, 133]
function readProjects(): Project[] { try { const data = JSON.parse(localStorage.getItem("auto-space-admin-projects") || "null"); return Array.isArray(data) && data.every(p => typeof p.name === "string" && typeof p.calls === "number") ? data : initial } catch { return initial } }
export default function AdminDashboard() {
  useEffect(() => { document.title = "凹凸时空 · 企业 AI 工作台" }, [])
  const [projects, setProjects] = useState<Project[]>(readProjects)
  const [dark, setDark] = useState(() => localStorage.getItem("auto-space-admin-theme") === "dark")
  const [section, setSection] = useState("工作台")
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("全部项目")
  const [page, setPage] = useState(1)
  const [period, setPeriod] = useState("近 7 天")
  const [create, setCreate] = useState(false)
  const [detail, setDetail] = useState<Project | null>(null)
  const [notice, setNotice] = useState(false)
  const [help, setHelp] = useState(false)
  const [mobile, setMobile] = useState(false)
  const [toast, setToast] = useState("")
  useEffect(() => { localStorage.setItem("auto-space-admin-projects", JSON.stringify(projects)) }, [projects])
  useEffect(() => { localStorage.setItem("auto-space-admin-theme", dark ? "dark" : "light") }, [dark])
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(""), 3500); return () => clearTimeout(timer) }, [toast])
  const typeFilter = ["智能体", "工作流", "知识库"].includes(section) ? section : ""
  const filtered = projects.filter(p => (!typeFilter || p.type === typeFilter) && (status === "全部项目" || p.status === status) && `${p.name}${p.description}${p.owner}${p.id}`.toLowerCase().includes(query.toLowerCase()))
  const pages = Math.max(1, Math.ceil(filtered.length / 5))
  const currentPage = Math.min(page, pages)
  const visible = filtered.slice((currentPage - 1) * 5, currentPage * 5)
  const running = projects.filter(p => p.status === "运行中").length
  const total = projects.reduce((n, p) => n + p.calls, 0)
  function go(label: string) { setSection(label); setQuery(""); setStatus("全部项目"); setPage(1); setMobile(false) }
  function exportData() {
    const csv = "\uFEFF" + [["项目编号", "项目名称", "类型", "状态", "负责人", "调用次数"], ...filtered.map(p => [p.id, p.name, p.type, p.status, p.owner, String(p.calls)])].map(row => row.map(cell => '"' + cell.replace(/"/g, '""').replace(/^[=+@-]/, "'$&") + '"').join(",")).join("\r\n")
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); const a = document.createElement("a"); a.href = url; a.download = "凹凸时空-项目列表.csv"; a.click(); URL.revokeObjectURL(url); setToast("已导出当前筛选的项目")
  }
  function updateStatus(value: string) { if (!detail) return; setProjects(items => items.map(p => p.id === detail.id ? { ...p, status: value } : p)); setDetail({ ...detail, status: value }); setToast("项目状态已更新") }
  const series = period === "近 7 天" ? trend.slice(-7) : trend
  const points = series.map((v, i) => `${(i / (series.length - 1)) * 680},${155 - v}`).join(" ")
  return <div className={`admin-app ${dark ? "dark" : ""}`}>
    {mobile && <button className="sidebar-scrim" onClick={() => setMobile(false)} aria-label="关闭导航" />}
    <aside className={`admin-sidebar ${mobile ? "is-open" : ""}`}>
      <a className="admin-brand" href="/" aria-label="凹凸时空工作台"><img src="/brand/mark.png" alt="" /><span><img src={`/brand/wordmark-${dark ? "white" : "ink"}.svg`} alt="凹凸时空" /><small>AUTO SPACE</small></span></a>
      <div className="nav-caption">工作空间</div>
      <nav aria-label="主导航">{nav.map(item => <button key={item.label} aria-current={section === item.label ? "page" : undefined} className={section === item.label ? "active" : ""} onClick={() => go(item.label)}><item.icon /><span>{item.label}</span>{item.label === "智能体" && <small>{projects.filter(p => p.type === "智能体").length}</small>}</button>)}</nav>
      <div className="nav-caption resource-caption">资源与支持</div>
      <nav aria-label="资源导航"><a href="/library" target="_blank" rel="noreferrer"><LayoutDashboard /><span>品牌组件库</span><ArrowUpRight size={14} /></a><button onClick={() => setHelp(true)}><CircleHelp /><span>使用指南</span></button></nav>
      <div className="sidebar-bottom"><div className="profile"><span className="avatar">林</span><div><strong>林管理</strong><small>企业管理员</small></div><Badge size="sm">演示</Badge></div></div>
    </aside>
    <div className="admin-body">
      <header className="admin-topbar"><div className="topbar-path"><button className="mobile-menu icon-button" aria-label="打开导航" onClick={() => setMobile(true)}><Menu /></button><span>工作空间</span><ChevronRight size={14} /><strong>{section}</strong></div><div className="topbar-actions"><span className="demo-chip"><span />本地交互演示</span><button className="icon-button" onClick={() => setDark(!dark)} aria-label={dark ? "切换亮色主题" : "切换暗色主题"}>{dark ? <Sun /> : <Moon />}</button><button className="icon-button notification-button" aria-label="查看通知" onClick={() => setNotice(true)}><Bell /><i /></button><span className="topbar-divider" /><span className="avatar small">林</span></div></header>
      <main className="admin-main">
        <div className="page-heading"><div><div className="eyebrow">AUTO SPACE / AI WORKSPACE</div><h1>{section === "工作台" ? "早上好，林管理" : section}<span className="heading-dot">.</span></h1><p>{section === "工作台" ? "让每一次智能连接，都转化为业务价值。" : `统一管理企业${section === "项目管理" ? "智能应用" : section}，让协作与交付井然有序。`}</p></div><div className="heading-actions"><Button variant="outline" leftIcon={<ArrowDownToLine size={16} />} onClick={exportData}>导出数据</Button><Button leftIcon={<Plus size={18} />} onClick={() => setCreate(true)}>新建项目</Button></div></div>
        <section className="metric-grid" aria-label="项目数据概览">{[
          { label: "全部项目", value: String(projects.length).padStart(2, "0"), sub: "覆盖 3 类智能应用", icon: FolderKanban, tag: "企业资产" },
          { label: "运行中项目", value: String(running).padStart(2, "0"), sub: `${projects.length - running} 个项目待发布或暂停`, icon: Bot, tag: "运行状态" },
          { label: "累计调用次数", value: total.toLocaleString(), sub: "所有项目调用量汇总", icon: Zap, tag: "样例数据" },
          { label: "应用类型", value: "03", sub: "智能体 / 工作流 / 知识库", icon: Workflow, tag: "场景覆盖" },
        ].map(item => <Card className="metric-tile" key={item.label}><div className="metric-top"><span>{item.label}</span><span className="metric-icon"><item.icon size={20} /></span></div><div className="metric-value">{item.value}</div><div className="metric-bottom"><span>{item.sub}</span><small>{item.tag}</small></div></Card>)}</section>
        {section === "工作台" && <div className="analytics-grid"><Card className="trend-card"><div className="panel-heading"><div><h2>智能应用调用趋势</h2><p>持续观察应用的使用与增长</p></div><div className="segmented" aria-label="时间范围">{["近 7 天", "近 30 天"].map(p => <button key={p} aria-pressed={period === p} className={period === p ? "selected" : ""} onClick={() => setPeriod(p)}>{p}</button>)}</div></div><div className="chart-legend"><span /><strong>应用调用量</strong><small>示例趋势 · 单位：百次</small></div><div className="chart"><div className="chart-y"><span>150</span><span>100</span><span>50</span><span>0</span></div><div className="chart-plot"><svg viewBox="0 0 680 165" preserveAspectRatio="none" role="img" aria-label={`${period}调用趋势示例，整体逐渐上升`}><defs><linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0D7CFD" stopOpacity=".18" /><stop offset="100%" stopColor="#0D7CFD" stopOpacity="0" /></linearGradient></defs>{[5,55,105,155].map(y => <line key={y} x1="0" x2="680" y1={y} y2={y} stroke="var(--as-border)" strokeDasharray="4 5" />)}<polygon points={`0,155 ${points} 680,155`} fill="url(#chart-fill)" /><polyline points={points} fill="none" stroke="#0D7CFD" strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" /></svg><div className="chart-x">{(period === "近 7 天" ? ["10.13", "10.14", "10.15", "10.16", "10.17", "10.18", "10.19"] : ["09.20", "09.25", "09.30", "10.05", "10.10", "10.15", "10.19"]).map(d => <span key={d}>{d}</span>)}</div></div></div></Card><Card className="activity-card"><div className="panel-heading"><div><h2>最近更新</h2><p>团队的每一步进展</p></div><Activity size={19} /></div><div className="activity-list">{projects.slice(0,3).map((p,i) => <button key={p.id} onClick={() => setDetail(p)}><span className={`activity-symbol symbol-${i}`} >{i === 0 ? <Check /> : i === 1 ? <Database /> : <Workflow />}</span><div><strong>{p.name}</strong><p>{p.owner} · {p.status}</p><small>{p.date}</small></div><ChevronRight size={15} /></button>)}</div></Card></div>}
        <Card padding="none" className="projects-panel"><div className="project-header"><div><h2>{typeFilter || "项目概览"}<span>{filtered.length}</span></h2><p>管理从场景验证到正式运行的每一个项目</p></div><div className="search-box"><Search size={17} /><Input aria-label="搜索项目" placeholder="搜索项目、负责人…" value={query} onChange={e => { setQuery(e.target.value); setPage(1) }} />{query && <button aria-label="清空搜索" onClick={() => setQuery("")}><X size={14} /></button>}</div></div><div className="table-toolbar"><div className="status-tabs">{["全部项目", "运行中", "待发布", "已暂停"].map(s => <button key={s} aria-pressed={status === s} className={status === s ? "selected" : ""} onClick={() => { setStatus(s); setPage(1) }}>{s}</button>)}</div><span className="table-note"><Settings2 size={14} /> 按最近更新排序</span></div><div className="table-scroll"><table className="project-table"><thead><tr><th>项目名称</th><th>类型</th><th>状态</th><th>负责人</th><th>调用次数</th><th>更新时间</th><th>操作</th></tr></thead><tbody>{visible.map(p => <tr key={p.id}><td><div className="project-name"><span className={`project-symbol ${p.type === "知识库" ? "knowledge" : p.type === "工作流" ? "flow" : ""}`}>{p.type === "智能体" ? <Bot /> : p.type === "知识库" ? <Database /> : <Workflow />}</span><div><button onClick={() => setDetail(p)}>{p.name}</button><small>{p.description}</small></div></div></td><td>{p.type}</td><td><Badge dot variant={p.status === "运行中" ? "success" : p.status === "待发布" ? "warning" : "neutral"}>{p.status}</Badge></td><td><span className="owner"><span>{p.owner.slice(0,1)}</span>{p.owner}</span></td><td className="tabular">{p.calls.toLocaleString()}</td><td className="muted">{p.date}</td><td><button className="detail-link" onClick={() => setDetail(p)}>管理 <ArrowRight size={14} /></button></td></tr>)}</tbody></table>{visible.length === 0 && <div className="empty-state"><Search size={32} /><h3>没有找到匹配的项目</h3><p>试试其他关键词，或清除筛选条件。</p><Button variant="outline" onClick={() => { setQuery(""); setStatus("全部项目") }}>清除筛选</Button></div>}</div><div className="table-footer"><span>共 {filtered.length} 个项目 · 每页 5 条</span><div><button className="pagination-arrow" disabled={currentPage === 1} aria-label="上一页" onClick={() => setPage(currentPage - 1)}><ChevronLeft size={16} /></button>{Array.from({ length: pages }, (_,i) => <button key={i} aria-label={`第 ${i+1} 页`} aria-current={currentPage === i+1 ? "page" : undefined} className={currentPage === i+1 ? "current-page" : ""} onClick={() => setPage(i+1)}>{i+1}</button>)}<button className="pagination-arrow" disabled={currentPage === pages} aria-label="下一页" onClick={() => setPage(currentPage+1)}><ChevronRight size={16} /></button></div></div></Card>
        <footer className="admin-footer"><span>© 2026 凹凸时空 AUTO SPACE</span><span>AI 改变行业未来 <span> / </span> 示例数据 · 仅保存在本机浏览器</span></footer>
      </main>
    </div>
    <Dialog open={create} onOpenChange={setCreate} title="新建智能项目" description="从一个真实的业务需求开始。创建后可在项目列表中管理。" footer={<><Button variant="outline" onClick={() => setCreate(false)}>取消</Button><Button type="submit" form="create-project">创建项目</Button></>}><form id="create-project" className="project-form" onSubmit={e => { e.preventDefault(); const data = new FormData(e.currentTarget); const name = String(data.get("name") || "").trim(); if (!name) return; setProjects(items => [{ id: `AS-${Date.now()}`, name, description: String(data.get("description") || "新建企业智能应用"), type: String(data.get("type")), owner: "林管理", status: "待发布", calls: 0, date: new Date().toLocaleDateString("sv-SE") }, ...items]); setCreate(false); go("项目管理"); setToast(`「${name}」创建成功`) }}><Field id="project-name" label="项目名称" required><Input name="name" required maxLength={40} placeholder="例如：设备故障诊断助手" /></Field><Field id="project-type" label="项目类型"><Select name="type" defaultValue={typeFilter || "智能体"}><option>智能体</option><option>工作流</option><option>知识库</option></Select></Field><Field id="project-description" label="项目描述" hint="简要描述应用场景和预期目标"><Textarea name="description" rows={3} maxLength={120} placeholder="这个项目将帮助团队解决什么问题？" /></Field></form></Dialog>
    <Dialog open={!!detail} onOpenChange={open => { if (!open) setDetail(null) }} title={detail?.name || "项目详情"} description={detail?.description} footer={<Button variant="outline" onClick={() => setDetail(null)}>完成</Button>}>{detail && <div className="detail-content"><div className="detail-meta"><div><span>项目编号</span><strong>{detail.id}</strong></div><div><span>应用类型</span><strong>{detail.type}</strong></div><div><span>负责人</span><strong>{detail.owner}</strong></div><div><span>累计调用</span><strong>{detail.calls.toLocaleString()}</strong></div></div><Field id="detail-status" label="项目状态" hint="演示操作：状态变化将保存在当前浏览器中。"><Select value={detail.status} onChange={e => updateStatus(e.target.value)}><option>运行中</option><option>待发布</option><option>已暂停</option></Select></Field></div>}</Dialog>
    <Dialog open={notice} onOpenChange={setNotice} title="通知中心" description="当前展示本地演示通知"><div className="notification-content"><ShieldCheck /><div><strong>企业工作空间已准备就绪</strong><p>你可以创建项目、查看运行状态，并通过品牌组件库了解界面规范。</p></div></div></Dialog>
    <Dialog open={help} onOpenChange={setHelp} title="工作台使用指南"><div className="help-content"><p><strong>01 · 创建应用</strong><br />点击“新建项目”，填写名称并选择智能体、工作流或知识库。</p><p><strong>02 · 管理项目</strong><br />通过关键词和状态筛选项目，点击“管理”查看详情并切换状态。</p><p><strong>03 · 分享与验证</strong><br />导出当前筛选结果为 CSV；点击月亮图标体验暗色主题。</p><p className="muted">本页面是品牌组件库的交互样例，使用本地示例数据，尚未连接实际企业业务接口。</p></div></Dialog>
    {toast && <div className="admin-toast" role="status"><Check size={18} />{toast}<button aria-label="关闭提示" onClick={() => setToast("")}><X size={16} /></button></div>}
  </div>
}

